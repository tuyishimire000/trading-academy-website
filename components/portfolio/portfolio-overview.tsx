"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Coins, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  BarChart3,
  DollarSign,
  Hash
} from "lucide-react"

interface PortfolioOverviewProps {
  data: {
    assets: any[]
    nfts: any[]
    transactions: any[]
    address: string
    balance: string
  }
}

export default function PortfolioOverview({ data }: PortfolioOverviewProps) {
  const { assets, nfts, transactions, balance } = data

  // Calculate metrics
  const totalTokens = assets.length
  const totalNFTs = nfts.length
  const totalTransactions = transactions.length
  const ethBalance = parseFloat(balance || '0')
  
  // Calculate total token value (simplified - in real app you'd fetch prices)
  const totalTokenValue = assets.reduce((sum, token) => {
    const balance = parseFloat(token.tokenBalance || '0')
    const decimals = token.decimals || 18
    return sum + (balance / Math.pow(10, decimals))
  }, 0)

  // Get recent transactions
  const recentTransactions = transactions.slice(0, 5)

  // Get top tokens by balance
  const topTokens = assets
    .sort((a, b) => parseFloat(b.tokenBalance || '0') - parseFloat(a.tokenBalance || '0'))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ETH Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ethBalance.toFixed(4)} ETH</div>
            <p className="text-xs text-muted-foreground">
              ≈ ${(ethBalance * 2000).toFixed(2)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTokens}</div>
            <p className="text-xs text-muted-foreground">
              ERC-20 tokens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NFTs Owned</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNFTs}</div>
            <p className="text-xs text-muted-foreground">
              Unique NFTs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tokens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Top Tokens</span>
            </CardTitle>
            <CardDescription>
              Your highest balance tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTokens.length > 0 ? (
                topTokens.map((token, index) => {
                  const balance = parseFloat(token.tokenBalance || '0')
                  const decimals = token.decimals || 18
                  const formattedBalance = (balance / Math.pow(10, decimals)).toFixed(4)
                  
                  return (
                    <div key={token.contractAddress} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {token.symbol?.slice(0, 2) || 'TK'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{token.symbol || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">
                            {token.contractAddress?.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formattedBalance}</p>
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No tokens found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Hash className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {tx.category === 'external' ? 'Transfer' : tx.category}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.blockNum).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {tx.value ? `${parseFloat(tx.value).toFixed(4)} ETH` : 'N/A'}
                      </p>
                      <Badge 
                        variant={tx.category === 'external' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {tx.category}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No recent transactions
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Portfolio Summary</span>
          </CardTitle>
          <CardDescription>
            Overview of your crypto holdings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Asset Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>ETH</span>
                  <span>{ethBalance.toFixed(4)}</span>
                </div>
                <Progress value={ethBalance > 0 ? 100 : 0} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Tokens</span>
                  <span>{totalTokens}</span>
                </div>
                <Progress value={totalTokens > 0 ? 100 : 0} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>NFTs</span>
                  <span>{totalNFTs}</span>
                </div>
                <Progress value={totalNFTs > 0 ? 100 : 0} className="h-2" />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Activity Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Transactions:</span>
                  <span className="font-medium">{totalTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unique Tokens:</span>
                  <span className="font-medium">{totalTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span>NFT Collections:</span>
                  <span className="font-medium">
                    {new Set(nfts.map(nft => nft.contract.address)).size}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <p className="text-sm font-medium">View on Etherscan</p>
                  <p className="text-xs text-gray-600">Check full transaction history</p>
                </button>
                <button className="w-full text-left p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                  <p className="text-sm font-medium">Export Data</p>
                  <p className="text-xs text-gray-600">Download portfolio report</p>
                </button>
                <button className="w-full text-left p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                  <p className="text-sm font-medium">Set Alerts</p>
                  <p className="text-xs text-gray-600">Configure price notifications</p>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
