import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth/jwt'
import { TradingJournalTrade, TradingJournalPerformanceMetric } from '@/lib/sequelize/models'
import { sequelize } from '@/lib/sequelize'
import { Op } from 'sequelize'

// GET /api/trading-journal/performance - Get performance metrics
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/trading-journal/performance - Starting request')
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    console.log('Token found:', !!token)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyJwt<{ sub: string; email: string; is_admin?: boolean }>(token)
    console.log('Payload:', payload)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const periodType = searchParams.get('period_type') || 'monthly'
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Get performance metrics from database
    let performanceMetrics = await TradingJournalPerformanceMetric.findAll({
      where: {
        user_id: payload.sub,
        period_type: periodType
      },
      order: [['period_start', 'DESC']],
      limit: 12 // Last 12 periods
    })

    // If no metrics exist, calculate them from trades
    if (performanceMetrics.length === 0) {
      performanceMetrics = await calculatePerformanceMetrics(payload.sub, periodType, startDate, endDate)
    }

    // Get current period metrics
    const currentPeriodMetrics = await getCurrentPeriodMetrics(payload.sub, periodType)

    // Get overall statistics
    const overallStats = await getOverallStats(payload.sub)

    return NextResponse.json({
      performanceMetrics,
      currentPeriod: currentPeriodMetrics,
      overallStats
    })

  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function calculatePerformanceMetrics(userId: string, periodType: string, startDate?: string | null, endDate?: string | null) {
  const metrics = []

  // Get date range
  const end = endDate ? new Date(endDate) : new Date()
  const start = startDate ? new Date(startDate) : new Date(end.getFullYear(), end.getMonth() - 11, 1)

  // Generate periods
  const periods = generatePeriods(start, end, periodType)

  for (const period of periods) {
    const periodMetrics = await calculatePeriodMetrics(userId, period.start, period.end)
    metrics.push(periodMetrics)
  }

  return metrics
}

function generatePeriods(start: Date, end: Date, periodType: string) {
  const periods = []
  let current = new Date(start)

  while (current <= end) {
    let periodEnd: Date

    switch (periodType) {
      case 'daily':
        periodEnd = new Date(current)
        current.setDate(current.getDate() + 1)
        break
      case 'weekly':
        periodEnd = new Date(current)
        periodEnd.setDate(periodEnd.getDate() + 6)
        current.setDate(current.getDate() + 7)
        break
      case 'monthly':
        periodEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
        current.setMonth(current.getMonth() + 1)
        break
      case 'quarterly':
        periodEnd = new Date(current.getFullYear(), current.getMonth() + 3, 0)
        current.setMonth(current.getMonth() + 3)
        break
      case 'yearly':
        periodEnd = new Date(current.getFullYear(), 11, 31)
        current.setFullYear(current.getFullYear() + 1)
        break
      default:
        periodEnd = new Date(current)
        current.setDate(current.getDate() + 1)
    }

    periods.push({
      start: new Date(current),
      end: periodEnd
    })
  }

  return periods
}

async function calculatePeriodMetrics(userId: string, periodStart: Date, periodEnd: Date) {
  // Get trades for the period
  const trades = await TradingJournalTrade.findAll({
    where: {
      user_id: userId,
      entry_time: {
        [Op.between]: [periodStart, periodEnd]
      },
      status: 'closed'
    }
  })

  const totalTrades = trades.length
  const winningTrades = trades.filter(t => t.is_winning).length
  const losingTrades = totalTrades - winningTrades
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl_amount || 0), 0)
  const winningTradesData = trades.filter(t => t.is_winning && t.pnl_amount)
  const losingTradesData = trades.filter(t => !t.is_winning && t.pnl_amount)

  const averageWin = winningTradesData.length > 0 
    ? winningTradesData.reduce((sum, t) => sum + (t.pnl_amount || 0), 0) / winningTradesData.length 
    : 0
  const averageLoss = losingTradesData.length > 0 
    ? losingTradesData.reduce((sum, t) => sum + (t.pnl_amount || 0), 0) / losingTradesData.length 
    : 0

  const largestWin = winningTradesData.length > 0 
    ? Math.max(...winningTradesData.map(t => t.pnl_amount || 0))
    : 0
  const largestLoss = losingTradesData.length > 0 
    ? Math.min(...losingTradesData.map(t => t.pnl_amount || 0))
    : 0

  const profitFactor = averageLoss !== 0 ? Math.abs(averageWin / averageLoss) : 0
  const riskRewardRatio = averageLoss !== 0 ? Math.abs(averageWin / averageLoss) : 0

  // Calculate max drawdown (simplified)
  let maxDrawdown = 0
  let peak = 0
  let runningTotal = 0

  for (const trade of trades.sort((a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime())) {
    runningTotal += trade.pnl_amount || 0
    if (runningTotal > peak) {
      peak = runningTotal
    }
    const drawdown = peak - runningTotal
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }

  return {
    period_start: periodStart,
    period_end: periodEnd,
    total_trades: totalTrades,
    winning_trades: winningTrades,
    losing_trades: losingTrades,
    win_rate: winRate,
    total_pnl: totalPnl,
    average_win: averageWin,
    average_loss: averageLoss,
    largest_win: largestWin,
    largest_loss: largestLoss,
    profit_factor: profitFactor,
    risk_reward_ratio: riskRewardRatio,
    max_drawdown: maxDrawdown,
    sharpe_ratio: 0, // Would need more complex calculation
    average_trade_duration: 0, // Would need to calculate from entry/exit times
    total_trading_time: 0
  }
}

async function getCurrentPeriodMetrics(userId: string, periodType: string) {
  const now = new Date()
  let periodStart: Date
  let periodEnd: Date

  switch (periodType) {
    case 'daily':
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      break
    case 'weekly':
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday)
      periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate() + 6, 23, 59, 59)
      break
    case 'monthly':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      break
    default:
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  }

  return await calculatePeriodMetrics(userId, periodStart, periodEnd)
}

async function getOverallStats(userId: string) {
  const trades = await TradingJournalTrade.findAll({
    where: {
      user_id: userId,
      status: 'closed'
    }
  })

  const totalTrades = trades.length
  const winningTrades = trades.filter(t => t.is_winning).length
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl_amount || 0), 0)
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

  return {
    totalTrades,
    winningTrades,
    losingTrades: totalTrades - winningTrades,
    winRate,
    totalPnl,
    averagePnl: totalTrades > 0 ? totalPnl / totalTrades : 0
  }
}
