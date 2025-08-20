import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { SubscriptionPlan } = await import("@/lib/sequelize/models")
    await ensureDatabaseConnection()

    // Check if free plan already exists
    const existingPlan = await SubscriptionPlan.findOne({ where: { name: 'free' } })
    
    if (existingPlan) {
      return NextResponse.json({ message: "Free plan already exists" })
    }

    // Create free plan
    const freePlan = await SubscriptionPlan.create({
      name: 'free',
      display_name: 'Free',
      description: 'Get started with trading',
      price: 0.00,
      billing_cycle: 'monthly',
      features: {
        features: [
          "Basic trading introduction",
          "Limited course access (3 courses)",
          "Community forum access",
          "Email support",
          "Mobile app access"
        ],
        max_courses: 3,
        live_sessions_per_month: 0,
        one_on_one_sessions: 0,
        priority_support: false
      },
      is_active: true
    })

    return NextResponse.json({ 
      message: "Free plan created successfully",
      plan: {
        id: freePlan.id,
        name: freePlan.name,
        display_name: freePlan.display_name,
        price: freePlan.price
      }
    })

  } catch (error) {
    console.error("Error creating free plan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

