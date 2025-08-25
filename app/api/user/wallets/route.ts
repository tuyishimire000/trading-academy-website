export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyJwt } from "@/lib/auth/jwt"
import { ensureDatabaseConnection } from "@/lib/sequelize/index"
import { UserWallet } from "@/lib/sequelize/models"

// GET - Fetch user's connected wallets
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const payload = verifyJwt<{ sub: string }>(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await ensureDatabaseConnection()
    
    const wallets = await UserWallet.findAll({
      where: { user_id: payload.sub },
      order: [['is_primary', 'DESC'], ['last_used', 'DESC']]
    })

    return NextResponse.json({ wallets })
  } catch (err) {
    console.error("Error fetching wallets:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Connect a new wallet
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const payload = verifyJwt<{ sub: string }>(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { wallet_address, wallet_name } = await request.json()
    
    if (!wallet_address || !wallet_name) {
      return NextResponse.json({ error: "Wallet address and name are required" }, { status: 400 })
    }

    await ensureDatabaseConnection()

    // Simplified to single wallet for all users
    const maxWallets = 1

    // Count existing wallets
    const existingWallets = await UserWallet.count({
      where: { user_id: payload.sub }
    })

    if (existingWallets >= maxWallets) {
      return NextResponse.json({ 
        error: "You can only connect one wallet. Please remove your existing wallet first to connect a new one." 
      }, { status: 403 })
    }

    // Check if wallet is already connected
    const existingWallet = await UserWallet.findOne({
      where: { 
        user_id: payload.sub,
        wallet_address: wallet_address.toLowerCase()
      }
    })

    if (existingWallet) {
      return NextResponse.json({ error: "This wallet is already connected" }, { status: 409 })
    }

    // If this is the first wallet, make it primary
    const isPrimary = existingWallets === 0

    const wallet = await UserWallet.create({
      user_id: payload.sub,
      wallet_address: wallet_address.toLowerCase(),
      wallet_name,
      is_primary: isPrimary
    })

    return NextResponse.json({ 
      wallet,
      message: "Wallet connected successfully" 
    })
  } catch (err) {
    console.error("Error connecting wallet:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
