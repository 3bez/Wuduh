import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedUser } from '@/lib/auth/session'
import { query } from '@/lib/db'
import { apiError, langFromHeaders } from '@/lib/i18n/errors'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> }
) {
  const { studyId } = await params
  const lang = langFromHeaders(request.headers)
  const user = await getVerifiedUser()
  if (!user) return NextResponse.json({ error: apiError('unauthorized', lang) }, { status: 401 })

  const body = await request.json()

  await query(
    'UPDATE studies SET "startupName" = $1, "updatedAt" = now() WHERE id = $2 AND "userId" = $3',
    [body.startup_name, studyId, user.id]
  )

  return NextResponse.json({ ok: true })
}
