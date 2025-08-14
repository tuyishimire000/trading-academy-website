import { createServerClient } from "@/lib/supabase/server"
import { checkAdminPermission } from "@/lib/auth/admin"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { hasPermission, error } = await checkAdminPermission("users", "read")

    if (!hasPermission) {
      return NextResponse.json({ error: error || "Insufficient permissions" }, { status: 403 })
    }

    const supabase = await createServerClient()

    // Fetch users with their profiles, subscriptions, and course progress
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select(`
        *,
        user_subscriptions (
          id,
          status,
          current_period_start,
          current_period_end,
          subscription_plans (
            display_name,
            name,
            price
          )
        ),
        user_course_progress (
          id,
          status,
          progress_percentage,
          courses (
            title
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 400 })
    }

    // Get user emails from auth.users (requires service role)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    // Merge profile data with auth data
    const enrichedUsers = users?.map((user) => {
      const authUser = authUsers?.users?.find((au) => au.id === user.id)
      return {
        ...user,
        email: authUser?.email,
        email_confirmed_at: authUser?.email_confirmed_at,
        last_sign_in_at: authUser?.last_sign_in_at,
      }
    })

    return NextResponse.json({ users: enrichedUsers })
  } catch (error) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { hasPermission, error } = await checkAdminPermission("users", "update")

    if (!hasPermission) {
      return NextResponse.json({ error: error || "Insufficient permissions" }, { status: 403 })
    }

    const { userId, updates } = await request.json()
    const supabase = await createServerClient()

    const { data, error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error("Admin user update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
