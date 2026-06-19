import { getUser } from '@/lib/auth/session'
import { queryOne } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> }
) {
  const { studyId } = await params
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const study = await queryOne(
    'SELECT startup_name, language, completion_percentage, status FROM studies WHERE id = $1 AND user_id = $2',
    [studyId, user.id]
  )

  if (!study) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(study)
}
