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

  const studies = await query<{
    id: string; startupName: string | null; language: string; status: string
    completionPercentage: number; email: string | null; createdAt: string; updatedAt: string; exports: number
  }>(`
    SELECT s.id, s."startupName", s.language, s.status, s."completionPercentage",
      u.email, s."createdAt", s."updatedAt",
      (SELECT count(*) FROM exports e WHERE e."studyId" = s.id)::int AS exports
    FROM studies s LEFT JOIN users u ON u.id = s."userId"
    ORDER BY s."updatedAt" DESC
  `)

  const header = 'id,startupName,language,status,completionPercentage,ownerEmail,exports,createdAt,updatedAt'
  const rows = studies.map(s =>
    [s.id, s.startupName, s.language, s.status, s.completionPercentage, s.email, s.exports, s.createdAt, s.updatedAt]
      .map(escapeCsv).join(',')
  )
  const csv = [header, ...rows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="wuduh-studies-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
