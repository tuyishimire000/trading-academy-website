import { type NextRequest, NextResponse } from "next/server"
import { signJwt } from "@/lib/auth/jwt"
import crypto from "crypto"
import { defaultSMSService } from "@/lib/services/sms"
import { defaultEmailService } from "@/lib/services/email"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, phoneNumber, method = 'email' } = await request.json()
    
    if (!email && !phoneNumber) {
      return NextResponse.json({ error: "Email or phone number is required" }, { status: 400 })
    }

    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { User } = await import("@/lib/sequelize/models")
    await ensureDatabaseConnection()

    // Find user by email or phone number
    const whereClause = email ? { email } : { phone_number: phoneNumber }
    const user = await User.findOne({ where: whereClause })
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        message: "If an account with that information exists, a password reset has been sent." 
      }, { status: 200 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token in user record
    await user.update({
      reset_token: resetToken,
      reset_token_expires_at: resetTokenExpiry
    })

    let success = false
    let message = ""

    if (method === 'sms' && user.phone_number) {
      // Generate a 6-digit verification code
      const verificationCode = crypto.randomInt(100000, 999999).toString()
      
      // Store the verification code in the database
      await user.update({
        reset_token: verificationCode,
        reset_token_expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      })
      
      // Send SMS with verification code
      success = await defaultSMSService.sendPasswordResetSMS(user.phone_number, verificationCode)
      message = "If an account with that phone number exists, a verification code has been sent via SMS."
      
      if (process.env.NODE_ENV === 'development') {
        console.log('SMS Verification Code:', verificationCode)
      }
    } else {
      // Generate a 6-digit verification code for email
      const verificationCode = crypto.randomInt(100000, 999999).toString()
      
      // Store the verification code in the database
      await user.update({
        reset_token: verificationCode,
        reset_token_expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      })
      
      // Send email with verification code
      success = await defaultEmailService.sendPasswordResetEmail(user.email, verificationCode)
      message = "If an account with that email exists, a verification code has been sent."
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Email Verification Code:', verificationCode)
      }
    }

    return NextResponse.json({ 
      message,
      success
    }, { status: 200 })

  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
