/**
 * NOWPayments API Service
 * Handles cryptocurrency payment processing using NOWPayments API
 */

export interface NOWPaymentsConfig {
  apiKey: string
  baseUrl: string
  ipnSecretKey: string
}

export interface Currency {
  code: string
  name: string
  enabled: boolean
  network?: string
  has_extra_id?: boolean
  extra_id_name?: string
  image?: string
  contract_address?: string
  decimals?: number
}

export interface PriceEstimate {
  currency_from: string
  currency_to: string
  amount_from: string
  amount_to: string
  estimated_amount: string
  rate: string
  valid_until: string
}

export interface CreatePaymentRequest {
  price_amount: number
  price_currency: string
  pay_currency: string
  pay_amount?: number
  ipn_callback_url?: string
  order_id?: string
  order_description?: string
  purchase_id?: string
  payout_address?: string
  payout_currency?: string
  payout_extra_id?: string
  fixed_rate?: boolean
  is_fixed_rate?: boolean
  is_fee_paid_by_user?: boolean
  case?: string
  partially_paid_amount?: number
  customer_email?: string
  customer_name?: string
}

export interface PaymentResponse {
  payment_id: string
  payment_status: string
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  pay_currency: string
  order_id?: string
  order_description?: string
  ipn_callback_url?: string
  created_at: string
  updated_at: string
  purchase_id?: string
  outcome_amount?: number
  outcome_currency?: string
  case?: string
  customer_email?: string
  customer_name?: string
}

export interface PaymentStatus {
  payment_id: string
  payment_status: string
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  pay_currency: string
  order_id?: string
  order_description?: string
  ipn_callback_url?: string
  created_at: string
  updated_at: string
  purchase_id?: string
  outcome_amount?: number
  outcome_currency?: string
  case?: string
  customer_email?: string
  customer_name?: string
  actually_paid?: number
  actually_paid_at_fiat?: number
  actually_paid_at_fiat_currency?: string
  refund_address?: string
  payin_extra_id?: string
  payin_payment_id?: string
  payin_confirmations?: number
  required_confirmations?: number
  host?: string
  txid?: string
  payout_hash?: string
  payout_extra_id?: string
  refund_hash?: string
  refund_extra_id?: string
}

export interface IPNPayload {
  payment_id: string
  payment_status: string
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  pay_currency: string
  order_id?: string
  order_description?: string
  purchase_id?: string
  created_at: string
  updated_at: string
  outcome_amount?: number
  outcome_currency?: string
  case?: string
  customer_email?: string
  customer_name?: string
  actually_paid?: number
  actually_paid_at_fiat?: number
  actually_paid_at_fiat_currency?: string
  refund_address?: string
  payin_extra_id?: string
  payin_payment_id?: string
  payin_confirmations?: number
  required_confirmations?: number
  host?: string
  txid?: string
  payout_hash?: string
  payout_extra_id?: string
  refund_hash?: string
  refund_extra_id?: string
}

class NOWPaymentsService {
  private config: NOWPaymentsConfig

  constructor(config: NOWPaymentsConfig) {
    this.config = config
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey,
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`NOWPayments API Error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Get list of available cryptocurrencies
   */
  async getCurrencies(): Promise<Currency[]> {
    const response = await this.makeRequest<{ currencies: string[] }>('/currencies')
    
    // Transform the response from array of strings to array of Currency objects
    return response.currencies.map(code => ({
      code: code.toLowerCase(),
      name: this.getCurrencyName(code),
      enabled: true
    }))
  }

  /**
   * Get human-readable currency name from code
   */
  private getCurrencyName(code: string): string {
    const currencyNames: { [key: string]: string } = {
      'btc': 'Bitcoin',
      'eth': 'Ethereum',
      'usdt': 'Tether',
      'usdc': 'USD Coin',
      'bnb': 'BNB',
      'ada': 'Cardano',
      'sol': 'Solana',
      'dot': 'Polkadot',
      'doge': 'Dogecoin',
      'ltc': 'Litecoin',
      'xrp': 'Ripple',
      'bch': 'Bitcoin Cash',
      'dash': 'Dash',
      'neo': 'Neo',
      'etc': 'Ethereum Classic',
      'zec': 'Zcash',
      'xmr': 'Monero',
      'vet': 'VeChain',
      'link': 'Chainlink',
      'uni': 'Uniswap',
      'aave': 'Aave',
      'sushi': 'SushiSwap',
      'comp': 'Compound',
      'yfi': 'Yearn.finance',
      'mkr': 'Maker',
      'bat': 'Basic Attention Token',
      'zrx': '0x',
      'knc': 'Kyber Network',
      'ren': 'Ren',
      'bal': 'Balancer',
      'crv': 'Curve',
      'snx': 'Synthetix',
      'uma': 'UMA',
      'band': 'Band Protocol',
      'nest': 'NEST Protocol',
      'perp': 'Perpetual Protocol',
      'rlc': 'iExec RLC',
      'storj': 'Storj',
      'oxt': 'Orchid',
      'mana': 'Decentraland',
      'sand': 'The Sandbox',
      'enj': 'Enjin Coin',
      'axs': 'Axie Infinity',
      'chz': 'Chiliz',
      'hot': 'Holo',
      'vet': 'VeChain',
      'theta': 'Theta',
      'fil': 'Filecoin',
      'icp': 'Internet Computer',
      'apt': 'Aptos',
      'sui': 'Sui',
      'sei': 'Sei',
      'inj': 'Injective',
      'atom': 'Cosmos',
      'osmo': 'Osmosis',
      'juno': 'Juno',
      'scrt': 'Secret',
      'cro': 'Crypto.com Coin',
      'ftt': 'FTX Token',
      'okb': 'OKB',
      'ht': 'Huobi Token',
      'kcs': 'KuCoin Token',
      'leo': 'UNUS SED LEO',
      'btt': 'BitTorrent',
      'trx': 'TRON',
      'xlm': 'Stellar',
      'algo': 'Algorand',
      'near': 'NEAR Protocol',
      'avax': 'Avalanche',
      'matic': 'Polygon',
      'ftm': 'Fantom',
      'one': 'Harmony',
      'hbar': 'Hedera',
      'egld': 'Elrond',
      'zil': 'Zilliqa',
      'qtum': 'Qtum',
      'waves': 'Waves',
      'nano': 'Nano',
      'xem': 'NEM',
      'xvg': 'Verge',
      'bcn': 'Bytecoin',
      'bts': 'BitShares',
      'steem': 'Steem',
      'hive': 'Hive',
      'sbd': 'Steem Dollars',
      'hbd': 'Hive Backed Dollars',
      'srm': 'Serum',
      'ray': 'Raydium',
      'orca': 'Orca',
      'saber': 'Saber',
      'mer': 'Mercurial',
      'step': 'Step Finance',
      'bonfida': 'Bonfida',
      'maps': 'Maps.me',
      'oxy': 'Oxygen',
      'mngo': 'Mango',
      'tulip': 'Tulip Protocol',
      'larix': 'Larix',
      'francium': 'Francium',
      'tribeca': 'Tribeca',
      'marinade': 'Marinade Finance',
      'socean': 'Socean',
      'daop': 'DAO Protocol',
      'jup': 'Jupiter',
      'pyth': 'Pyth Network',
      'switch': 'Switch',
      'cope': 'Cope',
      'media': 'Media Network',
      'sam': 'Samoyedcoin',
      'srm': 'Serum',
      'fida': 'Bonfida',
      'oxy': 'Oxygen',
      'maps': 'Maps.me',
      'mngo': 'Mango',
      'tulip': 'Tulip Protocol',
      'larix': 'Larix',
      'francium': 'Francium',
      'tribeca': 'Tribeca',
      'marinade': 'Marinade Finance',
      'socean': 'Socean',
      'daop': 'DAO Protocol',
      'jup': 'Jupiter',
      'pyth': 'Pyth Network',
      'switch': 'Switch',
      'cope': 'Cope',
      'media': 'Media Network',
      'sam': 'Samoyedcoin'
    }
    
    return currencyNames[code.toLowerCase()] || code.toUpperCase()
  }

  /**
   * Get minimum payment amount for a specific currency
   */
  async getMinimumPaymentAmount(currency_from: string, currency_to: string): Promise<{
    currency_from: string
    currency_to: string
    min_amount: string
  }> {
    return this.makeRequest(`/min-amount/${currency_from}_${currency_to}`)
  }

  /**
   * Get maximum payment amount for a specific currency
   */
  async getMaximumPaymentAmount(currency_from: string, currency_to: string): Promise<{
    currency_from: string
    currency_to: string
    max_amount: string
  }> {
    return this.makeRequest(`/max-amount/${currency_from}_${currency_to}`)
  }

  /**
   * Estimate cryptocurrency amount for a given fiat amount
   */
  async estimatePrice(
    amount: number,
    currency_from: string,
    currency_to: string,
    is_fixed_rate?: boolean
  ): Promise<PriceEstimate> {
    const params = new URLSearchParams({
      amount: amount.toString(),
      currency_from,
      currency_to,
      ...(is_fixed_rate !== undefined && { is_fixed_rate: is_fixed_rate.toString() }),
    })

    return this.makeRequest<PriceEstimate>(`/estimate?${params}`)
  }

  /**
   * Create a new payment
   */
  async createPayment(paymentData: CreatePaymentRequest): Promise<PaymentResponse> {
    return this.makeRequest<PaymentResponse>('/payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  /**
   * Get payment status by payment ID
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    return this.makeRequest<PaymentStatus>(`/payment/${paymentId}`)
  }

  /**
   * Verify IPN signature
   */
  verifyIPNSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha512', this.config.ipnSecretKey)
      .update(payload)
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  }
}

// Create singleton instance
const nowpaymentsService = new NOWPaymentsService({
  apiKey: process.env.NOWPAYMENTS_API_KEY || '',
  baseUrl: process.env.NOWPAYMENTS_BASE_URL || 'https://api.nowpayments.io/v1',
  ipnSecretKey: process.env.NOWPAYMENTS_IPN_SECRET_KEY || '',
})

export default nowpaymentsService
