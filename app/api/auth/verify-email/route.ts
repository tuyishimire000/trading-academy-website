import { type NextRequest, NextResponse } from "next/server"
import { signJwt, setAuthCookie } from "@/lib/auth/jwt"
import crypto from "crypto"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()
    
    if (!email || !code) {
      return NextResponse.json({ error: "Email and verification code are required" }, { status: 400 })
    }
    
    console.log("Email verification request:", { email, code })
    
    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { User, UserSubscription } = await import("@/lib/sequelize/models")
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

    // Check if verification code exists and is not expired
    if (!user.reset_token || !user.reset_token_expires_at) {
      return NextResponse.json({ error: "No active verification request found" }, { status: 400 })
    }

    // Check if verification code is expired
    if (new Date() > user.reset_token_expires_at) {
      return NextResponse.json({ error: "Verification code has expired" }, { status: 400 })
    }

    // Verify the code
    if (code !== user.reset_token) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    // Mark user as verified
    await user.update({
      email_verified_at: new Date(),
      reset_token: null,
      reset_token_expires_at: null
    })

    // Get stored plan information and create subscription
    let planInfo = null
    let redirectTo = '/dashboard'
    
    if (user.suspension_reason) {
      try {
        planInfo = JSON.parse(user.suspension_reason)
        const { SubscriptionPlan } = await import("@/lib/sequelize/models")
        const planRecord = await SubscriptionPlan.findOne({ where: { id: planInfo.planId, is_active: true } })
        
                 if (planRecord) {
           // Check if plan is free (price = 0) or paid
           const isFreePlan = planRecord.price === 0
           
           console.log('Plan verification:', {
             planName: planRecord.name,
             planPrice: planRecord.price,
             isFreePlan: isFreePlan,
             planId: planInfo.planId
           })
           
           if (isFreePlan) {
             // For free plans, create active subscription and redirect to dashboard
             await UserSubscription.create({
               user_id: user.id,
               plan_id: planInfo.planId,
               status: 'active',
               current_period_start: new Date(),
               current_period_end: planRecord.billing_cycle === 'lifetime' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days for monthly
             })
             redirectTo = '/dashboard'
             console.log('Free plan: Redirecting to dashboard')
           } else {
             // For paid plans, create pending subscription and redirect to payment page
             await UserSubscription.create({
               user_id: user.id,
               plan_id: planInfo.planId,
               status: 'pending', // Mark as pending until payment is completed
               current_period_start: null, // Will be set after payment
               current_period_end: null, // Will be set after payment
             })
             redirectTo = '/subscription'
             console.log('Paid plan: Redirecting to subscription page')
           }
         }
      } catch (error) {
        console.error("Error parsing plan info:", error)
      }
    }
    
    // Clean up temporary data
    await user.update({
      suspension_reason: null
    })

    // Issue JWT for verified user
    const token = signJwt({ sub: user.id, email: user.email, is_admin: user.is_admin })
    const headers = new Headers()
    setAuthCookie(headers, token)

    return new NextResponse(
      JSON.stringify({ 
        message: "Email verified successfully", 
        user: { id: user.id, email: user.email },
        redirectTo: redirectTo
      }),
      { status: 200, headers }
    )

  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
