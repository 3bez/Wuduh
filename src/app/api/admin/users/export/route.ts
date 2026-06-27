import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/admin'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

function escapeCsv(val: unknown): string {
  const s = val == null ? '' : String(val)
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const users = await query<{
    id: string; email: string; name: string | null; emailVerified: boolean
    banned: boolean; banReason: string | null; createdAt: string
    studies: number; exports: number
  }>(`
    SELECT u.id, u.email, u.name, u."emailVerified", u.banned, u."banReason", u."createdAt",
      (SELECT count(*) FROM studies s WHERE s."userId" = u.id)::int AS studies,
      (SELECT count(*) FROM exports e WHERE e."userId" = u.id)::int AS exports
    FROM users u ORDER BY u."createdAt" DESC
  `)

  const header = 'id,email,name,emailVerified,banned,banReason,studies,exports,createdAt'
  const rows = users.map(u =>
    [u.id, u.email, u.name, u.emailVerified, u.banned, u.banReason, u.studies, u.exports, u.createdAt]
      .map(escapeCsv).join(',')
  )
  const csv = [header, ...rows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="wuduh-users-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
