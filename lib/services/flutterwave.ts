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

export interface GooglePayChargeData {
  tx_ref: string
  amount: number
  currency: string
  email: string
  fullname: string
  redirect_url: string
  payment_options?: string
  meta?: {
    [key: string]: any
  }
}

export interface ApplePayChargeData {
  tx_ref: string
  amount: number
  currency: string
  email: string
  fullname: string
  redirect_url: string
  payment_options?: string
  meta?: {
    [key: string]: any
  }
}

export interface OPayChargeData {
  tx_ref: string
  amount: string
  currency: string
  email: string
  fullname: string
  phone_number: string
  redirect_url: string
  meta?: {
    [key: string]: any
  }
}

export interface CardChargeData {
  tx_ref: string
  amount: number
  currency: string
  email: string
  fullname: string
  phone_number?: string
  redirect_url: string
  customer_id?: string
  payment_method_id?: string
  card?: {
    encrypted_card_number: string
    encrypted_expiry_month: string
    encrypted_expiry_year: string
    encrypted_cvv: string
    nonce: string
  }
  meta?: {
    [key: string]: any
  }
}

export interface CustomerData {
  email: string
  name: string
  phone_number?: string
}

export interface PaymentMethodData {
  type: string
  card?: {
    encrypted_card_number: string
    encrypted_expiry_month: string
    encrypted_expiry_year: string
    encrypted_cvv: string
    nonce: string
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
    customer_id?: string
    payment_method_id?: string
    meta: {
      [key: string]: any
    }
    amount_settled: number
    subaccount: any
    charge_response: {
      [key: string]: any
    }
    auth_url?: string
    transfer_details?: {
      bank_name: string
      account_number: string
      account_name: string
      reference: string
      expires_at: string
    }
  }
  meta?: {
    [key: string]: any
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
   * Initialize a Google Pay payment
   */
  async initiateGooglePayPayment(data: GooglePayChargeData): Promise<FlutterwaveResponse> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v3/charges?type=googlepay`,
        {
          ...data,
          payment_type: 'googlepay',
          payment_options: data.payment_options || 'googlepay'
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
      console.error('Flutterwave Google Pay API Error:', error)
      throw new Error('Failed to initiate Google Pay payment')
    }
  }

  /**
   * Initialize an Apple Pay payment
   */
  async initiateApplePayPayment(data: ApplePayChargeData): Promise<FlutterwaveResponse> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v3/charges?type=applepay`,
        {
          ...data,
          payment_type: 'applepay',
          payment_options: data.payment_options || 'applepay'
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
      console.error('Flutterwave Apple Pay API Error:', error)
      throw new Error('Failed to initiate Apple Pay payment')
    }
  }

  /**
   * Initialize an OPay payment
   */
  async initiateOPayPayment(data: OPayChargeData): Promise<FlutterwaveResponse> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v3/charges?type=opay`,
        {
          ...data,
          payment_type: 'opay'
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
      console.error('Flutterwave OPay API Error:', error)
      throw new Error('Failed to initiate OPay payment')
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(data: CustomerData): Promise<FlutterwaveResponse> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v3/customers`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.config.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('Flutterwave Create Customer Error:', error)
      throw new Error('Failed to create customer')
    }
  }

  /**
   * Create a payment method
   */
  async createPaymentMethod(data: PaymentMethodData): Promise<FlutterwaveResponse> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v3/payment-methods`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.config.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('Flutterwave Create Payment Method Error:', error)
      throw new Error('Failed to create payment method')
    }
  }

  /**
   * Initialize a card payment
   */
  async initiateCardPayment(data: CardChargeData): Promise<FlutterwaveResponse> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v3/charges`,
        {
          ...data,
          payment_type: 'card'
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
      console.error('Flutterwave Card Payment API Error:', error)
      throw new Error('Failed to initiate card payment')
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
