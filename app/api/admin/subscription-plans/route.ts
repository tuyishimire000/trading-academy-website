import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyJwt } from "@/lib/auth/jwt"
import { ensureDatabaseConnection } from "@/lib/sequelize/index"
import { SubscriptionPlan } from "@/lib/sequelize/models"

export const runtime = "nodejs"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    const payload = token ? verifyJwt<{ is_admin?: boolean }>(token) : null
    if (!payload?.is_admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await ensureDatabaseConnection()
    const plans = await SubscriptionPlan.findAll({ order: [["price", "ASC"]] })
    return NextResponse.json({ plans })
  } catch (error) {
    console.error("Admin plans fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    const payload = token ? verifyJwt<{ is_admin?: boolean }>(token) : null
    if (!payload?.is_admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    await ensureDatabaseConnection()
    // Normalize features if provided as CSV
    if (typeof body.features === "string") {
      body.features = { features: body.features.split(",").map((s: string) => s.trim()).filter(Boolean) }
    }
    const plan = await SubscriptionPlan.create(body)
    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Admin plan creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    const payload = token ? verifyJwt<{ is_admin?: boolean }>(token) : null
    if (!payload?.is_admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id, updates } = await request.json()
    await ensureDatabaseConnection()
    if (updates && typeof updates.features === "string") {
      updates.features = { features: updates.features.split(",").map((s: string) => s.trim()).filter(Boolean) }
    }
    const [affected] = await SubscriptionPlan.update(updates, { where: { id }, limit: 1 })
    if (affected === 0) return NextResponse.json({ error: "Plan not found or no changes" }, { status: 404 })
    const plan = await SubscriptionPlan.findByPk(id)
    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Admin plan update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    const payload = token ? verifyJwt<{ is_admin?: boolean }>(token) : null
    if (!payload?.is_admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await request.json()
    await ensureDatabaseConnection()
    const deleted = await SubscriptionPlan.destroy({ where: { id }, limit: 1 })
    if (deleted === 0) return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin plan delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}





