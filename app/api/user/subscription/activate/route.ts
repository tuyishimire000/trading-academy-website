import { type NextRequest, NextResponse } from "next/server"
import { verifyJwt } from "@/lib/auth/jwt"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { paymentMethod, paymentData } = await request.json()
    console.log("Payment activation request:", { paymentMethod, paymentData })

    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { UserSubscription, SubscriptionPlan } = await import("@/lib/sequelize/models")
    await ensureDatabaseConnection()

    // Find user's subscription
    const subscription = await UserSubscription.findOne({
      where: { user_id: payload.sub },
      include: [{ model: SubscriptionPlan, as: 'plan' }]
    })

    if (!subscription) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    if (subscription.status === 'active') {
      return NextResponse.json({ error: "Subscription is already active" }, { status: 400 })
    }

    // Handle different payment methods
    const plan = (subscription as any).plan
    const currentDate = new Date()
    
    if (paymentMethod === 'mobile_money') {
      // For Mobile Money payments, we need to process them through Flutterwave
      try {
        const { PaymentService } = await import("@/lib/services/payment")
        
        // Process the mobile money payment
        const result = await PaymentService.processMobileMoney({
          method: 'mobile_money',
          amount: plan.price,
          currency: 'GHS', // Ghanaian Cedi for mobile money
          description: `Trading Academy Subscription - ${plan.display_name}`,
          customerEmail: payload.email || '',
          customerName: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
          phoneNumber: paymentData.phoneNumber,
          provider: paymentData.provider,
          countryCode: paymentData.countryCode,
          network: paymentData.network,
          subscriptionId: subscription.id
        })

        if (result.success) {
          // Mobile Money payment initiated successfully
          // The subscription will be activated via webhook when payment is confirmed
          return NextResponse.json({
            success: true,
            message: result.message,
            status: "pending",
            transactionId: result.transactionId,
            paymentUrl: result.paymentUrl,
            subscription: {
              id: subscription.id,
              status: 'pending',
              plan: {
                name: plan.name,
                display_name: plan.display_name,
                price: plan.price,
                billing_cycle: plan.billing_cycle
              }
            },
            payment: {
              method: paymentMethod,
              initiated_at: currentDate
            }
          })
        } else {
          return NextResponse.json({ 
            error: result.message || "Mobile Money payment failed" 
          }, { status: 400 })
        }
      } catch (error) {
        console.error("Mobile Money payment error:", error)
        return NextResponse.json({ 
          error: "Failed to process Mobile Money payment" 
        }, { status: 500 })
      }
    } else if (paymentMethod === 'bank_transfer') {
      // For Bank Transfer payments, we need to process them through Flutterwave
      try {
        const { PaymentService } = await import("@/lib/services/payment")
        
        // Process the bank transfer payment
        const result = await PaymentService.processBankTransfer({
          method: 'bank_transfer',
          amount: plan.price,
          currency: 'NGN', // Nigerian Naira for bank transfer (or GHS for Ghana)
          description: `Trading Academy Subscription - ${plan.display_name}`,
          customerEmail: payload.email || '',
          customerName: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
          subscriptionId: subscription.id
        })

        if (result.success) {
          // Bank transfer initiated successfully
          // The subscription will be activated via webhook when payment is confirmed
          return NextResponse.json({
            success: true,
            message: result.message,
            status: "pending",
            transactionId: result.transactionId,
            transferDetails: result.transferDetails,
            subscription: {
              id: subscription.id,
              status: 'pending',
              plan: {
                name: plan.name,
                display_name: plan.display_name,
                price: plan.price,
                billing_cycle: plan.billing_cycle
              }
            },
            payment: {
              method: paymentMethod,
              initiated_at: currentDate
            }
          })
        } else {
          return NextResponse.json({ 
            error: result.message || "Bank transfer failed" 
          }, { status: 400 })
        }
      } catch (error) {
        console.error("Bank transfer payment error:", error)
        return NextResponse.json({ 
          error: "Failed to process bank transfer payment" 
        }, { status: 500 })
      }
    } else if (paymentMethod === 'google_pay') {
      // For Google Pay payments, we need to process them through Flutterwave
      try {
        const { PaymentService } = await import("@/lib/services/payment")
        
        // Process the Google Pay payment
        const result = await PaymentService.processGooglePay({
          method: 'google_pay',
          amount: plan.price,
          currency: 'USD', // Google Pay typically uses USD
          description: `Trading Academy Subscription - ${plan.display_name}`,
          customerEmail: payload.email || '',
          customerName: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
          subscriptionId: subscription.id
        })

        if (result.success) {
          // Google Pay payment initiated successfully
          // The subscription will be activated via webhook when payment is confirmed
          return NextResponse.json({
            success: true,
            message: result.message,
            status: "pending",
            transactionId: result.transactionId,
            paymentUrl: result.paymentUrl,
            subscription: {
              id: subscription.id,
              status: 'pending',
              plan: {
                name: plan.name,
                display_name: plan.display_name,
                price: plan.price,
                billing_cycle: plan.billing_cycle
              }
            },
            payment: {
              method: paymentMethod,
              initiated_at: currentDate
            }
          })
        } else {
          return NextResponse.json({ 
            error: result.message || "Google Pay payment failed" 
          }, { status: 400 })
        }
      } catch (error) {
        console.error("Google Pay payment error:", error)
        return NextResponse.json({ 
          error: "Failed to process Google Pay payment" 
        }, { status: 500 })
      }
    } else if (paymentMethod === 'apple_pay') {
      // For Apple Pay payments, we need to process them through Flutterwave
      try {
        const { PaymentService } = await import("@/lib/services/payment")
        
        // Process the Apple Pay payment
        const result = await PaymentService.processApplePay({
          method: 'apple_pay',
          amount: plan.price,
          currency: 'USD', // Apple Pay typically uses USD
          description: `Trading Academy Subscription - ${plan.display_name}`,
          customerEmail: payload.email || '',
          customerName: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
          subscriptionId: subscription.id
        })

        if (result.success) {
          // Apple Pay payment initiated successfully
          // The subscription will be activated via webhook when payment is confirmed
          return NextResponse.json({
            success: true,
            message: result.message,
            status: "pending",
            transactionId: result.transactionId,
            paymentUrl: result.paymentUrl,
            subscription: {
              id: subscription.id,
              status: 'pending',
              plan: {
                name: plan.name,
                display_name: plan.display_name,
                price: plan.price,
                billing_cycle: plan.billing_cycle
              }
            },
            payment: {
              method: paymentMethod,
              initiated_at: currentDate
            }
          })
        } else {
          return NextResponse.json({ 
            error: result.message || "Apple Pay payment failed" 
          }, { status: 400 })
        }
      } catch (error) {
        console.error("Apple Pay payment error:", error)
        return NextResponse.json({ 
          error: "Failed to process Apple Pay payment" 
        }, { status: 500 })
      }
    } else if (paymentMethod === 'opay') {
      // For OPay payments, we need to process them through Flutterwave
      try {
        const { PaymentService } = await import("@/lib/services/payment")
        
        // Process the OPay payment
        const result = await PaymentService.processOPay({
          method: 'opay',
          amount: plan.price,
          currency: 'NGN', // OPay is only available for Nigerian Naira
          description: `Trading Academy Subscription - ${plan.display_name}`,
          customerEmail: payload.email || '',
          customerName: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
          phoneNumber: paymentData.phoneNumber || '',
          subscriptionId: subscription.id
        })

        if (result.success) {
          // OPay payment initiated successfully
          // The subscription will be activated via webhook when payment is confirmed
          return NextResponse.json({
            success: true,
            message: result.message,
            status: "pending",
            transactionId: result.transactionId,
            paymentUrl: result.paymentUrl,
            subscription: {
              id: subscription.id,
              status: 'pending',
              plan: {
                name: plan.name,
                display_name: plan.display_name,
                price: plan.price,
                billing_cycle: plan.billing_cycle
              }
            },
            payment: {
              method: paymentMethod,
              initiated_at: currentDate
            }
          })
        } else {
          return NextResponse.json({ 
            error: result.message || "OPay payment failed" 
          }, { status: 400 })
        }
      } catch (error) {
        console.error("OPay payment error:", error)
        return NextResponse.json({ 
          error: "Failed to process OPay payment" 
        }, { status: 500 })
      }
    } else if (paymentMethod === 'card') {
      // For card payments, we need to process them through Flutterwave
      try {
        const { PaymentService } = await import("@/lib/services/payment")
        
        // Process the card payment
        const result = await PaymentService.processCard({
          method: 'card',
          amount: plan.price,
          currency: 'USD', // Card payments typically use USD
          description: `Trading Academy Subscription - ${plan.display_name}`,
          customerEmail: payload.email || '',
          customerName: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
          phoneNumber: paymentData.phoneNumber || '',
          cardDetails: paymentData.cardDetails,
          subscriptionId: subscription.id
        })

        if (result.success) {
          // Card payment initiated successfully
          // The subscription will be activated via webhook when payment is confirmed
          return NextResponse.json({
            success: true,
            message: result.message,
            status: "pending",
            transactionId: result.transactionId,
            paymentUrl: result.paymentUrl,
            subscription: {
              id: subscription.id,
              status: 'pending',
              plan: {
                name: plan.name,
                display_name: plan.display_name,
                price: plan.price,
                billing_cycle: plan.billing_cycle
              }
            },
            payment: {
              method: paymentMethod,
              initiated_at: currentDate
            }
          })
        } else {
          return NextResponse.json({ 
            error: result.message || "Card payment failed" 
          }, { status: 400 })
        }
      } catch (error) {
        console.error("Card payment error:", error)
        return NextResponse.json({ 
          error: "Failed to process card payment" 
        }, { status: 500 })
      }
    } else if (paymentMethod === 'stripe') {
      // For Stripe payments, we need to process them through Stripe
      try {
        const { PaymentService } = await import("@/lib/services/payment")
        
        // Process the Stripe payment
        const result = await PaymentService.processStripe({
          method: 'stripe',
          amount: plan.price,
          currency: 'USD', // Stripe payments typically use USD
          description: `Trading Academy Subscription - ${plan.display_name}`,
          customerEmail: payload.email || '',
          customerName: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
          subscriptionId: subscription.id
        })

        if (result.success) {
          // Stripe payment initiated successfully
          // The subscription will be activated via webhook when payment is confirmed
          return NextResponse.json({
            success: true,
            message: result.message,
            status: "pending",
            transactionId: result.transactionId,
            clientSecret: result.clientSecret,
            requiresAction: result.requiresAction,
            nextAction: result.nextAction,
            subscription: {
              id: subscription.id,
              status: 'pending',
              plan: {
                name: plan.name,
                display_name: plan.display_name,
                price: plan.price,
                billing_cycle: plan.billing_cycle
              }
            },
            payment: {
              method: paymentMethod,
              initiated_at: currentDate
            }
          })
        } else {
          return NextResponse.json({ 
            error: result.message || "Stripe payment failed" 
          }, { status: 400 })
        }
      } catch (error) {
        console.error("Stripe payment error:", error)
        return NextResponse.json({ 
          error: "Failed to process Stripe payment" 
        }, { status: 500 })
      }
    } else {
      // For other payment methods, activate immediately (demo mode)
      await subscription.update({
        status: 'active',
        current_period_start: currentDate,
        current_period_end: plan.billing_cycle === 'lifetime' ? null : new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days for monthly
      })

      console.log("Subscription activated with payment method:", paymentMethod)
    }

    // Return response for non-mobile money payments
    return NextResponse.json({ 
      success: true,
      message: "Payment successful! Subscription activated.",
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: {
          name: plan.name,
          display_name: plan.display_name,
          price: plan.price,
          billing_cycle: plan.billing_cycle
        },
        payment: {
          method: paymentMethod,
          processed_at: currentDate
        }
      }
    })

  } catch (error) {
    console.error("Subscription activation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
