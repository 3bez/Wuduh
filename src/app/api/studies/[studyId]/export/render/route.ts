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

    const html = buildPdfHtml({
      startup_name: startupName,
      founder_name: founderName,
      logo_url: logoDataUri,
      language: study.language,
      completion_percentage: study.completionPercentage,
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
