import { NextRequest, NextResponse } from 'next/server'

// Better Auth handles its own callback via /api/auth/[...all]
// This route redirects legacy Supabase callback URLs to dashboard
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get('next') ?? '/dashboard'
  return NextResponse.redirect(`${origin}${next}`)
}
