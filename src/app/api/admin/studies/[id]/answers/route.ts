import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/admin'
import { query, queryOne } from '@/lib/db'
import { ALL_CARDS, getCard, calcCompletion } from '@/lib/cards/loader'
import type { Language } from '@/types/cards'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const study = await queryOne<{ id: string; startupName: string | null; language: string; status: string; completionPercentage: number; userId: string }>(
    `SELECT id, "startupName", language, status, "completionPercentage", "userId" FROM studies WHERE id = $1`, [id])
  if (!study) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const rows = await query<{ cardId: string; answer: unknown; status: string }>(
    `SELECT "cardId", answer, status FROM answers WHERE "studyId" = $1`, [id])
  const map = new Map(rows.map(r => [r.cardId, r]))
  const lang = (study.language === 'ar' ? 'ar' : 'en') as Language
  const items = ALL_CARDS.map(c => {
    const a = map.get(c.id)
    return {
      cardId: c.id, section: c.section, order: c.order, type: c.type, required: c.required,
      category: c[lang]?.category ?? '', prompt: c[lang]?.prompt ?? '',
      answer: a ? a.answer : null, status: a ? a.status : null,
    }
  })
  return NextResponse.json({ study, items })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const cardId = body?.cardId
  if (!cardId || !getCard(cardId)) return NextResponse.json({ error: 'bad cardId' }, { status: 400 })
  const status = body?.status === 'skipped' ? 'skipped' : 'done'
  const value = body?.value
  try {
    await query(
      `INSERT INTO answers ("studyId","cardId",answer,status) VALUES ($1,$2,$3::jsonb,$4)
       ON CONFLICT ("studyId","cardId") DO UPDATE SET answer = EXCLUDED.answer, status = EXCLUDED.status`,
      [id, cardId, JSON.stringify(value ?? null), status]
    )
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'save failed' }, { status: 500 })
  }
  // recompute completion using the SAME function the founder app uses
  const done = await query<{ cardId: string }>(`SELECT "cardId" FROM answers WHERE "studyId" = $1 AND status = 'done'`, [id])
  const completion = calcCompletion(new Set(done.map(d => d.cardId)))
  await query(`UPDATE studies SET "completionPercentage" = $1 WHERE id = $2`, [completion, id])
  return NextResponse.json({ ok: true, completionPercentage: completion })
}
