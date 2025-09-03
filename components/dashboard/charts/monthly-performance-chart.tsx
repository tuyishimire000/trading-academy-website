'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/lib/contexts/theme-context'

interface Trade {
  id: number
  entry_time: string
  exit_time?: string
  pnl_amount?: number
  is_winning?: boolean
  status: 'open' | 'closed' | 'cancelled'
}

interface MonthlyPerformanceChartProps {
  trades: Trade[]
}

export function MonthlyPerformanceChart({ trades }: MonthlyPerformanceChartProps) {
  const { theme } = useTheme()
  
  // Process trades data for the chart
  const chartData = React.useMemo(() => {
    if (!trades || trades.length === 0) return []
    
    // Filter only closed trades
    const closedTrades = trades.filter(t => t.status === 'closed')
    
    if (closedTrades.length === 0) return []
    
    // Group trades by month
    const monthlyData = closedTrades.reduce((acc, trade) => {
      const date = new Date(trade.exit_time!)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          monthName: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          totalPnl: 0,
          winRate: 0
        }
      }
      
      acc[monthKey].totalTrades++
      if (trade.is_winning) {
        acc[monthKey].winningTrades++
      } else {
        acc[monthKey].losingTrades++
      }
      acc[monthKey].totalPnl += parseFloat(trade.pnl_amount?.toString() || '0')
      
      return acc
    }, {} as Record<string, any>)
    
    // Calculate win rate for each month
    Object.values(monthlyData).forEach((month: any) => {
      month.winRate = month.totalTrades > 0 ? (month.winningTrades / month.totalTrades) * 100 : 0
    })
    
    // Sort by month
    return Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month))
  }, [trades])
  
  if (chartData.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No closed trades to display monthly performance</p>
            <p className="text-sm">Complete some trades to see your monthly trends</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* P&L by Month */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly P&L</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
                />
                                 <XAxis 
                   dataKey="monthName" 
                   stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                   fontSize={11}
                   angle={-45}
                   textAnchor="end"
                   height={80}
                   tick={{ fontSize: 10 }}
                 />
                 <YAxis 
                   stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                   fontSize={11}
                   tickFormatter={(value) => `$${value.toLocaleString()}`}
                   tick={{ fontSize: 10 }}
                 />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                  }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'P&L']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar 
                  dataKey="totalPnl" 
                  fill={theme === 'dark' ? '#10b981' : '#059669'}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Win Rate by Month */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Win Rate</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
                />
                                 <XAxis 
                   dataKey="monthName" 
                   stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                   fontSize={11}
                   angle={-45}
                   textAnchor="end"
                   height={80}
                   tick={{ fontSize: 10 }}
                 />
                 <YAxis 
                   stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                   fontSize={11}
                   domain={[0, 100]}
                   tickFormatter={(value) => `${value}%`}
                   tick={{ fontSize: 10 }}
                 />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                  }}
                  formatter={(value: any) => [`${value.toFixed(1)}%`, 'Win Rate']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="winRate"
                  stroke={theme === 'dark' ? '#3b82f6' : '#2563eb'}
                  strokeWidth={3}
                  dot={{ fill: theme === 'dark' ? '#3b82f6' : '#2563eb', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: theme === 'dark' ? '#3b82f6' : '#2563eb', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Monthly Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chartData.slice(-3).map((month: any, index) => (
              <div key={month.month} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">{month.monthName}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${month.totalPnl.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {month.totalTrades} trades • {month.winRate.toFixed(1)}% win rate
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
