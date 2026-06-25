import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedUser } from '@/lib/auth/session'
import * as Minio from 'minio'

function getMinioClient() {
  return new Minio.Client({
    endPoint:  process.env.MINIO_ENDPOINT ?? '65.21.151.1',
    port:      parseInt(process.env.MINIO_PORT ?? '9000'),
    useSSL:    false,
    accessKey: process.env.MINIO_ACCESS_KEY ?? 'wuduh',
    secretKey: process.env.MINIO_SECRET_KEY ?? '',
  })
}

const BUCKET = process.env.MINIO_BUCKET ?? 'wuduh-uploads'

export async function POST(request: NextRequest) {
  const user = await getVerifiedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file     = formData.get('file') as File | null
    const studyId  = formData.get('studyId') as string | null
    const cardId   = formData.get('cardId') as string | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!studyId) return NextResponse.json({ error: 'studyId is required' }, { status: 400 })

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
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 })
  }
}
