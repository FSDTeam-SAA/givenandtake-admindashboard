// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/api/auth',
    '/_next',
    '/favicon.ico',
  ]

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Allow public routes
  if (isPublicRoute) return NextResponse.next()

  // Redirect to login if no token
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based restrictions
  const role = token?.user.role // assuming your JWT includes "role"



  // Routes restricted for admin
  const restrictedForAdmin = ['/payment-details', '/plan', '/subscriber']

  if (role === 'admin' && restrictedForAdmin.some((route) => pathname.startsWith(route))) {
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }

  // Super-admin has full access
  if (role === 'super-admin') {
    return NextResponse.next()
  }

  // Default allow
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
