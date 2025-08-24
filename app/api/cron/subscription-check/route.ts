import { NextRequest, NextResponse } from "next/server"
import { SubscriptionScheduler } from "@/lib/services/scheduler"

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    // You can add additional verification here (e.g., Vercel Cron, custom headers, etc.)
    const userAgent = request.headers.get("user-agent") || ""
    const isCronRequest = userAgent.includes("cron") || 
                         request.headers.get("x-cron-secret") === process.env.CRON_SECRET

    if (!isCronRequest && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: "Unauthorized cron request" },
        { status: 401 }
      )
    }

    console.log("⏰ Cron job: Subscription check initiated...")
    
    // Run the scheduler tasks
    await SubscriptionScheduler.runScheduledTasks()
    
    return NextResponse.json({
      success: true,
      message: "Cron job completed successfully",
      timestamp: new Date().toISOString(),
      tasks: [
        "Expired subscription check and downgrade",
        "Expiration reminder emails"
      ]
    })

  } catch (error) {
    console.error("❌ Cron job error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// POST method for manual triggering
export async function POST(request: NextRequest) {
  try {
    // Check for authorization
    const apiKey = request.headers.get("x-api-key")
    const expectedApiKey = process.env.CRON_API_KEY
    
    if (!expectedApiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log("🚀 Manual cron job triggered...")
    
    await SubscriptionScheduler.runScheduledTasks()
    
    return NextResponse.json({
      success: true,
      message: "Manual cron job completed successfully",
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ Manual cron job error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Manual cron job failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
