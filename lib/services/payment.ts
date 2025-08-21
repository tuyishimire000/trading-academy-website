// Payment service for handling different payment methods
// This is a structure that you can extend with real payment APIs

export interface PaymentData {
  method: string
  amount: number
  currency: string
  description: string
  customerEmail: string
  customerName: string
  phoneNumber?: string
  cardDetails?: {
    encryptedCardNumber: string
    encryptedExpiryMonth: string
    encryptedExpiryYear: string
    encryptedCvv: string
    nonce: string
  }
  [key: string]: any // Additional payment-specific data
}

export interface MobileMoneyPaymentData extends PaymentData {
  phoneNumber: string
  provider: string
  countryCode: string
  network: string
}

export interface StripePaymentData extends PaymentData {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
}

export interface CryptoPaymentData extends PaymentData {
  selectedCrypto: string
  cryptoAmount: number
  walletAddress: string
  network: string
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  message: string
  error?: string
  paymentUrl?: string | null
  clientSecret?: string
  requiresAction?: boolean
  nextAction?: {
    type: string
    url?: string
  }
  txRef?: string
  transferDetails?: {
    bankName: string
    accountNumber: string
    accountName: string
    reference: string
    amount: number
    currency: string
    expiresAt: string
  }
}

export class PaymentService {
  // Cryptocurrency Payment Processing
  static async processCrypto(data: CryptoPaymentData): Promise<PaymentResult> {
    try {
      // TODO: Integrate with crypto payment gateway (Coinbase Commerce, BTCPay Server, etc.)
      console.log("Processing Crypto payment:", {
        amount: data.amount,
        currency: data.currency,
        selectedCrypto: data.selectedCrypto,
        cryptoAmount: data.cryptoAmount,
        walletAddress: data.walletAddress,
        network: data.network,
        // Note: In real implementation, you would integrate with a crypto payment processor
        // or implement blockchain monitoring for payment confirmations
      })
      
      // Simulate crypto payment processing (longer delay for blockchain confirmations)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      return {
        success: true,
        transactionId: `crypto_${data.selectedCrypto}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: `${data.selectedCrypto.toUpperCase()} payment processed successfully`
      }
    } catch (error) {
      return {
        success: false,
        message: "Crypto payment failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  // Stripe Payment
  static async processStripe(data: PaymentData): Promise<PaymentResult> {
    try {
      // Import Stripe service dynamically to avoid SSR issues
      const { stripeService } = await import('./stripe')
      
      console.log("Processing Stripe payment:", {
        amount: data.amount,
        currency: data.currency,
        customerEmail: data.customerEmail,
        customerName: data.customerName
      })

      // Create payment intent with Stripe
      const paymentIntentResult = await stripeService.createPaymentIntent({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase(),
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        description: data.description,
        metadata: {
          subscription_id: data.subscriptionId,
          payment_method: 'stripe',
          customer_name: data.customerName
        }
      })

      if (paymentIntentResult.success) {
        return {
          success: true,
          transactionId: paymentIntentResult.paymentIntentId!,
          message: paymentIntentResult.message,
          paymentUrl: paymentIntentResult.nextAction?.url || null,
          clientSecret: paymentIntentResult.clientSecret,
          requiresAction: paymentIntentResult.requiresAction,
          nextAction: paymentIntentResult.nextAction
        }
      } else {
        return {
          success: false,
          message: paymentIntentResult.message,
          error: paymentIntentResult.error || "Stripe payment failed"
        }
      }
    } catch (error) {
      console.error('Stripe payment error:', error)
      return {
        success: false,
        message: "Stripe payment failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  // Mobile Money Payment (MTN, Airtel, etc.)
  static async processMobileMoney(data: MobileMoneyPaymentData): Promise<PaymentResult> {
    try {
      // Import Flutterwave service dynamically to avoid SSR issues
      const { flutterwaveService } = await import('./flutterwave')
      
      console.log("Processing Mobile Money payment:", {
        amount: data.amount,
        currency: data.currency,
        phoneNumber: data.phoneNumber,
        provider: data.provider,
        countryCode: data.countryCode,
        network: data.network,
        customerEmail: data.customerEmail,
        customerName: data.customerName
      })

      // Generate transaction reference
      const txRef = flutterwaveService.generateTransactionRef()
      
      // Prepare Flutterwave charge data
      const chargeData = {
        tx_ref: txRef,
        amount: data.amount,
        currency: data.currency,
        country: data.countryCode,
        email: data.customerEmail,
        phone_number: data.phoneNumber,
        fullname: data.customerName,
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
        meta: {
          subscription_id: data.subscriptionId,
          payment_method: 'mobile_money',
          provider: data.provider,
          network: data.network
        }
      }

      // Initiate payment with Flutterwave
      const response = await flutterwaveService.initiateMobileMoneyPayment(chargeData)
      
      if (response.status === 'success') {
        return {
          success: true,
          transactionId: response.data.flw_ref,
          message: "Mobile Money payment initiated successfully. Please check your phone for payment prompt.",
          paymentUrl: response.data.charge_response?.link || null,
          txRef: txRef
        }
      } else {
        return {
          success: false,
          message: response.message || "Mobile Money payment failed",
          error: "Payment initiation failed"
        }
      }
    } catch (error) {
      console.error('Mobile Money payment error:', error)
      return {
        success: false,
        message: "Mobile Money payment failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  // Bank Transfer
  static async processBankTransfer(data: PaymentData): Promise<PaymentResult> {
    try {
      // Import Flutterwave service dynamically to avoid SSR issues
      const { flutterwaveService } = await import('./flutterwave')
      
      console.log("Processing Bank Transfer:", {
        amount: data.amount,
        currency: data.currency,
        customerEmail: data.customerEmail,
        customerName: data.customerName
      })

      // Generate transaction reference
      const txRef = flutterwaveService.generateTransactionRef()
      
      // Prepare Flutterwave bank transfer charge data
      const chargeData = {
        tx_ref: txRef,
        amount: data.amount,
        currency: data.currency,
        email: data.customerEmail,
        bank_transfer_options: {
          expires: 3600 // 1 hour expiration
        },
        meta: {
          subscription_id: data.subscriptionId,
          payment_method: 'bank_transfer',
          customer_name: data.customerName
        }
      }

      // Initiate bank transfer with Flutterwave
      const response = await flutterwaveService.initiateBankTransferPayment(chargeData)
      
      if (response.status === 'success') {
        const transferDetails = response.meta?.authorization
        return {
          success: true,
          transactionId: response.data.flw_ref,
          message: "Bank transfer initiated successfully. Please complete the transfer using the provided details.",
          paymentUrl: null,
          txRef: txRef,
          transferDetails: {
            bankName: response.data.transfer_details?.bank_name || 'Unknown Bank',
            accountNumber: response.data.transfer_details?.account_number || '',
            accountName: response.data.transfer_details?.account_name || '',
            reference: response.data.transfer_details?.reference || txRef,
            amount: data.amount,
            currency: data.currency,
            expiresAt: response.data.transfer_details?.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        }
      } else {
        return {
          success: false,
          message: response.message || "Bank transfer failed",
          error: "Payment initiation failed"
        }
      }
    } catch (error) {
      console.error('Bank Transfer payment error:', error)
      return {
        success: false,
        message: "Bank transfer failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  // Card Payment
  static async processCard(data: PaymentData): Promise<PaymentResult> {
    try {
      // Import Flutterwave service dynamically to avoid SSR issues
      const { flutterwaveService } = await import('./flutterwave')
      
      console.log("Processing card payment:", {
        amount: data.amount,
        currency: data.currency,
        customerEmail: data.customerEmail,
        customerName: data.customerName
      })

      // Generate transaction reference
      const txRef = flutterwaveService.generateTransactionRef()
      
      // Step 1: Create customer
      const customerResponse = await flutterwaveService.createCustomer({
        email: data.customerEmail,
        name: data.customerName,
        phone_number: data.phoneNumber || ''
      })

      if (customerResponse.status !== 'success') {
        return {
          success: false,
          message: "Failed to create customer",
          error: customerResponse.message || "Customer creation failed"
        }
      }

      const customerId = customerResponse.data.customer_id

      // Step 2: Create payment method (if card details are provided)
      let paymentMethodId: string | undefined
      if (data.cardDetails) {
        const paymentMethodResponse = await flutterwaveService.createPaymentMethod({
          type: 'card',
          card: {
            encrypted_card_number: data.cardDetails.encryptedCardNumber,
            encrypted_expiry_month: data.cardDetails.encryptedExpiryMonth,
            encrypted_expiry_year: data.cardDetails.encryptedExpiryYear,
            encrypted_cvv: data.cardDetails.encryptedCvv,
            nonce: data.cardDetails.nonce
          }
        })

        if (paymentMethodResponse.status === 'success') {
          paymentMethodId = paymentMethodResponse.data.payment_method_id
        }
      }

      // Step 3: Prepare Flutterwave card charge data
      const chargeData = {
        tx_ref: txRef,
        amount: data.amount,
        currency: data.currency,
        email: data.customerEmail,
        fullname: data.customerName,
        phone_number: data.phoneNumber || '',
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
        customer_id: customerId,
        payment_method_id: paymentMethodId,
        meta: {
          subscription_id: data.subscriptionId,
          payment_method: 'card',
          customer_name: data.customerName
        }
      }

      // Step 4: Initiate card payment with Flutterwave
      const response = await flutterwaveService.initiateCardPayment(chargeData)
      
      if (response.status === 'success') {
        return {
          success: true,
          transactionId: response.data.flw_ref,
          message: "Card payment initiated successfully. Please complete the payment on the next page.",
          paymentUrl: response.data.auth_url || response.data.charge_response?.link || null,
          txRef: txRef
        }
      } else {
        return {
          success: false,
          message: response.message || "Card payment failed",
          error: "Payment initiation failed"
        }
      }
    } catch (error) {
      console.error('Card payment error:', error)
      return {
        success: false,
        message: "Card payment failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  // Google Pay
  static async processGooglePay(data: PaymentData): Promise<PaymentResult> {
    try {
      // Import Flutterwave service dynamically to avoid SSR issues
      const { flutterwaveService } = await import('./flutterwave')
      
      console.log("Processing Google Pay payment:", {
        amount: data.amount,
        currency: data.currency,
        customerEmail: data.customerEmail,
        customerName: data.customerName
      })

      // Generate transaction reference
      const txRef = flutterwaveService.generateTransactionRef()
      
      // Prepare Flutterwave Google Pay charge data
      const chargeData = {
        tx_ref: txRef,
        amount: data.amount,
        currency: data.currency,
        email: data.customerEmail,
        fullname: data.customerName,
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
        payment_options: 'googlepay',
        meta: {
          subscription_id: data.subscriptionId,
          payment_method: 'google_pay',
          customer_name: data.customerName
        }
      }

      // Initiate Google Pay payment with Flutterwave
      const response = await flutterwaveService.initiateGooglePayPayment(chargeData)
      
      if (response.status === 'success') {
        return {
          success: true,
          transactionId: response.data.flw_ref,
          message: "Google Pay payment initiated successfully. Please complete the payment on the next page.",
          paymentUrl: response.data.charge_response?.link || null,
          txRef: txRef
        }
      } else {
        return {
          success: false,
          message: response.message || "Google Pay payment failed",
          error: "Payment initiation failed"
        }
      }
    } catch (error) {
      console.error('Google Pay payment error:', error)
      return {
        success: false,
        message: "Google Pay payment failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  // Apple Pay
  static async processApplePay(data: PaymentData): Promise<PaymentResult> {
    try {
      // Import Flutterwave service dynamically to avoid SSR issues
      const { flutterwaveService } = await import('./flutterwave')
      
      console.log("Processing Apple Pay payment:", {
        amount: data.amount,
        currency: data.currency,
        customerEmail: data.customerEmail,
        customerName: data.customerName
      })

      // Generate transaction reference
      const txRef = flutterwaveService.generateTransactionRef()
      
      // Prepare Flutterwave Apple Pay charge data
      const chargeData = {
        tx_ref: txRef,
        amount: data.amount,
        currency: data.currency,
        email: data.customerEmail,
        fullname: data.customerName,
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
        payment_options: 'applepay',
        meta: {
          subscription_id: data.subscriptionId,
          payment_method: 'apple_pay',
          customer_name: data.customerName
        }
      }

      // Initiate Apple Pay payment with Flutterwave
      const response = await flutterwaveService.initiateApplePayPayment(chargeData)
      
      if (response.status === 'success') {
        return {
          success: true,
          transactionId: response.data.flw_ref,
          message: "Apple Pay payment initiated successfully. Please complete the payment on the next page.",
          paymentUrl: response.data.auth_url || response.data.charge_response?.link || null,
          txRef: txRef
        }
      } else {
        return {
          success: false,
          message: response.message || "Apple Pay payment failed",
          error: "Payment initiation failed"
        }
      }
    } catch (error) {
      console.error('Apple Pay payment error:', error)
      return {
        success: false,
        message: "Apple Pay payment failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  // OPay
  static async processOPay(data: PaymentData): Promise<PaymentResult> {
    try {
      // Import Flutterwave service dynamically to avoid SSR issues
      const { flutterwaveService } = await import('./flutterwave')
      
      console.log("Processing OPay payment:", {
        amount: data.amount,
        currency: data.currency,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        phoneNumber: data.phoneNumber
      })

      // Generate transaction reference
      const txRef = flutterwaveService.generateTransactionRef()
      
      // Prepare Flutterwave OPay charge data
      const chargeData = {
        tx_ref: txRef,
        amount: data.amount.toString(), // OPay requires amount as string
        currency: 'NGN', // OPay is only available for Nigerian Naira
        email: data.customerEmail,
        fullname: data.customerName,
        phone_number: data.phoneNumber || '',
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
        meta: {
          subscription_id: data.subscriptionId,
          payment_method: 'opay',
          customer_name: data.customerName
        }
      }

      // Initiate OPay payment with Flutterwave
      const response = await flutterwaveService.initiateOPayPayment(chargeData)
      
      if (response.status === 'success') {
        return {
          success: true,
          transactionId: response.data.flw_ref,
          message: "OPay payment initiated successfully. Please complete the payment on the next page.",
          paymentUrl: response.data.auth_url || response.data.charge_response?.link || null,
          txRef: txRef
        }
      } else {
        return {
          success: false,
          message: response.message || "OPay payment failed",
          error: "Payment initiation failed"
        }
      }
    } catch (error) {
      console.error('OPay payment error:', error)
      return {
        success: false,
        message: "OPay payment failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  // Main payment processor
  static async processPayment(data: PaymentData): Promise<PaymentResult> {
    switch (data.method) {
      case "crypto":
        return this.processCrypto(data as CryptoPaymentData)
      case "stripe":
        return this.processStripe(data)
      case "mobile_money":
        return this.processMobileMoney(data as MobileMoneyPaymentData)
      case "bank_transfer":
        return this.processBankTransfer(data)
      case "card_payment":
        return this.processCard(data)
      case "google_pay":
        return this.processGooglePay(data)
      case "apple_pay":
        return this.processApplePay(data)
      case "opay":
        return this.processOPay(data)
      default:
        return {
          success: false,
          message: "Unsupported payment method",
          error: `Payment method '${data.method}' is not supported`
        }
    }
  }
}

// Payment method configurations
export const PAYMENT_METHODS_CONFIG = {
  crypto: {
    supportedCryptos: ["usdt", "usdc", "btc", "trx", "eth", "bnb", "dai", "busd"],
    requiredFields: ["selectedCrypto"],
    description: "Secure blockchain payment processing",
    networks: {
      usdt: ["TRC20", "ERC20"],
      usdc: ["ERC20"],
      dai: ["ERC20"],
      busd: ["BEP20"],
      btc: ["Bitcoin"],
      trx: ["TRON"],
      eth: ["Ethereum"],
      bnb: ["Binance Smart Chain"]
    }
  },
  stripe: {
    supportedCards: ["visa", "mastercard", "amex"],
    requiredFields: ["cardholderName", "cardNumber", "expiryDate", "cvv"],
    description: "Secure payment processing by Stripe"
  },
  mobile_money: {
    providers: [
      { id: "MTN", name: "MTN Mobile Money", country: "Ghana", countryCode: "GH", network: "MTN" },
      { id: "VOD", name: "Vodafone Cash", country: "Ghana", countryCode: "GH", network: "VOD" },
      { id: "TGO", name: "AirtelTigo Money", country: "Ghana", countryCode: "GH", network: "TGO" },
      { id: "MPZ", name: "M-Pesa", country: "Kenya", countryCode: "KE", network: "MPZ" },
      { id: "AIRTEL", name: "Airtel Money", country: "Kenya", countryCode: "KE", network: "AIRTEL" },
      { id: "MPS", name: "M-Pesa", country: "Tanzania", countryCode: "TZ", network: "MPS" },
      { id: "MTN_UG", name: "MTN Mobile Money", country: "Uganda", countryCode: "UG", network: "MTN" },
      { id: "MTN_RW", name: "MTN Mobile Money", country: "Rwanda", countryCode: "RW", network: "MTN" }
    ],
    requiredFields: ["provider", "phoneNumber", "countryCode", "network"],
    description: "Pay with mobile money from your phone"
  },
  bank_transfer: {
    banks: [
      { id: "gtb", name: "GT Bank", code: "058" },
      { id: "zenith", name: "Zenith Bank", code: "057" },
      { id: "access", name: "Access Bank", code: "044" },
      { id: "first", name: "First Bank", code: "011" },
      { id: "uba", name: "UBA", code: "033" }
    ],
    requiredFields: ["bankName", "accountNumber", "accountName"]
  },
  card_payment: {
    supportedCards: ["visa", "mastercard", "verve"],
    requiredFields: ["cardholderName", "cardNumber", "expiryDate", "cvv"]
  },
  google_pay: {
    requiredFields: []
  },
  apple_pay: {
    requiredFields: []
  },
  opay: {
    requiredFields: []
  }
}
