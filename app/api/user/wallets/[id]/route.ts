export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyJwt } from "@/lib/auth/jwt"
import { ensureDatabaseConnection } from "@/lib/sequelize/index"
import { UserWallet } from "@/lib/sequelize/models"
import { Op } from "sequelize"

// PUT - Update wallet (rename, set as primary)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const payload = verifyJwt<{ sub: string }>(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { wallet_name, is_primary } = await request.json()
    
    await ensureDatabaseConnection()

    // Find the wallet and ensure it belongs to the user
    const wallet = await UserWallet.findOne({
      where: { 
        id: params.id,
        user_id: payload.sub 
      }
    })

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // If setting as primary, unset other primary wallets
    if (is_primary) {
      await UserWallet.update(
        { is_primary: false },
        { 
          where: { 
            user_id: payload.sub,
            is_primary: true 
          } 
        }
      )
    }

    // Update the wallet
    const updateData: any = {}
    if (wallet_name !== undefined) updateData.wallet_name = wallet_name
    if (is_primary !== undefined) updateData.is_primary = is_primary
    
    await wallet.update(updateData)

    return NextResponse.json({ 
      wallet,
      message: "Wallet updated successfully" 
    })
  } catch (err) {
    console.error("Error updating wallet:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Disconnect wallet
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const payload = verifyJwt<{ sub: string }>(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await ensureDatabaseConnection()

    // Find the wallet and ensure it belongs to the user
    const wallet = await UserWallet.findOne({
      where: { 
        id: params.id,
        user_id: payload.sub 
      }
    })

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // Allow deleting the last wallet (users can always add a new one)
    // The frontend will handle the confirmation and user experience

    // If this is the primary wallet, set another wallet as primary
    if (wallet.is_primary) {
      const nextWallet = await UserWallet.findOne({
        where: { 
          user_id: payload.sub,
          id: { [Op.ne]: params.id }
        },
        order: [['created_at', 'ASC']]
      })

      if (nextWallet) {
        await nextWallet.update({ is_primary: true })
      }
    }

    // Delete the wallet
    await wallet.destroy()

    return NextResponse.json({ 
      message: "Wallet disconnected successfully" 
    })
  } catch (err) {
    console.error("Error disconnecting wallet:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
