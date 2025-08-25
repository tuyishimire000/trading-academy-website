export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth/server"
import { PaymentMethod } from "@/lib/sequelize/models"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = user.id

    // Fetch payment methods for the user
    const paymentMethods = await PaymentMethod.findAll({
      where: { 
        user_id: userId,
        is_active: true
      },
      order: [
        ["is_default", "DESC"],
        ["created_at", "DESC"]
      ]
    })

    return NextResponse.json({
      success: true,
      paymentMethods: paymentMethods.map(method => ({
        id: method.id,
        payment_type: method.payment_type,
        payment_provider: method.payment_provider,
        display_name: method.display_name,
        masked_data: method.masked_data,
        is_default: method.is_default,
        is_active: method.is_active,
        metadata: method.metadata
      }))
    })

  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch payment methods",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
