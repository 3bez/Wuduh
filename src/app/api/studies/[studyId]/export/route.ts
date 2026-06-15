// @ts-nocheck
// POST /api/studies/[studyId]/export

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generatePdf } from '@/lib/pdf/generator'

async function urlToBase64(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'WuduhPdfExporter/1.0' },
    })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') ?? 'image/png'
    const mimeType = contentType.split(';')[0].trim()
    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return `data:${mimeType};base64,${base64}`
  } catch (err) {
    console.warn('[export] logo fetch failed:', err)
    return null
  }
}

function extractStoragePath(url) {
  try {
    const u = new URL(url)
    const match = u.pathname.match(/\/object\/(?:public|sign)\/wuduh-uploads\/(.+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

export async function POST(request, { params }) {
  const { studyId } = await params
  const supabase    = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: study } = await supabase
    .from('studies')
    .select('*')
    .eq('id', studyId)
    .eq('user_id', user.id)
    .single()

  if (!study) return NextResponse.json({ error: 'Study not found' }, { status: 404 })

  const { data: answersRaw } = await supabase
    .from('answers')
    .select('card_id, answer, status')
    .eq('study_id', studyId)

  const answers = Object.fromEntries(
    (answersRaw ?? []).map(a => [
      a.card_id,
      { answer: a.answer, status: a.status }
    ])
  )

  const startupName = (answers['C2']?.answer) ?? study.startup_name ?? null
  const founderName = (answers['C3']?.answer) ?? null
  const rawLogoUrl  = (answers['C1']?.answer) ?? study.logo_url ?? null

  let logoDataUri = null
  if (rawLogoUrl) {
    const storagePath = extractStoragePath(rawLogoUrl)
    if (storagePath) {
      const { data: signedData } = await supabase.storage
        .from('wuduh-uploads')
        .createSignedUrl(storagePath, 60)
      if (signedData?.signedUrl) {
        logoDataUri = await urlToBase64(signedData.signedUrl)
      }
    } else if (rawLogoUrl.startsWith('data:')) {
      logoDataUri = rawLogoUrl
    }
  }

  if (logoDataUri) {
    answers['C1'] = { answer: logoDataUri, status: 'done' }
  } else if (answers['C1']) {
    answers['C1'] = { answer: null, status: 'skipped' }
  }

  if (startupName && startupName !== study.startup_name) {
    await supabase
      .from('studies')
      .update({ startup_name: startupName })
      .eq('id', studyId)
  }

  try {
    const pdfBuffer = await generatePdf({
      studyId,
      startup_name: startupName,
      founder_name: founderName,
      logo_url: logoDataUri,
      language: study.language,
      completion_percentage: study.completion_percentage,
      answers,
    })

    const filename = `${user.id}/${studyId}/export-${Date.now()}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('wuduh-uploads')
      .upload(filename, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    if (uploadError) throw new Error(uploadError.message)

    const { data: signed } = await supabase.storage
      .from('wuduh-uploads')
      .createSignedUrl(filename, 3600)

    const pdfUrl = signed?.signedUrl ?? null

    await supabase.from('exports').insert({
      study_id: studyId,
      user_id: user.id,
      pdf_url: pdfUrl,
      language: study.language,
      completion_snapshot: study.completion_percentage,
    })

    await supabase
      .from('studies')
      .update({ status: 'exported' })
      .eq('id', studyId)

    return NextResponse.json({ ok: true, url: pdfUrl })
  } catch (err) {
    console.error('[export]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'PDF generation failed' },
      { status: 500 }
    )
  }
}
