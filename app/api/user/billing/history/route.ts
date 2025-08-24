import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth/server"
import { UserSubscriptionHistory, SubscriptionPlan } from "@/lib/sequelize/models"
import { Op } from "sequelize"

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

    // Fetch subscription history for the user
    const history = await UserSubscriptionHistory.findAll({
      where: { user_id: userId },
      include: [
        {
          model: SubscriptionPlan,
          as: "previousPlan",
          attributes: ["display_name"]
        },
        {
          model: SubscriptionPlan,
          as: "newPlan",
          attributes: ["display_name"]
        }
      ],
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "action_type",
        "payment_method",
        "payment_amount",
        "payment_currency",
        "payment_status",
        "billing_cycle",
        "transaction_id",
        "created_at",
        "metadata"
      ]
    })

    // Transform the data for the frontend
    const transformedHistory = history.map(record => ({
      id: record.id,
      action_type: record.action_type,
      previous_plan: record.previousPlan?.display_name || null,
      new_plan: record.newPlan?.display_name || "Unknown Plan",
      payment_method: record.payment_method,
      payment_amount: record.payment_amount,
      payment_currency: record.payment_currency,
      payment_status: record.payment_status,
      billing_cycle: record.billing_cycle,
      transaction_id: record.transaction_id,
      created_at: record.created_at.toISOString(),
      metadata: record.metadata
    }))

    return NextResponse.json({
      success: true,
      history: transformedHistory
    })

  } catch (error) {
    console.error("Error fetching subscription history:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch subscription history",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
