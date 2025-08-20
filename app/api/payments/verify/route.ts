import { NextRequest, NextResponse } from "next/server"
import { flutterwaveService } from "@/lib/services/flutterwave"

export async function POST(request: NextRequest) {
  try {
    const { txRef } = await request.json()

    if (!txRef) {
      return NextResponse.json({ error: "Transaction reference is required" }, { status: 400 })
    }

    // Verify payment with Flutterwave
    const response = await flutterwaveService.verifyPayment(txRef)

    if (response.status === 'success' && response.data.status === 'successful') {
      // Payment is successful, activate subscription
      const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
      const { UserSubscription } = await import("@/lib/sequelize/models")
      
      await ensureDatabaseConnection()

      // Extract subscription ID from metadata
      const subscriptionId = response.data.meta?.subscription_id
      if (subscriptionId) {
        const subscription = await UserSubscription.findByPk(subscriptionId)
        if (subscription) {
          await subscription.update({
            status: 'active',
            current_period_start: new Date(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          })

          console.log(`Subscription ${subscriptionId} activated via verification`)
        }
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          transactionId: response.data.flw_ref,
          amount: response.data.amount,
          currency: response.data.currency,
          status: response.data.status
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Payment verification failed",
        error: response.message || "Payment not successful"
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({
      success: false,
      message: "Payment verification failed",
      error: "Internal server error"
    }, { status: 500 })
  }
}

