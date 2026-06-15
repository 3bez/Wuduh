import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// This route is called by Supabase after email confirmation.
// It exchanges the code for a session and redirects to the dashboard.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failed — redirect to login with error indicator
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
