import { type NextRequest, NextResponse } from "next/server"
// Lazy imports to avoid bundling DB driver incorrectly
import { signJwt, setAuthCookie } from "@/lib/auth/jwt"
import { hashPassword } from "@/lib/auth/password"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, plan } = await request.json()
    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { SubscriptionPlan, User } = await import("@/lib/sequelize/models")
    await ensureDatabaseConnection()

    // Validate plan exists
    const planRecord = await SubscriptionPlan.findOne({ where: { name: plan, is_active: true } })
    if (!planRecord) {
      return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 })
    }

    // Create user
    const existing = await User.findOne({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const password_hash = await hashPassword(password)
    const user = await User.create({ email, password_hash, first_name: firstName, last_name: lastName })

    // Issue JWT (no email verification for local dev)
    const token = signJwt({ sub: user.id, email: user.email, is_admin: user.is_admin })
    const headers = new Headers()
    setAuthCookie(headers, token)

    return new NextResponse(
      JSON.stringify({ message: "User created successfully", user: { id: user.id, email: user.email } }),
      { status: 200, headers }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
