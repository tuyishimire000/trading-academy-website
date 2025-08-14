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

    // Get all subscriptions with user and plan details
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("user_subscriptions")
      .select(`
        *,
        profiles (
          first_name,
          last_name
        ),
        subscription_plans (
          name,
          display_name,
          price,
          features
        )
      `)
      .order("created_at", { ascending: false })

    // Get subscription statistics
    const { data: stats, error: statsError } = await supabase
      .from("user_subscriptions")
      .select("status, subscription_plans(price)")

    // Calculate revenue and churn
    const totalRevenue =
      stats?.reduce((sum, sub) => {
        return sum + (sub.status === "active" ? sub.subscription_plans?.price || 0 : 0)
      }, 0) || 0

    const activeCount = stats?.filter((sub) => sub.status === "active").length || 0
    const cancelledCount = stats?.filter((sub) => sub.status === "cancelled").length || 0
    const churnRate = stats?.length ? (cancelledCount / stats.length) * 100 : 0

    // Get plan distribution
    const planDistribution =
      stats?.reduce((acc: any, sub) => {
        const planName = sub.subscription_plans?.name || "unknown"
        acc[planName] = (acc[planName] || 0) + 1
        return acc
      }, {}) || {}

    return NextResponse.json({
      subscriptions,
      statistics: {
        totalRevenue,
        activeSubscriptions: activeCount,
        churnRate: Math.round(churnRate * 100) / 100,
        planDistribution,
      },
    })
  } catch (error) {
    console.error("Admin subscriptions fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { hasPermission, error } = await checkAdminPermission("users", "update")

    if (!hasPermission) {
      return NextResponse.json({ error: error || "Insufficient permissions" }, { status: 403 })
    }

    const { subscriptionId, status } = await request.json()
    const supabase = await createServerClient()

    const { data, error: updateError } = await supabase
      .from("user_subscriptions")
      .update({ status })
      .eq("id", subscriptionId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ subscription: data })
  } catch (error) {
    console.error("Admin subscription update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
