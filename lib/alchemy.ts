import { Alchemy, Network } from 'alchemy-sdk'

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'YOUR_ALCHEMY_API_KEY',
  network: Network.ETH_MAINNET,
}

export const alchemy = new Alchemy(settings)

// Helper function to get user assets
export async function getUserAssets(address: string) {
  try {
    const assets = await alchemy.core.getTokenBalances(address)
    return assets
  } catch (error) {
    console.error('Error fetching user assets:', error)
    throw error
  }
}

// Helper function to get NFT balances
export async function getUserNFTs(address: string) {
  try {
    const nfts = await alchemy.nft.getNftsForOwner(address)
    return nfts
  } catch (error) {
    console.error('Error fetching user NFTs:', error)
    throw error
  }
}

// Helper function to get transaction history
export async function getUserTransactions(address: string) {
  try {
    const transactions = await alchemy.core.getAssetTransfers({
      fromBlock: '0x0',
      toBlock: 'latest',
      fromAddress: address,
      category: ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
    })
    return transactions
  } catch (error) {
    console.error('Error fetching user transactions:', error)
    throw error
  }
}

// Helper function to get token metadata
export async function getTokenMetadata(contractAddress: string) {
  try {
    const metadata = await alchemy.core.getTokenMetadata(contractAddress)
    return metadata
  } catch (error) {
    console.error('Error fetching token metadata:', error)
    throw error
  }
}
