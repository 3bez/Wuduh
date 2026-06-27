import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/admin'
import { queryOne } from '@/lib/db'
import * as Minio from 'minio'

export const dynamic = 'force-dynamic'

const BUCKET = process.env.MINIO_BUCKET ?? 'wuduh-uploads'

function getMinioClient() {
  const endPoint = process.env.MINIO_ENDPOINT
  const accessKey = process.env.MINIO_ACCESS_KEY
  const secretKey = process.env.MINIO_SECRET_KEY
  if (!endPoint || !accessKey || !secretKey) {
    throw new Error('MinIO is not configured: set MINIO_ENDPOINT, MINIO_ACCESS_KEY and MINIO_SECRET_KEY')
  }
  return new Minio.Client({
    endPoint,
    port: parseInt(process.env.MINIO_PORT ?? '9000'),
    useSSL: false,
    accessKey,
    secretKey,
  })
}

/** Recover the object key from a stored (possibly expired) presigned URL. */
function keyFromUrl(pdfUrl: string): string | null {
  try {
    const u = new URL(pdfUrl)
    const path = decodeURIComponent(u.pathname).replace(/^\/+/, '')
    if (path.startsWith(BUCKET + '/')) return path.slice(BUCKET.length + 1)
    return path || null
  } catch {
    return null
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const row = await queryOne<{ pdf_url: string | null }>(`SELECT pdf_url FROM exports WHERE id = $1`, [id])
  if (!row?.pdf_url) return NextResponse.json({ error: 'no file on record' }, { status: 404 })
  const key = keyFromUrl(row.pdf_url)
  if (!key) return NextResponse.json({ error: 'could not resolve file key' }, { status: 400 })
  try {
    const fresh = await getMinioClient().presignedGetObject(BUCKET, key, 3600)
    return NextResponse.redirect(fresh, 302)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed to sign url' }, { status: 500 })
  }
}
