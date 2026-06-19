import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/session'
import { query } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> }
) {
  const { studyId } = await params
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  await query(
    'UPDATE studies SET "startupName" = $1, updated_at = now() WHERE id = $2 AND "userId" = $3',
    [body.startup_name, studyId, user.id]
  )

  return NextResponse.json({ ok: true })
}
