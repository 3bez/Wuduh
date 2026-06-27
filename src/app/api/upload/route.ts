import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedUser } from '@/lib/auth/session'
import { apiError, langFromHeaders } from '@/lib/i18n/errors'
import * as Minio from 'minio'

function getMinioClient() {
  const endPoint  = process.env.MINIO_ENDPOINT
  const accessKey = process.env.MINIO_ACCESS_KEY
  const secretKey = process.env.MINIO_SECRET_KEY
  if (!endPoint || !accessKey || !secretKey) {
    throw new Error('MinIO is not configured: set MINIO_ENDPOINT, MINIO_ACCESS_KEY and MINIO_SECRET_KEY')
  }
  return new Minio.Client({
    endPoint,
    port:      parseInt(process.env.MINIO_PORT ?? '9000'),
    useSSL:    false,
    accessKey,
    secretKey,
  })
}

const BUCKET = process.env.MINIO_BUCKET ?? 'wuduh-uploads'

export async function POST(request: NextRequest) {
  const lang = langFromHeaders(request.headers)
  const user = await getVerifiedUser()
  if (!user) return NextResponse.json({ error: apiError('unauthorized', lang) }, { status: 401 })

  try {
    const formData = await request.formData()
    const file     = formData.get('file') as File | null
    const studyId  = formData.get('studyId') as string | null
    const cardId   = formData.get('cardId') as string | null

    if (!file) return NextResponse.json({ error: apiError('no_file', lang) }, { status: 400 })
    if (!studyId) return NextResponse.json({ error: apiError('study_id_required', lang) }, { status: 400 })

    const ext      = file.name.split('.').pop() ?? 'png'
    const objectName = `${user.id}/${studyId}/${cardId ?? 'upload'}-${Date.now()}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const client = getMinioClient()

    // Ensure bucket exists
    const exists = await client.bucketExists(BUCKET)
    if (!exists) await client.makeBucket(BUCKET)

    // Upload file
    await client.putObject(BUCKET, objectName, buffer, buffer.length, {
      'Content-Type': file.type,
    })

    // Generate a presigned URL valid for 7 days
    const url = await client.presignedGetObject(BUCKET, objectName, 7 * 24 * 60 * 60)

    return NextResponse.json({ ok: true, url, path: objectName })
  } catch (err) {
    console.error('[upload]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : apiError('upload_failed', lang) }, { status: 500 })
  }
}
