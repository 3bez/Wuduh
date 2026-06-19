import { NextRequest, NextResponse } from 'next/server'

// Cannot import `auth` (better-auth) here — it uses `pg` which requires
// Node.js native modules (node:util/types etc.) unavailable in the Edge Runtime.
// We do a lightweight cookie-presence check instead.
// Real session validation happens in each server component / API route
// via getUser(), which runs in the full Node.js runtime.

const protectedRoutes = ['/dashboard', '/study']

// better-auth sets this cookie (cookiePrefix "wuduh" defined in auth.ts)
const SESSION_COOKIE = 'wuduh.session_token'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtected) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE)
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
