import { NextRequest, NextResponse } from 'next/server'

// Auth guard is handled per-page via getUser() in server components.
// Each protected page (dashboard, study) calls getUser() and redirects
// to /login if no session — this runs in the Node.js runtime where pg works fine.
//
// We keep this proxy file because Next.js 16 requires it, but we do not
// block requests here to avoid cookie-timing issues with better-auth.

export function proxy(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
