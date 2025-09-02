import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth/jwt'
import { TradingJournalTrade, TradingJournalStrategy, TradingJournalCategory, TradingJournalTag, User } from '@/lib/sequelize/models'
import { sequelize } from '@/lib/sequelize'
import { Op } from 'sequelize'

// GET /api/trading-journal/trades - Get all trades for the authenticated user
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/trading-journal/trades - Starting request')
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    console.log('Token found:', !!token)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyJwt<{ sub: string; email: string; is_admin?: boolean }>(token)
    console.log('Payload:', payload)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const symbol = searchParams.get('symbol')
    const instrumentType = searchParams.get('instrument_type')
    const direction = searchParams.get('direction')
    const strategyId = searchParams.get('strategy_id')
    const categoryId = searchParams.get('category_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const offset = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      user_id: payload.sub
    }

    if (status) whereClause.status = status
    if (symbol) whereClause.symbol = { [Op.like]: `%${symbol}%` }
    if (instrumentType) whereClause.instrument_type = instrumentType
    if (direction) whereClause.direction = direction
    if (strategyId) whereClause.strategy_id = strategyId
    if (categoryId) whereClause.category_id = categoryId
    if (startDate && endDate) {
      whereClause.entry_time = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    }

    // Get trades with related data
    console.log('Where clause:', whereClause)
    const trades = await TradingJournalTrade.findAll({
      where: whereClause,
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
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['entry_time', 'DESC']],
      limit,
      offset
    })

    console.log('Found trades:', trades.length)
    console.log('Sample trade:', trades[0])

    // Get total count for pagination
    const totalCount = await TradingJournalTrade.count({ where: whereClause })

    return NextResponse.json({
      trades,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/trading-journal/trades - Create a new trade
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyJwt<{ sub: string; email: string; is_admin?: boolean }>(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const {
      symbol,
      instrument_type,
      direction,
      entry_price,
      entry_time,
      entry_reason,
      entry_confidence,
      position_size,
      position_size_currency,
      leverage,
      stop_loss,
      take_profit,
      risk_amount,
      risk_percentage,
      strategy_id,
      category_id,
      market_condition,
      trade_setup_quality,
      execution_quality,
      notes
    } = body

    // Validate required fields
    if (!symbol || !instrument_type || !direction || !entry_price || !entry_time || !position_size) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate unique trade_id
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const trade_id = `TRADE-${timestamp}-${randomSuffix}`

    // Create the trade
    const trade = await TradingJournalTrade.create({
      user_id: payload.sub,
      trade_id,
      symbol,
      instrument_type,
      direction,
      entry_price,
      entry_time: new Date(entry_time),
      entry_reason,
      entry_confidence: entry_confidence || 'medium',
      position_size,
      position_size_currency: position_size_currency || 'USD',
      leverage: leverage || 1.00,
      stop_loss,
      take_profit,
      risk_amount,
      risk_percentage,
      strategy_id,
      category_id,
      market_condition: market_condition || 'trending',
      trade_setup_quality: trade_setup_quality || 'fair',
      execution_quality: execution_quality || 'fair',
      notes,
      status: 'open',
      screenshots: body.screenshots ? JSON.stringify(body.screenshots) : null
    })

    // Fetch the created trade with related data
    const createdTrade = await TradingJournalTrade.findByPk(trade.id, {
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

    return NextResponse.json(createdTrade, { status: 201 })

  } catch (error) {
    console.error('Error creating trade:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
