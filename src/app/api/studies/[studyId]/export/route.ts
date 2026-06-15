// POST /api/studies/[studyId]/export

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generatePdf } from '@/lib/pdf/generator'
import type { Language } from '@/types/cards'

interface Params { params: Promise<{ studyId: string }> }

// Convert any URL to a base64 data URI so Puppeteer can embed it.
// For Supabase storage paths we generate a short-lived signed URL first.
async function urlToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'WuduhPdfExporter/1.0' },
    })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') ?? 'image/png'
    // Strip parameters from content-type (e.g. "image/png; charset=utf-8")
    const mimeType = contentType.split(';')[0].trim()
    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return `data:${mimeType};base64,${base64}`
  } catch (err) {
    console.warn('[export] logo fetch failed:', err)
    return null
  }
}

// Extract the Supabase storage path from a public or signed URL
// e.g. https://xxx.supabase.co/storage/v1/object/public/wuduh-uploads/userId/studyId/file.png
// → userId/studyId/file.png
function extractStoragePath(url: string): string | null {
  try {
    const u = new URL(url)
    // Match /object/public/wuduh-uploads/ or /object/sign/wuduh-uploads/
    const match = u.pathname.match(/\/object\/(?:public|sign)\/wuduh-uploads\/(.+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { studyId } = await params
  const supabase    = await createClient()

  // Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch study
  const { data: study } = await supabase
    .from('studies')
    .select('*')
    .eq('id', studyId)
    .eq('user_id', user.id)
    .single()

  if (!study) return NextResponse.json({ error: 'Study not found' }, { status: 404 })

  // Fetch all answers
  const { data: answersRaw } = await supabase
    .from('answers')
    .select('card_id, answer, status')
    .eq('study_id', studyId)

  const answers: Record<string, { answer: unknown; status: 'done' | 'skipped' }> =
    Object.fromEntries(
      (answersRaw ?? []).map(a => [
        a.card_id,
        { answer: a.answer, status: a.status as 'done' | 'skipped' }
      ])
    )

  // Pull key fields from answers (source of truth)
  const startupName = (answers['C2']?.answer as string) ?? study.startup_name ?? null
  const founderName = (answers['C3']?.answer as string) ?? null
  const rawLogoUrl  = (answers['C1']?.answer as string) ?? study.logo_url ?? null

  // Convert logo to base64 using a signed URL (bypasses private bucket auth)
  let logoDataUri: string | null = null
  if (rawLogoUrl) {
    const storagePath = extractStoragePath(rawLogoUrl)
    if (storagePath) {
      // Generate a 60-second signed URL so we can fetch it server-side
      const { data: signedData } = await supabase.storage
        .from('wuduh-uploads')
        .createSignedUrl(storagePath, 60)

      if (signedData?.signedUrl) {
        logoDataUri = await urlToBase64(signedData.signedUrl)
      }
    } else if (rawLogoUrl.startsWith('data:')) {
      // Already a data URI (e.g. from a previous run)
      logoDataUri = rawLogoUrl
    }
  }

  // Inject the base64 logo into answers so the template uses it
  if (logoDataUri) {
    answers['C1'] = { answer: logoDataUri, status: 'done' }
  } else if (answers['C1']) {
    // Clear broken URL so the template shows the dashed placeholder instead
    answers['C1'] = { answer: null, status: 'skipped' }
  }

  // Sync startup name to the study record if it changed
  if (startupName && startupName !== study.startup_name) {
    await supabase
      .from('studies')
      .update({ startup_name: startupName })
      .eq('id', studyId)
  }

  try {
    // Generate PDF
    const pdfBuffer = await generatePdf({
      studyId,
      startup_name: startupName,
      founder_name: founderName,
      logo_url: logoDataUri,
      language: study.language as Language,
      completion_percentage: study.completion_percentage,
      answers,
    })

    // Upload PDF to Supabase Storage
    const filename = `${user.id}/${studyId}/export-${Date.now()}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('wuduh-uploads')
      .upload(filename, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) throw new Error(uploadError.message)

    // Create signed download URL (1 hour expiry)
    const { data: signed } = await supabase.storage
      .from('wuduh-uploads')
      .createSignedUrl(filename, 3600)

    const pdfUrl = signed?.signedUrl ?? null

    // Save export record
    await supabase.from('exports').insert({
      study_id: studyId,
      user_id: user.id,
      pdf_url: pdfUrl,
      language: study.language,
      completion_snapshot: study.completion_percentage,
    })

    // Update study status
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
