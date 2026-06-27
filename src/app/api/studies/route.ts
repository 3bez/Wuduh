import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedUser } from '@/lib/auth/session'
import { query, queryOne } from '@/lib/db'
import { apiError, langFromHeaders } from '@/lib/i18n/errors'

// POST /api/studies — create a new study
export async function POST(request: NextRequest) {
  const lang = langFromHeaders(request.headers)
  const user = await getVerifiedUser()
  if (!user) return NextResponse.json({ error: apiError('unauthorized', lang) }, { status: 401 })

  const { language, startup_name } = await request.json()

  const study = await queryOne<{ id: string }>(
    `INSERT INTO studies ("userId", language, "startupName")
     VALUES ($1, $2, $3)
     RETURNING id`,
    [user.id, language ?? 'en', startup_name ?? null]
  )

  if (!study) return NextResponse.json({ error: apiError('failed_create_study', lang) }, { status: 500 })

  return NextResponse.json(study)
}

// GET /api/studies — list user's studies
export async function GET(request: NextRequest) {
  const lang = langFromHeaders(request.headers)
  const user = await getVerifiedUser()
  if (!user) return NextResponse.json({ error: apiError('unauthorized', lang) }, { status: 401 })

  const studies = await query(
    'SELECT * FROM studies WHERE "userId" = $1 ORDER BY "updatedAt" DESC',
    [user.id]
  )

  return NextResponse.json(studies)
}
