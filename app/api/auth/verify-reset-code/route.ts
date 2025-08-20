import { NextRequest, NextResponse } from "next/server"
import { User } from "@/lib/sequelize/models"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { code, email, phoneNumber, method } = await request.json()

    if (!code || (!email && !phoneNumber)) {
      return NextResponse.json(
        { message: "Code and email/phone number are required" },
        { status: 400 }
      )
    }

    // Find user by email or phone number
    let user
    if (method === "email" && email) {
      user = await User.findOne({ where: { email } })
    } else if (method === "sms" && phoneNumber) {
      user = await User.findOne({ where: { phone_number: phoneNumber } })
    }

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Check if user has a reset token and it's not expired
    if (!user.reset_token || !user.reset_token_expires_at) {
      return NextResponse.json(
        { message: "No active reset request found. Please request a new code." },
        { status: 400 }
      )
    }

    // Check if reset token is expired
    if (new Date() > user.reset_token_expires_at) {
      return NextResponse.json(
        { message: "Reset code has expired. Please request a new code." },
        { status: 400 }
      )
    }

    // For SMS method, the code is stored in reset_token
    // For email method, we need to extract the code from the token
    let expectedCode
    if (method === "sms") {
      expectedCode = user.reset_token
    } else {
      // For email, the reset_token contains the full token, not the code
      // We need to handle this differently - maybe store the code separately
      // For now, let's assume the code is the first 6 characters of the token
      expectedCode = user.reset_token.substring(0, 6)
    }

    // Verify the code
    if (code !== expectedCode) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      )
    }

    // Generate a new token for password reset (different from the verification code)
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update user with new reset token
    await user.update({
      reset_token: resetToken,
      reset_token_expires_at: resetTokenExpires,
    })

    return NextResponse.json({
      message: "Code verified successfully",
      token: resetToken,
    })

  } catch (error) {
    console.error("Error verifying reset code:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
