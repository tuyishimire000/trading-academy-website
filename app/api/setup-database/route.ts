import { NextResponse } from "next/server"
import { ensureDatabaseConnection } from "@/lib/sequelize/index"
import { sequelize } from "@/lib/sequelize/index"

export const runtime = "nodejs"

export async function POST() {
  try {
    console.log("Starting database setup...")
    
    // Test connection
    await ensureDatabaseConnection()
    console.log("Database connection established")
    
    // Sync all models (create tables)
    await sequelize.sync({ force: true })
    console.log("Database tables created")
    
    return NextResponse.json({ 
      message: "Database setup completed successfully",
      timestamp: new Date().toISOString(),
      status: "success"
    })
  } catch (error) {
    console.error("Database setup failed:", error)
    return NextResponse.json({ 
      error: "Database setup failed",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      status: "error"
    }, { status: 500 })
  }
}

// Also allow GET for testing
export async function GET() {
  try {
    await ensureDatabaseConnection()
    return NextResponse.json({ 
      message: "Database connection test successful",
      timestamp: new Date().toISOString(),
      status: "connected"
    })
  } catch (error) {
    return NextResponse.json({ 
      error: "Database connection test failed",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      status: "disconnected"
    }, { status: 500 })
  }
}
