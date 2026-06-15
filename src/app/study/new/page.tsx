// POST /study/new — creates a new study and redirects to card C0

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function NewStudyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Create the study
  const { data: study, error } = await supabase
    .from('studies')
    .insert({ user_id: user.id, language: 'en' })
    .select('id')
    .single()

  if (error || !study) redirect('/dashboard')

  // Send straight to the first card
  redirect(`/study/${study.id}?card=C0`)
}
