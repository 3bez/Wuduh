// POST /api/studies/[studyId]/answers
// Upserts a single card answer. Idempotent — safe to call multiple times.
// Also recalculates and updates the study's completion_percentage.

import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedUser } from '@/lib/auth/session'
import { query, queryOne } from '@/lib/db'
import { MANDATORY_CARDS } from '@/lib/cards/loader'
import { apiError, langFromHeaders } from '@/lib/i18n/errors'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> }
) {
  const { studyId } = await params
  const lang = langFromHeaders(request.headers)
  const user = await getVerifiedUser()
  if (!user) return NextResponse.json({ error: apiError('unauthorized', lang) }, { status: 401 })

  const study = await queryOne(
    'SELECT id FROM studies WHERE id = $1 AND "userId" = $2',
    [studyId, user.id]
  )
  if (!study) return NextResponse.json({ error: apiError('study_not_found', lang) }, { status: 404 })

  const { card_id, answer, status } = await request.json()
  if (!card_id || !status) return NextResponse.json({ error: apiError('card_status_required', lang) }, { status: 400 })

  // Upsert answer — wrap non-object answers as JSON
  const jsonAnswer = answer === null || answer === undefined
    ? null
    : typeof answer === 'string' || typeof answer === 'number' || typeof answer === 'boolean'
    ? JSON.stringify(answer)
    : JSON.stringify(answer)

  await query(
    `INSERT INTO answers ("studyId", "cardId", answer, status)
     VALUES ($1, $2, $3::jsonb, $4)
     ON CONFLICT ("studyId", "cardId")
     DO UPDATE SET answer = EXCLUDED.answer, status = EXCLUDED.status, "updatedAt" = now()`,
    [studyId, card_id, jsonAnswer, status]
  )

  // Recalculate completion %
  const allAnswers = await query<{ card_id: string; status: string }>(
    'SELECT "cardId" as card_id, status FROM answers WHERE "studyId" = $1',
    [studyId]
  )

  const answeredIds = new Set(allAnswers.filter(a => a.status === 'done').map(a => a.card_id))
  const mandatoryDone = MANDATORY_CARDS.filter(c => answeredIds.has(c.id)).length
  const completion = Math.round((mandatoryDone / MANDATORY_CARDS.length) * 100)

  await query(
    'UPDATE studies SET "completionPercentage" = $1, "updatedAt" = now() WHERE id = $2',
    [completion, studyId]
  )

  return NextResponse.json({ ok: true, completion })
}
