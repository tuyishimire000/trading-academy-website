import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Testing subscription plans fetch...")

    const supabase = await createServerClient()

    // Test 1: Check if table exists and has data
    const { data: allPlans, error: allError } = await supabase.from("subscription_plans").select("*")

    console.log("All plans:", { data: allPlans, error: allError })

    // Test 2: Check active plans only
    const { data: activePlans, error: activeError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price")

    console.log("Active plans:", { data: activePlans, error: activeError })

    return NextResponse.json({
      success: true,
      allPlans: {
        data: allPlans,
        error: allError?.message,
        count: allPlans?.length || 0,
      },
      activePlans: {
        data: activePlans,
        error: activeError?.message,
        count: activePlans?.length || 0,
      },
    })
  } catch (error) {
    console.error("Test plans error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
