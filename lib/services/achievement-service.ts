import { Achievement, UserAchievement, UserPoints, PointsHistory, PointsReward, User, UserCourseProgress, ForumPost, PortfolioTrade, Event } from '@/lib/sequelize/models'
import { ensureDatabaseConnection } from '@/lib/sequelize/index'

export class AchievementService {
  /**
   * Check and award achievements for a user based on their actions
   */
  static async checkAndAwardAchievements(userId: string, actionType: string, actionData: any = {}) {
    try {
      await ensureDatabaseConnection()
      
      // Get all active achievements
      const achievements = await Achievement.findAll({
        where: { is_active: true },
        order: [['points', 'ASC']]
      })

      // Get user's current achievements and points
      const userAchievements = await UserAchievement.findAll({
        where: { user_id: userId },
        include: [{ model: Achievement, as: 'achievement' }]
      })

      const userPoints = await UserPoints.findOne({
        where: { user_id: userId }
      }) || await UserPoints.create({
        user_id: userId,
        total_points: 0,
        points_earned: 0,
        points_spent: 0,
        current_level: 'beginner'
      })

      const earnedAchievementIds = userAchievements.map(ua => ua.achievement_id)
      let totalPointsEarned = 0
      const newlyEarnedAchievements: any[] = []

      for (const achievement of achievements) {
        // Skip if already earned
        if (earnedAchievementIds.includes(achievement.id)) {
          continue
        }

        // Check if achievement criteria is met
        const criteria = achievement.criteria as any
        const isEarned = await this.checkAchievementCriteria(userId, achievement, actionType, actionData)

        if (isEarned) {
          // Award achievement
          await UserAchievement.create({
            user_id: userId,
            achievement_id: achievement.id,
            earned_at: new Date()
          })

          // Add points
          const points = achievement.points || 0
          totalPointsEarned += points

          // Record points history
          await PointsHistory.create({
            user_id: userId,
            points_change: points,
            action_type: 'achievement_earned',
            achievement_id: achievement.id,
            description: `Earned ${achievement.name} achievement`
          })

          newlyEarnedAchievements.push({
            ...achievement.toJSON(),
            points_earned: points
          })
        }
      }

      // Update user points if any achievements were earned
      if (totalPointsEarned > 0) {
        await userPoints.update({
          total_points: userPoints.total_points + totalPointsEarned,
          points_earned: userPoints.points_earned + totalPointsEarned,
          current_level: this.calculateUserLevel(userPoints.total_points + totalPointsEarned)
        })

        // Check for milestone achievements
        await this.checkMilestoneAchievements(userId, userPoints.total_points + totalPointsEarned)
      }

      return {
        newlyEarnedAchievements,
        totalPointsEarned,
        newTotalPoints: userPoints.total_points + totalPointsEarned
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
      throw error
    }
  }

  /**
   * Check if achievement criteria is met
   */
  private static async checkAchievementCriteria(userId: string, achievement: any, actionType: string, actionData: any): Promise<boolean> {
    const criteria = achievement.criteria as any

    try {
      switch (criteria.type) {
        case 'module_completion':
          return await this.checkModuleCompletion(userId, criteria.count)
        
        case 'course_completion':
          return await this.checkCourseCompletion(userId, criteria.count)
        
        case 'learning_streak':
          return await this.checkLearningStreak(userId, criteria.days)
        
        case 'forum_posts':
          return await this.checkForumPosts(userId, criteria.count)
        
        case 'post_upvotes':
          return await this.checkPostUpvotes(userId, criteria.count)
        
        case 'trade_log':
          return await this.checkTradeLog(userId, criteria.count)
        
        case 'profitable_trades':
          return await this.checkProfitableTrades(userId, criteria.count)
        
        case 'portfolio_growth':
          return await this.checkPortfolioGrowth(userId, criteria.percentage)
        
        case 'event_attendance':
          return await this.checkEventAttendance(userId, criteria.count)
        
        case 'subscription_upgrade':
          return await this.checkSubscriptionUpgrade(userId, criteria.plan)
        
        case 'early_join':
          return await this.checkEarlyJoin(userId, criteria.month)
        
        case 'referrals':
          return await this.checkReferrals(userId, criteria.count)
        
        case 'feedback_surveys':
          return await this.checkFeedbackSurveys(userId, criteria.count)
        
        case 'mobile_usage':
          return await this.checkMobileUsage(userId, criteria.days)
        
        case 'points_milestone':
          return await this.checkPointsMilestone(userId, criteria.points)
        
        default:
          return false
      }
    } catch (error) {
      console.error(`Error checking achievement criteria ${criteria.type}:`, error)
      return false
    }
  }

  /**
   * Check module completion criteria
   */
  private static async checkModuleCompletion(userId: string, requiredCount: number): Promise<boolean> {
    const completedModules = await UserCourseProgress.count({
      where: {
        user_id: userId,
        status: 'completed'
      }
    })
    return completedModules >= requiredCount
  }

  /**
   * Check course completion criteria
   */
  private static async checkCourseCompletion(userId: string, requiredCount: number): Promise<boolean> {
    const completedCourses = await UserCourseProgress.count({
      where: {
        user_id: userId,
        status: 'completed'
      }
    })
    return completedCourses >= requiredCount
  }

  /**
   * Check learning streak criteria
   */
  private static async checkLearningStreak(userId: string, requiredDays: number): Promise<boolean> {
    // This would need to be implemented based on your learning streak logic
    // For now, return false as placeholder
    return false
  }

  /**
   * Check forum posts criteria
   */
  private static async checkForumPosts(userId: string, requiredCount: number): Promise<boolean> {
    const postCount = await ForumPost.count({
      where: {
        user_id: userId,
        parent_id: null // Only count main posts, not replies
      }
    })
    return postCount >= requiredCount
  }

  /**
   * Check post upvotes criteria
   */
  private static async checkPostUpvotes(userId: string, requiredCount: number): Promise<boolean> {
    // This would need to be implemented based on your upvote system
    // For now, return false as placeholder
    return false
  }

  /**
   * Check trade log criteria
   */
  private static async checkTradeLog(userId: string, requiredCount: number): Promise<boolean> {
    const tradeCount = await PortfolioTrade.count({
      where: { user_id: userId }
    })
    return tradeCount >= requiredCount
  }

  /**
   * Check profitable trades criteria
   */
  private static async checkProfitableTrades(userId: string, requiredCount: number): Promise<boolean> {
    const profitableTrades = await PortfolioTrade.count({
      where: {
        user_id: userId,
        profit_loss: { [require('sequelize').Op.gt]: 0 }
      }
    })
    return profitableTrades >= requiredCount
  }

  /**
   * Check portfolio growth criteria
   */
  private static async checkPortfolioGrowth(userId: string, requiredPercentage: number): Promise<boolean> {
    // This would need to be implemented based on your portfolio tracking
    // For now, return false as placeholder
    return false
  }

  /**
   * Check event attendance criteria
   */
  private static async checkEventAttendance(userId: string, requiredCount: number): Promise<boolean> {
    // This would need to be implemented based on your event attendance tracking
    // For now, return false as placeholder
    return false
  }

  /**
   * Check subscription upgrade criteria
   */
  private static async checkSubscriptionUpgrade(userId: string, requiredPlan: string): Promise<boolean> {
    // This would need to be implemented based on your subscription system
    // For now, return false as placeholder
    return false
  }

  /**
   * Check early join criteria
   */
  private static async checkEarlyJoin(userId: string, requiredMonth: number): Promise<boolean> {
    const user = await User.findByPk(userId)
    if (!user) return false

    const userJoinMonth = new Date(user.created_at).getMonth() + 1
    return userJoinMonth <= requiredMonth
  }

  /**
   * Check referrals criteria
   */
  private static async checkReferrals(userId: string, requiredCount: number): Promise<boolean> {
    // This would need to be implemented based on your referral system
    // For now, return false as placeholder
    return false
  }

  /**
   * Check feedback surveys criteria
   */
  private static async checkFeedbackSurveys(userId: string, requiredCount: number): Promise<boolean> {
    // This would need to be implemented based on your feedback system
    // For now, return false as placeholder
    return false
  }

  /**
   * Check mobile usage criteria
   */
  private static async checkMobileUsage(userId: string, requiredDays: number): Promise<boolean> {
    // This would need to be implemented based on your mobile usage tracking
    // For now, return false as placeholder
    return false
  }

  /**
   * Check points milestone criteria
   */
  private static async checkPointsMilestone(userId: string, requiredPoints: number): Promise<boolean> {
    const userPoints = await UserPoints.findOne({
      where: { user_id: userId }
    })
    if (!userPoints) return false

    return userPoints.total_points >= requiredPoints
  }

  /**
   * Check for milestone achievements when points are updated
   */
  private static async checkMilestoneAchievements(userId: string, totalPoints: number): Promise<void> {
    const milestoneAchievements = await Achievement.findAll({
      where: {
        is_active: true,
        name: {
          [require('sequelize').Op.like]: '%Points%'
        }
      }
    })

    for (const achievement of milestoneAchievements) {
      const criteria = achievement.criteria as any
      if (criteria.type === 'points_milestone' && totalPoints >= criteria.points) {
        // Check if already earned
        const existing = await UserAchievement.findOne({
          where: {
            user_id: userId,
            achievement_id: achievement.id
          }
        })

        if (!existing) {
          await UserAchievement.create({
            user_id: userId,
            achievement_id: achievement.id,
            earned_at: new Date()
          })
        }
      }
    }
  }

  /**
   * Calculate user level based on total points
   */
  private static calculateUserLevel(totalPoints: number): string {
    if (totalPoints >= 10000) return 'legend'
    if (totalPoints >= 5000) return 'expert'
    if (totalPoints >= 2000) return 'advanced'
    if (totalPoints >= 1000) return 'intermediate'
    if (totalPoints >= 500) return 'beginner+'
    if (totalPoints >= 100) return 'beginner'
    return 'newcomer'
  }

  /**
   * Get user's achievement progress
   */
  static async getUserAchievementProgress(userId: string) {
    try {
      await ensureDatabaseConnection()

      const achievements = await Achievement.findAll({
        where: { is_active: true },
        include: [{
          model: UserAchievement,
          as: 'userAchievements',
          where: { user_id: userId },
          required: false
        }],
        order: [['points', 'ASC']]
      })

      const userPoints = await UserPoints.findOne({
        where: { user_id: userId }
      }) || { total_points: 0, current_level: 'beginner' }

      const pointsHistory = await PointsHistory.findAll({
        where: { user_id: userId },
        include: [{ model: Achievement, as: 'achievement' }],
        order: [['created_at', 'DESC']],
        limit: 10
      })

      return {
        achievements: achievements.map(achievement => ({
          ...achievement.toJSON(),
          is_earned: achievement.userAchievements && achievement.userAchievements.length > 0,
          earned_at: achievement.userAchievements?.[0]?.earned_at || null
        })),
        userPoints,
        pointsHistory,
        totalAchievements: achievements.filter(a => a.userAchievements && a.userAchievements.length > 0).length,
        totalPossibleAchievements: achievements.length
      }
    } catch (error) {
      console.error('Error getting user achievement progress:', error)
      throw error
    }
  }

  /**
   * Get available rewards for user
   */
  static async getAvailableRewards(userId: string) {
    try {
      await ensureDatabaseConnection()

      const userPoints = await UserPoints.findOne({
        where: { user_id: userId }
      })

      if (!userPoints) return []

      const rewards = await PointsReward.findAll({
        where: {
          is_active: true,
          points_required: { [require('sequelize').Op.lte]: userPoints.total_points }
        },
        order: [['points_required', 'ASC']]
      })

      return rewards.map(reward => ({
        ...reward.toJSON(),
        can_claim: userPoints.total_points >= reward.points_required,
        is_claimed: false // Since we don't track claimed status in current schema
      }))
    } catch (error) {
      console.error('Error getting available rewards:', error)
      throw error
    }
  }
}
