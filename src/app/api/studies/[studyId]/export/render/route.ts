// GET /api/studies/[studyId]/export/render
// Returns the full HTML document for browser-side PDF printing.

import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedUser } from '@/lib/auth/session'
import { queryOne, query } from '@/lib/db'
import { buildPdfHtml } from '@/lib/pdf/template'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> }
) {
  try {
    const { studyId } = await params
    const user = await getVerifiedUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const study = await queryOne<{
      id: string; language: string; startupName: string | null;
      logoUrl: string | null; completionPercentage: number
    }>(
      'SELECT * FROM studies WHERE id = $1 AND "userId" = $2',
      [studyId, user.id]
    )
    if (!study) return new NextResponse('Not found', { status: 404 })

    const answersRaw = await query<{ card_id: string; answer: unknown; status: string }>(
      'SELECT "cardId" as card_id, answer, status FROM answers WHERE "studyId" = $1',
      [studyId]
    )

    const answers = Object.fromEntries(
      answersRaw.map(a => [a.card_id, { answer: a.answer, status: a.status }])
    )

    const startupName = (answers['C2']?.answer as string) ?? study.startupName ?? null
    const founderName = (answers['C3']?.answer as string) ?? null
    const rawLogoUrl  = (answers['C1']?.answer as string) ?? study.logoUrl ?? null

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

    // Embed the solution visual (card 2.8) as base64 so the print view can render it.
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
      language: study.language,
      completion_percentage: study.completionPercentage,
      answers,
    })

    const footerDir  = study.language === 'ar' ? 'rtl' : 'ltr'
    const footerMeta = study.language === 'ar'
      ? `${startupName ?? 'Wuduh'} \u00b7 \u062f\u0631\u0627\u0633\u0629 \u062c\u062f\u0648\u0649`
      : `${startupName ?? 'Wuduh'} \u00b7 Feasibility Study`

    const printHtml = html.replace(
      '</head>',
      `<style>
        /* Reserve a bottom band on every printed page for the fixed footer. */
        @page { size: A4; margin: 0 0 14mm 0; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { page-break-after: always; box-shadow: none !important; }
          .page:last-child { page-break-after: auto; }
          /* Fixed footer repeats on every page in print; no forced page height,
             so short sections no longer create blank footer-only pages. */
          .print-footer { position: fixed; bottom: 0; left: 0; right: 0; height: 14mm;
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 56px; box-sizing: border-box; border-top: 1px solid #EAE3D2;
            background: #FAF7F0; font-family: 'Courier New', monospace; color: #8795A6;
            font-size: 8px; letter-spacing: 0.08em; direction: ${footerDir}; }
        }
        @media screen {
          body { background: #666; padding: 20px; }
          .page { margin: 0 auto 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); max-width: 210mm; }
          .print-footer { display: none; }
        }
      </style>
      </head>`
    ).replace(
      '</body>',
      `<div class="print-footer">
        <span style="font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:11px;color:#0D1B2A;letter-spacing:0">Wuduh</span>
        <span style="text-transform:uppercase">${footerMeta}</span>
      </div>
      <script>
        window.addEventListener('load', function() {
          setTimeout(function() { window.print(); }, 1200);
        });
      </script>
      </body>`
    )

    // Log export
    try {
      await query(
        `INSERT INTO exports ("studyId", "userId", pdf_url, language, "completionSnapshot")
         VALUES ($1, $2, $3, $4, $5)`,
        [studyId, user.id, null, study.language, study.completionPercentage]
      )
    } catch (e) { console.error('[export/render] failed to log export record:', e) }

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
