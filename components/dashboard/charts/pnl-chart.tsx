'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/lib/contexts/theme-context'

interface Trade {
  id: number
  entry_time: string
  exit_time?: string
  pnl_amount?: number
  status: 'open' | 'closed' | 'cancelled'
}

interface PnLChartProps {
  trades: Trade[]
}

export function PnLChart({ trades }: PnLChartProps) {
  const { theme } = useTheme()
  
  // Process trades data for the chart
  const chartData = React.useMemo(() => {
    if (!trades || trades.length === 0) return []
    
    // Filter only closed trades with P&L
    const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl_amount !== null && t.exit_time)
    
    if (closedTrades.length === 0) return []
    
    // Sort by exit time
    const sortedTrades = closedTrades.sort((a, b) => 
      new Date(a.exit_time!).getTime() - new Date(b.exit_time!).getTime()
    )
    
    // Calculate cumulative P&L
    let cumulativePnl = 0
    return sortedTrades.map(trade => {
      cumulativePnl += parseFloat(trade.pnl_amount?.toString() || '0')
      return {
        date: new Date(trade.exit_time!).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        pnl: parseFloat(trade.pnl_amount?.toString() || '0'),
        cumulativePnl: cumulativePnl,
        tradeId: trade.id
      }
    })
  }, [trades])
  
  if (chartData.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">P&L Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No closed trades with P&L data</p>
            <p className="text-sm">Complete some trades to see your P&L progression</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const isPositive = chartData[chartData.length - 1]?.cumulativePnl >= 0
  
  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">P&L Over Time</CardTitle>
      </CardHeader>
      <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
           <AreaChart data={chartData}>
             <CartesianGrid 
               strokeDasharray="3 3" 
               stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
             />
             <XAxis 
               dataKey="date" 
               stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
               fontSize={12}
               tick={{ fontSize: 11 }}
             />
             <YAxis 
               stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
               fontSize={12}
               tickFormatter={(value) => `$${value.toLocaleString()}`}
               tick={{ fontSize: 11 }}
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
                 name === 'pnl' ? `$${value.toLocaleString()}` : `$${value.toLocaleString()}`,
                 name === 'pnl' ? 'Trade P&L' : 'Cumulative P&L'
               ]}
               labelFormatter={(label) => `Date: ${label}`}
             />
             <Area
               type="monotone"
               dataKey="cumulativePnl"
               stroke={isPositive ? '#10b981' : '#ef4444'}
               fill={isPositive ? '#10b981' : '#ef4444'}
               fillOpacity={0.1}
               strokeWidth={2}
             />
             <Line
               type="monotone"
               dataKey="pnl"
               stroke={theme === 'dark' ? '#60a5fa' : '#3b82f6'}
               strokeWidth={2}
               dot={{ fill: theme === 'dark' ? '#60a5fa' : '#3b82f6', strokeWidth: 2, r: 4 }}
             />
           </AreaChart>
         </ResponsiveContainer>
        
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {chartData.length > 0 ? `$${chartData[chartData.length - 1].cumulativePnl.toLocaleString()}` : '$0'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Cumulative P&L</div>
        </div>
      </CardContent>
    </Card>
  )
}
