import { type NextRequest, NextResponse } from "next/server"
// Lazy imports to avoid bundling DB driver incorrectly
import { signJwt, setAuthCookie } from "@/lib/auth/jwt"
import { hashPassword } from "@/lib/auth/password"
import crypto from "crypto"
import { defaultEmailService } from "@/lib/services/email"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phoneNumber, planId } = await request.json()
    
    // Validate required fields
    if (!planId) {
      return NextResponse.json({ error: "Subscription plan is required" }, { status: 400 })
    }
    
    console.log("Signup request:", { email, firstName, lastName, phoneNumber, planId })
    
    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { SubscriptionPlan, User, UserSubscription } = await import("@/lib/sequelize/models")
    await ensureDatabaseConnection()

    // Validate plan exists
    const planRecord = await SubscriptionPlan.findOne({ where: { id: planId, is_active: true } })
    if (!planRecord) {
      return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 })
    }

    // Check if user already exists with same email
    const existingEmail = await User.findOne({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Check if user already exists with same phone number
    if (phoneNumber) {
      const existingPhone = await User.findOne({ where: { phone_number: phoneNumber } })
      if (existingPhone) {
        return NextResponse.json({ error: "Phone number already registered" }, { status: 400 })
      }
    }

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString()
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create unverified user
    const password_hash = await hashPassword(password)
    const user = await User.create({ 
      email, 
      password_hash, 
      first_name: firstName, 
      last_name: lastName,
      phone_number: phoneNumber,
      email_verified_at: null, // User is not verified yet
      reset_token: verificationCode, // Store verification code in reset_token field
      reset_token_expires_at: verificationExpires
    })

    // Store plan information temporarily in user record (we'll clean this up after verification)
    await user.update({
      suspension_reason: JSON.stringify({
        planId,
        planRecord: {
          id: planRecord.id,
          name: planRecord.name,
          price: planRecord.price,
          billing_cycle: planRecord.billing_cycle
        }
      })
    })

    // Send verification email
    const emailSent = await defaultEmailService.sendEmailVerification(email, verificationCode, firstName)
    
    if (!emailSent) {
      // If email fails, delete the user and return error
      await user.destroy()
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    console.log('Email Verification Code:', verificationCode)

    return NextResponse.json({ 
      message: "Verification code sent to your email",
      needsEmailVerification: true,
      email: email
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
