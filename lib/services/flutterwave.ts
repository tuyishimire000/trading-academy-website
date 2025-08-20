import axios from 'axios'

export interface FlutterwaveConfig {
  publicKey: string
  secretKey: string
  baseUrl: string
}

export interface MobileMoneyChargeData {
  tx_ref: string
  amount: number
  currency: string
  country: string
  email: string
  phone_number: string
  fullname: string
  redirect_url: string
  meta: {
    [key: string]: any
  }
}

export interface BankTransferChargeData {
  tx_ref: string
  amount: number
  currency: string
  email: string
  bank_transfer_options?: {
    expires?: number
  }
  meta?: {
    [key: string]: any
  }
}

export interface FlutterwaveResponse {
  status: string
  message: string
  data: {
    id: number
    tx_ref: string
    flw_ref: string
    device_fingerprint: string
    amount: number
    currency: string
    charged_amount: number
    app_fee: number
    merchant_fee: number
    processor_response: string
    auth_model: string
    ip: string
    narration: string
    status: string
    payment_type: string
    created_at: string
    account_id: number
    customer: {
      id: number
      phone_number: string
      name: string
      email: string
      created_at: string
    }
    meta: {
      [key: string]: any
    }
    amount_settled: number
    subaccount: any
    charge_response: {
      [key: string]: any
    }
  }
}

class FlutterwaveService {
  private config: FlutterwaveConfig

  constructor(config: FlutterwaveConfig) {
    this.config = config
  }

  /**
   * Initialize a Mobile Money payment
   */
  async initiateMobileMoneyPayment(data: MobileMoneyChargeData): Promise<FlutterwaveResponse> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v3/charges?type=mobile_money_ghana`,
        {
          ...data,
          payment_type: 'mobile_money_ghana'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('Flutterwave API Error:', error)
      throw new Error('Failed to initiate mobile money payment')
    }
  }

  /**
   * Initialize a Bank Transfer payment
   */
  async initiateBankTransferPayment(data: BankTransferChargeData): Promise<FlutterwaveResponse> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v3/charges?type=bank_transfer`,
        {
          ...data,
          payment_type: 'bank_transfer'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('Flutterwave Bank Transfer API Error:', error)
      throw new Error('Failed to initiate bank transfer payment')
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(transactionId: string): Promise<FlutterwaveResponse> {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/v3/transactions/${transactionId}/verify`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('Flutterwave Verification Error:', error)
      throw new Error('Failed to verify payment')
    }
  }

  /**
   * Generate a unique transaction reference
   */
  generateTransactionRef(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `TA_${timestamp}_${random}`
  }
}

// Create default Flutterwave service instance
export const flutterwaveService = new FlutterwaveService({
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.flutterwave.com' 
    : 'https://api.flutterwave.com' // Use sandbox URL for testing
})

export default FlutterwaveService
