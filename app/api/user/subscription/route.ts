import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyJwt } from "@/lib/auth/jwt"
import { ensureDatabaseConnection } from "@/lib/sequelize/index"
import { SubscriptionPlan } from "@/lib/sequelize/models"
export const runtime = "nodejs"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = verifyJwt<{ sub: string }>(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // For demo, default everyone to 'pro'; in a full build, look up user_subscriptions
    await ensureDatabaseConnection()
    const plan = await SubscriptionPlan.findOne({ where: { name: "pro" } })
    if (!plan) return NextResponse.json({ subscription: null })

    return NextResponse.json({
      subscription: {
        id: "demo",
        plan_id: plan.id,
        status: "active",
        current_period_end: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        subscription_plans: {
          name: plan.getDataValue("name"),
          display_name: plan.getDataValue("display_name"),
          features: plan.getDataValue("features"),
        },
      },
    })
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}





