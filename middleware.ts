import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = await createServerClient()

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  console.log("Middleware - Session check:", {
    hasSession: !!session,
    userId: session?.user?.id,
    path: request.nextUrl.pathname,
    error: error?.message,
  })

  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      console.log("Middleware - No session, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      console.log("Middleware - Not admin, redirecting to dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Protect dashboard route
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      console.log("Middleware - No session for dashboard, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (session && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    console.log("Middleware - Authenticated user on auth page, redirecting to dashboard")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
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
