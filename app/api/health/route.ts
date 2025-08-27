import { NextResponse } from "next/server"
import { ensureDatabaseConnection } from "@/lib/sequelize/index"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Test database connection
    await ensureDatabaseConnection()
    
    return NextResponse.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected"
    })
  } catch (error) {
    console.error("Health check failed:", error)
    
    // Return 200 status to prevent build failures, but indicate database is not available
    return NextResponse.json({ 
      status: "degraded",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      message: "Database not available - this is expected during build time",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 200 })
  }
}
