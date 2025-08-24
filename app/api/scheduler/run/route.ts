import { NextRequest, NextResponse } from "next/server"
import { SubscriptionScheduler } from "@/lib/services/scheduler"

export async function POST(request: NextRequest) {
  try {
    // Check for authorization (you can add admin authentication here)
    const authHeader = request.headers.get("authorization")
    
    // For now, we'll use a simple API key check
    // In production, you should implement proper admin authentication
    const apiKey = request.headers.get("x-api-key")
    const expectedApiKey = process.env.SCHEDULER_API_KEY
    
    if (!expectedApiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log("🚀 Manual scheduler run initiated...")
    
    // Run all scheduled tasks
    await SubscriptionScheduler.runScheduledTasks()
    
    return NextResponse.json({
      success: true,
      message: "Scheduler tasks completed successfully",
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ Error running scheduler:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to run scheduler tasks",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// GET method for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Scheduler API is running",
    endpoints: {
      "POST /api/scheduler/run": "Run scheduled tasks manually",
      "GET /api/scheduler/run": "Check scheduler status"
    },
    timestamp: new Date().toISOString()
  })
}
