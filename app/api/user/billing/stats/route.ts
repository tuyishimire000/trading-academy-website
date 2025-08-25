export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth/server"
import { UserSubscriptionHistory, UserSubscription } from "@/lib/sequelize/models"
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

    // Fetch all payment records for the user
    const paymentHistory = await UserSubscriptionHistory.findAll({
      where: { 
        user_id: userId,
        payment_amount: {
          [Op.not]: null
        }
      },
      order: [["created_at", "DESC"]]
    })

    // Calculate statistics
    const totalPayments = paymentHistory.length
    const successfulPayments = paymentHistory.filter(p => p.payment_status === "completed").length
    const failedPayments = paymentHistory.filter(p => p.payment_status === "failed").length
    
    const totalAmount = paymentHistory
      .filter(p => p.payment_status === "completed" && p.payment_amount)
      .reduce((sum, p) => sum + (p.payment_amount || 0), 0)
    
    const averageAmount = successfulPayments > 0 ? totalAmount / successfulPayments : 0

    // Get last payment date
    const lastPayment = paymentHistory
      .filter(p => p.payment_status === "completed")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

    // Get next billing date from current subscription
    const currentSubscription = await UserSubscription.findOne({
      where: { 
        user_id: userId,
        status: "active"
      },
      order: [["created_at", "DESC"]]
    })

    const stats = {
      totalPayments,
      successfulPayments,
      failedPayments,
      totalAmount,
      averageAmount,
      lastPaymentDate: lastPayment?.created_at.toISOString() || null,
      nextBillingDate: currentSubscription?.current_period_end?.toISOString() || null
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error("Error fetching billing stats:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch billing statistics",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
