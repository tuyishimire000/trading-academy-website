import { NextRequest, NextResponse } from "next/server"
import { PortfolioTrade } from "@/lib/sequelize/models"
import { verifyAuth } from "@/lib/auth/server"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trades = await PortfolioTrade.findAll({
      where: {
        user_id: user.id
      },
      order: [['created_at', 'DESC']],
      limit: 100
    })

    return NextResponse.json(trades)
  } catch (error) {
    console.error('Portfolio trades fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio trades' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { symbol, tradeType, quantity, price, profitLoss, status } = body

    const trade = await PortfolioTrade.create({
      user_id: user.id,
      symbol,
      trade_type: tradeType,
      quantity,
      price,
      profit_loss: profitLoss,
      status: status || 'open'
    })

    return NextResponse.json(trade)
  } catch (error) {
    console.error('Portfolio trade creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create portfolio trade' },
      { status: 500 }
    )
  }
}
