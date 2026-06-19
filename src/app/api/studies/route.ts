import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/session'
import { query, queryOne } from '@/lib/db'

// POST /api/studies — create a new study
export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { language, startup_name } = await request.json()

  const study = await queryOne<{ id: string }>(
    `INSERT INTO studies (user_id, language, startup_name)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [user.id, language ?? 'en', startup_name ?? null]
  )

  if (!study) return NextResponse.json({ error: 'Failed to create study' }, { status: 500 })

  return NextResponse.json(study)
}

// GET /api/studies — list user's studies
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const studies = await query(
    'SELECT * FROM studies WHERE user_id = $1 ORDER BY updated_at DESC',
    [user.id]
  )

  return NextResponse.json(studies)
}
