"use client"

import { useState, useEffect } from "react"
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

export default function PortfolioContent() {
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crypto Portfolio</h1>
            <p className="text-gray-600">Connect your wallet to view your crypto analytics</p>
          </div>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600 mb-6">
              Connect your wallet to view detailed analytics, token balances, NFTs, and transaction history.
            </p>
            <ConnectButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crypto Portfolio</h1>
          <p className="text-gray-600">Your wallet analytics and portfolio overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPortfolioData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <ConnectButton />
        </div>
      </div>

      {/* Wallet Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Connected Wallet</h3>
                <div className="flex items-center gap-2">
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
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openEtherscan}
                    className="h-6 w-6 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">ETH Balance</p>
              <p className="text-lg font-semibold">
                {balance ? `${parseFloat(balance.formatted).toFixed(4)} ETH` : 'Loading...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Tabs */}
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading charts...</span>
            </div>
          ) : portfolioData ? (
            <PortfolioCharts data={portfolioData} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Chart Data Available</h3>
                <p className="text-gray-600">Connect your wallet and refresh to view your portfolio charts.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading portfolio data...</span>
            </div>
          ) : portfolioData ? (
            <PortfolioOverview data={portfolioData} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-600">Connect your wallet and refresh to view your portfolio data.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading tokens...</span>
            </div>
          ) : portfolioData ? (
            <TokenList tokens={portfolioData.assets} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tokens Found</h3>
                <p className="text-gray-600">No ERC-20 tokens found in this wallet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="nfts" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading NFTs...</span>
            </div>
          ) : portfolioData ? (
            <NFTGallery nfts={portfolioData.nfts} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs Found</h3>
                <p className="text-gray-600">No NFTs found in this wallet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading transactions...</span>
            </div>
          ) : portfolioData ? (
            <TransactionHistory transactions={portfolioData.transactions} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                <p className="text-gray-600">No recent transactions found for this wallet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
