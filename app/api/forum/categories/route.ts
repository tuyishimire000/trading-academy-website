import { NextRequest, NextResponse } from "next/server"
import { ForumCategory } from "@/lib/sequelize/models"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const categories = await ForumCategory.findAll({
      where: {
        is_active: true
      },
      order: [['sort_order', 'ASC']]
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Forum categories fetch error:', error)
    
    // Return empty array instead of error to prevent build failures
    return NextResponse.json([])
  }
}
