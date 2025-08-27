export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    if (url.searchParams.get('debug') === '1') {
      const mysql2Path = (() => { try { return require.resolve('mysql2/package.json') } catch { return 'not found' } })()
      const sequelizePath = (() => { try { return require.resolve('sequelize/package.json') } catch { return 'not found' } })()
      return NextResponse.json({
        debug: true,
        mysql2Path,
        sequelizePath,
        env: {
          MYSQL_HOST: process.env.MYSQL_HOST,
          MYSQL_DB: process.env.MYSQL_DB,
          hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        },
      })
    }
    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { SubscriptionPlan } = await import("@/lib/sequelize/models")
    await ensureDatabaseConnection()
    const plans = await SubscriptionPlan.findAll({ where: { is_active: true }, order: [["price", "ASC"]] })

    const normalized = plans.map((plan: any) => {
      const p = typeof plan.toJSON === "function" ? plan.toJSON() : plan
      let features = p.features
      if (typeof features === "string") {
        try {
          features = JSON.parse(features)
        } catch {
          features = null
        }
      }
      return {
        id: p.id,
        name: p.name,
        display_name: p.display_name,
        description: p.description,
        price: Number(p.price),
        billing_cycle: p.billing_cycle,
        features,
      }
    })

    return NextResponse.json({ plans: normalized })
  } catch (error) {
    console.error("Plans fetch error:", error)
    
    // Return empty data instead of error to prevent build failures
    return NextResponse.json({ plans: [] })
  }
}
