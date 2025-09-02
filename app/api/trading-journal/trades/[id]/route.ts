import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth/jwt'
import { TradingJournalTrade, TradingJournalStrategy, TradingJournalCategory } from '@/lib/sequelize/models'

// PUT /api/trading-journal/trades/[id] - Update a trade
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyJwt<{ sub: string; email: string; is_admin?: boolean }>(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tradeId = parseInt(params.id)
    const body = await request.json()

    // Find the trade and ensure it belongs to the user
    const trade = await TradingJournalTrade.findOne({
      where: { id: tradeId, user_id: payload.sub }
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    // Update the trade
    await trade.update(body)

    // Fetch the updated trade with related data
    const updatedTrade = await TradingJournalTrade.findByPk(tradeId, {
      include: [
        {
          model: TradingJournalStrategy,
          as: 'strategy',
          attributes: ['id', 'name', 'description']
        },
        {
          model: TradingJournalCategory,
          as: 'category',
          attributes: ['id', 'name', 'color']
        }
      ]
    })

    return NextResponse.json(updatedTrade)

  } catch (error) {
    console.error('Error updating trade:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/trading-journal/trades/[id] - Delete a trade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyJwt<{ sub: string; email: string; is_admin?: boolean }>(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tradeId = parseInt(params.id)

    // Find the trade and ensure it belongs to the user
    const trade = await TradingJournalTrade.findOne({
      where: { id: tradeId, user_id: payload.sub }
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    // Delete the trade
    await trade.destroy()

    return NextResponse.json({ message: 'Trade deleted successfully' })

  } catch (error) {
    console.error('Error deleting trade:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
