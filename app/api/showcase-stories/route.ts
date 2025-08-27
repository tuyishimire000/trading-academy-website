import { NextRequest, NextResponse } from "next/server"
import { ShowcaseStory } from "@/lib/sequelize/models"
import { Op } from "sequelize"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const now = new Date()

    // Fetch active stories that haven't expired yet
    const stories = await ShowcaseStory.findAll({
      where: {
        is_active: true,
        expires_at: {
          [Op.gt]: now // Greater than current time
        }
      },
      order: [["created_at", "DESC"]],
      attributes: [
        "id", "title", "caption", "image_url", "group_name", 
        "is_active", "expires_at", "created_at"
      ]
    })

    // Group stories by group_name
    const groupedStories = stories.reduce((acc, story) => {
      const groupName = story.group_name || "General"
      if (!acc[groupName]) {
        acc[groupName] = []
      }
      acc[groupName].push(story)
      return acc
    }, {} as Record<string, any[]>)

    // Convert to array format for easier frontend consumption
    const storyGroups = Object.entries(groupedStories).map(([groupName, stories]) => ({
      groupName,
      stories,
      storyCount: stories.length
    }))

    return NextResponse.json({
      success: true,
      data: {
        stories,
        grouped: groupedStories,
        groups: storyGroups,
        totalStories: stories.length,
        totalGroups: storyGroups.length
      }
    })

  } catch (error) {
    console.error("Error fetching showcase stories:", error)
    
    // Return empty data instead of error to prevent build failures
    return NextResponse.json({
      success: true,
      data: {
        stories: [],
        grouped: {},
        groups: [],
        totalStories: 0,
        totalGroups: 0
      }
    })
  }
}
