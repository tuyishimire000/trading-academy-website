import { type NextRequest, NextResponse } from "next/server"
// Lazy imports to avoid bundling DB driver incorrectly
import { setAuthCookie, signJwt } from "@/lib/auth/jwt"
import { comparePassword } from "@/lib/auth/password"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { User } = await import("@/lib/sequelize/models")
    await ensureDatabaseConnection()

    const user = await User.findOne({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 })
    }

    const valid = await comparePassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 })
    }

    const token = signJwt({ sub: user.id, email: user.email, is_admin: user.is_admin })
    const headers = new Headers()
    setAuthCookie(headers, token)

    return new NextResponse(
      JSON.stringify({ message: "Signed in successfully", user: { id: user.id, email: user.email, is_admin: user.is_admin } }),
      { status: 200, headers }
    )
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
