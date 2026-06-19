// POST /api/studies/[studyId]/answers
// Upserts a single card answer. Idempotent — safe to call multiple times.
// Also recalculates and updates the study's completion_percentage.

import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/session'
import { query, queryOne } from '@/lib/db'
import { MANDATORY_CARDS } from '@/lib/cards/loader'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> }
) {
  const { studyId } = await params
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const study = await queryOne(
    'SELECT id FROM studies WHERE id = $1 AND user_id = $2',
    [studyId, user.id]
  )
  if (!study) return NextResponse.json({ error: 'Study not found' }, { status: 404 })

  const { card_id, answer, status } = await request.json()
  if (!card_id || !status) return NextResponse.json({ error: 'card_id and status are required' }, { status: 400 })

  // Upsert answer
  await query(
    `INSERT INTO answers (study_id, card_id, answer, status)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (study_id, card_id)
     DO UPDATE SET answer = EXCLUDED.answer, status = EXCLUDED.status, "updated_at" = now()`,
    [studyId, card_id, answer ?? null, status]
  )

  // Recalculate completion %
  const allAnswers = await query<{ card_id: string; status: string }>(
    'SELECT card_id, status FROM answers WHERE study_id = $1',
    [studyId]
  )

  const answeredIds = new Set(allAnswers.filter(a => a.status === 'done').map(a => a.card_id))
  const mandatoryDone = MANDATORY_CARDS.filter(c => answeredIds.has(c.id)).length
  const completion = Math.round((mandatoryDone / MANDATORY_CARDS.length) * 100)

  await query(
    'UPDATE studies SET completion_percentage = $1, updated_at = now() WHERE id = $2',
    [completion, studyId]
  )

  return NextResponse.json({ ok: true, completion })
}
