"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Coins, 
  TrendingUp, 
  TrendingDown,
  ExternalLink,
  Copy,
  CheckCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TokenListProps {
  tokens: any[]
}

export default function TokenList({ tokens }: TokenListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const { toast } = useToast()

  // Filter tokens based on search term
  const filteredTokens = tokens.filter(token => 
    token.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.contractAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      toast({
        title: "Address Copied",
        description: "Token contract address copied to clipboard",
      })
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy address",
        variant: "destructive",
      })
    }
  }

  const openEtherscan = (address: string) => {
    window.open(`https://etherscan.io/token/${address}`, '_blank')
  }

  const formatTokenBalance = (token: any) => {
    const balance = parseFloat(token.tokenBalance || '0')
    const decimals = token.decimals || 18
    return (balance / Math.pow(10, decimals)).toFixed(4)
  }

  const getTokenIcon = (symbol: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600'
    ]
    const colorIndex = symbol?.charCodeAt(0) % colors.length || 0
    return colors[colorIndex]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5" />
            <span>Token Holdings</span>
            <Badge variant="secondary">{tokens.length} tokens</Badge>
          </CardTitle>
          <CardDescription>
            All ERC-20 tokens in your wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tokens by symbol or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Token List */}
      <div className="grid gap-4">
        {filteredTokens.length > 0 ? (
          filteredTokens.map((token, index) => (
            <Card key={token.contractAddress} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Token Icon */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${getTokenIcon(token.symbol)} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">
                        {token.symbol?.slice(0, 3) || 'TK'}
                      </span>
                    </div>

                    {/* Token Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          {token.symbol || 'Unknown Token'}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          ERC-20
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="font-mono">
                          {token.contractAddress?.slice(0, 8)}...{token.contractAddress?.slice(-6)}
                        </span>
                        <span>Decimals: {token.decimals || 18}</span>
                      </div>
                    </div>
                  </div>

                  {/* Token Balance */}
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {formatTokenBalance(token)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {token.symbol || 'TOKEN'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyAddress(token.contractAddress)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedAddress === token.contractAddress ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEtherscan(token.contractAddress)}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Additional Token Details */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Raw Balance:</span>
                      <div className="font-mono text-xs break-all">
                        {token.tokenBalance || '0'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Contract:</span>
                      <div className="font-mono text-xs break-all">
                        {token.contractAddress || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Error:</span>
                      <div className="text-xs">
                        {token.error || 'None'}
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
                  <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tokens found</h3>
                  <p className="text-gray-600 mb-4">
                    No tokens match your search criteria.
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
                  <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tokens found</h3>
                  <p className="text-gray-600">
                    This wallet doesn't contain any ERC-20 tokens.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Stats */}
      {filteredTokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Token Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredTokens.length}
                </div>
                <div className="text-sm text-gray-600">Total Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredTokens.filter(t => parseFloat(t.tokenBalance || '0') > 0).length}
                </div>
                <div className="text-sm text-gray-600">Non-Zero Balance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(filteredTokens.map(t => t.symbol)).size}
                </div>
                <div className="text-sm text-gray-600">Unique Symbols</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredTokens.filter(t => t.error).length}
                </div>
                <div className="text-sm text-gray-600">With Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
