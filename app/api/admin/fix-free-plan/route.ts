import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { SubscriptionPlan } = await import("@/lib/sequelize/models")
    await ensureDatabaseConnection()

    // Find the free plan with empty ID
    const freePlan = await SubscriptionPlan.findOne({ where: { name: 'free' } })
    
    if (!freePlan) {
      return NextResponse.json({ error: "Free plan not found" }, { status: 404 })
    }

    // Check if ID is empty or null
    if (!freePlan.id || freePlan.id === '') {
      // Generate a new UUID
      const newId = crypto.randomUUID()
      
      // Update the plan with new ID
      await freePlan.update({ id: newId })
      
      console.log("Fixed free plan ID:", newId)
      
      return NextResponse.json({ 
        message: "Free plan ID fixed successfully",
        newId: newId
      })
    } else {
      return NextResponse.json({ 
        message: "Free plan already has a valid ID",
        id: freePlan.id
      })
    }

  } catch (error) {
    console.error("Error fixing free plan ID:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

