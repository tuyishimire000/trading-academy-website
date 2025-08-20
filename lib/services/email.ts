// Email Service for password reset functionality
// Supports SMTP for sending emails

import * as nodemailer from 'nodemailer'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean // true for 465, false for other ports
  auth: {
    user: string
    pass: string
  }
  from: string
}

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  async sendEmail(message: EmailMessage): Promise<boolean> {
    try {
      // Create transporter for SMTP
      const transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth
      })

      // Send email
      const info = await transporter.sendMail({
        from: this.config.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text
      })

      console.log('📧 Email sent successfully:', {
        messageId: info.messageId,
        to: message.to,
        subject: message.subject,
        from: this.config.from
      })

      return true
    } catch (error) {
      console.error('Email sending failed:', error)
      return false
    }
  }

  // Helper method to send password reset email
  async sendPasswordResetEmail(email: string, verificationCode: string): Promise<boolean> {
    const subject = 'Password Reset Verification Code - Trading Academy'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Password Reset Verification</h2>
        <p>Hello,</p>
        <p>You have requested to reset your password for your Trading Academy account.</p>
        <p>Use the verification code below to proceed with your password reset:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f3f4f6; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; display: inline-block;">
            <h3 style="color: #3b82f6; margin: 0; font-size: 24px; letter-spacing: 4px;">${verificationCode}</h3>
          </div>
        </div>
        <p>Enter this code on the verification page to continue with your password reset.</p>
        <p>This code will expire in 10 minutes for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated message from Trading Academy. Please do not reply to this email.
        </p>
      </div>
    `
    const text = `
      Password Reset Verification Code - Trading Academy
      
      Hello,
      
      You have requested to reset your password for your Trading Academy account.
      
      Your verification code is: ${verificationCode}
      
      Enter this code on the verification page to continue with your password reset.
      
      This code will expire in 10 minutes for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      
      This is an automated message from Trading Academy. Please do not reply to this email.
    `

    return await this.sendEmail({
      to: email,
      subject,
      html,
      text
    })
  }
}

// Factory function to create email service
export function createEmailService(config: EmailConfig): EmailService {
  return new EmailService(config)
}

// Default email service instance (configure via environment variables)
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  from: process.env.SMTP_FROM || 'noreply@tradingacademy.com'
}

// Debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('📧 Email Configuration:', {
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass ? '***' + emailConfig.auth.pass.slice(-4) : 'undefined',
    from: emailConfig.from,
  })
}

export const defaultEmailService = createEmailService(emailConfig)
