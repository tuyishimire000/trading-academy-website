import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyJwt } from "@/lib/auth/jwt"
import { ensureDatabaseConnection } from "@/lib/sequelize/index"
import { UserSubscription, SubscriptionPlan } from "@/lib/sequelize/models"
export const runtime = "nodejs"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = verifyJwt<{ sub: string }>(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await ensureDatabaseConnection()
    
    // Look up the user's actual subscription
    const userSubscription = await UserSubscription.findOne({
      where: { user_id: payload.sub },
      include: [{ model: SubscriptionPlan, as: 'plan' }],
      order: [['created_at', 'DESC']] // Get the most recent subscription
    })

    if (!userSubscription) {
      return NextResponse.json({ subscription: null })
    }

    return NextResponse.json({
      subscription: {
        id: userSubscription.id,
        plan_id: userSubscription.plan_id,
        status: userSubscription.status,
        current_period_start: userSubscription.current_period_start,
        current_period_end: userSubscription.current_period_end,
        plan: userSubscription.plan ? {
          id: userSubscription.plan.id,
          name: userSubscription.plan.name,
          display_name: userSubscription.plan.display_name,
          price: Number(userSubscription.plan.price),
          billing_cycle: userSubscription.plan.billing_cycle,
          features: userSubscription.plan.features,
        } : null,
      },
    })
  } catch (err) {
    console.error("Subscription fetch error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}





