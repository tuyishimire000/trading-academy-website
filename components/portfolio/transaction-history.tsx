"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  ExternalLink,
  Copy,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TransactionHistoryProps {
  transactions: any[]
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const { toast } = useToast()

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(tx => 
    tx.hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.from?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopiedHash(hash)
      toast({
        title: "Hash Copied",
        description: "Transaction hash copied to clipboard",
      })
      setTimeout(() => setCopiedHash(null), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy hash",
        variant: "destructive",
      })
    }
  }

  const openEtherscan = (hash: string) => {
    window.open(`https://etherscan.io/tx/${hash}`, '_blank')
  }

  const getTransactionIcon = (category: string) => {
    switch (category) {
      case 'external':
        return <ArrowLeftRight className="h-4 w-4" />
      case 'internal':
        return <ArrowLeftRight className="h-4 w-4" />
      case 'erc20':
        return <TrendingUp className="h-4 w-4" />
      case 'erc721':
        return <TrendingUp className="h-4 w-4" />
      case 'erc1155':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <ArrowLeftRight className="h-4 w-4" />
    }
  }

  const getTransactionColor = (category: string) => {
    switch (category) {
      case 'external':
        return 'from-blue-500 to-blue-600'
      case 'internal':
        return 'from-green-500 to-green-600'
      case 'erc20':
        return 'from-purple-500 to-purple-600'
      case 'erc721':
        return 'from-pink-500 to-pink-600'
      case 'erc1155':
        return 'from-orange-500 to-orange-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const formatValue = (value: string, decimals: number = 18) => {
    if (!value) return '0'
    const numValue = parseFloat(value) / Math.pow(10, decimals)
    return numValue.toFixed(6)
  }

  const formatDate = (blockNum: string) => {
    // Convert block number to approximate date (simplified)
    const now = new Date()
    const blockTime = new Date(now.getTime() - (parseInt(blockNum) * 12 * 1000)) // 12 seconds per block
    return blockTime.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Transaction History</span>
            <Badge variant="secondary">{transactions.length} transactions</Badge>
          </CardTitle>
          <CardDescription>
            All transactions from your wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions by hash, category, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx, index) => (
            <Card key={tx.hash || index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Transaction Icon */}
                    <div className={`w-10 h-10 bg-gradient-to-br ${getTransactionColor(tx.category)} rounded-full flex items-center justify-center text-white`}>
                      {getTransactionIcon(tx.category)}
                    </div>

                    {/* Transaction Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">
                          {tx.category === 'external' ? 'Transfer' : 
                           tx.category === 'internal' ? 'Internal Transfer' :
                           tx.category === 'erc20' ? 'Token Transfer' :
                           tx.category === 'erc721' ? 'NFT Transfer' :
                           tx.category === 'erc1155' ? 'NFT Transfer' :
                           'Transaction'}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {tx.category}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span className="font-mono text-xs">
                            Hash: {tx.hash?.slice(0, 8)}...{tx.hash?.slice(-6)}
                          </span>
                          <span>Block: {tx.blockNum}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-mono text-xs">
                            From: {tx.from?.slice(0, 8)}...{tx.from?.slice(-6)}
                          </span>
                          <span className="font-mono text-xs">
                            To: {tx.to?.slice(0, 8)}...{tx.to?.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Value */}
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {tx.value ? `${formatValue(tx.value)} ETH` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(tx.blockNum)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyHash(tx.hash)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedHash === tx.hash ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEtherscan(tx.hash)}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Additional Transaction Details */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Asset:</span>
                      <div className="font-medium">
                        {tx.asset || 'ETH'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <div className="font-medium">
                        {tx.category || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Block:</span>
                      <div className="font-mono text-xs">
                        {tx.blockNum || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Rank:</span>
                      <div className="text-xs font-medium">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              {searchTerm ? (
                <div>
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                  <p className="text-gray-600 mb-4">
                    No transactions match your search criteria.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div>
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                  <p className="text-gray-600">
                    This wallet doesn't have any transaction history.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Stats */}
      {filteredTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredTransactions.length}
                </div>
                <div className="text-sm text-gray-600">Total Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredTransactions.filter(tx => tx.category === 'external').length}
                </div>
                <div className="text-sm text-gray-600">External Transfers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredTransactions.filter(tx => tx.category === 'erc20').length}
                </div>
                <div className="text-sm text-gray-600">Token Transfers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {filteredTransactions.filter(tx => tx.category === 'erc721' || tx.category === 'erc1155').length}
                </div>
                <div className="text-sm text-gray-600">NFT Transfers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
