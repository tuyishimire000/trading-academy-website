"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Activity, 
  ExternalLink,
  Copy,
  CheckCircle,
  Image as ImageIcon
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NFTGalleryProps {
  nfts: any[]
}

export default function NFTGallery({ nfts }: NFTGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const { toast } = useToast()

  // Filter NFTs based on search term
  const filteredNFTs = nfts.filter(nft => 
    nft.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nft.contract.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nft.contract.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      toast({
        title: "Address Copied",
        description: "NFT contract address copied to clipboard",
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

  const openOpenSea = (address: string, tokenId: string) => {
    window.open(`https://opensea.io/assets/ethereum/${address}/${tokenId}`, '_blank')
  }

  const getNFTImage = (nft: any) => {
    if (nft.media && nft.media.length > 0) {
      return nft.media[0].gateway || nft.media[0].raw
    }
    return null
  }

  const getCollectionIcon = (name: string) => {
    const colors = [
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-red-500 to-red-600',
      'from-orange-500 to-orange-600'
    ]
    const colorIndex = name?.charCodeAt(0) % colors.length || 0
    return colors[colorIndex]
  }

  // Group NFTs by collection
  const groupedNFTs = filteredNFTs.reduce((groups, nft) => {
    const collectionAddress = nft.contract.address
    if (!groups[collectionAddress]) {
      groups[collectionAddress] = {
        collection: nft.contract,
        nfts: []
      }
    }
    groups[collectionAddress].nfts.push(nft)
    return groups
  }, {} as Record<string, { collection: any, nfts: any[] }>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>NFT Collections</span>
            <Badge variant="secondary">{nfts.length} NFTs</Badge>
          </CardTitle>
          <CardDescription>
            All NFT collections in your wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search NFTs by name or collection..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* NFT Collections */}
      {Object.keys(groupedNFTs).length > 0 ? (
        Object.entries(groupedNFTs).map(([address, { collection, nfts: collectionNFTs }]) => (
          <Card key={address} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getCollectionIcon(collection.name)} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">
                      {collection.name?.slice(0, 2) || 'NF'}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">{collection.name || 'Unknown Collection'}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span className="font-mono text-xs">
                        {address.slice(0, 8)}...{address.slice(-6)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {collectionNFTs.length} NFTs
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyAddress(address)}
                    className="h-8 w-8 p-0"
                  >
                    {copiedAddress === address ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEtherscan(address)}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {collectionNFTs.map((nft) => {
                  const imageUrl = getNFTImage(nft)
                  
                  return (
                    <Card key={`${nft.contract.address}-${nft.tokenId}`} className="overflow-hidden">
                      <div className="aspect-square bg-gray-100 relative">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={nft.title || 'NFT'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling!.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ display: imageUrl ? 'none' : 'flex' }}>
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm truncate">
                            {nft.title || `#${nft.tokenId}`}
                          </h4>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              #{nft.tokenId}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openOpenSea(nft.contract.address, nft.tokenId)}
                              className="h-6 w-6 p-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                          {nft.description && (
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {nft.description}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            {searchTerm ? (
              <div>
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs found</h3>
                <p className="text-gray-600 mb-4">
                  No NFTs match your search criteria.
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
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs found</h3>
                <p className="text-gray-600">
                  This wallet doesn't contain any NFTs.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {Object.keys(groupedNFTs).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">NFT Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(groupedNFTs).length}
                </div>
                <div className="text-sm text-gray-600">Collections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {filteredNFTs.length}
                </div>
                <div className="text-sm text-gray-600">Total NFTs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {new Set(filteredNFTs.map(nft => nft.contract.name)).size}
                </div>
                <div className="text-sm text-gray-600">Unique Names</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredNFTs.filter(nft => getNFTImage(nft)).length}
                </div>
                <div className="text-sm text-gray-600">With Images</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
