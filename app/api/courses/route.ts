import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: courses, error } = await supabase
      .from("courses")
      .select(`
        *,
        course_categories (
          name,
          display_name: name,
          icon
        )
      `)
      .eq("is_published", true)
      .order("sort_order")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Courses fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
