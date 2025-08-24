// Email Service for password reset functionality
// Supports SMTP for sending emails

import nodemailer from "nodemailer"

interface EmailData {
  to: string
  subject: string
  template: string
  data: Record<string, any>
}

// Email templates
const emailTemplates = {
  "subscription-expired": (data: any) => ({
    subject: "Your Trading Academy Subscription Has Expired",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Expired</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Expired</h1>
            <p>Trading Academy</p>
          </div>
          <div class="content">
            <h2>Hello ${data.firstName},</h2>
            <p>Your <strong>${data.planName}</strong> subscription has expired on <strong>${data.expirationDate}</strong>.</p>
            <p>We've automatically downgraded your account to our free plan to ensure you don't lose access to basic features.</p>
            <p>To continue enjoying premium features and advanced trading tools, please renew your subscription:</p>
            <div style="text-align: center;">
              <a href="${data.renewalUrl}" class="button">Renew Subscription</a>
            </div>
            <p><strong>What happens now?</strong></p>
            <ul>
              <li>You still have access to basic courses and features</li>
              <li>Premium courses and advanced tools are temporarily locked</li>
              <li>Your progress and data are safely preserved</li>
              <li>Renew anytime to restore full access</li>
            </ul>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The Trading Academy Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Trading Academy. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  "subscription-expiring-soon": (data: any) => ({
    subject: `Your Trading Academy subscription expires in ${data.daysUntilExpiration} days`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Expiring Soon</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Expiring Soon</h1>
            <p>Trading Academy</p>
          </div>
          <div class="content">
            <h2>Hello ${data.firstName},</h2>
            <div class="warning">
              <p><strong>⚠️ Important:</strong> Your <strong>${data.planName}</strong> subscription will expire in <strong>${data.daysUntilExpiration} days</strong> on <strong>${data.expirationDate}</strong>.</p>
            </div>
            <p>Don't lose access to your premium features! Renew now to continue your trading journey without interruption.</p>
            <div style="text-align: center;">
              <a href="${data.renewalUrl}" class="button">Renew Now</a>
            </div>
            <p><strong>What you'll keep with renewal:</strong></p>
            <ul>
              <li>✅ All premium courses and advanced trading tools</li>
              <li>✅ VIP Discord community access</li>
              <li>✅ Live trading sessions and webinars</li>
              <li>✅ Priority support and exclusive content</li>
              <li>✅ Your learning progress and achievements</li>
            </ul>
            <p><strong>What happens if you don't renew:</strong></p>
            <ul>
              <li>❌ Access to premium courses will be locked</li>
              <li>❌ VIP Discord access will be revoked</li>
              <li>❌ Live sessions will no longer be available</li>
              <li>❌ Your account will be downgraded to free plan</li>
            </ul>
            <p>Renew now to maintain uninterrupted access to all premium features!</p>
            <p>Best regards,<br>The Trading Academy Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Trading Academy. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

/**
 * Send email using template
 */
export async function sendEmail(emailData: EmailData) {
  try {
    const template = emailTemplates[emailData.template as keyof typeof emailTemplates]
    
    if (!template) {
      throw new Error(`Email template '${emailData.template}' not found`)
    }

    const { subject, html } = template(emailData.data)
    
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: emailData.to,
      subject: subject,
      html: html,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`📧 Email sent successfully to ${emailData.to}:`, result.messageId)
    
    return result
  } catch (error) {
    console.error(`❌ Error sending email to ${emailData.to}:`, error)
    throw error
  }
}

/**
 * Send test email
 */
export async function sendTestEmail(to: string) {
  const testData = {
    to,
    subject: "Test Email from Trading Academy",
    template: "subscription-expiring-soon",
    data: {
      firstName: "Test User",
      planName: "Premium Plan",
      expirationDate: new Date().toLocaleDateString(),
      daysUntilExpiration: 5,
      renewalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`
    }
  }

  return await sendEmail(testData)
}
