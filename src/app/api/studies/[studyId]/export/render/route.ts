// @ts-nocheck
// GET /api/studies/[studyId]/export/render
// Returns the full HTML document for browser-side PDF printing.

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function urlToBase64(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const contentType = (res.headers.get('content-type') ?? 'image/png').split(';')[0].trim()
    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return `data:${contentType};base64,${base64}`
  } catch {
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

export async function GET(request, { params }) {
  try {
    const { studyId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const { data: study } = await supabase
      .from('studies')
      .select('*')
      .eq('id', studyId)
      .eq('user_id', user.id)
      .single()

    if (!study) return new NextResponse('Not found', { status: 404 })

    const { data: answersRaw } = await supabase
      .from('answers')
      .select('card_id, answer, status')
      .eq('study_id', studyId)

    const answers = Object.fromEntries(
      (answersRaw ?? []).map(a => [a.card_id, { answer: a.answer, status: a.status }])
    )

    const startupName = answers['C2']?.answer ?? study.startup_name ?? null
    const founderName = answers['C3']?.answer ?? null
    const rawLogoUrl  = answers['C1']?.answer ?? study.logo_url ?? null

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

    // Dynamically import to avoid module-level errors
    const { buildPdfHtml } = await import('@/lib/pdf/template')

    const html = buildPdfHtml({
      startup_name: startupName,
      founder_name: founderName,
      logo_url: logoDataUri,
      language: study.language,
      completion_percentage: study.completion_percentage,
      answers,
    })

    const printHtml = html.replace(
      '</head>',
      `<style>
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { page-break-after: always; box-shadow: none !important; }
          .page:last-child { page-break-after: auto; }
        }
        @media screen {
          body { background: #666; padding: 20px; }
          .page { margin: 0 auto 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); max-width: 210mm; }
        }
      </style>
      </head>`
    ).replace(
      '</body>',
      `<script>
        window.addEventListener('load', function() {
          setTimeout(function() { window.print(); }, 1200);
        });
      </script>
      </body>`
    )

    // Log export — ignore errors
    try {
      await supabase.from('exports').insert({
        study_id: studyId,
        user_id: user.id,
        pdf_url: null,
        language: study.language,
        completion_snapshot: study.completion_percentage,
      })
    } catch (_) {}

    return new NextResponse(printHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[render] error:', err)
    return new NextResponse(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
