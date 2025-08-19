import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"

// Mock Discord settings - in production, this would be stored in database
let discordSettings = {
  serverUrl: "https://discord.gg/tradingacademy",
  serverName: "Trading Academy Community",
  inviteCode: "tradingacademy",
  isActive: true,
  memberCount: 1250,
  onlineCount: 89,
  channels: [
    { name: "general", memberCount: 1250 },
    { name: "trading-discussion", memberCount: 890 },
    { name: "news", memberCount: 650 },
    { name: "support", memberCount: 320 }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 })
    }

    return NextResponse.json(discordSettings)
  } catch (error) {
    console.error('Discord settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Discord settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json()
    const { serverUrl, serverName, inviteCode, isActive } = body

    // Update Discord settings
    discordSettings = {
      ...discordSettings,
      serverUrl: serverUrl || discordSettings.serverUrl,
      serverName: serverName || discordSettings.serverName,
      inviteCode: inviteCode || discordSettings.inviteCode,
      isActive: isActive !== undefined ? isActive : discordSettings.isActive
    }

    return NextResponse.json({
      message: 'Discord settings updated successfully',
      settings: discordSettings
    })
  } catch (error) {
    console.error('Discord settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update Discord settings' },
      { status: 500 }
    )
  }
}
