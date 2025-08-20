// SMS Service for password reset functionality
// Supports multiple SMS providers: Twilio, AWS SNS, Vonage, Mista, and custom providers

export interface SMSConfig {
  provider: 'twilio' | 'aws-sns' | 'vonage' | 'mista' | 'custom'
  apiKey?: string
  apiSecret?: string
  accountSid?: string // Twilio specific
  authToken?: string // Twilio specific
  fromNumber?: string
  region?: string // AWS SNS specific
  customEndpoint?: string // For custom providers
  apiUrl?: string // Mista specific
  senderId?: string // Mista specific
}

export interface SMSMessage {
  to: string
  message: string
  from?: string
}

export class SMSService {
  private config: SMSConfig

  constructor(config: SMSConfig) {
    this.config = config
  }

  async sendSMS(message: SMSMessage): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'twilio':
          return await this.sendViaTwilio(message)
        case 'aws-sns':
          return await this.sendViaAWSSNS(message)
        case 'vonage':
          return await this.sendViaVonage(message)
        case 'mista':
          return await this.sendViaMista(message)
        case 'custom':
          return await this.sendViaCustom(message)
        default:
          throw new Error(`Unsupported SMS provider: ${this.config.provider}`)
      }
    } catch (error) {
      console.error('SMS sending failed:', error)
      return false
    }
  }

  private async sendViaTwilio(message: SMSMessage): Promise<boolean> {
    if (!this.config.accountSid || !this.config.authToken || !this.config.fromNumber) {
      throw new Error('Twilio configuration incomplete. Need accountSid, authToken, and fromNumber.')
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`
    const auth = Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: message.to,
        From: this.config.fromNumber,
        Body: message.message,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Twilio SMS failed: ${error}`)
    }

    return true
  }

  private async sendViaAWSSNS(message: SMSMessage): Promise<boolean> {
    if (!this.config.apiKey || !this.config.apiSecret || !this.config.region) {
      throw new Error('AWS SNS configuration incomplete. Need apiKey, apiSecret, and region.')
    }

    // This is a simplified implementation
    // In production, you'd use the AWS SDK
    const url = `https://sns.${this.config.region}.amazonaws.com/`
    
    // Note: This is a placeholder. You'll need to implement proper AWS SNS signing
    console.log('AWS SNS SMS sending (placeholder):', {
      to: message.to,
      message: message.message,
      region: this.config.region
    })

    return true
  }

  private async sendViaVonage(message: SMSMessage): Promise<boolean> {
    if (!this.config.apiKey || !this.config.apiSecret || !this.config.fromNumber) {
      throw new Error('Vonage configuration incomplete. Need apiKey, apiSecret, and fromNumber.')
    }

    const url = 'https://rest.nexmo.com/sms/json'
    const params = new URLSearchParams({
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret,
      to: message.to,
      from: this.config.fromNumber,
      text: message.message,
    })

    const response = await fetch(`${url}?${params}`)
    const result = await response.json()

    if (result.messages?.[0]?.status !== '0') {
      throw new Error(`Vonage SMS failed: ${result.messages?.[0]?.['error-text'] || 'Unknown error'}`)
    }

    return true
  }

  private async sendViaMista(message: SMSMessage): Promise<boolean> {
    if (!this.config.apiUrl || !this.config.apiKey || !this.config.senderId) {
      throw new Error('Mista configuration incomplete. Need apiUrl, apiKey, and senderId.')
    }

    console.log('📱 Sending SMS via Mista:', {
      to: message.to,
      message: message.message.substring(0, 50) + '...',
      sender_id: this.config.senderId,
      apiUrl: this.config.apiUrl
    })

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          to: message.to,
          message: message.message,
          sender_id: this.config.senderId,
        }),
      })

      console.log('📱 Mista API Response Status:', response.status)

      if (!response.ok) {
        const error = await response.text()
        console.error('📱 Mista API Error Response:', error)
        throw new Error(`Mista SMS failed: ${error}`)
      }

      const result = await response.json()
      console.log('📱 Mista API Success Response:', result)
      
      // Check if the response indicates success (adjust based on Mista's actual response format)
      if (result.success === false || result.error) {
        throw new Error(`Mista SMS failed: ${result.error || result.message || 'Unknown error'}`)
      }

      console.log('📱 SMS sent successfully via Mista')
      return true
    } catch (error) {
      console.error('📱 SMS sending failed:', error)
      throw error
    }
  }

  private async sendViaCustom(message: SMSMessage): Promise<boolean> {
    if (!this.config.customEndpoint) {
      throw new Error('Custom SMS provider endpoint not configured.')
    }

    const response = await fetch(this.config.customEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.config.apiKey ? `Bearer ${this.config.apiKey}` : '',
      },
      body: JSON.stringify({
        to: message.to,
        message: message.message,
        from: message.from || this.config.fromNumber,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Custom SMS failed: ${error}`)
    }

    return true
  }

  // Helper method to send password reset SMS
  async sendPasswordResetSMS(phoneNumber: string, resetCode: string): Promise<boolean> {
    const message = `Your Trading Academy password reset code is: ${resetCode}. This code expires in 10 minutes. Do not share this code with anyone.`
    
    return await this.sendSMS({
      to: phoneNumber,
      message,
      from: this.config.fromNumber,
    })
  }
}

// Factory function to create SMS service
export function createSMSService(config: SMSConfig): SMSService {
  return new SMSService(config)
}

// Default SMS service instance (configure via environment variables)
const smsConfig = {
  provider: (process.env.SMS_PROVIDER as any) || 'mista',
  apiKey: process.env.MISTA_API_KEY, // Changed from SMS_API_KEY to MISTA_API_KEY
  apiSecret: process.env.SMS_API_SECRET,
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.SMS_FROM_NUMBER,
  region: process.env.AWS_REGION,
  customEndpoint: process.env.SMS_CUSTOM_ENDPOINT,
  apiUrl: process.env.MISTA_API_URL,
  senderId: process.env.MISTA_SENDER_ID,
}

// Debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 SMS Configuration:', {
    provider: smsConfig.provider,
    apiUrl: smsConfig.apiUrl,
    apiKey: smsConfig.apiKey ? '***' + smsConfig.apiKey.slice(-4) : 'undefined',
    senderId: smsConfig.senderId,
  })
}

export const defaultSMSService = createSMSService(smsConfig)
