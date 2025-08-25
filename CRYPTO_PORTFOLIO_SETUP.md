# Crypto Portfolio Setup Guide

This guide will help you set up the crypto portfolio feature with wallet connection and analytics.

## Required Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# WalletConnect Project ID (Required for wallet connections)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Alchemy API Key (Required for blockchain data)
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
```

## Setup Instructions

### 1. WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in to your account
3. Create a new project
4. Copy your Project ID
5. Add it to your `.env.local` file as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### 2. Alchemy API Key

1. Go to [Alchemy Dashboard](https://dashboard.alchemyapi.io/)
2. Sign up or log in to your account
3. Create a new app
4. Select "Ethereum" as the network
5. Copy your API Key
6. Add it to your `.env.local` file as `NEXT_PUBLIC_ALCHEMY_API_KEY`

## Features

### Wallet Connection
- Support for MetaMask, WalletConnect, Coinbase Wallet, and more
- Secure wallet connection using RainbowKit
- Display of wallet address and ETH balance

### Portfolio Analytics
- **Overview**: Key metrics and portfolio summary
- **Tokens**: List of all ERC-20 tokens with balances
- **NFTs**: NFT collections and individual NFTs
- **Transactions**: Complete transaction history
- **Charts**: Visual analytics (placeholder for now)

### Data Sources
- **Alchemy API**: Fetches token balances, NFTs, and transaction history
- **Wagmi**: Real-time wallet data and balance updates
- **RainbowKit**: Wallet connection UI and management

## Supported Networks

The portfolio currently supports:
- Ethereum Mainnet
- Polygon
- Optimism
- Arbitrum
- Base
- Sepolia (testnet)

## Usage

1. Navigate to the Dashboard
2. Click on "Portfolio" in the sidebar
3. Click "Connect Wallet & View Portfolio" or "View Full Portfolio"
4. Connect your wallet using the RainbowKit interface
5. View your portfolio data across different tabs

## Components

- `app/portfolio/page.tsx` - Main portfolio page
- `components/portfolio/portfolio-overview.tsx` - Overview dashboard
- `components/portfolio/token-list.tsx` - Token holdings list
- `components/portfolio/nft-gallery.tsx` - NFT collections
- `components/portfolio/transaction-history.tsx` - Transaction history
- `components/portfolio/portfolio-charts.tsx` - Analytics charts
- `lib/wagmi.ts` - Wagmi configuration
- `lib/alchemy.ts` - Alchemy API helpers
- `components/providers.tsx` - Wallet providers wrapper

## Troubleshooting

### Wallet Connection Issues
- Ensure WalletConnect Project ID is correctly set
- Check that your wallet supports the required networks
- Try refreshing the page and reconnecting

### Data Loading Issues
- Verify Alchemy API key is correct
- Check network connectivity
- Ensure the wallet address has some activity on Ethereum mainnet

### Chart Display Issues
- Charts are currently placeholder components
- Full chart implementation will be added in future updates

## Security Notes

- Never expose your private keys or seed phrases
- The app only reads wallet data, it cannot send transactions
- All wallet connections are handled securely through RainbowKit
- API keys are used only for reading blockchain data

## Future Enhancements

- Real-time price data integration
- Portfolio performance tracking
- Advanced charting with Chart.js
- Multi-chain support expansion
- DeFi protocol integration
- Portfolio export functionality
