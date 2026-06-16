import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> }
) {
  const { studyId } = await params
  const supabase    = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: study } = await supabase
    .from('studies')
    .select('startup_name, language, completion_percentage, status')
    .eq('id', studyId)
    .eq('user_id', user.id)
    .single()

  if (!study) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(study)
}
