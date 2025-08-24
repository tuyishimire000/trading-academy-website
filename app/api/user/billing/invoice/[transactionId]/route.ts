import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth/server"
import { UserSubscriptionHistory, User, SubscriptionPlan } from "@/lib/sequelize/models"

export async function GET(
  request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = user.id
    const { transactionId } = params

    // Fetch the transaction record
    const transaction = await UserSubscriptionHistory.findOne({
      where: { 
        transaction_id: transactionId,
        user_id: userId
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["first_name", "last_name", "email"]
        },
        {
          model: SubscriptionPlan,
          as: "newPlan",
          attributes: ["display_name", "price", "billing_cycle"]
        }
      ]
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Generate simple invoice HTML (in a real app, you'd use a proper PDF library)
    const invoiceHtml = generateInvoiceHTML(transaction)

    // Return as HTML for now (in production, convert to PDF)
    return new NextResponse(invoiceHtml, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="invoice-${transactionId}.html"`
      }
    })

  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to generate invoice",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(transaction: any) {
  const user = transaction.user
  const plan = transaction.newPlan
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${transaction.transaction_id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .invoice-details { margin-bottom: 30px; }
        .customer-info { margin-bottom: 30px; }
        .items { margin-bottom: 30px; }
        .total { text-align: right; font-size: 18px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
        .logo { font-size: 24px; font-weight: bold; color: #f59e0b; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Trading Academy</div>
        <h1>INVOICE</h1>
        <p>Invoice #${transaction.transaction_id}</p>
        <p>Date: ${new Date(transaction.created_at).toLocaleDateString()}</p>
      </div>
      
      <div class="customer-info">
        <h3>Bill To:</h3>
        <p>${user.first_name} ${user.last_name}</p>
        <p>${user.email}</p>
      </div>
      
      <div class="items">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Billing Cycle</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${plan.display_name} Subscription</td>
              <td>${plan.billing_cycle}</td>
              <td>$${transaction.payment_amount}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="total">
        <p>Total: $${transaction.payment_amount}</p>
        <p>Payment Method: ${transaction.payment_method || 'N/A'}</p>
        <p>Status: ${transaction.payment_status || 'N/A'}</p>
      </div>
      
      <div style="margin-top: 50px; text-align: center; color: #666;">
        <p>Thank you for your business!</p>
        <p>Trading Academy</p>
      </div>
    </body>
    </html>
  `
}
