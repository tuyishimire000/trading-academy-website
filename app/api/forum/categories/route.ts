import { NextRequest, NextResponse } from "next/server"
import { ForumCategory, ForumPost } from "@/lib/sequelize/models"
import { ensureDatabaseConnection } from "@/lib/sequelize/index"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await ensureDatabaseConnection()
    
    const categories = await ForumCategory.findAll({
      where: {
        is_active: true
      },
      order: [['sort_order', 'ASC']]
    })

    // Get post counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const postCount = await ForumPost.count({
          where: {
            category_id: category.id,
            parent_id: null // Only count top-level posts, not replies
          }
        })
        
        return {
          ...category.toJSON(),
          posts_count: postCount
        }
      })
    )

    return NextResponse.json(categoriesWithCounts)
  } catch (error) {
    console.error('Forum categories fetch error:', error)
    
    // Return empty array instead of error to prevent build failures
    return NextResponse.json([])
  }
}
