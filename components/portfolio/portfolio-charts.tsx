"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Activity,
  Coins,
  Wallet,
  TrendingDown,
  Target,
  Zap,
  DollarSign
} from "lucide-react"

// Fallback data for portfolio value over time (last 30 days)
const portfolioValueData = [
  { date: '2024-01-01', value: 12500, change: 0 },
  { date: '2024-01-02', value: 12800, change: 2.4 },
  { date: '2024-01-03', value: 13100, change: 2.3 },
  { date: '2024-01-04', value: 12900, change: -1.5 },
  { date: '2024-01-05', value: 13200, change: 2.3 },
  { date: '2024-01-06', value: 13500, change: 2.3 },
  { date: '2024-01-07', value: 13800, change: 2.2 },
  { date: '2024-01-08', value: 14100, change: 2.2 },
  { date: '2024-01-09', value: 13900, change: -1.4 },
  { date: '2024-01-10', value: 14200, change: 2.2 },
  { date: '2024-01-11', value: 14500, change: 2.1 },
  { date: '2024-01-12', value: 14800, change: 2.1 },
  { date: '2024-01-13', value: 15100, change: 2.0 },
  { date: '2024-01-14', value: 15400, change: 2.0 },
  { date: '2024-01-15', value: 15700, change: 1.9 },
  { date: '2024-01-16', value: 16000, change: 1.9 },
  { date: '2024-01-17', value: 16300, change: 1.9 },
  { date: '2024-01-18', value: 16600, change: 1.8 },
  { date: '2024-01-19', value: 16900, change: 1.8 },
  { date: '2024-01-20', value: 17200, change: 1.8 },
  { date: '2024-01-21', value: 17500, change: 1.7 },
  { date: '2024-01-22', value: 17800, change: 1.7 },
  { date: '2024-01-23', value: 18100, change: 1.7 },
  { date: '2024-01-24', value: 18400, change: 1.7 },
  { date: '2024-01-25', value: 18700, change: 1.6 },
  { date: '2024-01-26', value: 19000, change: 1.6 },
  { date: '2024-01-27', value: 19300, change: 1.6 },
  { date: '2024-01-28', value: 19600, change: 1.6 },
  { date: '2024-01-29', value: 19900, change: 1.5 },
  { date: '2024-01-30', value: 20200, change: 1.5 }
]

// Fallback data for asset allocation
const assetAllocationData = [
  { name: 'Ethereum (ETH)', value: 8500, percentage: 42.5, color: '#627EEA' },
  { name: 'Bitcoin (BTC)', value: 6500, percentage: 32.5, color: '#F7931A' },
  { name: 'USDC', value: 2500, percentage: 12.5, color: '#2775CA' },
  { name: 'Uniswap (UNI)', value: 1500, percentage: 7.5, color: '#FF007A' },
  { name: 'Chainlink (LINK)', value: 1000, percentage: 5.0, color: '#2A5ADA' }
]

// Fallback data for token performance
const tokenPerformanceData = [
  { token: 'ETH', price: 3200, change: 5.2, volume: 1250000, marketCap: 385000000000 },
  { token: 'BTC', price: 65000, change: 3.8, volume: 2800000, marketCap: 1250000000000 },
  { token: 'USDC', price: 1.00, change: 0.0, volume: 850000, marketCap: 25000000000 },
  { token: 'UNI', price: 12.50, change: -2.1, volume: 450000, marketCap: 7500000000 },
  { token: 'LINK', price: 18.75, change: 7.5, volume: 320000, marketCap: 11000000000 }
]

// Fallback data for transaction volume
const transactionVolumeData = [
  { month: 'Jan', volume: 45000, transactions: 125 },
  { month: 'Feb', volume: 52000, transactions: 142 },
  { month: 'Mar', volume: 48000, transactions: 138 },
  { month: 'Apr', volume: 61000, transactions: 156 },
  { month: 'May', volume: 58000, transactions: 149 },
  { month: 'Jun', volume: 72000, transactions: 167 },
  { month: 'Jul', volume: 68000, transactions: 158 },
  { month: 'Aug', volume: 75000, transactions: 172 },
  { month: 'Sep', volume: 82000, transactions: 185 },
  { month: 'Oct', volume: 78000, transactions: 176 },
  { month: 'Nov', volume: 89000, transactions: 194 },
  { month: 'Dec', volume: 95000, transactions: 203 }
]

// Fallback data for risk metrics
const riskMetricsData = [
  { metric: 'Volatility', value: 0.15, target: 0.12, status: 'warning' },
  { metric: 'Sharpe Ratio', value: 1.85, target: 1.5, status: 'good' },
  { metric: 'Max Drawdown', value: -0.08, target: -0.10, status: 'good' },
  { metric: 'Beta', value: 0.92, target: 1.0, status: 'good' },
  { metric: 'Alpha', value: 0.045, target: 0.02, status: 'excellent' }
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

interface PortfolioChartsProps {
  data: {
    assets: any[]
    nfts: any[]
    transactions: any[]
    address: string
    balance: string
  }
}

export default function PortfolioCharts({ data }: PortfolioChartsProps) {
  const { assets, nfts, transactions, balance } = data
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate portfolio metrics
  const totalValue = portfolioValueData[portfolioValueData.length - 1]?.value || 0
  const totalChange = ((totalValue - 12500) / 12500) * 100
  const isPositive = totalChange >= 0

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{totalChange.toFixed(2)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">30d</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assets</p>
                <p className="text-2xl font-bold text-gray-900">{assetAllocationData.length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Coins className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Different tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">30d Volume</p>
                <p className="text-2xl font-bold text-gray-900">${(95000).toLocaleString()}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Transaction volume</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">7.2</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Low risk</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Portfolio Value Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Portfolio Value Over Time</span>
              </CardTitle>
              <CardDescription>
                Your portfolio value trend over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioValueData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Asset Allocation Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5" />
                  <span>Asset Allocation</span>
                </CardTitle>
                <CardDescription>
                  Distribution of your portfolio across different assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetAllocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {assetAllocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Top Performers</span>
                </CardTitle>
                <CardDescription>
                  Best performing assets in your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tokenPerformanceData.slice(0, 5).map((token, index) => (
                    <div key={token.token} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{token.token}</span>
                        </div>
                        <div>
                          <p className="font-medium">{token.token}</p>
                          <p className="text-sm text-gray-500">${token.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${token.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {token.change >= 0 ? '+' : ''}{token.change}%
                        </p>
                        <p className="text-sm text-gray-500">24h</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChartIcon className="h-5 w-5" />
                <span>Detailed Asset Allocation</span>
              </CardTitle>
              <CardDescription>
                Complete breakdown of your portfolio allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assetAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Token Performance</span>
              </CardTitle>
              <CardDescription>
                Performance comparison of your portfolio tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tokenPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="token" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value: any) => [`${value}%`, '24h Change']} />
                    <Bar dataKey="change" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Transaction Volume</span>
              </CardTitle>
              <CardDescription>
                Monthly transaction volume and count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transactionVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => value} />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'volume' ? `$${value.toLocaleString()}` : value,
                        name === 'volume' ? 'Volume' : 'Transactions'
                      ]}
                    />
                    <Bar yAxisId="left" dataKey="volume" fill="#8884d8" name="volume" />
                    <Bar yAxisId="right" dataKey="transactions" fill="#82ca9d" name="transactions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Risk Metrics</span>
              </CardTitle>
              <CardDescription>
                Key risk and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskMetricsData.map((metric) => (
                  <div key={metric.metric} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{metric.metric}</p>
                      <p className="text-sm text-gray-500">Target: {metric.target}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{metric.value}</p>
                      <Badge 
                        variant={metric.status === 'excellent' ? 'default' : 
                                metric.status === 'good' ? 'secondary' : 
                                metric.status === 'warning' ? 'destructive' : 'outline'}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
