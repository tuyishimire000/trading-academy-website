import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total users
    const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    // Get active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")

    // Get total courses
    const { count: totalCourses } = await supabase.from("courses").select("*", { count: "exact", head: true })

    // Get upcoming events
    const { count: upcomingEvents } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "scheduled")
      .gte("start_time", new Date().toISOString())

    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: recentSignups } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString())

    // Get subscription breakdown
    const { data: subscriptionBreakdown } = await supabase
      .from("user_subscriptions")
      .select(`
        subscription_plans (
          name,
          display_name
        )
      `)
      .eq("status", "active")

    const planCounts = subscriptionBreakdown?.reduce((acc: any, sub: any) => {
      const planName = sub.subscription_plans?.display_name || "Unknown"
      acc[planName] = (acc[planName] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalCourses: totalCourses || 0,
        upcomingEvents: upcomingEvents || 0,
        recentSignups: recentSignups || 0,
        subscriptionBreakdown: planCounts || {},
      },
    })
  } catch (error) {
    console.error("Admin stats fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
