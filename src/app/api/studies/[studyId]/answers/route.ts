// POST /api/studies/[studyId]/answers
// Upserts a single card answer. Idempotent — safe to call multiple times.
// Also recalculates and updates the study's completion_percentage.

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { MANDATORY_CARDS } from '@/lib/cards/loader'

interface Params { params: Promise<{ studyId: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { studyId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: study } = await supabase
    .from('studies')
    .select('id, user_id')
    .eq('id', studyId)
    .eq('user_id', user.id)
    .single()

  if (!study) return NextResponse.json({ error: 'Study not found' }, { status: 404 })

  const body = await request.json()
  const { card_id, answer, status } = body as {
    card_id: string
    answer: unknown
    status: 'done' | 'skipped'
  }

  if (!card_id || !status) {
    return NextResponse.json({ error: 'card_id and status are required' }, { status: 400 })
  }

  // Check if answer exists for this card
  const { data: existing } = await supabase
    .from('answers')
    .select('id')
    .eq('study_id', studyId)
    .eq('card_id', card_id)
    .maybeSingle()

  let saveError = null

  if (existing) {
    const { error } = await supabase
      .from('answers')
      .update({ answer: answer ?? null, status, updated_at: new Date().toISOString() })
      .eq('study_id', studyId)
      .eq('card_id', card_id)
    saveError = error
  } else {
    const { error } = await supabase
      .from('answers')
      .insert({ study_id: studyId, card_id, answer: answer ?? null, status })
    saveError = error
  }

  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 })
  }

  // Recalculate completion %
  const { data: allAnswers } = await supabase
    .from('answers')
    .select('card_id, status')
    .eq('study_id', studyId)

  const answeredIds = new Set(
    (allAnswers ?? []).filter(a => a.status === 'done').map(a => a.card_id)
  )
  const mandatoryDone = MANDATORY_CARDS.filter(c => answeredIds.has(c.id)).length
  const completion = Math.round((mandatoryDone / MANDATORY_CARDS.length) * 100)

  await supabase
    .from('studies')
    .update({ completion_percentage: completion, updated_at: new Date().toISOString() })
    .eq('id', studyId)

  return NextResponse.json({ ok: true, completion })
}
