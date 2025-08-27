import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/', 
    '/login', 
    '/signup', 
    '/forgot-password', 
    '/reset-password', 
    '/verify-email', 
    '/verify-reset-code',
    '/api/auth/signin',
    '/api/auth/signup',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-email',
    '/api/auth/verify-reset-code',
    '/api/auth/resend-verification',
    '/api/health',
    '/api/setup-database'
  ]
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Check if it's a public route
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if it's an API route
  if (pathname.startsWith('/api/')) {
    // Let API routes handle their own authentication
    return NextResponse.next()
  }

  // For all other routes, check for auth token
  const token = request.cookies.get("auth-token")?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If token exists, allow access (JWT verification will be handled by individual pages/API routes)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
