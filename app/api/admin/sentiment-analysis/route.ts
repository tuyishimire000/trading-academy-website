import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"
import { ForumPost } from "@/lib/sequelize/models"
import { Op } from "sequelize"

// Mock AI sentiment analysis function
// In a real implementation, this would integrate with OpenAI, Azure Cognitive Services, or similar
const analyzeSentiment = async (text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number
  confidence: number
}> => {
  // Mock sentiment analysis logic
  const positiveWords = ['great', 'excellent', 'amazing', 'good', 'love', 'awesome', 'fantastic', 'wonderful', 'perfect', 'best']
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'disappointing', 'frustrated', 'angry', 'upset', 'poor']
  
  const lowerText = text.toLowerCase()
  let positiveCount = 0
  let negativeCount = 0
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g')
    const matches = lowerText.match(regex)
    if (matches) positiveCount += matches.length
  })
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g')
    const matches = lowerText.match(regex)
    if (matches) negativeCount += matches.length
  })
  
  const total = positiveCount + negativeCount
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
  let score = 0
  
  if (total > 0) {
    score = ((positiveCount - negativeCount) / total) * 100
    if (score > 20) sentiment = 'positive'
    else if (score < -20) sentiment = 'negative'
  }
  
  const confidence = Math.min(Math.abs(score) / 100, 0.95)
  
  return { sentiment, score, confidence }
}

export async function GET(request: Request) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin || error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const days = parseInt(url.searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch recent forum posts
    const posts = await ForumPost.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate
        }
      },
      order: [['created_at', 'DESC']],
      limit
    })

    // Analyze sentiment for each post
    const sentimentResults = await Promise.all(
      posts.map(async (post) => {
        const analysis = await analyzeSentiment(post.content + ' ' + post.title)
        return {
          postId: post.id,
          title: post.title,
          content: post.content,
          createdAt: post.created_at,
          sentiment: analysis.sentiment,
          score: analysis.score,
          confidence: analysis.confidence
        }
      })
    )

    // Calculate overall sentiment statistics
    const totalPosts = sentimentResults.length
    const positivePosts = sentimentResults.filter(p => p.sentiment === 'positive').length
    const negativePosts = sentimentResults.filter(p => p.sentiment === 'negative').length
    const neutralPosts = sentimentResults.filter(p => p.sentiment === 'neutral').length
    
    const averageScore = sentimentResults.reduce((sum, p) => sum + p.score, 0) / totalPosts
    const averageConfidence = sentimentResults.reduce((sum, p) => sum + p.confidence, 0) / totalPosts

    return NextResponse.json({
      analysis: {
        totalPosts,
        positivePosts,
        negativePosts,
        neutralPosts,
        averageScore: parseFloat(averageScore.toFixed(2)),
        averageConfidence: parseFloat(averageConfidence.toFixed(2)),
        sentimentDistribution: {
          positive: parseFloat(((positivePosts / totalPosts) * 100).toFixed(1)),
          negative: parseFloat(((negativePosts / totalPosts) * 100).toFixed(1)),
          neutral: parseFloat(((neutralPosts / totalPosts) * 100).toFixed(1))
        }
      },
      posts: sentimentResults
    })
  } catch (error) {
    console.error("Sentiment analysis error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin || error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text } = await request.json()
    
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const analysis = await analyzeSentiment(text)

    return NextResponse.json({
      text,
      sentiment: analysis.sentiment,
      score: analysis.score,
      confidence: analysis.confidence
    })
  } catch (error) {
    console.error("Sentiment analysis error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
