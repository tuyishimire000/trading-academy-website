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

    // Get recent user activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentUsers, error: recentUsersError } = await supabase
      .from("profiles")
      .select("first_name, last_name, created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(10)

    // Get event registrations
    const { data: eventRegistrations, error: eventRegError } = await supabase
      .from("event_registrations")
      .select(`
        *,
        events (
          title,
          event_date
        ),
        profiles (
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(20)

    // Get course enrollments (recent)
    const { data: courseEnrollments, error: courseEnrollError } = await supabase
      .from("user_course_progress")
      .select(`
        created_at,
        status,
        courses (
          title
        ),
        profiles (
          first_name,
          last_name
        )
      `)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(15)

    // Mock Discord statistics (you can replace with real Discord API data)
    const discordStats = {
      totalMembers: 1247,
      onlineMembers: 89,
      newMembersToday: 12,
      messagesLast24h: 156,
      activeChannels: 8,
    }

    // Calculate community engagement metrics
    const totalUsers = await supabase.from("profiles").select("*", { count: "exact", head: true })

    const activeUsers = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("updated_at", sevenDaysAgo.toISOString())

    const engagementRate = totalUsers.count ? Math.round(((activeUsers.count || 0) / totalUsers.count) * 100) : 0

    return NextResponse.json({
      community: {
        recentUsers: recentUsers || [],
        eventRegistrations: eventRegistrations || [],
        courseEnrollments: courseEnrollments || [],
        discordStats,
        engagement: {
          totalUsers: totalUsers.count || 0,
          activeUsers: activeUsers.count || 0,
          engagementRate,
        },
      },
    })
  } catch (error) {
    console.error("Admin community fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
