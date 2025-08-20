import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { SubscriptionPlan } = await import("@/lib/sequelize/models")
    await ensureDatabaseConnection()

    // Get all subscription plans
    const allPlans = await SubscriptionPlan.findAll()
    console.log("All plans found:", allPlans.length)

    const results = []

    for (const plan of allPlans) {
      console.log(`Plan: ${plan.name}, ID: ${plan.id}`)
      
      // Fix empty IDs
      if (!plan.id || plan.id === '') {
        const newId = crypto.randomUUID()
        await plan.update({ id: newId })
        results.push({
          name: plan.name,
          action: "Fixed empty ID",
          newId: newId
        })
        console.log(`Fixed ${plan.name} with new ID: ${newId}`)
      } else {
        results.push({
          name: plan.name,
          action: "Already has valid ID",
          id: plan.id
        })
      }
    }

    return NextResponse.json({ 
      message: "Subscription plans cleanup completed",
      results: results
    })

  } catch (error) {
    console.error("Error cleaning up plans:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

