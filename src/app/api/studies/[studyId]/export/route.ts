// POST /api/studies/[studyId]/export
// Generates a PDF using PDFShift, uploads to MinIO, returns a presigned URL.

import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedUser } from '@/lib/auth/session'
import { query, queryOne } from '@/lib/db'
import { buildPdfHtml, buildPdfFooter } from '@/lib/pdf/template'
import type { Language } from '@/types/cards'
import { getMinioClient, BUCKET } from '@/lib/storage'

async function urlToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const contentType = (res.headers.get('content-type') ?? 'image/png').split(';')[0].trim()
    const buffer = await res.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
    return `data:${contentType};base64,${btoa(binary)}`
  } catch {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> }
) {
  try {
    const { studyId } = await params
    const user = await getVerifiedUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const study = await queryOne<{
      id: string; language: string; startupName: string | null;
      logoUrl: string | null; completionPercentage: number; status: string
    }>(
      'SELECT * FROM studies WHERE id = $1 AND "userId" = $2',
      [studyId, user.id]
    )
    if (!study) return NextResponse.json({ error: 'Study not found' }, { status: 404 })

    const answersRaw = await query<{ card_id: string; answer: unknown; status: string }>(
      'SELECT "cardId" as card_id, answer, status FROM answers WHERE "studyId" = $1',
      [studyId]
    )

    const answers = Object.fromEntries(
      answersRaw.map(a => [a.card_id, { answer: a.answer, status: a.status as 'done' | 'skipped' }])
    )

    const startupName = (answers['C2']?.answer as string) ?? study.startupName ?? null
    const founderName = (answers['C3']?.answer as string) ?? null
    const rawLogoUrl  = (answers['C1']?.answer as string) ?? study.logoUrl ?? null

    // Convert logo to base64 if it's a URL
    let logoDataUri: string | null = null
    if (rawLogoUrl) {
      if (rawLogoUrl.startsWith('data:')) {
        logoDataUri = rawLogoUrl
      } else if (rawLogoUrl.startsWith('http')) {
        logoDataUri = await urlToBase64(rawLogoUrl)
      }
    }

    if (logoDataUri) {
      answers['C1'] = { answer: logoDataUri, status: 'done' }
    }

    // Embed the solution visual (card 2.8) as base64 so PDFShift can render it.
    // Its raw value is a MinIO/presigned URL PDFShift usually can't fetch directly,
    // which is why it previously fell back to printing "File attached".
    const rawVisual = (answers['2.8']?.answer as string) ?? null
    if (rawVisual && rawVisual.startsWith('http')) {
      const visualDataUri = await urlToBase64(rawVisual)
      if (visualDataUri) {
        answers['2.8'] = { answer: visualDataUri, status: answers['2.8']?.status ?? 'done' }
      }
    }

    const html = buildPdfHtml({
      startup_name: startupName,
      founder_name: founderName,
      logo_url: logoDataUri,
      language: study.language as Language,
      completion_percentage: study.completionPercentage,
      answers,
    })

    const apiKey = process.env.PDFSHIFT_API_KEY
    if (!apiKey) throw new Error('PDFSHIFT_API_KEY is not set')

    const pdfResponse = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: html,
        format: 'A4',
        landscape: false,
        // Reserve space at the bottom for the repeating footer; keep the rest full-bleed.
        margin: { top: '0', right: '0', bottom: '14mm', left: '0' },
        // Footer drawn by PDFShift on EVERY page (real page numbers via {{page}}/{{total}}).
        // Pulling it out of the page flow is what stops short sections from spawning
        // blank footer-only pages, in any study.
        footer: {
          source: buildPdfFooter(study.language as Language, startupName ?? 'Wuduh'),
          height: '14mm',
          start_at: 1,
        },
        // Safety net: drop any genuinely empty page in edge-case studies.
        remove_blank: true,
      }),
    })

    if (!pdfResponse.ok) {
      const errText = await pdfResponse.text()
      throw new Error(`PDFShift error ${pdfResponse.status}: ${errText}`)
    }

    // Upload PDF to MinIO
    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer())
    const filename  = `${user.id}/${studyId}/export-${Date.now()}.pdf`
    const minio     = getMinioClient()

    await minio.putObject(BUCKET, filename, pdfBuffer, pdfBuffer.length, {
      'Content-Type': 'application/pdf',
    })

    // Generate presigned URL valid for 1 hour
    const pdfUrl = await minio.presignedGetObject(BUCKET, filename, 3600)

    // Save export record
    try {
      await query(
        `INSERT INTO exports ("studyId", "userId", pdf_url, language, "completionSnapshot")
         VALUES ($1, $2, $3, $4, $5)`,
        [studyId, user.id, pdfUrl, study.language, study.completionPercentage]
      )
    } catch (e) { console.error('[export] failed to log export record:', e) }

    // Mark study as exported
    await query('UPDATE studies SET status = $1 WHERE id = $2', ['exported', studyId])

    return NextResponse.json({ ok: true, url: pdfUrl })
  } catch (err) {
    console.error('[export]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'PDF generation failed' },
      { status: 500 }
    )
  }
}
