'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/lib/contexts/theme-context'

interface Trade {
  id: number
  symbol: string
  instrument_type: string
  direction: 'long' | 'short'
  status: 'open' | 'closed' | 'cancelled'
  is_winning?: boolean
}

interface TradeDistributionChartProps {
  trades: Trade[]
}

export function TradeDistributionChart({ trades }: TradeDistributionChartProps) {
  const { theme } = useTheme()
  
  // Process trades data for the chart
  const chartData = React.useMemo(() => {
    if (!trades || trades.length === 0) return []
    
    // Count trades by instrument type
    const instrumentTypeCount = trades.reduce((acc, trade) => {
      acc[trade.instrument_type] = (acc[trade.instrument_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Count trades by direction
    const directionCount = trades.reduce((acc, trade) => {
      acc[trade.direction] = (acc[trade.direction] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Count trades by status
    const statusCount = trades.reduce((acc, trade) => {
      acc[trade.status] = (acc[trade.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Count winning vs losing trades
    const closedTrades = trades.filter(t => t.status === 'closed')
    const winningCount = closedTrades.filter(t => t.is_winning).length
    const losingCount = closedTrades.filter(t => !t.is_winning).length
    
    return [
      {
        name: 'Instrument Types',
        data: Object.entries(instrumentTypeCount).map(([type, count]) => ({
          name: type.charAt(0).toUpperCase() + type.slice(1),
          value: count
        }))
      },
      {
        name: 'Trade Direction',
        data: Object.entries(directionCount).map(([direction, count]) => ({
          name: direction.charAt(0).toUpperCase() + direction.slice(1),
          value: count
        }))
      },
      {
        name: 'Trade Status',
        data: Object.entries(statusCount).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count
        }))
      },
      {
        name: 'Trade Results',
        data: [
          { name: 'Winning', value: winningCount },
          { name: 'Losing', value: losingCount }
        ].filter(item => item.value > 0)
      }
    ]
  }, [trades])
  
  if (trades.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Trade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No trades to display</p>
            <p className="text-sm">Start trading to see your distribution</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ]
  
  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Trade Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chartData.map((category, categoryIndex) => (
            <div key={category.name} className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">
                {category.name}
              </h3>
                             <ResponsiveContainer width="100%" height={200}>
                 <PieChart>
                   <Pie
                     data={category.data}
                     cx="50%"
                     cy="50%"
                     labelLine={true}
                     label={({ name, percent, value }) => {
                       const percentage = (percent * 100).toFixed(0)
                       return `${name}\n${percentage}% (${value})`
                     }}
                     outerRadius={50}
                     fill="#8884d8"
                     dataKey="value"
                     fontSize={10}
                     labelStyle={{
                       fontSize: '10px',
                       fontWeight: 'bold',
                       fill: theme === 'dark' ? '#f9fafb' : '#111827',
                       textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                     }}
                   >
                     {category.data.map((entry, index) => (
                       <Cell 
                         key={`cell-${index}`} 
                         fill={colors[index % colors.length]} 
                       />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{
                       backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                       border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                       borderRadius: '8px',
                       color: theme === 'dark' ? '#f9fafb' : '#111827'
                     }}
                     formatter={(value: any) => [value, 'Count']}
                   />
                 </PieChart>
               </ResponsiveContainer>
              
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total: {category.data.reduce((sum, item) => sum + item.value, 0)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {trades.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Trades</div>
        </div>
      </CardContent>
    </Card>
  )
}
