import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  // During build time, just return a basic health check without database connection
  // This prevents build failures when database is not available
  return NextResponse.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: "not_checked",
    message: "Health check endpoint available - database connection not tested during build"
  })
}
