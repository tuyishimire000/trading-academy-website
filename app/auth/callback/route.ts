import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"

  console.log("Auth callback - Code:", !!code, "Next:", next)

  if (code) {
    const supabase = await createServerClient()

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      console.log("Auth callback - Exchange result:", {
        hasSession: !!data.session,
        userId: data.session?.user?.id,
        error: error?.message,
      })

      if (!error && data.session) {
        console.log("Auth callback - Success, redirecting to:", next)
        return NextResponse.redirect(new URL(next, request.url))
      } else {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error?.message || "Authentication failed")}`, request.url),
        )
      }
    } catch (error) {
      console.error("Auth callback exception:", error)
      return NextResponse.redirect(new URL("/login?error=authentication_failed", request.url))
    }
  }

  console.log("Auth callback - No code present")
  return NextResponse.redirect(new URL("/login?error=no_code_present", request.url))
}
