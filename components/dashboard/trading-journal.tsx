'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  BarChart3, 
  FileText, 
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Eye,
  X,
  Settings,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/lib/hooks/use-auth'
import { PnLChart, WinRateChart, TradeDistributionChart, MonthlyPerformanceChart } from '@/components/dashboard/charts'

interface Screenshot {
  id: number
  trade_id: number
  user_id: string
  filename: string
  original_name: string
  file_path: string
  file_url: string
  file_size: number
  mime_type: string
  screenshot_type: 'entry' | 'exit'
  created_at: string
  updated_at: string
}

interface Trade {
  id: number
  trade_id: string
  symbol: string
  instrument_type: string
  direction: 'long' | 'short'
  entry_price: number
  entry_time: string
  entry_reason: string
  entry_confidence: 'low' | 'medium' | 'high'
  exit_price?: number
  exit_time?: string
  exit_reason?: string
  exit_confidence?: 'low' | 'medium' | 'high'
  position_size: number
  position_size_currency: string
  leverage: number
  stop_loss?: number
  take_profit?: number
  risk_amount?: number
  risk_percentage?: number
  pnl_amount?: number
  pnl_percentage?: number
  max_profit?: number
  max_loss?: number
  strategy_id?: number
  category_id?: number
  market_condition: string
  trade_setup_quality: string
  execution_quality: string
  status: 'open' | 'closed' | 'cancelled'
  is_winning?: boolean
  notes?: string
  lessons_learned?: string
  next_time_actions?: string

  strategy?: { name: string }
  category?: { name: string; color: string }
  screenshots?: Screenshot[]
}

interface PerformanceMetrics {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnl: number
  averagePnl: number
}

// Helper functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const safeNumber = (value: any): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

// Analytics calculation functions
const calculateSharpeRatio = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl_amount !== null)
  if (closedTrades.length === 0) return 0
  
  const returns = closedTrades.map(t => parseFloat(t.pnl_amount?.toString() || '0'))
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
  const stdDev = Math.sqrt(variance)
  
  return stdDev === 0 ? 0 : avgReturn / stdDev
}

const calculateMaxDrawdown = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl_amount !== null)
  if (closedTrades.length === 0) return 0
  
  let peak = 0
  let maxDrawdown = 0
  let cumulativePnl = 0
  
  closedTrades.forEach(trade => {
    cumulativePnl += parseFloat(trade.pnl_amount?.toString() || '0')
    if (cumulativePnl > peak) peak = cumulativePnl
    const drawdown = ((peak - cumulativePnl) / peak) * 100
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
  })
  
  return maxDrawdown
}

const calculateProfitFactor = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl_amount !== null)
  if (closedTrades.length === 0) return 0
  
  const grossProfit = closedTrades
    .filter(t => parseFloat(t.pnl_amount?.toString() || '0') > 0)
    .reduce((sum, t) => sum + parseFloat(t.pnl_amount?.toString() || '0'), 0)
  
  const grossLoss = Math.abs(closedTrades
    .filter(t => parseFloat(t.pnl_amount?.toString() || '0') < 0)
    .reduce((sum, t) => sum + parseFloat(t.pnl_amount?.toString() || '0'), 0))
  
  return grossLoss === 0 ? grossProfit : grossProfit / grossLoss
}

const calculateExpectancy = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl_amount !== null)
  if (closedTrades.length === 0) return 0
  
  const totalPnl = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl_amount?.toString() || '0'), 0)
  return totalPnl / closedTrades.length
}

const calculateVolatility = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl_amount !== null)
  if (closedTrades.length === 0) return 0
  
  const returns = closedTrades.map(t => parseFloat(t.pnl_amount?.toString() || '0'))
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
  
  return Math.sqrt(variance)
}

const calculateVaR = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl_amount !== null)
  if (closedTrades.length === 0) return 0
  
  const returns = closedTrades.map(t => parseFloat(t.pnl_amount?.toString() || '0'))
  const sortedReturns = returns.sort((a, b) => a - b)
  const varIndex = Math.floor(sortedReturns.length * 0.05) // 95% confidence
  
  return Math.abs(sortedReturns[varIndex] || 0)
}

const calculateLargestWin = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl_amount !== null)
  if (closedTrades.length === 0) return 0
  
  const wins = closedTrades
    .filter(t => parseFloat(t.pnl_amount?.toString() || '0') > 0)
    .map(t => parseFloat(t.pnl_amount?.toString() || '0'))
  
  return wins.length > 0 ? Math.max(...wins) : 0
}

const calculateLargestLoss = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl_amount !== null)
  if (closedTrades.length === 0) return 0
  
  const losses = closedTrades
    .filter(t => parseFloat(t.pnl_amount?.toString() || '0') < 0)
    .map(t => Math.abs(parseFloat(t.pnl_amount?.toString() || '0')))
  
  return losses.length > 0 ? Math.max(...losses) : 0
}

const calculateAverageWin = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl_amount !== null)
  if (closedTrades.length === 0) return 0
  
  const wins = closedTrades
    .filter(t => parseFloat(t.pnl_amount?.toString() || '0') > 0)
    .map(t => parseFloat(t.pnl_amount?.toString() || '0'))
  
  return wins.length > 0 ? wins.reduce((sum, win) => sum + win, 0) / wins.length : 0
}

const calculateAverageLoss = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl_amount !== null)
  if (closedTrades.length === 0) return 0
  
  const losses = closedTrades
    .filter(t => parseFloat(t.pnl_amount?.toString() || '0') < 0)
    .map(t => parseFloat(t.pnl_amount?.toString() || '0'))
  
  return losses.length > 0 ? Math.abs(losses.reduce((sum, loss) => sum + loss, 0) / losses.length) : 0
}

const calculateConsecutiveWins = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.is_winning !== null)
  if (closedTrades.length === 0) return 0
  
  let maxStreak = 0
  let currentStreak = 0
  
  closedTrades.forEach(trade => {
    if (trade.is_winning) {
      currentStreak++
      if (currentStreak > maxStreak) maxStreak = currentStreak
    } else {
      currentStreak = 0
    }
  })
  
  return maxStreak
}

const calculateConsecutiveLosses = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.is_winning !== null)
  if (closedTrades.length === 0) return 0
  
  let maxStreak = 0
  let currentStreak = 0
  
  closedTrades.forEach(trade => {
    if (!trade.is_winning) {
      currentStreak++
      if (currentStreak > maxStreak) maxStreak = currentStreak
    } else {
      currentStreak = 0
    }
  })
  
  return maxStreak
}

const calculateLongestTrade = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.entry_time && t.exit_time)
  if (closedTrades.length === 0) return 0
  
  const durations = closedTrades.map(trade => {
    const entry = new Date(trade.entry_time)
    const exit = new Date(trade.exit_time!)
    return Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24))
  })
  
  return Math.max(...durations)
}

const calculateShortestTrade = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.entry_time && t.exit_time)
  if (closedTrades.length === 0) return 0
  
  const durations = closedTrades.map(trade => {
    const entry = new Date(trade.entry_time)
    const exit = new Date(trade.exit_time!)
    return Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24))
  })
  
  return Math.min(...durations)
}

const calculateAverageHoldTime = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.entry_time && t.exit_time)
  if (closedTrades.length === 0) return 0
  
  const totalDuration = closedTrades.reduce((sum, trade) => {
    const entry = new Date(trade.entry_time)
    const exit = new Date(trade.exit_time!)
    return sum + Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24))
  }, 0)
  
  return Math.round(totalDuration / closedTrades.length)
}

const calculateWinLossRatio = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.is_winning !== null)
  if (closedTrades.length === 0) return 0
  
  const winningTrades = closedTrades.filter(t => t.is_winning).length
  const losingTrades = closedTrades.filter(t => !t.is_winning).length
  
  return losingTrades === 0 ? winningTrades : winningTrades / losingTrades
}

const getPerformanceByCategory = (trades: Trade[], categoryKey: keyof Trade) => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl_amount !== null)
  if (closedTrades.length === 0) return []
  
  const categoryMap = new Map<string, { totalPnl: number; wins: number; total: number }>()
  
  closedTrades.forEach(trade => {
    const category = trade[categoryKey] as string
    if (!category) return
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, { totalPnl: 0, wins: 0, total: 0 })
    }
    
    const current = categoryMap.get(category)!
    current.totalPnl += parseFloat(trade.pnl_amount?.toString() || '0')
    current.total++
    if (trade.is_winning) current.wins++
  })
  
  return Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    totalPnl: data.totalPnl,
    winRate: (data.wins / data.total) * 100
  }))
}

const getPerformanceByMonth = (trades: Trade[]) => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl_amount !== null && t.exit_time)
  if (closedTrades.length === 0) return []
  
  const monthMap = new Map<string, { totalPnl: number; trades: number }>()
  
  closedTrades.forEach(trade => {
    const date = new Date(trade.exit_time!)
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { totalPnl: 0, trades: 0 })
    }
    
    const current = monthMap.get(monthKey)!
    current.totalPnl += parseFloat(trade.pnl_amount?.toString() || '0')
    current.trades++
  })
  
  return Array.from(monthMap.entries()).map(([name, data]) => ({
    name,
    totalPnl: data.totalPnl,
    trades: data.trades
  })).sort((a, b) => {
    const [aMonth, aYear] = a.name.split(' ')
    const [bMonth, bYear] = b.name.split(' ')
    return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime()
  })
}

const getYearlyCalendarData = (trades: Trade[]) => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.exit_time)
  if (closedTrades.length === 0) return []
  
  const yearMap = new Map<number, {
    year: number
    months: Array<{
      pnl: number
      winRate: number
      trades: number
    } | null>
    total: {
      pnl: number
      winRate: number
      trades: number
    }
  }>()
  
  // Initialize years from 2020 to current year
  const currentYear = new Date().getFullYear()
  for (let year = 2020; year <= currentYear; year++) {
    yearMap.set(year, {
      year,
      months: new Array(12).fill(null),
      total: { pnl: 0, winRate: 0, trades: 0 }
    })
  }
  
  // Process trades
  closedTrades.forEach(trade => {
    const date = new Date(trade.exit_time!)
    const year = date.getFullYear()
    const month = date.getMonth()
    
    if (!yearMap.has(year)) {
      yearMap.set(year, {
        year,
        months: new Array(12).fill(null),
        total: { pnl: 0, winRate: 0, trades: 0 }
      })
    }
    
    const yearData = yearMap.get(year)!
    const pnl = parseFloat(trade.pnl_amount?.toString() || '0')
    
    // Initialize month if null
    if (!yearData.months[month]) {
      yearData.months[month] = { pnl: 0, winRate: 0, trades: 0 }
    }
    
    // Update month data
    yearData.months[month]!.pnl += pnl
    yearData.months[month]!.trades++
    yearData.months[month]!.winRate = yearData.months[month]!.trades > 0 
      ? (yearData.months[month]!.trades * (trade.is_winning ? 1 : 0)) / yearData.months[month]!.trades * 100
      : 0
    
    // Update year totals
    yearData.total.pnl += pnl
    yearData.total.trades++
  })
  
  // Calculate yearly win rates
  yearMap.forEach((yearData) => {
    const winningTrades = closedTrades
      .filter(t => {
        const date = new Date(t.exit_time!)
        return date.getFullYear() === yearData.year && t.is_winning
      }).length
    
    yearData.total.winRate = yearData.total.trades > 0 
      ? (winningTrades / yearData.total.trades) * 100 
      : 0
  })
  
  // Convert to array and sort by year (newest first)
  return Array.from(yearMap.values())
    .filter(yearData => yearData.total.trades > 0) // Only show years with data
    .sort((a, b) => b.year - a.year)
}

// Cache for monthly calendar data to prevent duplicate calculations
const monthlyCalendarCache = new Map<string, any>()

const getMonthlyCalendarData = (trades: Trade[], year: number, month: number) => {
  // Create cache key
  const cacheKey = `${year}-${month}-${trades.length}`
  
  // Check if we have cached data for this exact state
  if (monthlyCalendarCache.has(cacheKey)) {
    console.log(`Using cached calendar data for ${year}-${month}`)
    return monthlyCalendarCache.get(cacheKey)
  }
  
  console.log(`Calculating fresh calendar data for ${year}-${month}`)
  
  // More precise date filtering to avoid timezone issues
  const closedTrades = trades.filter(t => {
    if (t.status !== 'closed' || !t.exit_time) return false
    
    const exitDate = new Date(t.exit_time)
    const tradeYear = exitDate.getFullYear()
    const tradeMonth = exitDate.getMonth()
    
    // Strict year and month comparison
    return tradeYear === year && tradeMonth === month
  })
  
  if (closedTrades.length === 0) return null
  
  // Get month info
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // Initialize daily data
  const dailyData = new Map<number, {
    day: number
    trades: Trade[]
    pnl: number
    winRate: number
    tradeCount: number
  }>()
  
  // Initialize all days
  for (let day = 1; day <= daysInMonth; day++) {
    dailyData.set(day, {
      day,
      trades: [],
      pnl: 0,
      winRate: 0,
      tradeCount: 0
    })
  }
  
  // Process trades for each day with better date handling
  closedTrades.forEach(trade => {
    const exitDate = new Date(trade.exit_time!)
    
    // Ensure we're working with the correct month
    if (exitDate.getFullYear() !== year || exitDate.getMonth() !== month) {
      console.warn(`Trade ${trade.id} has exit date ${trade.exit_time} but was filtered for ${year}-${month}`)
      return
    }
    
    const day = exitDate.getDate()
    const pnl = parseFloat(trade.pnl_amount?.toString() || '0')
    
    const dayData = dailyData.get(day)
    if (dayData) {
      dayData.trades.push(trade)
      dayData.pnl += pnl
      dayData.tradeCount++
    }
  })
  
  // Calculate win rates for each day
  dailyData.forEach((dayData) => {
    if (dayData.tradeCount > 0) {
      const winningTrades = dayData.trades.filter(t => t.is_winning).length
      dayData.winRate = (winningTrades / dayData.tradeCount) * 100
    }
  })
  
  // Calculate month totals
  const totalPnl = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl_amount?.toString() || '0'), 0)
  const totalTrades = closedTrades.length
  const winningTrades = closedTrades.filter(t => t.is_winning).length
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
  
  // Debug logging
  console.log(`=== MONTHLY CALENDAR DEBUG: ${monthName} ===`)
  console.log('Year:', year, 'Month:', month, 'Total Trades:', totalTrades)
  console.log('Closed Trades Details:')
  closedTrades.forEach((t, index) => {
    const exitDate = new Date(t.exit_time!)
    console.log(`  Trade ${index + 1}: ID=${t.id}, Exit=${t.exit_time}, Parsed=${exitDate.toISOString()}, Year=${exitDate.getFullYear()}, Month=${exitDate.getMonth()}, Day=${exitDate.getDate()}`)
  })
  
  console.log('Daily Data Summary:')
  dailyData.forEach((dayData) => {
    if (dayData.tradeCount > 0) {
      console.log(`  Day ${dayData.day}: ${dayData.tradeCount} trades, P&L: ${dayData.pnl}, Win Rate: ${dayData.winRate.toFixed(1)}%`)
    }
  })
  console.log('=== END DEBUG ===')
  
  // Additional debug: Check for any trades that might be in wrong month
  const allTradesInPeriod = trades.filter(t => 
    t.status === 'closed' && 
    t.exit_time && 
    new Date(t.exit_time).getFullYear() === year &&
    Math.abs(new Date(t.exit_time).getMonth() - month) <= 1 // Check adjacent months
  )
  
  if (allTradesInPeriod.length > closedTrades.length) {
    console.warn(`Found ${allTradesInPeriod.length - closedTrades.length} trades in adjacent months that might be causing confusion`)
    allTradesInPeriod.forEach(t => {
      const exitDate = new Date(t.exit_time!)
      console.log(`Trade ${t.id}: ${t.exit_time} -> ${exitDate.toISOString()} -> Year: ${exitDate.getFullYear()}, Month: ${exitDate.getMonth()}, Day: ${exitDate.getDate()}`)
    })
  }
  
  const result = {
    monthName,
    year,
    month,
    dailyData: Array.from(dailyData.values()),
    summary: {
      totalPnl,
      totalTrades,
      winRate,
      winningTrades,
      losingTrades: totalTrades - winningTrades,
      averagePnl: totalTrades > 0 ? totalPnl / totalTrades : 0
    }
  }
  
  // Cache the result
  monthlyCalendarCache.set(cacheKey, result)
  
  return result
}

const getDailyTradeDetails = (trades: Trade[], year: number, month: number, day: number) => {
  return trades.filter(t => 
    t.status === 'closed' && 
    t.exit_time &&
    new Date(t.exit_time).getFullYear() === year &&
    new Date(t.exit_time).getMonth() === month &&
    new Date(t.exit_time).getDate() === day
  )
}

export function TradingJournal() {
  const { user } = useAuth()
  const [trades, setTrades] = useState<Trade[]>([])
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    totalPnl: 0,
    averagePnl: 0
  })
  const [loading, setLoading] = useState(true)
  const [showTradeForm, setShowTradeForm] = useState(false)
  const [showCloseTradeForm, setShowCloseTradeForm] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    symbol: '',
    instrument_type: '',
    direction: '',
    entry_price: '',
    entry_time: '',
    entry_reason: '',
    position_size: '',
    position_size_currency: 'USD',
    leverage: '1.00'
  })
  const [submitting, setSubmitting] = useState(false)
  const [closeFormData, setCloseFormData] = useState({
    exit_price: '',
    exit_time: '',
    exit_reason: '',
    exit_confidence: 'medium',
    pnl_amount: '',
    pnl_percentage: '',
    lessons_learned: '',
    next_time_actions: ''
  })
  
  const [selectedTradeForView, setSelectedTradeForView] = useState<Trade | null>(null)
  const [showTradeViewModal, setShowTradeViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})
  
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'analytics' | 'calendar'>('overview')
  const [calendarView, setCalendarView] = useState<'winrate' | 'pnl' | 'trades'>('pnl')
  // MT5 integration state
  // MT5 removed
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth()
  })
  const [calendarMode, setCalendarMode] = useState<'yearly' | 'monthly'>('yearly')
         
  useEffect(() => {
    if (user) {
      fetchTrades()
      fetchPerformance()
    }
  }, [user])

  // Recalculate performance when trades change
  useEffect(() => {
    if (trades.length > 0) {
      const closedTrades = trades.filter(t => t.status === 'closed')
      const winningTrades = closedTrades.filter(t => t.is_winning === true).length
      const losingTrades = closedTrades.filter(t => t.is_winning === false).length
      const totalPnl = closedTrades.reduce((sum, t) => sum + (parseFloat(t.pnl_amount?.toString()) || 0), 0)
      const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0
      const averagePnl = closedTrades.length > 0 ? totalPnl / closedTrades.length : 0
      
      console.log('Performance calculation:', {
        totalTrades: trades.length,
        closedTrades: closedTrades.length,
        winningTrades,
        losingTrades,
        winRate,
        totalPnl,
        averagePnl
      })
      
      setPerformance({
        totalTrades: trades.length,
        winningTrades,
        losingTrades,
        winRate,
        totalPnl,
        averagePnl
      })
    }
  }, [trades])

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/trading-journal/trades')
      if (response.ok) {
        const data = await response.json()
        console.log('Trades API response:', data)
        setTrades(data.trades || [])
      } else {
        const errorData = await response.json()
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const fetchPerformance = async () => {
    try {
      const response = await fetch('/api/trading-journal/performance')
      if (response.ok) {
        const data = await response.json()
        console.log('Performance API response:', data)
        console.log('Overall stats:', data.overallStats)
        setPerformance(data.overallStats || {
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          winRate: 0,
          totalPnl: 0,
          averagePnl: 0
        })
      } else {
        const errorData = await response.json()
        console.error('Performance API error:', errorData)
        
        // Fallback: calculate performance from trades data
        if (trades.length > 0) {
          const closedTrades = trades.filter(t => t.status === 'closed')
          const winningTrades = closedTrades.filter(t => t.is_winning === true).length
          const losingTrades = closedTrades.filter(t => t.is_winning === false).length
          const totalPnl = closedTrades.reduce((sum, t) => sum + (parseFloat(t.pnl_amount?.toString()) || 0), 0)
          const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0
          const averagePnl = closedTrades.length > 0 ? totalPnl / closedTrades.length : 0
          
          setPerformance({
            totalTrades: trades.length,
            winningTrades,
            losingTrades,
            winRate,
            totalPnl,
            averagePnl
          })
        }
      }
    } catch (error) {
      console.error('Performance fetch error:', error)
      
      // Fallback: calculate performance from trades data
      if (trades.length > 0) {
        const closedTrades = trades.filter(t => t.status === 'closed')
        const winningTrades = closedTrades.filter(t => t.is_winning === true).length
        const losingTrades = closedTrades.filter(t => t.is_winning === false).length
        const totalPnl = closedTrades.reduce((sum, t) => sum + (parseFloat(t.pnl_amount?.toString()) || 0), 0)
        const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0
        const averagePnl = closedTrades.length > 0 ? totalPnl / closedTrades.length : 0
        
        setPerformance({
          totalTrades: trades.length,
          winningTrades,
          losingTrades,
          winRate,
          totalPnl,
          averagePnl
        })
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData()
      
      // Add only non-empty form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'screenshots' && formData[key as keyof typeof formData]) {
          const value = formData[key as keyof typeof formData]
          if (typeof value === 'string' && value.trim() !== '') {
            formDataToSend.append(key, value)
          }
        }
      })
      

      
      // Add parsed values
      formDataToSend.set('entry_price', parseFloat(formData.entry_price).toString())
      formDataToSend.set('position_size', parseFloat(formData.position_size).toString())
      formDataToSend.set('leverage', parseFloat(formData.leverage).toString())
      formDataToSend.set('entry_time', formData.entry_time || new Date().toISOString().slice(0, 16))

      // Debug: Log what's being sent
      console.log('FormData being sent:')
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value)
      }

      const response = await fetch('/api/trading-journal/trades', {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        const newTrade = await response.json()
        setTrades(prev => [newTrade, ...prev])
        setShowTradeForm(false)
        setFormData({
          symbol: '',
          instrument_type: '',
          direction: '',
          entry_price: '',
          entry_time: '',
          entry_reason: '',
          position_size: '',
          position_size_currency: 'USD',
          leverage: '1.00'
        })
        // Refresh performance data
        fetchPerformance()
      } else {
        const error = await response.json()
        alert(`Error creating trade: ${error.error}`)
      }
    } catch (error) {
      alert('Error creating trade. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      symbol: '',
      instrument_type: '',
      direction: '',
      entry_reason: '',
      entry_price: '',
      entry_time: '',
      position_size: '',
      position_size_currency: 'USD',
      leverage: '1.00'
    })
  }
  
  const resetCloseForm = () => {
    setCloseFormData({
      exit_price: '',
      exit_time: '',
      exit_reason: '',
      exit_confidence: 'medium',
      pnl_amount: '',
      pnl_percentage: '',
      lessons_learned: '',
      next_time_actions: ''
    })
  }
  
  const handleCloseTrade = (trade: Trade) => {
    setSelectedTrade(trade)
    setCloseFormData({
      exit_price: '',
      exit_time: new Date().toISOString().slice(0, 16),
      exit_reason: '',
      exit_confidence: 'medium',
      pnl_amount: '',
      pnl_percentage: '',
      lessons_learned: '',
      next_time_actions: ''
    })
    setShowCloseTradeForm(true)
  }
  
  const handleCloseTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTrade) return
    
    setSubmitting(true)
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData()
      
      // Add all form fields
      Object.keys(closeFormData).forEach(key => {
        if (key !== 'screenshots') {
          const value = closeFormData[key as keyof typeof closeFormData]
          if (typeof value === 'string' && value.trim() !== '') {
            formDataToSend.append(key, value)
          }
        }
      })
      

      
      // Add parsed values
      formDataToSend.set('exit_price', parseFloat(closeFormData.exit_price).toString())
      if (closeFormData.pnl_amount) {
        formDataToSend.set('pnl_amount', parseFloat(closeFormData.pnl_amount).toString())
      }
      if (closeFormData.pnl_percentage) {
        formDataToSend.set('pnl_percentage', parseFloat(closeFormData.pnl_percentage).toString())
      }

      const response = await fetch(`/api/trading-journal/trades/${selectedTrade.id}/close`, {
        method: 'POST',
        body: formDataToSend
      })
      
      if (response.ok) {
        const updatedTrade = await response.json()
        setTrades((prev: Trade[]) => prev.map(trade => 
          trade.id === selectedTrade.id ? updatedTrade : trade
        ))
        setShowCloseTradeForm(false)
        setSelectedTrade(null)
        resetCloseForm()
        fetchPerformance()
      } else {
        const error = await response.json()
        alert(`Error closing trade: ${error.error}`)
      }
    } catch (error) {
      alert('Error closing trade. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  





  
  const handleViewTrade = (trade: Trade) => {
    console.log('Viewing trade:', trade)
    console.log('Trade screenshots:', trade.screenshots)
    setSelectedTradeForView(trade)
    setShowTradeViewModal(true)
  }

  const addScreenshotsToTrade = async (tradeId: number, files: File[], type: 'entry' | 'exit' = 'entry') => {
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('screenshots', file)
      })
      formData.append('type', type)

      const response = await fetch(`/api/trading-journal/trades/${tradeId}/screenshots`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh the trade view to show new screenshots
        const updatedTrade = await fetch(`/api/trading-journal/trades/${tradeId}/screenshots`).then(res => res.json())
        setSelectedTradeForView(prev => prev ? { ...prev, screenshots: updatedTrade.screenshots } : null)
        alert('Screenshots added successfully!')
      } else {
        const error = await response.json()
        alert(`Error adding screenshots: ${error.error}`)
      }
    } catch (error) {
      alert('Error adding screenshots. Please try again.')
    }
  }

  const removeScreenshotFromTrade = async (tradeId: number, screenshotId: number) => {
    try {
      const response = await fetch(`/api/trading-journal/trades/${tradeId}/screenshots?id=${screenshotId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove screenshot from local state
        setSelectedTradeForView(prev => prev ? {
          ...prev,
          screenshots: prev.screenshots?.filter(s => s.id !== screenshotId) || []
        } : null)
        alert('Screenshot removed successfully!')
      } else {
        const error = await response.json()
        alert(`Error removing screenshot: ${error.error}`)
      }
    } catch (error) {
      alert('Error removing screenshot. Please try again.')
    }
  }
  
  const handleEditTrade = (trade: Trade) => {
    setEditFormData({
      symbol: trade.symbol,
      instrument_type: trade.instrument_type,
      direction: trade.direction,
      entry_price: trade.entry_price,
      entry_time: trade.entry_time?.slice(0, 16),
      entry_reason: trade.entry_reason,
      position_size: trade.position_size,
      position_size_currency: trade.position_size_currency,
      leverage: trade.leverage,
      notes: trade.notes
    })
    setSelectedTrade(trade)
    setShowEditModal(true)
  }
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTrade) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`/api/trading-journal/trades/${selectedTrade.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          entry_price: parseFloat(editFormData.entry_price),
          position_size: parseFloat(editFormData.position_size),
          leverage: parseFloat(editFormData.leverage)
        })
      })
      
      if (response.ok) {
        const updatedTrade = await response.json()
        setTrades(prev => prev.map(trade => 
          trade.id === selectedTrade.id ? updatedTrade : trade
        ))
        setShowEditModal(false)
        setSelectedTrade(null)
        fetchPerformance()
      } else {
        const error = await response.json()
        alert(`Error updating trade: ${error.error}`)
      }
    } catch (error) {
      alert('Error updating trade. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleDeleteTrade = async (tradeId: number) => {
    if (!confirm('Are you sure you want to delete this trade? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/trading-journal/trades/${tradeId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setTrades(prev => prev.filter(trade => trade.id !== tradeId))
        fetchPerformance()
      } else {
        const error = await response.json()
        alert(`Error deleting trade: ${error.error}`)
      }
    } catch (error) {
      alert('Error deleting trade. Please try again.')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0
    const num = Number(value)
    return isNaN(num) ? 0 : num
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trading Journal</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Track your trades, analyze performance, and improve your strategy</p>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
            </Button>
            
            <Button onClick={() => setShowTradeForm(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              New Trade
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'trades', label: 'Trades', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'calendar', label: 'Calendar', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <tab.icon className="inline-block w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Net P&L</CardTitle>
                  <div className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                    {performance.totalTrades}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${safeNumber(performance.totalPnl) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(safeNumber(performance.totalPnl))}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total profit/loss</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Trade Win %</CardTitle>
                  <Target className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {performance.totalTrades > 0 ? (performance.winningTrades / performance.totalTrades * 100).toFixed(1) : '0.0'}%
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${performance.totalTrades > 0 ? (performance.winningTrades / performance.totalTrades * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">{performance.winningTrades}</span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">{performance.totalTrades - performance.winningTrades - performance.losingTrades}</span>
                    <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">{performance.losingTrades}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Profit Factor</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {performance.totalTrades > 0 ? (safeNumber(performance.totalPnl) / Math.abs(performance.losingTrades > 0 ? performance.totalPnl / performance.totalTrades : 1)).toFixed(2) : '0.00'}
                  </div>
                  <div className="w-16 h-16 mx-auto mt-2">
                    <div className="w-full h-full rounded-full border-4 border-gray-200 dark:border-gray-600 flex items-center justify-center">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">PF</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Day Win %</CardTitle>
                  <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {performance.totalTrades > 0 ? (performance.winningTrades / performance.totalTrades * 100).toFixed(1) : '0.0'}%
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${performance.totalTrades > 0 ? (performance.winningTrades / performance.totalTrades * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Avg Win/Loss</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {performance.totalTrades > 0 ? (safeNumber(performance.totalPnl) / performance.totalTrades).toFixed(2) : '0.00'}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span className="text-green-600">${performance.totalTrades > 0 ? (safeNumber(performance.totalPnl) / performance.totalTrades).toFixed(0) : '0'}</span>
                    <span className="text-red-600">-${Math.abs(performance.totalTrades > 0 ? (safeNumber(performance.totalPnl) / performance.totalTrades).toFixed(0) : '0')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* P&L Over Time Chart */}
              <div className="lg:col-span-2">
                <PnLChart trades={trades} />
              </div>
              
              {/* Win Rate Trend Chart */}
              <div>
                <WinRateChart trades={trades} />
              </div>
              
              {/* Trade Distribution Chart */}
              <div>
                <TradeDistributionChart trades={trades} />
              </div>
            </div>
            
            {/* Monthly Performance Chart */}
            <div className="mt-6">
              <MonthlyPerformanceChart trades={trades} />
            </div>

            {/* Recent Trades */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Trades</CardTitle>
                    <CardDescription className="dark:text-gray-300">Your latest trading activity</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('trades')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-200">Close Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-200">Symbol</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-200">Net P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.slice(0, 5).map((trade) => (
                        <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => handleViewTrade(trade)}>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                            {trade.exit_time ? new Date(trade.exit_time).toLocaleDateString() : 'Open'}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{trade.symbol}</td>
                          <td className={`py-3 px-4 text-sm font-medium ${trade.pnl_amount && trade.pnl_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trade.pnl_amount ? formatCurrency(trade.pnl_amount) : '--'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="space-y-6">
            {/* Trades Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Trades</h2>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analyze
                </Button>
              </div>
            </div>

            {/* Trades Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trades.map((trade) => (
                <Card key={trade.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewTrade(trade)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant={trade.direction === 'long' ? 'default' : 'secondary'} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        {trade.direction.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{trade.instrument_type}</span>
                    </div>
                    <h3 className="font-semibold text-xl mb-2 text-gray-900 dark:text-white">{trade.symbol}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Entry Price:</span>
                        <span className="font-medium text-gray-900 dark:text-white">${trade.entry_price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Position Size:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{trade.position_size} {trade.position_size_currency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Leverage:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{trade.leverage}x</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={trade.status === 'open' ? 'outline' : trade.status === 'closed' ? 'default' : 'secondary'}>
                        {trade.status}
                      </Badge>
                      {trade.pnl_amount && (
                        <span className={`text-sm font-medium ${trade.pnl_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(trade.pnl_amount)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trading Analytics</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Deep dive into your trading performance and patterns</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Date Range
                </Button>
              </div>
            </div>

            {/* Key Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Sharpe Ratio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {calculateSharpeRatio(trades).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Risk-adjusted returns</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Max Drawdown</CardTitle>
                  <TrendingDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {calculateMaxDrawdown(trades).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Largest peak to trough</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Profit Factor</CardTitle>
                  <BarChart3 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {calculateProfitFactor(trades).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Gross profit / Gross loss</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Expectancy</CardTitle>
                  <Target className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${calculateExpectancy(trades).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Expected P&L per trade</div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Analysis */}
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Risk Analysis</CardTitle>
                  <CardDescription className="dark:text-gray-300">Portfolio risk metrics and volatility</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {calculateVolatility(trades).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Volatility</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {calculateVaR(trades).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Value at Risk</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Largest Win:</span>
                      <span className="font-medium text-green-600">
                        ${calculateLargestWin(trades).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Largest Loss:</span>
                      <span className="font-medium text-red-600">
                        ${calculateLargestLoss(trades).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Average Win:</span>
                      <span className="font-medium text-green-600">
                        ${calculateAverageWin(trades).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Average Loss:</span>
                      <span className="font-medium text-red-600">
                        ${calculateAverageLoss(trades).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trade Analysis */}
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Trade Analysis</CardTitle>
                  <CardDescription className="dark:text-gray-300">Detailed trade statistics and patterns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {calculateConsecutiveWins(trades)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Best Streak</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {calculateConsecutiveLosses(trades)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Worst Streak</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Longest Trade:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculateLongestTrade(trades)} days
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Shortest Trade:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculateShortestTrade(trades)} days
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Average Hold Time:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculateAverageHoldTime(trades)} days
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Win/Loss Ratio:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculateWinLossRatio(trades).toFixed(2)}:1
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance by Category */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Performance by Category</CardTitle>
                <CardDescription className="dark:text-gray-300">Breakdown of performance by instrument type and direction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* By Instrument Type */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">By Instrument Type</h4>
                    <div className="space-y-2">
                      {getPerformanceByCategory(trades, 'instrument_type').map((category) => (
                        <div key={category.name} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-sm text-gray-600 dark:text-gray-300">{category.name}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              ${category.totalPnl.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {category.winRate.toFixed(1)}% win rate
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Direction */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">By Direction</h4>
                    <div className="space-y-2">
                      {getPerformanceByCategory(trades, 'direction').map((category) => (
                        <div key={category.name} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-sm text-gray-600 dark:text-gray-300">{category.name}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              ${category.totalPnl.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {category.winRate.toFixed(1)}% win rate
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Month */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">By Month</h4>
                    <div className="space-y-2">
                      {getPerformanceByMonth(trades).slice(-6).map((month) => (
                        <div key={month.name} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-sm text-gray-600 dark:text-gray-300">{month.name}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              ${month.totalPnl.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {month.trades} trades
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trading Calendar</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Detailed daily and monthly performance overview</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Calendar
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Date Range
                </Button>
              </div>
            </div>

            {/* Calendar Mode Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setCalendarMode('yearly')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    calendarMode === 'yearly'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Yearly Overview
                </button>
                <button
                  onClick={() => setCalendarMode('monthly')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    calendarMode === 'monthly'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Monthly Detail
                </button>
              </div>
            </div>

            {/* Yearly Calendar View */}
            {calendarMode === 'yearly' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  {[
                    { id: 'winrate', label: 'Win Rate', icon: Target },
                    { id: 'pnl', label: 'P&L', icon: DollarSign },
                    { id: 'trades', label: 'Trades', icon: BarChart3 }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setCalendarView(tab.id as 'winrate' | 'pnl' | 'trades')}
                      className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        calendarView === tab.id
                          ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Yearly Calendar Grid */}
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-200">Year</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-200">Jan</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-200">Feb</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-200">Mar</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-200">Apr</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-200">May</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-200">Jun</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-200">Jul</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-200">Aug</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-200">Sep</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-200">Oct</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-200">Nov</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-200">Dec</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-200">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getYearlyCalendarData(trades).map((yearData) => (
                          <tr key={yearData.year} className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                              {yearData.year}
                            </td>
                            {yearData.months.map((month, monthIndex) => (
                              <td key={monthIndex} className="py-4 px-2 text-center">
                                {month ? (
                                  <div className={`inline-block p-3 rounded-lg min-w-[80px] ${
                                    calendarView === 'pnl' 
                                      ? month.pnl >= 0 
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                      : calendarView === 'winrate'
                                      ? month.winRate >= 50
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                                  }`}>
                                    <div className="text-sm font-semibold">
                                      {calendarView === 'pnl' 
                                        ? formatCurrency(month.pnl)
                                        : calendarView === 'winrate'
                                        ? `${month.winRate.toFixed(1)}%`
                                        : month.trades
                                      }
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      {calendarView === 'pnl' || calendarView === 'winrate'
                                        ? `${month.trades} trades`
                                        : 'trades'
                                      }
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-gray-400 dark:text-gray-600">--</div>
                                )}
                              </td>
                            ))}
                            <td className="py-4 px-4 text-center">
                              <div className={`inline-block p-3 rounded-lg min-w-[80px] ${
                                calendarView === 'pnl' 
                                  ? yearData.total.pnl >= 0 
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                  : calendarView === 'winrate'
                                  ? yearData.total.winRate >= 50
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                              }`}>
                                <div className="text-sm font-semibold">
                                  {calendarView === 'pnl' 
                                    ? formatCurrency(yearData.total.pnl)
                                    : calendarView === 'winrate'
                                    ? `${yearData.total.winRate.toFixed(1)}%`
                                    : yearData.total.trades
                                  }
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {calendarView === 'pnl' || calendarView === 'winrate'
                                    ? `${yearData.total.trades} trades`
                                    : 'trades'
                                  }
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Calendar View */}
            {calendarMode === 'monthly' && (
              <div className="space-y-6">
                {/* Month Navigation */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newMonth = selectedMonth.month === 0 ? 11 : selectedMonth.month - 1
                        const newYear = selectedMonth.month === 0 ? selectedMonth.year - 1 : selectedMonth.year
                        setSelectedMonth({ year: newYear, month: newMonth })
                      }}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous Month
                    </Button>
                    
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {new Date(selectedMonth.year, selectedMonth.month).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Click on any day to view detailed trades
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newMonth = selectedMonth.month === 11 ? 0 : selectedMonth.month + 1
                        const newYear = selectedMonth.month === 11 ? selectedMonth.year + 1 : selectedMonth.year
                        setSelectedMonth({ year: newYear, month: newMonth })
                      }}
                    >
                      Next Month
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* Monthly Summary */}
                {(() => {
                  const monthData = getMonthlyCalendarData(trades, selectedMonth.year, selectedMonth.month)
                  return monthData ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Total P&L</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`text-2xl font-bold ${
                            monthData.summary.totalPnl >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatCurrency(monthData.summary.totalPnl)}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Total Trades</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {monthData.summary.totalTrades}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Win Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {monthData.summary.winRate.toFixed(1)}%
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Avg P&L</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`text-2xl font-bold ${
                            monthData.summary.averagePnl >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatCurrency(monthData.summary.averagePnl)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardContent className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                        <p className="text-gray-600 dark:text-gray-400">No trades found for this month</p>
                      </CardContent>
                    </Card>
                  )
                })()}

                {/* Daily Calendar Grid */}
                {(() => {
                  const monthData = getMonthlyCalendarData(trades, selectedMonth.year, selectedMonth.month)
                  if (!monthData) return null
                  
                  const firstDayOfMonth = new Date(selectedMonth.year, selectedMonth.month, 1)
                  const lastDayOfMonth = new Date(selectedMonth.year, selectedMonth.month + 1, 0)
                  const startDate = new Date(firstDayOfMonth)
                  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay())
                  
                  const calendarDays = []
                  const currentDate = new Date(startDate)
                  
                  while (currentDate <= lastDayOfMonth || currentDate.getDay() !== 0) {
                    calendarDays.push(new Date(currentDate))
                    currentDate.setDate(currentDate.getDate() + 1)
                  }
                  
                  return (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <div className="grid grid-cols-7 gap-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-center py-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                            {day}
                          </div>
                        ))}
                        
                        {calendarDays.map((date, index) => {
                          const isCurrentMonth = date.getMonth() === selectedMonth.month
                          // Only show trade data for the current month, not adjacent months
                          const dayData = isCurrentMonth ? monthData.dailyData.find(d => d.day === date.getDate()) : null
                          const hasTrades = isCurrentMonth && dayData && dayData.tradeCount > 0
                          
                          return (
                            <div
                              key={index}
                              className={`min-h-[80px] p-2 border border-gray-100 dark:border-gray-700 ${
                                isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                              }`}
                            >
                              <div className={`text-sm font-medium mb-1 ${
                                isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                              }`}>
                                {date.getDate()}
                              </div>
                              
                              {hasTrades && dayData && (
                                <div className="space-y-1">
                                  <div className={`text-xs px-2 py-1 rounded ${
                                    calendarView === 'pnl'
                                      ? dayData.pnl >= 0
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                      : calendarView === 'winrate'
                                      ? dayData.winRate >= 50
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                                  }`}>
                                    {calendarView === 'pnl' 
                                      ? formatCurrency(dayData.pnl)
                                      : calendarView === 'winrate'
                                      ? `${dayData.winRate.toFixed(1)}%`
                                      : dayData.tradeCount
                                    }
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {dayData.tradeCount} trade{dayData.tradeCount !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        {activeTab === 'mt5' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Connect MT5 Account</h2>
                <p className="text-gray-600 dark:text-gray-400">Securely connect to import trades into your journal</p>
              </div>
            </div>

            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">MT5 Credentials</CardTitle>
                <CardDescription className="dark:text-gray-300">We never store your password in plain text. Use a read-only investor password where possible.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const form = e.currentTarget as HTMLFormElement
                    const server = (form.elements.namedItem('mt5_server') as HTMLInputElement)?.value
                    const login = (form.elements.namedItem('mt5_login') as HTMLInputElement)?.value
                    const password = (form.elements.namedItem('mt5_password') as HTMLInputElement)?.value
                    try {
                      setMt5Error(null)
                      setMt5Connecting(true)
                      const res = await fetch('/api/mt5/connect', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ server, login, password })
                      })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data?.error || 'Connection failed')
                      // Store session in state for the session
                      const sessionId = data?.session?.id || data?.session?.sessionId || data?.session?.token || null
                      setMt5SessionId(sessionId)
                      console.log('MT5 connected:', data?.session)
                      alert('MT5 connected successfully')
                    } catch (err: any) {
                      setMt5Error(err?.message || 'Unknown error')
                      alert(`MT5 connection failed: ${err?.message || 'Unknown error'}`)
                    } finally {
                      setMt5Connecting(false)
                    }
                  }}
                >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Broker</label>
                    <Select value={selectedBroker} onValueChange={(v) => { setSelectedBroker(v); setSelectedServer('') }}>
                      <SelectTrigger>
                        <SelectValue placeholder={brokers ? 'Select broker' : 'Loading...'} />
                      </SelectTrigger>
                      <SelectContent>
                        {(brokers || []).map((b) => (
                          <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Server</label>
                    <Select value={selectedServer} onValueChange={setSelectedServer} disabled={!selectedBroker}>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedBroker ? 'Select server' : 'Select broker first'} />
                      </SelectTrigger>
                      <SelectContent>
                        {(brokers?.find(b => b.name === selectedBroker)?.servers || []).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Server</label>
                    <Input name="mt5_server" placeholder="e.g. MetaQuotes-Demo" value={selectedServer} onChange={(e) => setSelectedServer(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Account/Login</label>
                    <Input name="mt5_login" placeholder="e.g. 12345678" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <Input name="mt5_password" type="password" placeholder="Enter password" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Platform</label>
                    <Select defaultValue="mt5">
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mt5">MetaTrader 5</SelectItem>
                        <SelectItem value="mt4" disabled>MetaTrader 4 (coming soon)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <Button disabled={!selectedServer || mt5Connecting} type="submit" className="bg-purple-600 hover:bg-purple-700">{mt5Connecting ? 'Connecting...' : 'Connect'}</Button>
                  <Button type="button" variant="outline" onClick={async () => {
                    alert('We will ping MT5 with provided credentials once connected.')
                  }}>Test Connection</Button>
                </div>
                </form>
                {mt5Error && (
                  <div className="text-sm text-red-600 mt-2">{mt5Error}</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Import Options</CardTitle>
                <CardDescription className="dark:text-gray-300">Choose how to sync your historical and new trades.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button disabled={!mt5SessionId} variant="outline" onClick={async () => {
                    if (!mt5SessionId) { alert('Please connect MT5 first.'); return }
                    const res = await fetch('/api/mt5/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: mt5SessionId, from: new Date(Date.now() - 30*24*60*60*1000).toISOString(), to: new Date().toISOString() }) })
                    const data = await res.json()
                    if (!res.ok) {
                      alert(`Import failed: ${data?.error || 'Unknown error'}`)
                      return
                    }
                    console.log('Imported trades (30d):', data?.trades)
                    setMt5TradesPreview(Array.isArray(data?.trades) ? data?.trades : (data?.trades?.results || []))
                    alert('Fetched recent trades (check console). We will map these into journal next.')
                  }}>Import Last 30 Days</Button>
                  <Button disabled={!mt5SessionId} variant="outline" onClick={async () => {
                    if (!mt5SessionId) { alert('Please connect MT5 first.'); return }
                    const start = new Date(new Date().getFullYear(), 0, 1).toISOString()
                    const res = await fetch('/api/mt5/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: mt5SessionId, from: start, to: new Date().toISOString() }) })
                    const data = await res.json()
                    if (!res.ok) {
                      alert(`Import failed: ${data?.error || 'Unknown error'}`)
                      return
                    }
                    console.log('Imported trades (YTD):', data?.trades)
                    setMt5TradesPreview(Array.isArray(data?.trades) ? data?.trades : (data?.trades?.results || []))
                    alert('Fetched YTD trades (check console).')
                  }}>Import Year-to-Date</Button>
                  <Button disabled={!mt5SessionId} variant="outline" onClick={async () => {
                    if (!mt5SessionId) { alert('Please connect MT5 first.'); return }
                    const res = await fetch('/api/mt5/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: mt5SessionId }) })
                    const data = await res.json()
                    if (!res.ok) {
                      alert(`Import failed: ${data?.error || 'Unknown error'}`)
                      return
                    }
                    console.log('Imported trades (All):', data?.trades)
                    setMt5TradesPreview(Array.isArray(data?.trades) ? data?.trades : (data?.trades?.results || []))
                    alert('Fetched all history (check console).')
                  }}>Import All History</Button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Auto-sync new trades every 15 minutes after connecting.</div>
              </CardContent>
            </Card>

            

            {mt5TradesPreview && (
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">MT5 Trades Preview</CardTitle>
                  <CardDescription className="dark:text-gray-300">First {Math.min(mt5TradesPreview.length, 10)} trades shown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="text-gray-600 dark:text-gray-300">
                        <tr>
                          <th className="px-2 py-1 text-left">Ticket</th>
                          <th className="px-2 py-1 text-left">Symbol</th>
                          <th className="px-2 py-1 text-left">Type</th>
                          <th className="px-2 py-1 text-right">Volume</th>
                          <th className="px-2 py-1 text-right">Profit</th>
                          <th className="px-2 py-1 text-left">Close Time</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-800 dark:text-gray-100">
                        {mt5TradesPreview.slice(0, 10).map((t, idx) => (
                          <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                            <td className="px-2 py-1">{t.ticket || t.id || '-'}</td>
                            <td className="px-2 py-1">{t.symbol || '-'}</td>
                            <td className="px-2 py-1 capitalize">{t.type || t.side || '-'}</td>
                            <td className="px-2 py-1 text-right">{t.volume || t.lots || '-'}</td>
                            <td className="px-2 py-1 text-right">{typeof t.profit !== 'undefined' ? t.profit : (t.pnl || '-')}</td>
                            <td className="px-2 py-1">{t.close_time || t.time_close || t.time || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Open Trades - Card View */}
      {trades.filter(t => t.status === 'open').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Open Trades</CardTitle>
            <CardDescription>Your active positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trades.filter(t => t.status === 'open').map((trade) => (
                <Card key={trade.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewTrade(trade)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={trade.direction === 'long' ? 'default' : 'secondary'}>
                        {trade.direction.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{trade.instrument_type}</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{trade.symbol}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entry:</span>
                        <span className="font-medium">{formatCurrency(trade.entry_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{trade.position_size} {trade.position_size_currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Leverage:</span>
                        <span>{trade.leverage}x</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Click to view details</span>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleCloseTrade(trade); }}>
                          Close
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Closed Trades - Table View */}
      {trades.filter(t => t.status === 'closed').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Closed Trades</CardTitle>
            <CardDescription>Your completed trades for analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Symbol</th>
                    <th className="text-left p-2 font-medium">Direction</th>
                    <th className="text-left p-2 font-medium">Entry Price</th>
                    <th className="text-left p-2 font-medium">Exit Price</th>
                    <th className="text-left p-2 font-medium">P&L</th>
                    <th className="text-left p-2 font-medium">Status</th>
                    <th className="text-left p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.filter(t => t.status === 'closed').map((trade) => (
                    <tr key={trade.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{trade.symbol}</span>
                          <Badge variant="outline" className="text-xs">{trade.instrument_type}</Badge>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant={trade.direction === 'long' ? 'default' : 'secondary'}>
                          {trade.direction.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-2">{formatCurrency(trade.entry_price)}</td>
                      <td className="p-2">{formatCurrency(trade.exit_price!)}</td>
                      <td className="p-2">
                        <div className={`font-medium ${safeNumber(trade.pnl_amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(safeNumber(trade.pnl_amount))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {safeNumber(trade.pnl_percentage).toFixed(2)}%
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant={trade.is_winning ? 'default' : 'destructive'}>
                          {trade.is_winning ? 'Win' : 'Loss'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewTrade(trade)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditTrade(trade)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteTrade(trade.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Trades Message */}
      {trades.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4" />
            <p>No trades recorded yet</p>
            <p className="text-sm">Start by creating your first trade</p>
          </CardContent>
        </Card>
      )}

      {/* Create Trade Dialog */}
      <Dialog open={showTradeForm} onOpenChange={setShowTradeForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Trade</DialogTitle>
            <DialogDescription>Record a new trade with all the details</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol *</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value)}
                  placeholder="BTCUSD"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instrument_type">Instrument Type *</Label>
                <Select value={formData.instrument_type} onValueChange={(value) => handleInputChange('instrument_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="commodity">Commodity</SelectItem>
                    <SelectItem value="index">Index</SelectItem>
                    <SelectItem value="option">Option</SelectItem>
                    <SelectItem value="future">Future</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direction">Direction *</Label>
                <Select value={formData.direction} onValueChange={(value) => handleInputChange('direction', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry_price">Entry Price *</Label>
                <Input
                  id="entry_price"
                  type="number"
                  step="0.000001"
                  value={formData.entry_price}
                  onChange={(e) => handleInputChange('entry_price', e.target.value)}
                  placeholder="45000.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry_time">Entry Time *</Label>
                <Input
                  id="entry_time"
                  type="datetime-local"
                  value={formData.entry_time}
                  onChange={(e) => handleInputChange('entry_time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position_size">Position Size *</Label>
                <Input
                  id="position_size"
                  type="number"
                  step="0.000001"
                  value={formData.position_size}
                  onChange={(e) => handleInputChange('position_size', e.target.value)}
                  placeholder="100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leverage">Leverage</Label>
                <Input
                  id="leverage"
                  type="number"
                  step="0.01"
                  value={formData.leverage}
                  onChange={(e) => handleInputChange('leverage', e.target.value)}
                  placeholder="1.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry_reason">Entry Reason</Label>
              <Textarea
                id="entry_reason"
                value={formData.entry_reason}
                onChange={(e) => handleInputChange('entry_reason', e.target.value)}
                placeholder="Why are you entering this trade?"
                rows={3}
              />
            </div>



            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowTradeForm(false)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Trade'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Close Trade Dialog */}
      <Dialog open={showCloseTradeForm} onOpenChange={setShowCloseTradeForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Close Trade</DialogTitle>
            <DialogDescription>
              Record exit details and analyze your trade performance
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrade && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Trade Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Symbol:</span> {selectedTrade.symbol}
                </div>
                <div>
                  <span className="text-muted-foreground">Direction:</span> {selectedTrade.direction}
                </div>
                <div>
                  <span className="text-muted-foreground">Entry Price:</span> {formatCurrency(selectedTrade.entry_price)}
                </div>
                <div>
                  <span className="text-muted-foreground">Position Size:</span> {selectedTrade.position_size} {selectedTrade.position_size_currency}
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleCloseTradeSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exit_price">Exit Price *</Label>
                <Input
                  id="exit_price"
                  type="number"
                  step="0.000001"
                  value={closeFormData.exit_price}
                  onChange={(e) => setCloseFormData(prev => ({ ...prev, exit_price: e.target.value }))}
                  placeholder="45000.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exit_time">Exit Time *</Label>
                <Input
                  id="exit_time"
                  type="datetime-local"
                  value={closeFormData.exit_time}
                  onChange={(e) => setCloseFormData(prev => ({ ...prev, exit_time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pnl_amount">P&L Amount</Label>
                <Input
                  id="pnl_amount"
                  type="number"
                  step="0.01"
                  value={closeFormData.pnl_amount}
                  onChange={(e) => setCloseFormData(prev => ({ ...prev, pnl_amount: e.target.value }))}
                  placeholder="150.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pnl_percentage">P&L Percentage</Label>
                <Input
                  id="pnl_percentage"
                  type="number"
                  step="0.01"
                  value={closeFormData.pnl_percentage}
                  onChange={(e) => setCloseFormData(prev => ({ ...prev, pnl_percentage: e.target.value }))}
                  placeholder="3.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exit_reason">Exit Reason</Label>
              <Textarea
                id="exit_reason"
                value={closeFormData.exit_reason}
                onChange={(e) => setCloseFormData(prev => ({ ...prev, exit_reason: e.target.value }))}
                placeholder="Why are you exiting this trade?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessons_learned">Lessons Learned</Label>
              <Textarea
                id="lessons_learned"
                value={closeFormData.lessons_learned}
                onChange={(e) => setCloseFormData(prev => ({ ...prev, lessons_learned: e.target.value }))}
                placeholder="What did you learn from this trade?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_time_actions">Next Time Actions</Label>
              <Textarea
                id="next_time_actions"
                value={closeFormData.next_time_actions}
                onChange={(e) => setCloseFormData(prev => ({ ...prev, next_time_actions: e.target.value }))}
                placeholder="What will you do differently next time?"
                rows={2}
              />
            </div>



            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowCloseTradeForm(false)
                setSelectedTrade(null)
                resetCloseForm()
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Closing...' : 'Close Trade'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Trade View Modal */}
      <Dialog open={showTradeViewModal} onOpenChange={setShowTradeViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trade Details</DialogTitle>
            <DialogDescription>Complete information about this trade</DialogDescription>
          </DialogHeader>
          
          {selectedTradeForView && (
            <div className="space-y-6">
              {/* Trade Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant={selectedTradeForView.direction === 'long' ? 'default' : 'secondary'}>
                    {selectedTradeForView.direction.toUpperCase()}
                  </Badge>
                  <h3 className="text-xl font-bold">{selectedTradeForView.symbol}</h3>
                  <Badge variant="outline">{selectedTradeForView.instrument_type}</Badge>
                  <Badge variant={selectedTradeForView.status === 'open' ? 'default' : 'secondary'}>
                    {selectedTradeForView.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditTrade(selectedTradeForView)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {selectedTradeForView.status === 'open' && (
                    <Button variant="outline" size="sm" onClick={() => handleCloseTrade(selectedTradeForView)}>
                      Close Trade
                    </Button>
                  )}
                </div>
              </div>

              {/* Trade Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Entry Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Entry Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry Price:</span>
                      <span className="font-medium">{formatCurrency(selectedTradeForView.entry_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry Time:</span>
                      <span className="font-medium">{formatDate(selectedTradeForView.entry_time)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Position Size:</span>
                      <span className="font-medium">{selectedTradeForView.position_size} {selectedTradeForView.position_size_currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Leverage:</span>
                      <span className="font-medium">{selectedTradeForView.leverage}x</span>
                    </div>
                    {selectedTradeForView.entry_reason && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entry Reason:</span>
                        <span className="font-medium">{selectedTradeForView.entry_reason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Exit Details (if closed) */}
                {selectedTradeForView.status === 'closed' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Exit Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exit Price:</span>
                        <span className="font-medium">{formatCurrency(selectedTradeForView.exit_price!)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exit Time:</span>
                        <span className="font-medium">{formatDate(selectedTradeForView.exit_time!)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">P&L Amount:</span>
                        <span className={`font-medium ${safeNumber(selectedTradeForView.pnl_amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(safeNumber(selectedTradeForView.pnl_amount))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">P&L Percentage:</span>
                        <span className={`font-medium ${safeNumber(selectedTradeForView.pnl_percentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {safeNumber(selectedTradeForView.pnl_percentage).toFixed(2)}%
                        </span>
                      </div>
                      {selectedTradeForView.exit_reason && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Exit Reason:</span>
                          <span className="font-medium">{selectedTradeForView.exit_reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedTradeForView.notes && (
                    <div>
                      <h5 className="font-medium mb-2">Notes</h5>
                      <p className="text-sm text-gray-600">{selectedTradeForView.notes}</p>
                    </div>
                  )}
                  {selectedTradeForView.lessons_learned && (
                    <div>
                      <h5 className="font-medium mb-2">Lessons Learned</h5>
                      <p className="text-sm text-gray-600">{selectedTradeForView.lessons_learned}</p>
                    </div>
                  )}
                  {selectedTradeForView.next_time_actions && (
                    <div>
                      <h5 className="font-medium mb-2">Next Time Actions</h5>
                      <p className="text-sm text-gray-600">{selectedTradeForView.next_time_actions}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Screenshots */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg">Screenshots</h4>
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      id="add-screenshots"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        if (files.length > 0) {
                          addScreenshotsToTrade(selectedTradeForView.id, files, selectedTradeForView.status === 'closed' ? 'exit' : 'entry')
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('add-screenshots')?.click()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Screenshots
                    </Button>
                  </div>
                </div>
                
                {selectedTradeForView?.screenshots && selectedTradeForView.screenshots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedTradeForView.screenshots.map((screenshot) => (
                      <div key={screenshot.id} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                        <img 
                          src={screenshot.file_url} 
                          alt={`Trade screenshot - ${screenshot.original_name}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', screenshot.file_url)
                            e.currentTarget.src = '/placeholder-image.svg'
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => removeScreenshotFromTrade(selectedTradeForView.id, screenshot.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="text-xs">
                            {screenshot.screenshot_type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">
                      <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>No screenshots uploaded for this trade</p>
                      <p className="text-sm">Click "Add Screenshots" to upload images</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Trade Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trade</DialogTitle>
            <DialogDescription>Update trade information</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_symbol">Symbol *</Label>
                <Input
                  id="edit_symbol"
                  value={editFormData.symbol || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, symbol: e.target.value }))}
                  placeholder="BTCUSD"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_instrument_type">Instrument Type *</Label>
                <Select value={editFormData.instrument_type || ''} onValueChange={(value) => setEditFormData(prev => ({ ...prev, instrument_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="commodity">Commodity</SelectItem>
                    <SelectItem value="index">Index</SelectItem>
                    <SelectItem value="option">Option</SelectItem>
                    <SelectItem value="future">Future</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_direction">Direction *</Label>
                <Select value={editFormData.direction || ''} onValueChange={(value) => setEditFormData(prev => ({ ...prev, direction: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_entry_price">Entry Price *</Label>
                <Input
                  id="edit_entry_price"
                  type="number"
                  step="0.000001"
                  value={editFormData.entry_price || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, entry_price: e.target.value }))}
                  placeholder="45000.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_entry_time">Entry Time *</Label>
                <Input
                  id="edit_entry_time"
                  type="datetime-local"
                  value={editFormData.entry_time || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, entry_time: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_position_size">Position Size *</Label>
                <Input
                  id="edit_position_size"
                  type="number"
                  step="0.000001"
                  value={editFormData.position_size || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, position_size: e.target.value }))}
                  placeholder="100"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_leverage">Leverage</Label>
                <Input
                  id="edit_leverage"
                  type="number"
                  step="0.01"
                  value={editFormData.leverage || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, leverage: e.target.value }))}
                  placeholder="1.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_entry_reason">Entry Reason</Label>
              <Textarea
                id="edit_entry_reason"
                value={editFormData.entry_reason || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, entry_reason: e.target.value }))}
                placeholder="Why are you entering this trade?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                value={editFormData.notes || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this trade"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowEditModal(false)
                setSelectedTrade(null)
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Trade'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
