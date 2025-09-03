import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth/jwt'
import { TradingJournalTrade, TradingJournalStrategy, TradingJournalCategory, TradingJournalTag, User, Screenshot } from '@/lib/sequelize/models'
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
        },
        {
          model: Screenshot,
          as: 'screenshots',
          attributes: ['id', 'filename', 'original_name', 'file_url', 'file_size', 'mime_type', 'screenshot_type', 'created_at']
        },

      ],
      order: [['entry_time', 'DESC']],
      limit,
      offset
    })

    console.log('Found trades:', trades.length)
    console.log('Sample trade:', trades[0])
    
    // Debug screenshots
    if (trades.length > 0) {
      trades.forEach((trade, index) => {
        console.log(`Trade ${index + 1} (ID: ${trade.id}) screenshots:`, trade.screenshots)
      })
    }

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
    // Check database connection and table existence
    try {
      await sequelize.authenticate()
      console.log('Database connection established successfully')
      
      // Check if the table exists
      const tableExists = await sequelize.getQueryInterface().showAllTables()
      console.log('Available tables:', tableExists)
      
      if (!tableExists.includes('trading_journal_trades')) {
        console.error('Table trading_journal_trades does not exist')
        return NextResponse.json({ error: 'Required database table does not exist' }, { status: 500 })
      }
    } catch (dbConnectionError) {
      console.error('Database connection failed:', dbConnectionError)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyJwt<{ sub: string; email: string; is_admin?: boolean }>(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await request.formData()
    
    // Debug: Log what's being received
    console.log('FormData received:')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }
    
    const symbol = formData.get('symbol') as string
    const instrument_type = formData.get('instrument_type') as string
    const direction = formData.get('direction') as string
    const entry_price = formData.get('entry_price') as string
    const entry_time = formData.get('entry_time') as string
    const entry_reason = formData.get('entry_reason') as string
    const entry_confidence = formData.get('entry_confidence') as string
    const position_size = formData.get('position_size') as string
    const position_size_currency = formData.get('position_size_currency') as string
    const leverage = formData.get('leverage') as string
    const stop_loss = formData.get('stop_loss') as string
    const take_profit = formData.get('take_profit') as string
    const risk_amount = formData.get('risk_amount') as string
    const risk_percentage = formData.get('risk_percentage') as string
    const strategy_id = formData.get('strategy_id') as string
    const category_id = formData.get('category_id') as string
    const market_condition = formData.get('market_condition') as string
    const trade_setup_quality = formData.get('trade_setup_quality') as string
    const execution_quality = formData.get('execution_quality') as string
    const notes = formData.get('notes') as string


    // Validate required fields
    console.log('Validating fields:', {
      symbol: !!symbol,
      instrument_type: !!instrument_type,
      direction: !!direction,
      entry_price: !!entry_price,
      entry_time: !!entry_time,
      position_size: !!position_size
    })
    
    const missingFields: string[] = []
    
    // Check for empty strings
    if (!symbol || symbol.trim() === '') missingFields.push('symbol')
    if (!instrument_type || instrument_type.trim() === '') missingFields.push('instrument_type')
    if (!direction || direction.trim() === '') missingFields.push('direction')
    if (!entry_price || entry_price.trim() === '') missingFields.push('entry_price')
    if (!entry_time || entry_time.trim() === '') missingFields.push('entry_time')
    if (!position_size || position_size.trim() === '') missingFields.push('position_size')
    
    if (missingFields.length > 0) {
      console.error('Missing or empty required fields:', missingFields)
      return NextResponse.json({ 
        error: 'Missing or empty required fields', 
        missingFields 
      }, { status: 400 })
    }

    // Generate unique trade_id
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const trade_id = `TRADE-${timestamp}-${randomSuffix}`

    // Create the trade first
    console.log('Creating trade with data:', {
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
      screenshots: null
    })
    
    let trade
    try {
      trade = await TradingJournalTrade.create({
        user_id: payload.sub,
        trade_id,
        symbol,
        instrument_type,
        direction,
        entry_price: parseFloat(entry_price),
        entry_time: new Date(entry_time),
        entry_reason,
        entry_confidence: entry_confidence || 'medium',
        position_size: parseFloat(position_size),
        position_size_currency: position_size_currency || 'USD',
        leverage: parseFloat(leverage || '1.00'),
        stop_loss: stop_loss ? parseFloat(stop_loss) : null,
        take_profit: take_profit ? parseFloat(take_profit) : null,
        risk_amount: risk_amount ? parseFloat(risk_amount) : null,
        risk_percentage: risk_percentage ? parseFloat(risk_percentage) : null,
        strategy_id: strategy_id ? parseInt(strategy_id) : null,
        category_id: category_id ? parseInt(category_id) : null,
        market_condition: market_condition || 'trending',
        trade_setup_quality: trade_setup_quality || 'fair',
        execution_quality: execution_quality || 'fair',
        notes,
        status: 'open',
        screenshots: null
      })
      console.log('Trade created successfully:', trade.id)
    } catch (dbError) {
      console.error('Database error creating trade:', dbError)
      return NextResponse.json({ 
        error: 'Database error', 
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 })
    }



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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
