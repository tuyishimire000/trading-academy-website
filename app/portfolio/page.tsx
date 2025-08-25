"use client"

import { useState, useEffect, Suspense } from "react"
import { useAccount, useBalance } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Wallet, 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import PortfolioOverview from "@/components/portfolio/portfolio-overview"
import TokenList from "@/components/portfolio/token-list"
import NFTGallery from "@/components/portfolio/nft-gallery"
import TransactionHistory from "@/components/portfolio/transaction-history"
import PortfolioCharts from "@/components/portfolio/portfolio-charts"
import { getUserAssets, getUserNFTs, getUserTransactions } from "@/lib/alchemy"

function PortfolioPageContent() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { toast } = useToast()
  
  const [portfolioData, setPortfolioData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      fetchPortfolioData()
    }
  }, [isConnected, address])

  const fetchPortfolioData = async () => {
    if (!address) return
    
    setLoading(true)
    try {
      const [assets, nfts, transactions] = await Promise.all([
        getUserAssets(address),
        getUserNFTs(address),
        getUserTransactions(address)
      ])

      setPortfolioData({
        assets: assets.tokenBalances || [],
        nfts: nfts.ownedNfts || [],
        transactions: transactions.transfers || [],
        address,
        balance: balance?.formatted || '0'
      })
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch portfolio data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = async () => {
    if (!address) return
    
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy address",
        variant: "destructive",
      })
    }
  }

  const openEtherscan = () => {
    if (!address) return
    window.open(`https://etherscan.io/address/${address}`, '_blank')
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Crypto Portfolio</h1>
            <p className="text-gray-600">Connect your wallet to view your crypto portfolio analytics</p>
          </div>
          
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Wallet className="h-6 w-6" />
                <span>Connect Wallet</span>
              </CardTitle>
              <CardDescription>
                Connect your wallet to access your portfolio data and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ConnectButton />
              <div className="mt-4 text-sm text-gray-500">
                <p>Supported wallets:</p>
                <p>MetaMask, WalletConnect, Coinbase Wallet, and more</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Crypto Portfolio</h1>
              <p className="text-gray-600">Your wallet analytics and portfolio overview</p>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectButton />
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPortfolioData}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Wallet Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="h-5 w-5" />
                <span>Connected Wallet</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyAddress}
                        className="h-6 w-6 p-0"
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">ETH Balance</p>
                    <p className="text-lg font-bold text-gray-900">
                      {balance?.formatted ? parseFloat(balance.formatted).toFixed(4) : '0.0000'} ETH
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={openEtherscan}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Etherscan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading portfolio data...</p>
            </div>
          </div>
        ) : portfolioData ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="tokens" className="flex items-center space-x-2">
                <Coins className="h-4 w-4" />
                <span>Tokens</span>
              </TabsTrigger>
              <TabsTrigger value="nfts" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>NFTs</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center space-x-2">
                <PieChart className="h-4 w-4" />
                <span>Charts</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <PortfolioOverview data={portfolioData} />
            </TabsContent>

            <TabsContent value="tokens" className="space-y-6">
              <TokenList tokens={portfolioData.assets} />
            </TabsContent>

            <TabsContent value="nfts" className="space-y-6">
              <NFTGallery nfts={portfolioData.nfts} />
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <TransactionHistory transactions={portfolioData.transactions} />
            </TabsContent>

            <TabsContent value="charts" className="space-y-6">
              <PortfolioCharts data={portfolioData} />
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Data</h3>
              <p className="text-gray-600 mb-4">
                Unable to fetch portfolio data. Please check your connection and try again.
              </p>
              <Button onClick={fetchPortfolioData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Portfolio...</h2>
        </div>
      </div>
    }>
      <PortfolioPageContent />
    </Suspense>
  )
}
