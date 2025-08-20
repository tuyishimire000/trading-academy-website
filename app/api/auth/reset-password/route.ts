import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth/password"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    
    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { User } = await import("@/lib/sequelize/models")
    await ensureDatabaseConnection()

    // Find user by reset token
    const user = await User.findOne({ 
      where: { 
        reset_token: token,
        reset_token_expires_at: { [require('sequelize').Op.gt]: new Date() }
      } 
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password and clear reset token
    await user.update({
      password_hash: hashedPassword,
      reset_token: null,
      reset_token_expires_at: null
    })

    return NextResponse.json({ 
      message: "Password reset successfully" 
    }, { status: 200 })

  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
