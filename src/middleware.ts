import { auth } from '@/lib/auth/auth'
import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard', '/study']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtected) {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
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
