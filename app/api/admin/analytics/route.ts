import { createServerClient } from "@/lib/supabase/server"
import { checkAdminPermission } from "@/lib/auth/admin"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { hasPermission, error } = await checkAdminPermission("analytics", "read")

    if (!hasPermission) {
      return NextResponse.json({ error: error || "Insufficient permissions" }, { status: 403 })
    }

    const supabase = await createServerClient()

    // Get user growth data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: userGrowth, error: userGrowthError } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true })

    // Get total users
    const { count: totalUsers, error: totalUsersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    // Get active subscriptions
    const { count: activeSubscriptions, error: activeSubsError } = await supabase
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")

    // Get total courses
    const { count: totalCourses, error: totalCoursesError } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })

    // Get total events
    const { count: totalEvents, error: totalEventsError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })

    // Get course completion rates
    const { data: courseProgress, error: courseProgressError } = await supabase.from("user_course_progress").select(`
        status,
        progress_percentage,
        courses (
          title
        )
      `)

    // Get revenue data (mock calculation based on active subscriptions)
    const { data: revenueData, error: revenueError } = await supabase
      .from("user_subscriptions")
      .select(`
        status,
        current_period_start,
        subscription_plans (
          price
        )
      `)
      .eq("status", "active")

    // Calculate monthly revenue
    const monthlyRevenue =
      revenueData?.reduce((total, sub) => {
        return total + (sub.subscription_plans?.price || 0)
      }, 0) || 0

    // Process user growth data by day
    const userGrowthByDay =
      userGrowth?.reduce((acc: any, user) => {
        const date = new Date(user.created_at).toISOString().split("T")[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {}) || {}

    // Calculate course completion rates
    const completionRates =
      courseProgress?.reduce((acc: any, progress) => {
        const courseTitle = progress.courses?.title || "Unknown Course"
        if (!acc[courseTitle]) {
          acc[courseTitle] = { total: 0, completed: 0 }
        }
        acc[courseTitle].total += 1
        if (progress.status === "completed") {
          acc[courseTitle].completed += 1
        }
        return acc
      }, {}) || {}

    const analytics = {
      overview: {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalCourses: totalCourses || 0,
        totalEvents: totalEvents || 0,
        monthlyRevenue,
      },
      userGrowth: userGrowthByDay,
      completionRates,
      recentActivity: userGrowth?.slice(-10) || [],
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Admin analytics fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
