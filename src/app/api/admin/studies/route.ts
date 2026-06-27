import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/admin'
import { query, queryOne } from '@/lib/db'

export const dynamic = 'force-dynamic'

const SORT_COLS: Record<string, string> = {
  startupName: 's."startupName"', status: 's.status', completionPercentage: 's."completionPercentage"',
  updatedAt: 's."updatedAt"', createdAt: 's."createdAt"', exports: 'exports', email: 'u.email',
}

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const status = searchParams.get('status') || 'all'
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10))
  const sortCol = SORT_COLS[searchParams.get('sort') || ''] || 's."updatedAt"'
  const sortDir = searchParams.get('dir') === 'asc' ? 'ASC' : 'DESC'
  const dateFrom = searchParams.get('from') || ''
  const dateTo = searchParams.get('to') || ''

  const where: string[] = []
  const params: unknown[] = []
  if (q) { params.push(`%${q}%`); where.push(`(s."startupName" ILIKE $${params.length} OR u.email ILIKE $${params.length})`) }
  if (status === 'draft' || status === 'complete' || status === 'exported') { params.push(status); where.push(`s.status = $${params.length}`) }
  if (dateFrom) { params.push(dateFrom); where.push(`s."updatedAt" >= $${params.length}::date`) }
  if (dateTo) { params.push(dateTo); where.push(`s."updatedAt" < ($${params.length}::date + interval '1 day')`) }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const totalRow = await queryOne<{ c: string }>(`SELECT count(*)::int AS c FROM studies s LEFT JOIN users u ON u.id = s."userId" ${whereSql}`, params)
  const studies = await query(`
    SELECT s.id, s."startupName", s.language, s.status, s."completionPercentage", s."createdAt", s."updatedAt",
      u.email, u.id AS "userId",
      (SELECT count(*) FROM exports e WHERE e."studyId" = s.id)::int AS exports
    FROM studies s LEFT JOIN users u ON u.id = s."userId"
    ${whereSql}
    ORDER BY ${sortCol} ${sortDir} NULLS LAST
    LIMIT ${limit} OFFSET ${offset}
  `, params)
  return NextResponse.json({ studies, total: totalRow?.c ?? 0, limit, offset })
}
