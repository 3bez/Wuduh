import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/admin'
import { queryOne } from '@/lib/db'
import { presignGet, keyFromUrl } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const row = await queryOne<{ pdf_url: string | null }>(`SELECT pdf_url FROM exports WHERE id = $1`, [id])
  if (!row?.pdf_url) return NextResponse.json({ error: 'no file on record' }, { status: 404 })
  const key = keyFromUrl(row.pdf_url)
  if (!key) return NextResponse.json({ error: 'could not resolve file key' }, { status: 400 })
  try {
    const fresh = await presignGet(key)
    return NextResponse.redirect(fresh, 302)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed to sign url' }, { status: 500 })
  }
}
