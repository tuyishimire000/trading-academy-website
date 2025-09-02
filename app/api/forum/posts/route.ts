import { NextRequest, NextResponse } from "next/server"
import { ForumPost, ForumCategory, User } from "@/lib/sequelize/models"
import { verifyAuth } from "@/lib/auth/server"
import { ensureDatabaseConnection } from "@/lib/sequelize/index"

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await ensureDatabaseConnection()
    
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const parentId = searchParams.get('parentId')
    const includeReplies = searchParams.get('includeReplies') === 'true'

    const where: any = {}
    if (categoryId) where.category_id = categoryId
    if (parentId) where.parent_id = parentId
    if (!parentId) where.parent_id = null // Only top-level posts

    const posts = await ForumPost.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: ForumCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        ...(includeReplies ? [{
          model: ForumPost,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'first_name', 'last_name', 'email']
            },
            // Recursively include nested replies
            {
              model: ForumPost,
              as: 'replies',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'first_name', 'last_name', 'email']
                }
              ],
              order: [['created_at', 'ASC']]
            }
          ],
          order: [['created_at', 'ASC']]
        }] : [])
      ],
      order: [['created_at', 'DESC']],
      limit: 50
    })

    // If we're fetching top-level posts and want replies, also fetch user votes
    if (!parentId && includeReplies) {
      const { UserVote } = await import('@/lib/sequelize/models')
      const user = await verifyAuth(request)
      
      if (user) {
        // Collect all post IDs (main posts, replies, and nested replies)
        const allPostIds = new Set<string>()
        posts.forEach(post => {
          allPostIds.add(post.id)
          if (post.replies) {
            post.replies.forEach(reply => {
              allPostIds.add(reply.id)
              if (reply.replies) {
                reply.replies.forEach(nestedReply => {
                  allPostIds.add(nestedReply.id)
                })
              }
            })
          }
        })

        // Fetch user votes for all posts
        const userVotes = await UserVote.findAll({
          where: {
            user_id: user.id,
            post_id: Array.from(allPostIds)
          }
        })

        // Attach user votes to posts
        posts.forEach(post => {
          const userVote = userVotes.find(v => v.post_id === post.id)
          if (userVote) {
            (post as any).user_vote = userVote.vote_type
          }
          
          // Attach user votes to replies
          if (post.replies) {
            post.replies.forEach(reply => {
              const replyVote = userVotes.find(v => v.post_id === reply.id)
              if (replyVote) {
                (reply as any).user_vote = replyVote.vote_type
              }
              
              // Attach user votes to nested replies
              if (reply.replies) {
                reply.replies.forEach(nestedReply => {
                  const nestedVote = userVotes.find(v => v.post_id === nestedReply.id)
                  if (nestedVote) {
                    (nestedReply as any).user_vote = nestedVote.vote_type
                  }
                })
              }
            })
          }
        })
      }
    }



    return NextResponse.json(posts)
  } catch (error) {
    console.error('Forum posts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forum posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    await ensureDatabaseConnection()
    
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { categoryId, parentId, title, content } = body



    const post = await ForumPost.create({
      user_id: user.id,
      category_id: categoryId,
      parent_id: parentId || null,
      title: title || null,
      content
    })

    // Fetch the created post with user and category information
    const createdPost = await ForumPost.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: ForumCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    })

    return NextResponse.json(createdPost)
  } catch (error) {
    console.error('Forum post creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create forum post' },
      { status: 500 }
    )
  }
}
