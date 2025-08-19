"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff
} from "lucide-react"

interface Trade {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  quantity: number
  price: number
  timestamp: Date
  profitLoss?: number
  status: 'open' | 'closed'
}

interface PortfolioData {
  totalValue: number
  totalCost: number
  totalProfitLoss: number
  profitLossPercentage: number
  dailyChange: number
  dailyChangePercentage: number
  positions: Position[]
  trades: Trade[]
  performanceHistory: PerformancePoint[]
}

interface Position {
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice: number
  marketValue: number
  profitLoss: number
  profitLossPercentage: number
}

interface PerformancePoint {
  date: string
  value: number
  change: number
}

export function PortfolioTracker() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalValue: 125000,
    totalCost: 120000,
    totalProfitLoss: 5000,
    profitLossPercentage: 4.17,
    dailyChange: 1250,
    dailyChangePercentage: 1.01,
    positions: [
      {
        symbol: 'AAPL',
        quantity: 50,
        avgPrice: 150,
        currentPrice: 165,
        marketValue: 8250,
        profitLoss: 750,
        profitLossPercentage: 10.0
      },
      {
        symbol: 'TSLA',
        quantity: 30,
        avgPrice: 200,
        currentPrice: 185,
        marketValue: 5550,
        profitLoss: -450,
        profitLossPercentage: -7.5
      },
      {
        symbol: 'NVDA',
        quantity: 25,
        avgPrice: 300,
        currentPrice: 350,
        marketValue: 8750,
        profitLoss: 1250,
        profitLossPercentage: 16.67
      }
    ],
    trades: [
      {
        id: '1',
        symbol: 'AAPL',
        type: 'buy',
        quantity: 20,
        price: 155,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        profitLoss: 200,
        status: 'closed'
      },
      {
        id: '2',
        symbol: 'TSLA',
        type: 'sell',
        quantity: 10,
        price: 190,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        profitLoss: -100,
        status: 'closed'
      }
    ],
    performanceHistory: [
      { date: '2024-01-01', value: 120000, change: 0 },
      { date: '2024-01-02', value: 121500, change: 1.25 },
      { date: '2024-01-03', value: 119800, change: -1.40 },
      { date: '2024-01-04', value: 122300, change: 2.08 },
      { date: '2024-01-05', value: 123750, change: 1.18 },
      { date: '2024-01-06', value: 125000, change: 1.01 }
    ]
  })

  const [showValues, setShowValues] = useState(true)
  const [timeframe, setTimeframe] = useState('1M')

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getProfitLossColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getProfitLossIcon = (value: number) => {
    return value >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />
  }

  const pieChartData = portfolioData.positions.map(pos => ({
    name: pos.symbol,
    value: pos.marketValue
  }))

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
                <p className="text-2xl font-bold">
                  {showValues ? formatCurrency(portfolioData.totalValue) : '****'}
                </p>
              </div>
              <div className={`flex items-center gap-1 ${getProfitLossColor(portfolioData.dailyChangePercentage)}`}>
                {getProfitLossIcon(portfolioData.dailyChangePercentage)}
                <span className="text-sm font-medium">
                  {formatPercentage(portfolioData.dailyChangePercentage)}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Daily change: {showValues ? formatCurrency(portfolioData.dailyChange) : '****'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total P&L</p>
                <p className={`text-2xl font-bold ${getProfitLossColor(portfolioData.totalProfitLoss)}`}>
                  {showValues ? formatCurrency(portfolioData.totalProfitLoss) : '****'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {formatPercentage(portfolioData.profitLossPercentage)} return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold">
                  {showValues ? formatCurrency(portfolioData.totalCost) : '****'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Average cost basis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Positions</p>
                <p className="text-2xl font-bold">{portfolioData.positions.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {portfolioData.trades.filter(t => t.status === 'open').length} open trades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Add Trade
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowValues(!showValues)}
        >
          {showValues ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showValues ? 'Hide Values' : 'Show Values'}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="trades">Trade History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Portfolio Performance</CardTitle>
                <div className="flex items-center gap-2">
                  {['1W', '1M', '3M', '6M', '1Y'].map((period) => (
                    <Button
                      key={period}
                      variant={timeframe === period ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeframe(period)}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={portfolioData.performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Asset Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioData.positions
                    .sort((a, b) => b.profitLossPercentage - a.profitLossPercentage)
                    .slice(0, 5)
                    .map((position) => (
                      <div key={position.symbol} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">{position.symbol}</span>
                          </div>
                          <div>
                            <p className="font-medium">{position.symbol}</p>
                            <p className="text-sm text-gray-500">
                              {position.quantity} shares @ {formatCurrency(position.avgPrice)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${getProfitLossColor(position.profitLossPercentage)}`}>
                            {formatPercentage(position.profitLossPercentage)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {showValues ? formatCurrency(position.profitLoss) : '****'}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Symbol</th>
                      <th className="text-left py-3 px-4">Quantity</th>
                      <th className="text-left py-3 px-4">Avg Price</th>
                      <th className="text-left py-3 px-4">Current Price</th>
                      <th className="text-left py-3 px-4">Market Value</th>
                      <th className="text-left py-3 px-4">P&L</th>
                      <th className="text-left py-3 px-4">P&L %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioData.positions.map((position) => (
                      <tr key={position.symbol} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{position.symbol}</td>
                        <td className="py-3 px-4">{position.quantity}</td>
                        <td className="py-3 px-4">{showValues ? formatCurrency(position.avgPrice) : '****'}</td>
                        <td className="py-3 px-4">{showValues ? formatCurrency(position.currentPrice) : '****'}</td>
                        <td className="py-3 px-4">{showValues ? formatCurrency(position.marketValue) : '****'}</td>
                        <td className={`py-3 px-4 font-medium ${getProfitLossColor(position.profitLoss)}`}>
                          {showValues ? formatCurrency(position.profitLoss) : '****'}
                        </td>
                        <td className={`py-3 px-4 ${getProfitLossColor(position.profitLossPercentage)}`}>
                          {formatPercentage(position.profitLossPercentage)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioData.trades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${trade.type === 'buy' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium">{trade.symbol}</p>
                        <p className="text-sm text-gray-500">
                          {trade.type.toUpperCase()} {trade.quantity} shares @ {formatCurrency(trade.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {trade.timestamp.toLocaleDateString()}
                      </p>
                      {trade.profitLoss !== undefined && (
                        <p className={`font-medium ${getProfitLossColor(trade.profitLoss)}`}>
                          {formatCurrency(trade.profitLoss)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { month: 'Jan', return: 4.2 },
                    { month: 'Feb', return: -1.8 },
                    { month: 'Mar', return: 2.5 },
                    { month: 'Apr', return: 3.1 },
                    { month: 'May', return: 1.7 },
                    { month: 'Jun', return: 2.9 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Return']} />
                    <Bar dataKey="return" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sharpe Ratio</span>
                    <span className="font-medium">1.45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Max Drawdown</span>
                    <span className="font-medium text-red-600">-8.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Volatility</span>
                    <span className="font-medium">12.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Beta</span>
                    <span className="font-medium">0.95</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
