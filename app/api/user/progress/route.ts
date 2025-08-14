import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: progress, error } = await supabase
      .from("user_course_progress")
      .select(`
        *,
        courses (
          title,
          thumbnail_url,
          difficulty_level
        )
      `)
      .eq("user_id", user.id)
      .order("last_accessed", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ progress })
  } catch (error) {
    console.error("Progress fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
