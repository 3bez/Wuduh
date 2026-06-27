import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/admin'
import { query, queryOne } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const filter = searchParams.get('filter') || 'all'
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10))

  const where: string[] = []
  const params: unknown[] = []
  if (q) { params.push(`%${q}%`); where.push(`(u.email ILIKE $${params.length} OR u.name ILIKE $${params.length})`) }
  if (filter === 'verified') where.push(`u."emailVerified" = true`)
  if (filter === 'unverified') where.push(`u."emailVerified" = false`)
  if (filter === 'banned') where.push(`u.banned = true`)
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const totalRow = await queryOne<{ c: string }>(`SELECT count(*)::int AS c FROM users u ${whereSql}`, params)
  const users = await query(`
    SELECT u.id, u.email, u.name, u."emailVerified", u.banned, u."createdAt",
      (SELECT count(*) FROM studies s WHERE s."userId" = u.id)::int AS studies,
      (SELECT count(*) FROM exports e WHERE e."userId" = u.id)::int AS exports,
      (SELECT max(x."createdAt") FROM sessions x WHERE x."userId" = u.id) AS "lastActive"
    FROM users u
    ${whereSql}
    ORDER BY u."createdAt" DESC
    LIMIT ${limit} OFFSET ${offset}
  `, params)

  return NextResponse.json({ users, total: totalRow?.c ?? 0, limit, offset })
}
