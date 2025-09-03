import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth/jwt'
import { TradingJournalTrade, TradingJournalStrategy, TradingJournalCategory } from '@/lib/sequelize/models'


// POST /api/trading-journal/trades/[id]/close - Close a trade
export async function POST(
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
    const formData = await request.formData()
    const exit_price = formData.get('exit_price') as string
    const exit_time = formData.get('exit_time') as string
    const exit_reason = formData.get('exit_reason') as string
    const exit_confidence = formData.get('exit_confidence') as string
    const pnl_amount = formData.get('pnl_amount') as string
    const pnl_percentage = formData.get('pnl_percentage') as string
    const notes = formData.get('notes') as string
    const lessons_learned = formData.get('lessons_learned') as string
    const next_time_actions = formData.get('next_time_actions') as string


    // Validate required fields
    if (!exit_price || !exit_time) {
      return NextResponse.json({ error: 'Exit price and time are required' }, { status: 400 })
    }

    // Find the trade and ensure it belongs to the user
    const trade = await TradingJournalTrade.findOne({
      where: { id: tradeId, user_id: payload.sub }
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.status === 'closed') {
      return NextResponse.json({ error: 'Trade is already closed' }, { status: 400 })
    }

    // Use user-provided P&L data or calculate if not provided
    let pnlAmount = pnl_amount || 0
    let pnlPercentage = pnl_percentage || 0

    if (!pnl_amount || !pnl_percentage) {
      // Calculate P&L if not provided
      const entryValue = trade.entry_price * trade.position_size
      const exitValue = exit_price * trade.position_size

      if (trade.direction === 'long') {
        pnlAmount = exitValue - entryValue
        pnlPercentage = ((exit_price - trade.entry_price) / trade.entry_price) * 100
      } else {
        pnlAmount = entryValue - exitValue
        pnlPercentage = ((trade.entry_price - exit_price) / trade.entry_price) * 100
      }
    }

    // Determine if trade is winning
    const isWinning = pnlAmount > 0



    // Update the trade
    await trade.update({
      exit_price,
      exit_time: new Date(exit_time),
      exit_reason,
      exit_confidence,
      pnl_amount: pnlAmount,
      pnl_percentage: pnlPercentage,
      status: 'closed',
      is_winning: isWinning,
      notes: notes || trade.notes,
      lessons_learned,
      next_time_actions,

      updated_at: new Date()
    })

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
    console.error('Error closing trade:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
