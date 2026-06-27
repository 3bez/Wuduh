import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/admin'
import { query, queryOne } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10))

  const totalRow = await queryOne<{ c: number }>(`SELECT count(*)::int AS c FROM admin_audit_log`)
  const rows = await query(`
    SELECT id, action, target_type, target_id, detail, ip, "createdAt"
    FROM admin_audit_log
    ORDER BY "createdAt" DESC
    LIMIT ${limit} OFFSET ${offset}
  `)
  return NextResponse.json({ logs: rows, total: totalRow?.c ?? 0, limit, offset })
}
