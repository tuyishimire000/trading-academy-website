"use client"

import { useState } from "react"
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
  DollarSign, 
  Target, 
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Coins,
  Building2,
  Globe,
  Package,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar
} from "lucide-react"

const portfolioTypes = {
  crypto: { 
    name: 'Cryptocurrency', 
    icon: Coins, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    value: 45000, 
    pnl: 3000,
    cost: 42000,
    dailyChange: 1200,
    dailyChangePercentage: 2.73,
    positions: [
      { symbol: 'BTC', quantity: 0.5, avgPrice: 80000, currentPrice: 85000, marketValue: 42500, profitLoss: 2500, profitLossPercentage: 6.25 },
      { symbol: 'ETH', quantity: 2.5, avgPrice: 3000, currentPrice: 3200, marketValue: 8000, profitLoss: 500, profitLossPercentage: 6.67 },
      { symbol: 'ADA', quantity: 5000, avgPrice: 0.4, currentPrice: 0.42, marketValue: 2100, profitLoss: 100, profitLossPercentage: 5.0 }
    ],
    trades: [
      { id: '1', symbol: 'BTC', type: 'buy', quantity: 0.2, price: 82000, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), profitLoss: 600, status: 'closed' },
      { id: '2', symbol: 'ETH', type: 'sell', quantity: 1.0, price: 3100, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), profitLoss: 100, status: 'closed' }
    ],
    performanceHistory: [
      { date: '2024-01-01', value: 42000, change: 0 },
      { date: '2024-01-02', value: 42500, change: 1.19 },
      { date: '2024-01-03', value: 41800, change: -1.65 },
      { date: '2024-01-04', value: 43200, change: 3.35 },
      { date: '2024-01-05', value: 43800, change: 1.39 },
      { date: '2024-01-06', value: 45000, change: 2.73 }
    ]
  },
  stocks: { 
    name: 'Stocks', 
    icon: Building2, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    value: 125000, 
    pnl: 5000,
    cost: 120000,
    dailyChange: 1250,
    dailyChangePercentage: 1.01,
    positions: [
      { symbol: 'AAPL', quantity: 50, avgPrice: 150, currentPrice: 165, marketValue: 8250, profitLoss: 750, profitLossPercentage: 10.0 },
      { symbol: 'TSLA', quantity: 30, avgPrice: 200, currentPrice: 185, marketValue: 5550, profitLoss: -450, profitLossPercentage: -7.5 },
      { symbol: 'NVDA', quantity: 25, avgPrice: 300, currentPrice: 350, marketValue: 8750, profitLoss: 1250, profitLossPercentage: 16.67 },
      { symbol: 'MSFT', quantity: 40, avgPrice: 280, currentPrice: 295, marketValue: 11800, profitLoss: 600, profitLossPercentage: 5.36 }
    ],
    trades: [
      { id: '3', symbol: 'AAPL', type: 'buy', quantity: 20, price: 155, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), profitLoss: 200, status: 'closed' },
      { id: '4', symbol: 'TSLA', type: 'sell', quantity: 10, price: 190, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), profitLoss: -100, status: 'closed' }
    ],
    performanceHistory: [
      { date: '2024-01-01', value: 120000, change: 0 },
      { date: '2024-01-02', value: 121500, change: 1.25 },
      { date: '2024-01-03', value: 119800, change: -1.40 },
      { date: '2024-01-04', value: 122300, change: 2.08 },
      { date: '2024-01-05', value: 123750, change: 1.18 },
      { date: '2024-01-06', value: 125000, change: 1.01 }
    ]
  },
  forex: { 
    name: 'Forex', 
    icon: Globe, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    value: 35000, 
    pnl: 1000,
    cost: 34000,
    dailyChange: 350,
    dailyChangePercentage: 1.01,
    positions: [
      { symbol: 'EUR/USD', quantity: 25000, avgPrice: 1.0850, currentPrice: 1.0920, marketValue: 27300, profitLoss: 175, profitLossPercentage: 0.64 },
      { symbol: 'GBP/USD', quantity: 15000, avgPrice: 1.2650, currentPrice: 1.2720, marketValue: 19080, profitLoss: 105, profitLossPercentage: 0.55 },
      { symbol: 'USD/JPY', quantity: 20000, avgPrice: 110.50, currentPrice: 110.80, marketValue: 18160, profitLoss: 54, profitLossPercentage: 0.30 }
    ],
    trades: [
      { id: '5', symbol: 'EUR/USD', type: 'buy', quantity: 10000, price: 1.0800, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), profitLoss: 120, status: 'closed' }
    ],
    performanceHistory: [
      { date: '2024-01-01', value: 34000, change: 0 },
      { date: '2024-01-02', value: 34100, change: 0.29 },
      { date: '2024-01-03', value: 33950, change: -0.44 },
      { date: '2024-01-04', value: 34200, change: 0.74 },
      { date: '2024-01-05', value: 34650, change: 1.32 },
      { date: '2024-01-06', value: 35000, change: 1.01 }
    ]
  },
  commodities: { 
    name: 'Commodities', 
    icon: Package, 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    value: 28000, 
    pnl: 500,
    cost: 27500,
    dailyChange: 280,
    dailyChangePercentage: 1.01,
    positions: [
      { symbol: 'GOLD', quantity: 15, avgPrice: 1800, currentPrice: 1820, marketValue: 27300, profitLoss: 300, profitLossPercentage: 1.11 },
      { symbol: 'SILVER', quantity: 500, avgPrice: 22.5, currentPrice: 22.8, marketValue: 11400, profitLoss: 150, profitLossPercentage: 1.33 },
      { symbol: 'OIL', quantity: 100, avgPrice: 75.0, currentPrice: 76.5, marketValue: 7650, profitLoss: 150, profitLossPercentage: 2.0 }
    ],
    trades: [
      { id: '6', symbol: 'GOLD', type: 'buy', quantity: 5, price: 1790, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), profitLoss: 150, status: 'closed' }
    ],
    performanceHistory: [
      { date: '2024-01-01', value: 27500, change: 0 },
      { date: '2024-01-02', value: 27600, change: 0.36 },
      { date: '2024-01-03', value: 27450, change: -0.54 },
      { date: '2024-01-04', value: 27700, change: 0.91 },
      { date: '2024-01-05', value: 27720, change: 0.07 },
      { date: '2024-01-06', value: 28000, change: 1.01 }
    ]
  },
  futures: { 
    name: 'Futures', 
    icon: Clock, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    value: 15000, 
    pnl: 200,
    cost: 14800,
    dailyChange: 150,
    dailyChangePercentage: 1.01,
    positions: [
      { symbol: 'ES', quantity: 2, avgPrice: 4500, currentPrice: 4520, marketValue: 9040, profitLoss: 40, profitLossPercentage: 0.44 },
      { symbol: 'NQ', quantity: 1, avgPrice: 15000, currentPrice: 15100, marketValue: 15100, profitLoss: 100, profitLossPercentage: 0.67 },
      { symbol: 'YM', quantity: 3, avgPrice: 35000, currentPrice: 35200, marketValue: 105600, profitLoss: 600, profitLossPercentage: 0.57 }
    ],
    trades: [
      { id: '7', symbol: 'ES', type: 'sell', quantity: 1, price: 4480, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), profitLoss: 40, status: 'closed' }
    ],
    performanceHistory: [
      { date: '2024-01-01', value: 14800, change: 0 },
      { date: '2024-01-02', value: 14850, change: 0.34 },
      { date: '2024-01-03', value: 14780, change: -0.47 },
      { date: '2024-01-04', value: 14900, change: 0.81 },
      { date: '2024-01-05', value: 14850, change: -0.34 },
      { date: '2024-01-06', value: 15000, change: 1.01 }
    ]
  }
}

export function PortfolioTracker() {
  const [activeType, setActiveType] = useState('crypto')
  const [showValues, setShowValues] = useState(true)
  const [timeframe, setTimeframe] = useState('1M')

  const current = portfolioTypes[activeType as keyof typeof portfolioTypes]
  const Icon = current.icon

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

  const pieChartData = current.positions.map(pos => ({
    name: pos.symbol,
    value: pos.marketValue
  }))

  return (
    <div className="space-y-6">
      <Tabs value={activeType} onValueChange={setActiveType} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(portfolioTypes).map(([key, config]) => {
            const Icon = config.icon
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {config.name}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {Object.entries(portfolioTypes).map(([key, config]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            {/* Portfolio Type Header */}
            <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
              <div className="flex items-center gap-3">
                <Icon className={`h-6 w-6 ${config.color}`} />
                <div>
                  <h2 className="text-xl font-semibold">{config.name} Portfolio</h2>
                  <p className="text-sm text-gray-600">Track your {config.name.toLowerCase()} investments and performance</p>
                </div>
              </div>
            </div>

            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold">
                        {showValues ? formatCurrency(config.value) : '****'}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 ${getProfitLossColor(config.dailyChangePercentage)}`}>
                      {getProfitLossIcon(config.dailyChangePercentage)}
                      <span className="text-sm font-medium">
                        {formatPercentage(config.dailyChangePercentage)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Daily change: {showValues ? formatCurrency(config.dailyChange) : '****'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total P&L</p>
                      <p className={`text-2xl font-bold ${getProfitLossColor(config.pnl)}`}>
                        {showValues ? formatCurrency(config.pnl) : '****'}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatPercentage(((config.pnl / config.cost) * 100))} return
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Cost</p>
                      <p className="text-2xl font-bold">
                        {showValues ? formatCurrency(config.cost) : '****'}
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
                      <p className="text-2xl font-bold">{config.positions.length}</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {config.trades.filter(t => t.status === 'open').length} open trades
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
              <Button variant="outline" size="sm" onClick={() => setShowValues(!showValues)}>
                {showValues ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showValues ? 'Hide Values' : 'Show Values'}
              </Button>
            </div>

            {/* Portfolio Details Tabs */}
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
                      <CardTitle>{config.name} Performance</CardTitle>
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
                      <LineChart data={config.performanceHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={config.color.replace('text-', '')} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Asset Allocation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5" />
                        Asset Allocation
                      </CardTitle>
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
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
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
                        {config.positions
                          .sort((a, b) => b.profitLossPercentage - a.profitLossPercentage)
                          .slice(0, 5)
                          .map((position) => (
                            <div key={position.symbol} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{position.symbol}</p>
                                <p className="text-sm text-gray-500">
                                  {showValues ? formatCurrency(position.marketValue) : '****'}
                                </p>
                              </div>
                              <div className={`text-right ${getProfitLossColor(position.profitLossPercentage)}`}>
                                <p className="font-medium">{formatPercentage(position.profitLossPercentage)}</p>
                                <p className="text-sm">
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

              <TabsContent value="positions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Positions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {config.positions.map((position) => (
                        <div key={position.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="font-bold text-lg">{position.symbol}</span>
                            </div>
                            <div>
                              <p className="font-medium">{position.symbol}</p>
                              <p className="text-sm text-gray-500">
                                {position.quantity} units @ {showValues ? formatCurrency(position.avgPrice) : '****'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {showValues ? formatCurrency(position.marketValue) : '****'}
                            </p>
                            <p className={`text-sm ${getProfitLossColor(position.profitLossPercentage)}`}>
                              {formatPercentage(position.profitLossPercentage)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trades" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Trade History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {config.trades.length > 0 ? (
                        config.trades.map((trade) => (
                          <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                                {trade.type.toUpperCase()}
                              </Badge>
                              <div>
                                <p className="font-medium">{trade.symbol}</p>
                                <p className="text-sm text-gray-500">
                                  {trade.quantity} units @ {showValues ? formatCurrency(trade.price) : '****'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {trade.timestamp.toLocaleDateString()}
                              </p>
                              {trade.profitLoss && (
                                <p className={`text-sm ${getProfitLossColor(trade.profitLoss)}`}>
                                  {showValues ? formatCurrency(trade.profitLoss) : '****'}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No trades found for this portfolio type
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Return</span>
                          <span className={getProfitLossColor(((config.pnl / config.cost) * 100))}>
                            {formatPercentage(((config.pnl / config.cost) * 100))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Daily Change</span>
                          <span className={getProfitLossColor(config.dailyChangePercentage)}>
                            {formatPercentage(config.dailyChangePercentage)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Win Rate</span>
                          <span>65.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Hold Time</span>
                          <span>45 days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Sharpe Ratio</span>
                          <span>1.24</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Drawdown</span>
                          <span className="text-red-600">-8.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volatility</span>
                          <span>12.3%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Beta</span>
                          <span>0.85</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Monthly Returns Chart */}
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
                        <Bar dataKey="return" fill={config.color.replace('text-', '')} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
