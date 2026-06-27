import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/admin'
import { query, queryOne } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const user = await queryOne(`SELECT id, email, name, "emailVerified", "createdAt", "updatedAt" FROM users WHERE id = $1`, [id])
  if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const studies = await query(`
    SELECT id, "startupName", language, status, "completionPercentage", "createdAt", "updatedAt",
      (SELECT count(*) FROM exports e WHERE e."studyId" = s.id)::int AS exports
    FROM studies s WHERE s."userId" = $1 ORDER BY s."updatedAt" DESC
  `, [id])
  const exports = await query(`
    SELECT e.id, e.language, e."completionSnapshot", e.pdf_url, e."createdAt", s."startupName"
    FROM exports e LEFT JOIN studies s ON s.id = e."studyId"
    WHERE e."userId" = $1 ORDER BY e."createdAt" DESC
  `, [id])
  return NextResponse.json({ user, studies, exports })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const action = body?.action
  if (action !== 'verify' && action !== 'unverify') return NextResponse.json({ error: 'bad action' }, { status: 400 })
  await query(`UPDATE users SET "emailVerified" = $1 WHERE id = $2`, [action === 'verify', id])
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  await query(`DELETE FROM users WHERE id = $1`, [id])
  return NextResponse.json({ ok: true })
}
