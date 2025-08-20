import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJwt } from "@/lib/auth/jwt"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/verify-reset-code']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin')

  // Protected routes that require active subscription
  const protectedRoutes = ['/dashboard', '/courses', '/events', '/community', '/portfolio', '/notifications', '/quiz']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Check if it's a public route
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check authentication
  const token = request.cookies.get("auth-token")?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const payload = verifyJwt(token)
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // For admin routes, check admin status
    if (isAdminRoute) {
      if (!payload.is_admin) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.next()
    }

    // For protected routes, we'll let the individual pages handle subscription checks
    // This avoids the middleware API call issue
    if (isProtectedRoute) {
      return NextResponse.next()
    }

    // Allow access to other authenticated routes
    return NextResponse.next()

  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
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
