import { NextRequest, NextResponse } from "next/server"
import { Course, CourseCategory, SubscriptionPlan } from "@/lib/sequelize/models"

export async function POST(request: NextRequest) {
  try {
    // Seed Subscription Plans if not present (for required_plan checks)
    const planCount = await SubscriptionPlan.count()
    if (planCount === 0) {
      await SubscriptionPlan.bulkCreate([
        { name: "free", display_name: "Free", price: 0.00, billing_cycle: "monthly", features: {} },
        { name: "pro", display_name: "Pro", price: 99.99, billing_cycle: "monthly", features: {} },
        { name: "premium", display_name: "Premium", price: 29.99, billing_cycle: "monthly", features: {} },
      ])
    }

    // Create sample course categories
    const categoryCount = await CourseCategory.count().catch(() => 0)
    if (categoryCount === 0) {
      await CourseCategory.bulkCreate([
        {
          name: "Technical Analysis",
          description: "Learn chart patterns, indicators, and price action",
          icon: "📈",
          sort_order: 1,
          is_active: true
        },
        {
          name: "Risk Management",
          description: "Master position sizing and portfolio protection",
          icon: "🛡️",
          sort_order: 2,
          is_active: true
        },
        {
          name: "Psychology",
          description: "Develop the right mindset for trading success",
          icon: "🧠",
          sort_order: 3,
          is_active: true
        }
      ]).catch(() => null)
    }

    // Get categories for course creation
    const categories = await CourseCategory.findAll().catch(() => [])
    const techCategory = categories.find(c => c.name === "Technical Analysis")
    const riskCategory = categories.find(c => c.name === "Risk Management")
    const psychCategory = categories.find(c => c.name === "Psychology")

    // Create sample courses
    const courseCount = await Course.count().catch(() => 0)
    if (courseCount === 0) {
      await Course.bulkCreate([
        {
          category_id: techCategory?.id || null,
          title: "Candlestick Patterns Mastery",
          description: "Learn to read and interpret Japanese candlestick patterns for better trading decisions. This comprehensive course covers single and multiple candlestick patterns.",
          thumbnail_url: null,
          difficulty_level: "beginner",
          estimated_duration: 120,
          required_plan: "free",
          sort_order: 1,
          is_published: true
        },
        {
          category_id: techCategory?.id || null,
          title: "Advanced Chart Analysis",
          description: "Master advanced technical analysis techniques including Elliott Wave Theory, Fibonacci retracements, and complex chart patterns.",
          thumbnail_url: null,
          difficulty_level: "advanced",
          estimated_duration: 240,
          required_plan: "pro",
          sort_order: 2,
          is_published: true
        },
        {
          category_id: riskCategory?.id || null,
          title: "Position Sizing Fundamentals",
          description: "Learn how to properly size your positions to manage risk and maximize returns. Covers Kelly Criterion, fixed fractional, and percentage risk models.",
          thumbnail_url: null,
          difficulty_level: "intermediate",
          estimated_duration: 90,
          required_plan: "free",
          sort_order: 3,
          is_published: true
        },
        {
          category_id: riskCategory?.id || null,
          title: "Portfolio Risk Management",
          description: "Advanced portfolio management techniques for professional traders. Learn correlation analysis, VaR calculations, and hedging strategies.",
          thumbnail_url: null,
          difficulty_level: "advanced",
          estimated_duration: 180,
          required_plan: "premium",
          sort_order: 4,
          is_published: true
        },
        {
          category_id: psychCategory?.id || null,
          title: "Trading Psychology Basics",
          description: "Understand the psychological challenges of trading and develop mental frameworks for consistent performance.",
          thumbnail_url: null,
          difficulty_level: "beginner",
          estimated_duration: 75,
          required_plan: "free",
          sort_order: 5,
          is_published: true
        },
        {
          category_id: psychCategory?.id || null,
          title: "Advanced Trading Mindset",
          description: "Master advanced psychological concepts including cognitive biases, emotional regulation, and developing a winning trader's mindset.",
          thumbnail_url: null,
          difficulty_level: "advanced",
          estimated_duration: 150,
          required_plan: "premium",
          sort_order: 6,
          is_published: true
        }
      ]).catch(() => null)
    }

    return NextResponse.json({ 
      message: "Sample course data created successfully",
      categories: categories.length,
      courses: await Course.count().catch(() => 0)
    })

  } catch (error) {
    console.error("Error seeding courses:", error)
    return NextResponse.json(
      { error: "Failed to seed courses" },
      { status: 500 }
    )
  }
}
