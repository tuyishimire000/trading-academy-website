import { createServerClient } from "@/lib/supabase/server"
import { getBaseUrl } from "@/lib/utils/site-config"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, plan } = await request.json()

    const supabase = await createServerClient()
    const baseUrl = getBaseUrl()

    // Sign up the user with email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 400 })
    }

    // Get the selected plan
    const { data: planData, error: planError } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("name", plan)
      .single()

    if (planError || !planData) {
      return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 })
    }

    // Create user subscription (in a real app, this would be handled after payment)
    const { error: subscriptionError } = await supabase.from("user_subscriptions").insert({
      user_id: authData.user.id,
      plan_id: planData.id,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    })

    if (subscriptionError) {
      console.error("Subscription creation error:", subscriptionError)
      // Don't fail the signup if subscription creation fails
    }

    return NextResponse.json({
      message: "User created successfully. Please check your email to verify your account.",
      user: authData.user,
      needsEmailVerification: !authData.session,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
