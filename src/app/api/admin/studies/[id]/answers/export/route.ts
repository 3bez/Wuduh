import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/admin'
import { query, queryOne } from '@/lib/db'
import { ALL_CARDS } from '@/lib/cards/loader'
import type { Language } from '@/types/cards'

export const dynamic = 'force-dynamic'

function escapeCsv(val: unknown): string {
  const s = val == null ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val)
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const study = await queryOne<{ startupName: string | null; language: string }>(
    `SELECT "startupName", language FROM studies WHERE id = $1`, [id])
  if (!study) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const rows = await query<{ cardId: string; answer: unknown; status: string }>(
    `SELECT "cardId", answer, status FROM answers WHERE "studyId" = $1`, [id])
  const map = new Map(rows.map(r => [r.cardId, r]))
  const lang = (study.language === 'ar' ? 'ar' : 'en') as Language

  const header = 'cardId,section,category,prompt,required,status,answer'
  const csvRows = ALL_CARDS.map(c => {
    const a = map.get(c.id)
    return [c.id, c.section, c[lang]?.category ?? '', c[lang]?.prompt ?? '', c.required, a?.status ?? 'unanswered', a?.answer ?? '']
      .map(escapeCsv).join(',')
  })
  const csv = [header, ...csvRows].join('\n')
  const safeName = (study.startupName || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${safeName}-answers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
