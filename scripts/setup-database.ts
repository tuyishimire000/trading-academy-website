import { sequelize } from '../lib/sequelize/index'
import {
  User,
  SubscriptionPlan,
  CourseCategory,
  Course,
  CourseModule,
  UserProgress,
  Event,
  Notification,
  ForumCategory,
  ForumPost,
  PortfolioPosition,
  PortfolioTrade,
  Achievement,
  UserAchievement,
  UserSubscription
} from '../lib/sequelize/models'
import bcrypt from 'bcrypt'

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...')
    
    // Sync all models
    await sequelize.sync({ force: true })
    console.log('✅ Database tables created')

    // Create subscription plans
    const plans = await SubscriptionPlan.bulkCreate([
      {
        name: 'basic',
        display_name: 'Basic Plan',
        description: 'Perfect for beginners starting their trading journey',
        price: 0,
        billing_cycle: 'monthly',
        features: {
          courses: 3,
          events: 2,
          community: true,
          portfolio: false,
          support: 'email'
        }
      },
      {
        name: 'premium',
        display_name: 'Premium Plan',
        description: 'Advanced features for serious traders',
        price: 29.99,
        billing_cycle: 'monthly',
        features: {
          courses: 'unlimited',
          events: 'unlimited',
          community: true,
          portfolio: true,
          support: 'priority',
          analytics: true
        }
      },
      {
        name: 'pro',
        display_name: 'Pro Plan',
        description: 'Professional tools for experienced traders',
        price: 99.99,
        billing_cycle: 'monthly',
        features: {
          courses: 'unlimited',
          events: 'unlimited',
          community: true,
          portfolio: true,
          support: 'dedicated',
          analytics: true,
          api_access: true,
          custom_alerts: true
        }
      }
    ])
    console.log('✅ Subscription plans created')

    // Create course categories
    const categories = await CourseCategory.bulkCreate([
      {
        name: 'Trading Fundamentals',
        description: 'Learn the basics of trading and market analysis',
        icon: '📊',
        sort_order: 1
      },
      {
        name: 'Technical Analysis',
        description: 'Master chart patterns and technical indicators',
        icon: '📈',
        sort_order: 2
      },
      {
        name: 'Risk Management',
        description: 'Protect your capital with proper risk management',
        icon: '🛡️',
        sort_order: 3
      },
      {
        name: 'Advanced Strategies',
        description: 'Sophisticated trading strategies for experienced traders',
        icon: '🎯',
        sort_order: 4
      }
    ])
    console.log('✅ Course categories created')

    // Create courses
    const courses = await Course.bulkCreate([
      {
        category_id: categories[0].id,
        title: 'Introduction to Trading',
        description: 'Learn the fundamentals of trading and market basics',
        thumbnail_url: '/api/placeholder/400/250',
        difficulty_level: 'beginner',
        estimated_duration: 120,
        required_plan: 'basic',
        sort_order: 1,
        is_published: true
      },
      {
        category_id: categories[0].id,
        title: 'Market Psychology',
        description: 'Understand market psychology and emotional control',
        thumbnail_url: '/api/placeholder/400/250',
        difficulty_level: 'beginner',
        estimated_duration: 90,
        required_plan: 'basic',
        sort_order: 2,
        is_published: true
      },
      {
        category_id: categories[1].id,
        title: 'Technical Analysis Basics',
        description: 'Learn chart patterns and basic technical indicators',
        thumbnail_url: '/api/placeholder/400/250',
        difficulty_level: 'intermediate',
        estimated_duration: 180,
        required_plan: 'premium',
        sort_order: 1,
        is_published: true
      },
      {
        category_id: categories[1].id,
        title: 'Advanced Chart Patterns',
        description: 'Master complex chart patterns and their applications',
        thumbnail_url: '/api/placeholder/400/250',
        difficulty_level: 'advanced',
        estimated_duration: 240,
        required_plan: 'premium',
        sort_order: 2,
        is_published: true
      },
      {
        category_id: categories[2].id,
        title: 'Risk Management Fundamentals',
        description: 'Learn essential risk management techniques',
        thumbnail_url: '/api/placeholder/400/250',
        difficulty_level: 'intermediate',
        estimated_duration: 150,
        required_plan: 'premium',
        sort_order: 1,
        is_published: true
      }
    ])
    console.log('✅ Courses created')

    // Create course modules
    const modules = await CourseModule.bulkCreate([
      {
        course_id: courses[0].id,
        title: 'What is Trading?',
        description: 'Introduction to the world of trading',
        content_type: 'video',
        content_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: 15,
        sort_order: 1,
        is_published: true
      },
      {
        course_id: courses[0].id,
        title: 'Market Types',
        description: 'Understanding different market types',
        content_type: 'video',
        content_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: 20,
        sort_order: 2,
        is_published: true
      },
      {
        course_id: courses[0].id,
        title: 'Trading Quiz',
        description: 'Test your knowledge of trading basics',
        content_type: 'quiz',
        duration: 10,
        sort_order: 3,
        is_published: true
      },
      {
        course_id: courses[2].id,
        title: 'Support and Resistance',
        description: 'Learn about support and resistance levels',
        content_type: 'video',
        content_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: 25,
        sort_order: 1,
        is_published: true
      },
      {
        course_id: courses[2].id,
        title: 'Moving Averages',
        description: 'Understanding moving averages',
        content_type: 'video',
        content_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: 30,
        sort_order: 2,
        is_published: true
      }
    ])
    console.log('✅ Course modules created')

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10)
    const users = await User.bulkCreate([
      {
        email: 'admin@tradingacademy.com',
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        is_admin: true,
        email_verified_at: new Date()
      },
      {
        email: 'john.doe@example.com',
        password_hash: hashedPassword,
        first_name: 'John',
        last_name: 'Doe',
        is_admin: false,
        email_verified_at: new Date()
      },
      {
        email: 'jane.smith@example.com',
        password_hash: hashedPassword,
        first_name: 'Jane',
        last_name: 'Smith',
        is_admin: false,
        email_verified_at: new Date()
      }
    ])
    console.log('✅ Users created')

    // Create user subscriptions
    await UserSubscription.bulkCreate([
      {
        user_id: users[1].id,
        plan_id: plans[1].id, // Premium plan
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        user_id: users[2].id,
        plan_id: plans[0].id, // Basic plan
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ])
    console.log('✅ User subscriptions created')

    // Create user progress
    await UserProgress.bulkCreate([
      {
        user_id: users[1].id,
        course_id: courses[0].id,
        module_id: modules[0].id,
        progress_percentage: 75.0,
        last_accessed_at: new Date()
      },
      {
        user_id: users[1].id,
        course_id: courses[2].id,
        module_id: modules[3].id,
        progress_percentage: 45.0,
        last_accessed_at: new Date()
      },
      {
        user_id: users[2].id,
        course_id: courses[0].id,
        module_id: modules[1].id,
        progress_percentage: 30.0,
        last_accessed_at: new Date()
      }
    ])
    console.log('✅ User progress created')

    // Create events
    await Event.bulkCreate([
      {
        title: 'Live Trading Session',
        description: 'Join us for a live trading session where we analyze current market conditions',
        event_type: 'webinar',
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
        timezone: 'America/New_York',
        meeting_url: 'https://zoom.us/j/123456789',
        max_participants: 100,
        required_plan: 'premium',
        instructor_id: users[0].id,
        status: 'scheduled'
      },
      {
        title: 'Market Analysis Workshop',
        description: 'Learn how to analyze market trends and make informed decisions',
        event_type: 'workshop',
        start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        timezone: 'America/New_York',
        meeting_url: 'https://zoom.us/j/987654321',
        max_participants: 50,
        required_plan: 'premium',
        instructor_id: users[0].id,
        status: 'scheduled'
      },
      {
        title: 'Risk Management Seminar',
        description: 'Essential risk management strategies for traders',
        event_type: 'seminar',
        start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1.5 hours later
        timezone: 'America/New_York',
        meeting_url: 'https://zoom.us/j/456789123',
        max_participants: 200,
        required_plan: 'basic',
        instructor_id: users[0].id,
        status: 'scheduled'
      }
    ])
    console.log('✅ Events created')

    // Create notifications
    await Notification.bulkCreate([
      {
        user_id: users[1].id,
        type: 'course',
        title: 'New Course Available',
        message: 'Advanced Technical Analysis course is now available for Premium members.',
        data: { courseId: courses[3].id }
      },
      {
        user_id: users[1].id,
        type: 'event',
        title: 'Live Trading Session',
        message: 'Join our live trading session today at 2:00 PM EST.',
        data: { eventId: 'event-1' }
      },
      {
        user_id: users[1].id,
        type: 'achievement',
        title: 'Course Completed!',
        message: 'Congratulations! You\'ve completed the "Introduction to Trading" course.',
        data: { courseId: courses[0].id },
        read_at: new Date()
      }
    ])
    console.log('✅ Notifications created')

    // Create forum categories
    const forumCategories = await ForumCategory.bulkCreate([
      {
        name: 'General Discussion',
        description: 'General trading discussions and questions',
        slug: 'general',
        sort_order: 1
      },
      {
        name: 'Trading Strategies',
        description: 'Share and discuss trading strategies',
        slug: 'strategies',
        sort_order: 2
      },
      {
        name: 'Market Analysis',
        description: 'Market analysis and insights',
        slug: 'analysis',
        sort_order: 3
      },
      {
        name: 'Help & Support',
        description: 'Get help with platform and trading questions',
        slug: 'help',
        sort_order: 4
      }
    ])
    console.log('✅ Forum categories created')

    // Create forum posts
    const forumPosts = await ForumPost.bulkCreate([
      {
        user_id: users[1].id,
        category_id: forumCategories[0].id,
        title: 'What\'s everyone\'s thoughts on the current market volatility?',
        content: 'I\'m seeing some interesting patterns in the S&P 500. What\'s everyone\'s take on the current market conditions?',
        likes_count: 8,
        dislikes_count: 1
      },
      {
        user_id: users[2].id,
        category_id: forumCategories[0].id,
        title: 'Just completed the Advanced Technical Analysis course!',
        content: 'The Fibonacci retracement section was incredibly helpful. Highly recommend!',
        likes_count: 15,
        dislikes_count: 0
      }
    ])
    console.log('✅ Forum posts created')

    // Create forum replies
    await ForumPost.bulkCreate([
      {
        user_id: users[0].id,
        category_id: forumCategories[0].id,
        parent_id: forumPosts[0].id,
        content: 'I\'ve been watching the VIX closely. The current levels suggest we might see a breakout soon.',
        likes_count: 5,
        dislikes_count: 0
      }
    ])
    console.log('✅ Forum replies created')

    // Create portfolio positions
    await PortfolioPosition.bulkCreate([
      {
        user_id: users[1].id,
        symbol: 'AAPL',
        quantity: 50,
        avg_price: 150.00,
        current_price: 165.00
      },
      {
        user_id: users[1].id,
        symbol: 'TSLA',
        quantity: 30,
        avg_price: 200.00,
        current_price: 185.00
      },
      {
        user_id: users[1].id,
        symbol: 'NVDA',
        quantity: 25,
        avg_price: 300.00,
        current_price: 350.00
      }
    ])
    console.log('✅ Portfolio positions created')

    // Create portfolio trades
    await PortfolioTrade.bulkCreate([
      {
        user_id: users[1].id,
        symbol: 'AAPL',
        trade_type: 'buy',
        quantity: 20,
        price: 155.00,
        profit_loss: 200.00,
        status: 'closed'
      },
      {
        user_id: users[1].id,
        symbol: 'TSLA',
        trade_type: 'sell',
        quantity: 10,
        price: 190.00,
        profit_loss: -100.00,
        status: 'closed'
      }
    ])
    console.log('✅ Portfolio trades created')

    // Create achievements
    const achievements = await Achievement.bulkCreate([
      {
        name: 'First Course Completed',
        description: 'Completed your first trading course',
        icon: '🎓',
        points: 100,
        criteria: { type: 'course_completion', count: 1 }
      },
      {
        name: 'Consistent Learner',
        description: '7 days of consecutive learning',
        icon: '🔥',
        points: 50,
        criteria: { type: 'consecutive_days', count: 7 }
      },
      {
        name: 'Portfolio Growth',
        description: 'Achieved 10% portfolio growth',
        icon: '📈',
        points: 200,
        criteria: { type: 'portfolio_growth', percentage: 10 }
      },
      {
        name: 'Community Contributor',
        description: 'Made 10 forum posts',
        icon: '💬',
        points: 75,
        criteria: { type: 'forum_posts', count: 10 }
      }
    ])
    console.log('✅ Achievements created')

    // Create user achievements
    await UserAchievement.bulkCreate([
      {
        user_id: users[1].id,
        achievement_id: achievements[0].id
      },
      {
        user_id: users[1].id,
        achievement_id: achievements[1].id
      }
    ])
    console.log('✅ User achievements created')

    console.log('🎉 Database setup completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`- ${plans.length} subscription plans`)
    console.log(`- ${categories.length} course categories`)
    console.log(`- ${courses.length} courses`)
    console.log(`- ${modules.length} course modules`)
    console.log(`- ${users.length} users`)
    console.log(`- ${forumCategories.length} forum categories`)
    console.log(`- ${achievements.length} achievements`)

  } catch (error) {
    console.error('❌ Error setting up database:', error)
    throw error
  } finally {
    await sequelize.close()
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('✅ Database setup completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  })
