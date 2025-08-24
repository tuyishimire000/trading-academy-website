import { NextRequest, NextResponse } from "next/server"
import { SubscriptionScheduler } from "@/lib/services/scheduler"
import { sendTestEmail } from "@/lib/services/email"

export async function POST(request: NextRequest) {
  try {
    const { action, email } = await request.json()
    
    switch (action) {
      case "run-scheduler":
        console.log("🧪 Test: Running scheduler...")
        await SubscriptionScheduler.runScheduledTasks()
        return NextResponse.json({
          success: true,
          message: "Scheduler test completed",
          action: "run-scheduler"
        })

      case "test-email":
        if (!email) {
          return NextResponse.json(
            { success: false, error: "Email is required for email test" },
            { status: 400 }
          )
        }
        console.log("🧪 Test: Sending test email...")
        await sendTestEmail(email)
        return NextResponse.json({
          success: true,
          message: "Test email sent successfully",
          action: "test-email",
          email
        })

      case "check-expired":
        console.log("🧪 Test: Checking expired subscriptions...")
        await SubscriptionScheduler.checkExpiredSubscriptions()
        return NextResponse.json({
          success: true,
          message: "Expired subscription check completed",
          action: "check-expired"
        })

      case "send-reminders":
        console.log("🧪 Test: Sending expiration reminders...")
        await SubscriptionScheduler.sendExpirationReminders()
        return NextResponse.json({
          success: true,
          message: "Expiration reminders sent",
          action: "send-reminders"
        })

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action. Use: run-scheduler, test-email, check-expired, send-reminders" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("❌ Test error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Scheduler Test API",
    availableActions: {
      "run-scheduler": "Run all scheduler tasks",
      "test-email": "Send test email (requires email in body)",
      "check-expired": "Check and process expired subscriptions",
      "send-reminders": "Send expiration reminder emails"
    },
    example: {
      method: "POST",
      body: {
        action: "test-email",
        email: "test@example.com"
      }
    }
  })
}
