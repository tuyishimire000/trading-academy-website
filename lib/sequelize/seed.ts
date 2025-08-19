import { ensureDatabaseConnection, sequelize } from "./index"
import { Course, CourseCategory, SubscriptionPlan } from "./models"

export async function seedDatabase(): Promise<void> {
  await ensureDatabaseConnection()

  await sequelize.sync({ alter: true })

  const planCount = await SubscriptionPlan.count()
  if (planCount === 0) {
    await SubscriptionPlan.bulkCreate([
      {
        name: "basic",
        display_name: "Basic",
        description: "Perfect for beginners",
        price: 14.99,
        billing_cycle: "monthly",
        features: {
          features: [
            "Basic trading strategies",
            "Discord community access",
            "Weekly market updates",
            "Email support",
            "Mobile app access",
          ],
        },
      },
      {
        name: "pro",
        display_name: "Pro",
        description: "For serious traders",
        price: 24.99,
        billing_cycle: "monthly",
        features: {
          features: [
            "All Basic features",
            "Advanced trading strategies",
            "Live trading sessions (3x/week)",
            "Priority Discord support",
            "1-on-1 monthly session",
            "Trading signals & alerts",
          ],
        },
      },
      {
        name: "elite",
        display_name: "Elite",
        description: "Lifetime access",
        price: 499.99,
        billing_cycle: "lifetime",
        features: {
          features: [
            "All Pro features",
            "Lifetime access to all content",
            "Exclusive VIP Discord channels",
            "Weekly 1-on-1 sessions",
            "Portfolio review & optimization",
            "Direct access to head trader",
          ],
        },
      },
    ])
  }

  const categoryCount = await CourseCategory.count()
  if (categoryCount === 0) {
    await CourseCategory.bulkCreate([
      { name: "fundamentals", description: "Trading Fundamentals", icon: "BookOpen", sort_order: 1 },
      { name: "technical-analysis", description: "Technical Analysis", icon: "BarChart3", sort_order: 2 },
      { name: "risk-management", description: "Risk Management", icon: "Shield", sort_order: 3 },
      { name: "psychology", description: "Trading Psychology", icon: "Brain", sort_order: 4 },
      { name: "strategies", description: "Trading Strategies", icon: "Target", sort_order: 5 },
      { name: "crypto", description: "Cryptocurrency Trading", icon: "Bitcoin", sort_order: 6 },
    ])
  }

  const coursesCount = await Course.count()
  if (coursesCount === 0) {
    const fundamentals = await CourseCategory.findOne({ where: { name: "fundamentals" } })
    const technical = await CourseCategory.findOne({ where: { name: "technical-analysis" } })
    const risk = await CourseCategory.findOne({ where: { name: "risk-management" } })
    const psychology = await CourseCategory.findOne({ where: { name: "psychology" } })
    const strategies = await CourseCategory.findOne({ where: { name: "strategies" } })
    const crypto = await CourseCategory.findOne({ where: { name: "crypto" } })

    await Course.bulkCreate([
      {
        category_id: fundamentals?.id || null,
        title: "Trading Basics: Getting Started",
        description:
          "Learn the fundamental concepts of trading, market structure, and basic terminology.",
        difficulty_level: "beginner",
        estimated_duration: 120,
        required_plan: "basic",
        sort_order: 1,
        is_published: true,
      },
      {
        category_id: technical?.id || null,
        title: "Chart Patterns Masterclass",
        description: "Identify and trade the most profitable chart patterns in any market.",
        difficulty_level: "intermediate",
        estimated_duration: 180,
        required_plan: "pro",
        sort_order: 1,
        is_published: true,
      },
      {
        category_id: risk?.id || null,
        title: "Risk Management Fundamentals",
        description: "Learn how to protect your capital and manage risk effectively.",
        difficulty_level: "beginner",
        estimated_duration: 150,
        required_plan: "basic",
        sort_order: 1,
        is_published: true,
      },
      {
        category_id: psychology?.id || null,
        title: "Trading Psychology Mastery",
        description: "Overcome emotional trading and develop a winning mindset.",
        difficulty_level: "intermediate",
        estimated_duration: 200,
        required_plan: "pro",
        sort_order: 1,
        is_published: true,
      },
      {
        category_id: strategies?.id || null,
        title: "Scalping Strategies",
        description: "Learn high-frequency trading strategies for quick profits.",
        difficulty_level: "advanced",
        estimated_duration: 180,
        required_plan: "pro",
        sort_order: 1,
        is_published: true,
      },
      {
        category_id: crypto?.id || null,
        title: "Cryptocurrency Trading Guide",
        description: "Complete guide to trading Bitcoin, Ethereum, and altcoins.",
        difficulty_level: "intermediate",
        estimated_duration: 300,
        required_plan: "pro",
        sort_order: 1,
        is_published: true,
      },
    ])
  }
}




