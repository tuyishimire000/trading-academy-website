import { NextRequest, NextResponse } from "next/server"
import { PortfolioPosition } from "@/lib/sequelize/models"
import { verifyAuth } from "@/lib/auth/server"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const positions = await PortfolioPosition.findAll({
      where: {
        user_id: user.id
      },
      order: [['created_at', 'DESC']]
    })

    return NextResponse.json(positions)
  } catch (error) {
    console.error('Portfolio positions fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio positions' },
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
    const { symbol, quantity, avgPrice, currentPrice } = body

    const position = await PortfolioPosition.create({
      user_id: user.id,
      symbol,
      quantity,
      avg_price: avgPrice,
      current_price: currentPrice
    })

    return NextResponse.json(position)
  } catch (error) {
    console.error('Portfolio position creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create portfolio position' },
      { status: 500 }
    )
  }
}
