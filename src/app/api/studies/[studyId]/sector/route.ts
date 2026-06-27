import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedUser } from '@/lib/auth/session'
import { query } from '@/lib/db'
import { apiError, langFromHeaders } from '@/lib/i18n/errors'

const VALID_SECTORS = ['general', 'fintech', 'ecommerce', 'saas']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> }
) {
  const { studyId } = await params
  const lang = langFromHeaders(request.headers)
  const user = await getVerifiedUser()
  if (!user) return NextResponse.json({ error: apiError('unauthorized', lang) }, { status: 401 })

  const { sector } = await request.json()
  if (!sector || !VALID_SECTORS.includes(sector)) {
    return NextResponse.json({ error: 'Invalid sector' }, { status: 400 })
  }

  await query(
    'UPDATE studies SET sector = $1, "updatedAt" = now() WHERE id = $2 AND "userId" = $3',
    [sector, studyId, user.id]
  )

  return NextResponse.json({ ok: true })
}
