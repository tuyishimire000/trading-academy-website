import { checkAdminPermission } from "@/lib/auth/admin"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { hasPermission, error } = await checkAdminPermission("settings", "read")

    if (!hasPermission) {
      return NextResponse.json({ error: error || "Insufficient permissions" }, { status: 403 })
    }

    // For now, return default settings
    // In production, you'd store these in a settings table
    const settings = {
      general: {
        siteName: "Prime Aura Trading Academy",
        siteDescription: "Learn trading from the experts",
        maintenanceMode: false,
        registrationEnabled: true,
      },
      subscription: {
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
        trialPeriodDays: 7,
        allowCancellation: true,
        prorationEnabled: true,
      },
      discord: {
        botToken: process.env.DISCORD_BOT_TOKEN || "",
        guildId: process.env.DISCORD_GUILD_ID || "",
        welcomeChannelId: "",
        autoRoleEnabled: true,
      },
      email: {
        provider: "resend",
        fromEmail: "noreply@primeaura.com",
        fromName: "Prime Aura Trading Academy",
        smtpHost: "",
        smtpPort: 587,
      },
      security: {
        passwordMinLength: 8,
        requireSpecialChars: true,
        sessionTimeoutMinutes: 60,
        maxLoginAttempts: 5,
      },
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Admin settings fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { hasPermission, error } = await checkAdminPermission("settings", "update")

    if (!hasPermission) {
      return NextResponse.json({ error: error || "Insufficient permissions" }, { status: 403 })
    }

    const { category, settings } = await request.json()

    // In production, you'd save these to a settings table
    // For now, we'll just return success
    console.log(`Updating ${category} settings:`, settings)

    return NextResponse.json({
      success: true,
      message: `${category} settings updated successfully`,
    })
  } catch (error) {
    console.error("Admin settings update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
