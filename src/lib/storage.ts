// Shared MinIO/S3 storage helpers — the single source of truth for object storage.
// Used by the founder-facing export route and the admin download route so they
// never drift apart in configuration or URL handling.

import * as Minio from 'minio'

export const BUCKET = process.env.MINIO_BUCKET ?? 'wuduh-uploads'

export function getMinioClient() {
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

/** Generate a fresh presigned GET URL for an object key (default 1 hour). */
export function presignGet(key: string, expirySeconds = 3600): Promise<string> {
  return getMinioClient().presignedGetObject(BUCKET, key, expirySeconds)
}

/** Recover the object key from a stored (possibly expired) presigned URL. */
export function keyFromUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const path = decodeURIComponent(u.pathname).replace(/^\/+/, '')
    if (path.startsWith(BUCKET + '/')) return path.slice(BUCKET.length + 1)
    return path || null
  } catch {
    return null
  }
}
