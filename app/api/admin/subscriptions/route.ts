export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyJwt } from "@/lib/auth/jwt"
import { ensureDatabaseConnection } from "@/lib/sequelize/index"
import { SubscriptionPlan, User, UserSubscription } from "@/lib/sequelize/models"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    const payload = token ? verifyJwt<{ is_admin?: boolean }>(token) : null
    if (!payload?.is_admin) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })

    await ensureDatabaseConnection()

    const subscriptions = await UserSubscription.findAll({ order: [["created_at", "DESC"]] })
    const plans = await SubscriptionPlan.findAll()
    const planById = new Map(plans.map((p: any) => [p.id, p]))

    const users = await User.findAll({ attributes: ["id", "first_name", "last_name"] })
    const userById = new Map(users.map((u: any) => [u.id, u]))

    const enriched = subscriptions.map((s: any) => ({
      id: s.id,
      status: s.status,
      created_at: s.created_at,
      current_period_end: s.current_period_end,
      profiles: {
        first_name: userById.get(s.user_id)?.first_name || "",
        last_name: userById.get(s.user_id)?.last_name || "",
      },
      subscription_plans: {
        name: planById.get(s.plan_id)?.name || "",
        display_name: planById.get(s.plan_id)?.display_name || "",
        price: Number(planById.get(s.plan_id)?.price || 0),
        features: planById.get(s.plan_id)?.features || { features: [] },
      },
    }))

    const active = enriched.filter((s: any) => s.status === "active")
    const totalRevenue = active.reduce((sum: number, s: any) => sum + (s.subscription_plans?.price || 0), 0)
    const cancelledCount = enriched.filter((s: any) => s.status === "cancelled").length
    const churnRate = enriched.length ? (cancelledCount / enriched.length) * 100 : 0
    const planDistribution = enriched.reduce((acc: any, s: any) => {
      const plan = s.subscription_plans?.name || "unknown"
      acc[plan] = (acc[plan] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      subscriptions: enriched,
      statistics: {
        totalRevenue,
        activeSubscriptions: active.length,
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
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    const payload = token ? verifyJwt<{ is_admin?: boolean }>(token) : null
    if (!payload?.is_admin) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })

    const { subscriptionId, status } = await request.json()
    await ensureDatabaseConnection()
    const [affected] = await UserSubscription.update({ status }, { where: { id: subscriptionId }, limit: 1 })
    if (affected === 0) return NextResponse.json({ error: "Subscription not found or no changes" }, { status: 404 })
    const subscription = await UserSubscription.findByPk(subscriptionId)
    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Admin subscription update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
