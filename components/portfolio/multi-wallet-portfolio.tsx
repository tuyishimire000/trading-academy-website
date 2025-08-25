"use client"

import { useState, useEffect } from "react"
import { useAccount, useBalance } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Wallet, 
  Coins, 
  Activity,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Copy,
  CheckCircle,
  Loader2,
  Plus,
  Trash2,
  Star
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import PortfolioOverview from "@/components/portfolio/portfolio-overview"
import TokenList from "@/components/portfolio/token-list"
import NFTGallery from "@/components/portfolio/nft-gallery"
import TransactionHistory from "@/components/portfolio/transaction-history"
import PortfolioCharts from "@/components/portfolio/portfolio-charts"
import { getUserAssets, getUserNFTs, getUserTransactions } from "@/lib/alchemy"

type UserWallet = {
  id: string
  wallet_address: string
  wallet_name: string
  is_primary: boolean
  connected_at: string
  last_used: string
}

type PortfolioData = {
  assets: any[]
  nfts: any[]
  transactions: any[]
  address: string
  balance: string
}

export default function Portfolio() {
  // Security: Wallet data is fetched fresh from database on each login
  // No localStorage caching to ensure user only sees their own wallet data
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { toast } = useToast()
  
  const [userWallets, setUserWallets] = useState<UserWallet[]>([])
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(false)
  const [walletsLoading, setWalletsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [walletToDelete, setWalletToDelete] = useState<UserWallet | null>(null)
  const [deletingWallet, setDeletingWallet] = useState(false)

  useEffect(() => {
    // Clear any cached portfolio data on mount for security
    // This ensures fresh data is fetched each time user logs in
    setPortfolioData(null)
    setSelectedWallet(null)
    setUserWallets([])
    
    // Fetch user's connected wallets from database
    fetchUserWallets()
  }, [])

  useEffect(() => {
    if (selectedWallet) {
      fetchPortfolioData(selectedWallet)
    }
  }, [selectedWallet])

  // Reset delete dialog when connection state changes
  useEffect(() => {
    if (!isConnected) {
      setShowDeleteConfirm(false)
      setWalletToDelete(null)
      setDeletingWallet(false)
    }
  }, [isConnected])

  const fetchUserWallets = async () => {
    setWalletsLoading(true)
    try {
      const response = await fetch("/api/user/wallets")
      const data = await response.json()
      
      if (response.ok) {
        const wallets = data.wallets || []
        setUserWallets(wallets)
        
        // Set the first wallet as selected if none is selected
        if (wallets.length > 0 && !selectedWallet) {
          setSelectedWallet(wallets[0].wallet_address)
        }
      } else {
        console.error("Failed to fetch wallets:", data.error)
        toast({
          title: "Error",
          description: "Failed to fetch your connected wallets",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching wallets:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your connected wallets",
        variant: "destructive",
      })
    } finally {
      setWalletsLoading(false)
    }
  }

  const fetchPortfolioData = async (walletAddress: string) => {
    if (!walletAddress) return
    
    setLoading(true)
    try {
      const [assets, nfts, transactions] = await Promise.all([
        getUserAssets(walletAddress),
        getUserNFTs(walletAddress),
        getUserTransactions(walletAddress)
      ])

      setPortfolioData({
        assets: assets.tokenBalances || [],
        nfts: nfts.ownedNfts || [],
        transactions: transactions.transfers || [],
        address: walletAddress,
        balance: '0' // We'll get balance from Alchemy data instead of current wallet
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

  const addWallet = async () => {
    if (!address) {
      toast({
        title: "No Wallet Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    // Check if wallet is already connected to this user's account
    const isAlreadyConnected = userWallets.some(wallet => 
      wallet.wallet_address.toLowerCase() === address.toLowerCase()
    )

    if (isAlreadyConnected) {
      toast({
        title: "Wallet Already Connected",
        description: "This wallet is already connected to your account.",
        variant: "destructive",
      })
      return
    }

    // Use a default name
    const walletName = `Wallet ${userWallets.length + 1}`

    try {
      const response = await fetch("/api/user/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
          wallet_name: walletName
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Wallet connected to your portfolio successfully",
        })
        // Refresh the wallet list to show the newly connected wallet
        fetchUserWallets()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to connect wallet",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding wallet:", error)
      toast({
        title: "Error",
        description: "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  const handleAddWalletClick = () => {
    // If wallet is connected, add it directly
    if (isConnected && address) {
      addWallet()
    } else {
      // If not connected, the ConnectButton will handle the connection
      // and then the user can click again to add the wallet
    }
  }

  const handleDeleteWallet = (wallet: UserWallet) => {
    setWalletToDelete(wallet)
    setShowDeleteConfirm(true)
  }

  const removeWallet = async () => {
    if (!walletToDelete || deletingWallet) return

    setDeletingWallet(true)
    try {
      const response = await fetch(`/api/user/wallets/${walletToDelete.id}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Wallet removed successfully",
        })
        setShowDeleteConfirm(false)
        setWalletToDelete(null)
        fetchUserWallets()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to remove wallet",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing wallet:", error)
      toast({
        title: "Error",
        description: "Failed to remove wallet",
        variant: "destructive",
      })
    } finally {
      setDeletingWallet(false)
    }
  }

  const copyAddress = async (address: string) => {
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

  const openEtherscan = (address: string) => {
    window.open(`https://etherscan.io/address/${address}`, '_blank')
  }

  // Simplified to single wallet for all users
  const canAddWallet = () => {
    return userWallets.length < 1
  }

  // Show connect wallet page for users without any connected wallets
  if (userWallets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
            <p className="text-gray-600">Connect your wallet to start tracking your portfolio</p>
          </div>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Wallet Connected</h3>
            <p className="text-gray-600 mb-6">
              Connect your wallet to add it to your portfolio and view detailed analytics, charts, and insights.
            </p>
            <div className="space-y-4">
              <ConnectButton />
              {isConnected && address && (
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 font-medium">Wallet Connected!</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Connected: {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                  <Button onClick={handleAddWalletClick} className="mx-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Portfolio
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600">Your connected wallet and portfolio analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUserWallets}
            disabled={walletsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${walletsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {canAddWallet() && (
            <div className="flex items-center gap-2">
              <ConnectButton />
              {isConnected && address && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleAddWalletClick}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Portfolio
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Wallet Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Connected Wallet</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                1/1 wallet
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {walletsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading wallets...</span>
            </div>
          ) : userWallets.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No wallets stored yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    selectedWallet === wallet.wallet_address
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{wallet.wallet_name}</h3>
                        {wallet.is_primary && (
                          <Badge variant="default" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {wallet.wallet_address.slice(0, 6)}...{wallet.wallet_address.slice(-4)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAddress(wallet.wallet_address)}
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
                          onClick={() => openEtherscan(wallet.wallet_address)}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWallet(wallet.wallet_address)}
                      disabled={selectedWallet === wallet.wallet_address}
                    >
                      {selectedWallet === wallet.wallet_address ? 'Selected' : 'Select'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWallet(wallet)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove wallet"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Wallet Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={(open) => {
        if (!open && !deletingWallet) {
          setShowDeleteConfirm(false)
          setWalletToDelete(null)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Wallet</DialogTitle>
            <DialogDescription>
              This is your only wallet. You'll need to add a new wallet to continue using the portfolio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {walletToDelete && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{walletToDelete.wallet_name}</span>
                  {walletToDelete.is_primary && (
                    <Badge variant="default" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Primary
                    </Badge>
                  )}
                </div>
                <code className="text-sm text-gray-600 mt-1 block">
                  {walletToDelete.wallet_address.slice(0, 6)}...{walletToDelete.wallet_address.slice(-4)}
                </code>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setWalletToDelete(null)
                }}
                disabled={deletingWallet}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={removeWallet}
                disabled={deletingWallet}
              >
                {deletingWallet ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove Wallet"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Portfolio Tabs - Show when a wallet is selected */}
      {selectedWallet ? (
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
                  <p className="text-gray-600">Select a wallet to view portfolio charts.</p>
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
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                  <p className="text-gray-600">Select a wallet to view portfolio data.</p>
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
                  <p className="text-gray-600">Select a wallet to view tokens.</p>
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
                  <p className="text-gray-600">Select a wallet to view NFTs.</p>
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
                  <p className="text-gray-600">Select a wallet to view transactions.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Wallet</h3>
            <p className="text-gray-600">Choose a wallet from your list above to view its portfolio data.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
