// POST /api/studies/[studyId]/export
// Generates a PDF using PDFShift and returns a signed download URL.

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { buildPdfHtml } from '@/lib/pdf/template'

async function urlToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const contentType = (res.headers.get('content-type') ?? 'image/png').split(';')[0].trim()
    const buffer = await res.arrayBuffer()
    // Use Web API instead of Node.js Buffer
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
    const base64 = btoa(binary)
    return `data:${contentType};base64,${base64}`
  } catch {
    return null
  }
}

function extractStoragePath(url: string): string | null {
  try {
    const u = new URL(url)
    const match = u.pathname.match(/\/object\/(?:public|sign)\/wuduh-uploads\/(.+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

async function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> }
) {
  try {
    const { studyId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: study } = await supabase
      .from('studies').select('*')
      .eq('id', studyId).eq('user_id', user.id).single()

    if (!study) return NextResponse.json({ error: 'Study not found' }, { status: 404 })

    const { data: answersRaw } = await supabase
      .from('answers').select('card_id, answer, status')
      .eq('study_id', studyId)

    const answers = Object.fromEntries(
      (answersRaw ?? []).map(a => [a.card_id, { answer: a.answer, status: a.status }])
    )

    const startupName = answers['C2']?.answer ?? study.startup_name ?? null
    const founderName = answers['C3']?.answer ?? null
    const rawLogoUrl  = answers['C1']?.answer ?? study.logo_url ?? null

    // Convert logo to base64 (Web API)
    let logoDataUri = null
    if (rawLogoUrl) {
      const storagePath = extractStoragePath(rawLogoUrl)
      if (storagePath) {
        const { data: signedData } = await supabase.storage
          .from('wuduh-uploads').createSignedUrl(storagePath, 60)
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
      await supabase.from('studies').update({ startup_name: startupName }).eq('id', studyId)
    }

    const html = buildPdfHtml({
      startup_name: startupName,
      founder_name: founderName,
      logo_url: logoDataUri,
      language: study.language,
      completion_percentage: study.completion_percentage,
      answers,
    })

    const apiKey = process.env.PDFSHIFT_API_KEY
    if (!apiKey) throw new Error('PDFSHIFT_API_KEY is not set')

    const pdfResponse = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: html, format: 'A4', margin: '0', landscape: false }),
    })

    if (!pdfResponse.ok) {
      const errText = await pdfResponse.text()
      throw new Error(`PDFShift error ${pdfResponse.status}: ${errText}`)
    }

    // Convert PDF to base64 using Web API (no Buffer)
    const pdfArrayBuffer = await pdfResponse.arrayBuffer()
    const pdfBase64 = await arrayBufferToBase64(pdfArrayBuffer)

    // Upload to Supabase Storage as base64-decoded bytes
    const pdfBytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0))
    const filename = `${user.id}/${studyId}/export-${Date.now()}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('wuduh-uploads')
      .upload(filename, pdfBytes, { contentType: 'application/pdf', upsert: true })

    if (uploadError) throw new Error(uploadError.message)

    const { data: signed } = await supabase.storage
      .from('wuduh-uploads').createSignedUrl(filename, 3600)

    const pdfUrl = signed?.signedUrl ?? null

    try {
      await supabase.from('exports').insert({
        study_id: studyId, user_id: user.id, pdf_url: pdfUrl,
        language: study.language, completion_snapshot: study.completion_percentage,
      })
    } catch (_) {}

    await supabase.from('studies').update({ status: 'exported' }).eq('id', studyId)

    return NextResponse.json({ ok: true, url: pdfUrl })
  } catch (err) {
    console.error('[export]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'PDF generation failed' },
      { status: 500 }
    )
  }
}
