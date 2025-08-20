import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { defaultEmailService } from "@/lib/services/email"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }
    
    console.log("Resend verification request:", { email })
    
    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { User } = await import("@/lib/sequelize/models")
    await ensureDatabaseConnection()

    // Find user by email
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is already verified
    if (user.email_verified_at) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 })
    }

    // Generate new verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString()
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update user with new verification code
    await user.update({
      reset_token: verificationCode,
      reset_token_expires_at: verificationExpires
    })

    // Send new verification email
    const emailSent = await defaultEmailService.sendEmailVerification(email, verificationCode, user.first_name || 'User')
    
    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    console.log('New Email Verification Code:', verificationCode)

    return NextResponse.json({ 
      message: "New verification code sent to your email"
    })

  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

