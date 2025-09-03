'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/lib/contexts/theme-context'

interface Trade {
  id: number
  entry_time: string
  exit_time?: string
  is_winning?: boolean
  status: 'open' | 'closed' | 'cancelled'
}

interface WinRateChartProps {
  trades: Trade[]
}

export function WinRateChart({ trades }: WinRateChartProps) {
  const { theme } = useTheme()
  
  // Process trades data for the chart
  const chartData = React.useMemo(() => {
    if (!trades || trades.length === 0) return []
    
    // Filter only closed trades
    const closedTrades = trades.filter(t => t.status === 'closed' && t.is_winning !== null)
    
    if (closedTrades.length === 0) return []
    
    // Sort by exit time
    const sortedTrades = closedTrades.sort((a, b) => 
      new Date(a.exit_time!).getTime() - new Date(b.exit_time!).getTime()
    )
    
    // Calculate running win rate
    let wins = 0
    let total = 0
    return sortedTrades.map((trade, index) => {
      total++
      if (trade.is_winning) wins++
      
      const winRate = (wins / total) * 100
      
      return {
        trade: index + 1,
        date: new Date(trade.exit_time!).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        winRate: Math.round(winRate * 100) / 100, // Round to 2 decimal places
        totalTrades: total,
        wins: wins
      }
    })
  }, [trades])
  
  if (chartData.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Win Rate Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No closed trades to calculate win rate</p>
            <p className="text-sm">Complete some trades to see your win rate progression</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const currentWinRate = chartData[chartData.length - 1]?.winRate || 0
  
  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Win Rate Trend</CardTitle>
      </CardHeader>
      <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
           <LineChart data={chartData}>
             <CartesianGrid 
               strokeDasharray="3 3" 
               stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
             />
             <XAxis 
               dataKey="trade" 
               stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
               fontSize={12}
               tick={{ fontSize: 11 }}
               label={{ 
                 value: 'Trade Number', 
                 position: 'insideBottom', 
                 offset: -10,
                 style: { 
                   textAnchor: 'middle',
                   fill: theme === 'dark' ? '#9ca3af' : '#6b7280',
                   fontSize: '11px'
                 }
               }}
             />
             <YAxis 
               stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
               fontSize={12}
               domain={[0, 100]}
               tickFormatter={(value) => `${value}%`}
               tick={{ fontSize: 11 }}
               label={{ 
                 value: 'Win Rate (%)', 
                 angle: -90, 
                 position: 'insideLeft',
                 style: { 
                   textAnchor: 'middle',
                   fill: theme === 'dark' ? '#9ca3af' : '#6b7280',
                   fontSize: '11px'
                 }
               }}
             />
             <Tooltip 
               contentStyle={{
                 backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                 border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                 borderRadius: '8px',
                 color: theme === 'dark' ? '#f9fafb' : '#111827',
                 fontSize: '12px'
               }}
               formatter={(value: any, name: string) => [
                 `${value}%`,
                 name === 'winRate' ? 'Win Rate' : name
               ]}
               labelFormatter={(label) => `Trade ${label}`}
             />
             <Line
               type="monotone"
               dataKey="winRate"
               stroke={theme === 'dark' ? '#10b981' : '#059669'}
               strokeWidth={3}
               dot={{ fill: theme === 'dark' ? '#10b981' : '#059669', strokeWidth: 2, r: 4 }}
               activeDot={{ r: 6, stroke: theme === 'dark' ? '#10b981' : '#059669', strokeWidth: 2 }}
             />
           </LineChart>
         </ResponsiveContainer>
        
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentWinRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Current Win Rate ({chartData[chartData.length - 1]?.wins || 0} wins out of {chartData[chartData.length - 1]?.totalTrades || 0} trades)
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
