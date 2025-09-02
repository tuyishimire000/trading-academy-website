import { DataTypes, Model, Optional } from "sequelize"
import { sequelize } from "./index"

// Users
interface UserAttributes {
  id: string
  email: string
  password_hash: string
  first_name: string | null
  last_name: string | null
  phone_number: string | null
  is_admin: boolean
  email_verified_at: Date | null
  forum_suspended: boolean
  suspension_reason: string | null
  suspended_at: Date | null
  suspended_until: Date | null
  reset_token: string | null
  reset_token_expires_at: Date | null
  created_at: Date
  updated_at: Date
}

type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "first_name" | "last_name" | "is_admin" | "email_verified_at" | "forum_suspended" | "suspension_reason" | "suspended_at" | "suspended_until" | "created_at" | "updated_at"
>

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string
  declare email: string
  declare password_hash: string
  declare first_name: string | null
  declare last_name: string | null
  declare phone_number: string | null
  declare is_admin: boolean
  declare email_verified_at: Date | null
  declare forum_suspended: boolean
  declare suspension_reason: string | null
  declare suspended_at: Date | null
  declare suspended_until: Date | null
  declare reset_token: string | null
  declare reset_token_expires_at: Date | null
  declare created_at: Date
  declare updated_at: Date
}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    first_name: { type: DataTypes.STRING(100), allowNull: true },
    last_name: { type: DataTypes.STRING(100), allowNull: true },
    phone_number: { type: DataTypes.STRING(20), allowNull: true },
    is_admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    email_verified_at: { type: DataTypes.DATE, allowNull: true },
    forum_suspended: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    suspension_reason: { type: DataTypes.TEXT, allowNull: true },
    suspended_at: { type: DataTypes.DATE, allowNull: true },
    suspended_until: { type: DataTypes.DATE, allowNull: true },
    reset_token: { type: DataTypes.STRING(255), allowNull: true },
    reset_token_expires_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "users", tableName: "users", timestamps: false }
)

// Subscription Plans
interface SubscriptionPlanAttributes {
  id: string
  name: string
  display_name: string
  description: string | null
  price: number
  billing_cycle: string
  features: object | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

type SubscriptionPlanCreation = Optional<
  SubscriptionPlanAttributes,
  "id" | "description" | "features" | "is_active" | "created_at" | "updated_at"
>

export class SubscriptionPlan
  extends Model<SubscriptionPlanAttributes, SubscriptionPlanCreation>
  implements SubscriptionPlanAttributes
{
  declare id: string
  declare name: string
  declare display_name: string
  declare description: string | null
  declare price: number
  declare billing_cycle: string
  declare features: object | null
  declare is_active: boolean
  declare created_at: Date
  declare updated_at: Date
}

SubscriptionPlan.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    display_name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    billing_cycle: { type: DataTypes.STRING(20), allowNull: false },
    features: { type: DataTypes.JSON, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "subscription_plans", tableName: "subscription_plans", timestamps: false }
)

// Course Categories
interface CourseCategoryAttributes {
  id: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: Date
}

type CourseCategoryCreation = Optional<
  CourseCategoryAttributes,
  "id" | "description" | "icon" | "sort_order" | "is_active" | "created_at"
>

export class CourseCategory
  extends Model<CourseCategoryAttributes, CourseCategoryCreation>
  implements CourseCategoryAttributes
{
  declare id: string
  declare name: string
  declare description: string | null
  declare icon: string | null
  declare sort_order: number
  declare is_active: boolean
  declare created_at: Date
}

CourseCategory.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    icon: { type: DataTypes.STRING(50), allowNull: true },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "course_categories", tableName: "course_categories", timestamps: false }
)

// Courses
interface CourseAttributes {
  id: string
  category_id: string | null
  title: string
  description: string | null
  thumbnail_url: string | null
  difficulty_level: string
  estimated_duration: number | null
  required_plan: string
  sort_order: number
  is_published: boolean
  created_at: Date
  updated_at: Date
}

type CourseCreation = Optional<
  CourseAttributes,
  | "id"
  | "category_id"
  | "description"
  | "thumbnail_url"
  | "estimated_duration"
  | "sort_order"
  | "is_published"
  | "created_at"
  | "updated_at"
>

export class Course extends Model<CourseAttributes, CourseCreation> implements CourseAttributes {
  declare id: string
  declare category_id: string | null
  declare title: string
  declare description: string | null
  declare thumbnail_url: string | null
  declare difficulty_level: string
  declare estimated_duration: number | null
  declare required_plan: string
  declare sort_order: number
  declare is_published: boolean
  declare created_at: Date
  declare updated_at: Date
}

Course.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    category_id: { type: DataTypes.UUID, allowNull: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    thumbnail_url: { type: DataTypes.TEXT, allowNull: true },
    difficulty_level: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "beginner" },
    estimated_duration: { type: DataTypes.INTEGER, allowNull: true },
    required_plan: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "basic" },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "courses", tableName: "courses", timestamps: false }
)

// Course Modules
interface CourseModuleAttributes {
  id: string
  course_id: string
  title: string
  description: string | null
  content_type: string
  content_url: string | null
  duration: number | null
  sort_order: number
  is_published: boolean
  created_at: Date
  updated_at: Date
}

type CourseModuleCreation = Optional<
  CourseModuleAttributes,
  | "id"
  | "description"
  | "content_url"
  | "duration"
  | "sort_order"
  | "is_published"
  | "created_at"
  | "updated_at"
>

export class CourseModule extends Model<CourseModuleAttributes, CourseModuleCreation> implements CourseModuleAttributes {
  declare id: string
  declare course_id: string
  declare title: string
  declare description: string | null
  declare content_type: string
  declare content_url: string | null
  declare duration: number | null
  declare sort_order: number
  declare is_published: boolean
  declare created_at: Date
  declare updated_at: Date
}

CourseModule.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    course_id: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    content_type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "video" },
    content_url: { type: DataTypes.TEXT, allowNull: true },
    duration: { type: DataTypes.INTEGER, allowNull: true },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "course_modules", tableName: "course_modules", timestamps: false }
)

// User Course Progress
interface UserCourseProgressAttributes {
  id: string
  user_id: string
  course_id: string
  status: string
  progress_percentage: number
  started_at: Date | null
  completed_at: Date | null
  last_accessed: Date | null
}

type UserCourseProgressCreation = Optional<
  UserCourseProgressAttributes,
  | "id"
  | "status"
  | "progress_percentage"
  | "started_at"
  | "completed_at"
  | "last_accessed"
>

export class UserCourseProgress extends Model<UserCourseProgressAttributes, UserCourseProgressCreation> implements UserCourseProgressAttributes {
  declare id: string
  declare user_id: string
  declare course_id: string
  declare status: string
  declare progress_percentage: number
  declare started_at: Date | null
  declare completed_at: Date | null
  declare last_accessed: Date | null
}

UserCourseProgress.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    course_id: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'not_started' },
    progress_percentage: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    started_at: { type: DataTypes.DATE, allowNull: true },
    completed_at: { type: DataTypes.DATE, allowNull: true },
    last_accessed: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: "user_course_progress", tableName: "user_course_progress", timestamps: false }
)

// Events
interface EventAttributes {
  id: string
  title: string
  description: string | null
  event_type: string
  start_time: Date
  end_time: Date
  timezone: string | null
  meeting_url: string | null
  max_participants: number | null
  required_plan: string
  instructor_id: string | null
  is_recurring: boolean
  recurrence_pattern: object | null
  status: string
  created_at: Date
  updated_at: Date
}

type EventCreation = Optional<
  EventAttributes,
  | "id"
  | "description"
  | "timezone"
  | "meeting_url"
  | "max_participants"
  | "instructor_id"
  | "is_recurring"
  | "recurrence_pattern"
  | "status"
  | "created_at"
  | "updated_at"
>

export class Event extends Model<EventAttributes, EventCreation> implements EventAttributes {
  declare id: string
  declare title: string
  declare description: string | null
  declare event_type: string
  declare start_time: Date
  declare end_time: Date
  declare timezone: string | null
  declare meeting_url: string | null
  declare max_participants: number | null
  declare required_plan: string
  declare instructor_id: string | null
  declare is_recurring: boolean
  declare recurrence_pattern: object | null
  declare status: string
  declare created_at: Date
  declare updated_at: Date
}

Event.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    event_type: { type: DataTypes.STRING(50), allowNull: false },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    timezone: { type: DataTypes.STRING(50), allowNull: true },
    meeting_url: { type: DataTypes.TEXT, allowNull: true },
    max_participants: { type: DataTypes.INTEGER, allowNull: true },
    required_plan: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "basic" },
    instructor_id: { type: DataTypes.UUID, allowNull: true },
    is_recurring: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    recurrence_pattern: { type: DataTypes.JSON, allowNull: true },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "scheduled" },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "events", tableName: "events", timestamps: false }
)

// Notifications
interface NotificationAttributes {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data: object | null
  read_at: Date | null
  created_at: Date
}

type NotificationCreation = Optional<
  NotificationAttributes,
  | "id"
  | "data"
  | "read_at"
  | "created_at"
>

export class Notification extends Model<NotificationAttributes, NotificationCreation> implements NotificationAttributes {
  declare id: string
  declare user_id: string
  declare type: string
  declare title: string
  declare message: string
  declare data: object | null
  declare read_at: Date | null
  declare created_at: Date
}

Notification.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.STRING(50), allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    data: { type: DataTypes.JSON, allowNull: true },
    read_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "notifications", tableName: "notifications", timestamps: false }
)

// Forum Categories
interface ForumCategoryAttributes {
  id: string
  name: string
  description: string | null
  slug: string
  sort_order: number
  is_active: boolean
  created_at: Date
}

type ForumCategoryCreation = Optional<
  ForumCategoryAttributes,
  | "id"
  | "description"
  | "sort_order"
  | "is_active"
  | "created_at"
>

export class ForumCategory extends Model<ForumCategoryAttributes, ForumCategoryCreation> implements ForumCategoryAttributes {
  declare id: string
  declare name: string
  declare description: string | null
  declare slug: string
  declare sort_order: number
  declare is_active: boolean
  declare created_at: Date
}

ForumCategory.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "forum_categories", tableName: "forum_categories", timestamps: false }
)

// Forum Posts
interface ForumPostAttributes {
  id: string
  user_id: string
  category_id: string
  parent_id: string | null
  title: string | null
  content: string
  likes_count: number
  dislikes_count: number
  is_edited: boolean
  created_at: Date
  updated_at: Date
}

type ForumPostCreation = Optional<
  ForumPostAttributes,
  | "id"
  | "parent_id"
  | "title"
  | "likes_count"
  | "dislikes_count"
  | "is_edited"
  | "created_at"
  | "updated_at"
>

export class ForumPost extends Model<ForumPostAttributes, ForumPostCreation> implements ForumPostAttributes {
  declare id: string
  declare user_id: string
  declare category_id: string
  declare parent_id: string | null
  declare title: string | null
  declare content: string
  declare likes_count: number
  declare dislikes_count: number
  declare is_edited: boolean
  declare created_at: Date
  declare updated_at: Date
}

ForumPost.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    category_id: { type: DataTypes.UUID, allowNull: false },
    parent_id: { type: DataTypes.UUID, allowNull: true },
    title: { type: DataTypes.STRING(200), allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    likes_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    dislikes_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    is_edited: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "forum_posts", tableName: "forum_posts", timestamps: false }
)

// Portfolio Positions
interface PortfolioPositionAttributes {
  id: string
  user_id: string
  symbol: string
  quantity: number
  avg_price: number
  current_price: number
  created_at: Date
  updated_at: Date
}

type PortfolioPositionCreation = Optional<
  PortfolioPositionAttributes,
  | "id"
  | "current_price"
  | "created_at"
  | "updated_at"
>

export class PortfolioPosition extends Model<PortfolioPositionAttributes, PortfolioPositionCreation> implements PortfolioPositionAttributes {
  declare id: string
  declare user_id: string
  declare symbol: string
  declare quantity: number
  declare avg_price: number
  declare current_price: number
  declare created_at: Date
  declare updated_at: Date
}

PortfolioPosition.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    symbol: { type: DataTypes.STRING(20), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    avg_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    current_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "portfolio_positions", tableName: "portfolio_positions", timestamps: false }
)

// Portfolio Trades
interface PortfolioTradeAttributes {
  id: string
  user_id: string
  symbol: string
  trade_type: string
  quantity: number
  price: number
  profit_loss: number | null
  status: string
  created_at: Date
}

type PortfolioTradeCreation = Optional<
  PortfolioTradeAttributes,
  | "id"
  | "profit_loss"
  | "status"
  | "created_at"
>

export class PortfolioTrade extends Model<PortfolioTradeAttributes, PortfolioTradeCreation> implements PortfolioTradeAttributes {
  declare id: string
  declare user_id: string
  declare symbol: string
  declare trade_type: string
  declare quantity: number
  declare price: number
  declare profit_loss: number | null
  declare status: string
  declare created_at: Date
}

PortfolioTrade.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    symbol: { type: DataTypes.STRING(20), allowNull: false },
    trade_type: { type: DataTypes.STRING(10), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    profit_loss: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "open" },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "portfolio_trades", tableName: "portfolio_trades", timestamps: false }
)

// Achievements
interface AchievementAttributes {
  id: number
  name: string
  description: string
  icon: string
  points: number
  criteria: object
  is_active: boolean
  created_at: Date
}

type AchievementCreation = Optional<
  AchievementAttributes,
  | "id"
  | "is_active"
  | "created_at"
>

export class Achievement extends Model<AchievementAttributes, AchievementCreation> implements AchievementAttributes {
  declare id: number
  declare name: string
  declare description: string
  declare icon: string
  declare points: number
  declare criteria: object
  declare is_active: boolean
  declare created_at: Date
}

Achievement.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    icon: { type: DataTypes.STRING(50), allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    criteria: { type: DataTypes.JSON, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "achievements", tableName: "achievements", timestamps: false }
)

// User Achievements
interface UserAchievementAttributes {
  id: string
  user_id: string
  achievement_id: number
  earned_at: Date
}

type UserAchievementCreation = Optional<
  UserAchievementAttributes,
  | "id"
  | "earned_at"
>

export class UserAchievement extends Model<UserAchievementAttributes, UserAchievementCreation> implements UserAchievementAttributes {
  declare id: string
  declare user_id: string
  declare achievement_id: number
  declare earned_at: Date
}

UserAchievement.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    achievement_id: { type: DataTypes.INTEGER, allowNull: false },
    earned_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "user_achievements", tableName: "user_achievements", timestamps: false }
)

// User Points
interface UserPointsAttributes {
  id: string
  user_id: string
  total_points: number
  points_earned: number
  points_spent: number
  current_level: string
  created_at: Date
  updated_at: Date
}

type UserPointsCreation = Optional<
  UserPointsAttributes,
  | "id"
  | "total_points"
  | "points_earned"
  | "points_spent"
  | "current_level"
  | "created_at"
  | "updated_at"
>

export class UserPoints extends Model<UserPointsAttributes, UserPointsCreation> implements UserPointsAttributes {
  declare id: string
  declare user_id: string
  declare total_points: number
  declare points_earned: number
  declare points_spent: number
  declare current_level: string
  declare created_at: Date
  declare updated_at: Date
}

UserPoints.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    total_points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    points_earned: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    points_spent: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    current_level: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'beginner' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "user_points", tableName: "user_points", timestamps: false }
)

// Points History
interface PointsHistoryAttributes {
  id: number
  user_id: string
  points_change: number
  action_type: string
  achievement_id: number | null
  description: string | null
  created_at: Date
}

type PointsHistoryCreation = Optional<
  PointsHistoryAttributes,
  | "id"
  | "achievement_id"
  | "description"
  | "created_at"
>

export class PointsHistory extends Model<PointsHistoryAttributes, PointsHistoryCreation> implements PointsHistoryAttributes {
  declare id: number
  declare user_id: string
  declare points_change: number
  declare action_type: string
  declare achievement_id: number | null
  declare description: string | null
  declare created_at: Date
}

PointsHistory.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    points_change: { type: DataTypes.INTEGER, allowNull: false },
    action_type: { type: DataTypes.STRING(100), allowNull: false },
    achievement_id: { type: DataTypes.INTEGER, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "points_history", tableName: "points_history", timestamps: false }
)

// Points Rewards
interface PointsRewardAttributes {
  id: number
  points_required: number
  reward_type: string
  reward_value: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

type PointsRewardCreation = Optional<
  PointsRewardAttributes,
  | "id"
  | "is_active"
  | "created_at"
  | "updated_at"
>

export class PointsReward extends Model<PointsRewardAttributes, PointsRewardCreation> implements PointsRewardAttributes {
  declare id: number
  declare points_required: number
  declare reward_type: string
  declare reward_value: string
  declare is_active: boolean
  declare created_at: Date
  declare updated_at: Date
}

PointsReward.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    points_required: { type: DataTypes.INTEGER, allowNull: false },
    reward_type: { type: DataTypes.STRING(50), allowNull: false },
    reward_value: { type: DataTypes.TEXT, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "points_rewards", tableName: "points_rewards", timestamps: false }
)

// User Subscriptions
interface UserSubscriptionAttributes {
  id: string
  user_id: string
  plan_id: string
  status: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  current_period_start: Date | null
  current_period_end: Date | null
  cancel_at_period_end: boolean
  created_at: Date
  updated_at: Date
}

type UserSubscriptionCreation = Optional<
  UserSubscriptionAttributes,
  | "id"
  | "stripe_subscription_id"
  | "stripe_customer_id"
  | "current_period_start"
  | "current_period_end"
  | "cancel_at_period_end"
  | "created_at"
  | "updated_at"
>

export class UserSubscription
  extends Model<UserSubscriptionAttributes, UserSubscriptionCreation>
  implements UserSubscriptionAttributes
{
  declare id: string
  declare user_id: string
  declare plan_id: string
  declare status: string
  declare stripe_subscription_id: string | null
  declare stripe_customer_id: string | null
  declare current_period_start: Date | null
  declare current_period_end: Date | null
  declare cancel_at_period_end: boolean
  declare created_at: Date
  declare updated_at: Date
}

UserSubscription.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    plan_id: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "active" },
    stripe_subscription_id: { type: DataTypes.STRING(255), allowNull: true },
    stripe_customer_id: { type: DataTypes.STRING(255), allowNull: true },
    current_period_start: { type: DataTypes.DATE, allowNull: true },
    current_period_end: { type: DataTypes.DATE, allowNull: true },
    cancel_at_period_end: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "user_subscriptions", tableName: "user_subscriptions", timestamps: false }
)

// User Subscription History
interface UserSubscriptionHistoryAttributes {
  id: string
  user_id: string
  subscription_id: string
  action_type: string // 'payment', 'renewal', 'upgrade', 'downgrade', 'cancellation'
  previous_plan_id: string | null
  new_plan_id: string
  payment_method: string | null
  payment_amount: number | null
  payment_currency: string | null
  payment_status: string | null // 'pending', 'completed', 'failed', 'refunded'
  billing_cycle: string
  transaction_id: string | null
  gateway_reference: string | null
  metadata: object | null
  created_at: Date
}

type UserSubscriptionHistoryCreation = Optional<
  UserSubscriptionHistoryAttributes,
  | "id"
  | "previous_plan_id"
  | "payment_method"
  | "payment_amount"
  | "payment_currency"
  | "payment_status"
  | "transaction_id"
  | "gateway_reference"
  | "metadata"
  | "created_at"
>

export class UserSubscriptionHistory
  extends Model<UserSubscriptionHistoryAttributes, UserSubscriptionHistoryCreation>
  implements UserSubscriptionHistoryAttributes
{
  declare id: string
  declare user_id: string
  declare subscription_id: string
  declare action_type: string
  declare previous_plan_id: string | null
  declare new_plan_id: string
  declare payment_method: string | null
  declare payment_amount: number | null
  declare payment_currency: string | null
  declare payment_status: string | null
  declare billing_cycle: string
  declare transaction_id: string | null
  declare gateway_reference: string | null
  declare metadata: object | null
  declare created_at: Date
}

UserSubscriptionHistory.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    subscription_id: { type: DataTypes.UUID, allowNull: false },
    action_type: { type: DataTypes.STRING(50), allowNull: false },
    previous_plan_id: { type: DataTypes.UUID, allowNull: true },
    new_plan_id: { type: DataTypes.UUID, allowNull: false },
    payment_method: { type: DataTypes.STRING(50), allowNull: true },
    payment_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    payment_currency: { type: DataTypes.STRING(3), allowNull: true },
    payment_status: { type: DataTypes.STRING(20), allowNull: true },
    billing_cycle: { type: DataTypes.STRING(20), allowNull: false },
    transaction_id: { type: DataTypes.STRING(255), allowNull: true },
    gateway_reference: { type: DataTypes.STRING(255), allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "user_subscription_history", tableName: "user_subscription_history", timestamps: false }
)

// Event Participants
interface EventParticipantAttributes {
  id: string
  event_id: string
  user_id: string
  status: string
  registered_at: Date
  created_at: Date
  updated_at: Date
}

type EventParticipantCreation = Optional<
  EventParticipantAttributes,
  "id" | "status" | "registered_at" | "created_at" | "updated_at"
>

export class EventParticipant extends Model<EventParticipantAttributes, EventParticipantCreation> implements EventParticipantAttributes {
  declare id: string
  declare event_id: string
  declare user_id: string
  declare status: string
  declare registered_at: Date
  declare created_at: Date
  declare updated_at: Date
}

EventParticipant.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    event_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "registered" },
    registered_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "event_participants", tableName: "event_participants", timestamps: false }
)

// Associations
Course.belongsTo(CourseCategory, { foreignKey: "category_id", as: "category" })
CourseCategory.hasMany(Course, { foreignKey: "category_id", as: "courses" })

CourseModule.belongsTo(Course, { foreignKey: "course_id", as: "course" })
Course.hasMany(CourseModule, { foreignKey: "course_id", as: "modules" })

UserCourseProgress.belongsTo(User, { foreignKey: "user_id", as: "user" })
UserCourseProgress.belongsTo(Course, { foreignKey: "course_id", as: "course" })

Event.belongsTo(User, { foreignKey: "instructor_id", as: "instructor" })
Event.hasMany(EventParticipant, { foreignKey: "event_id", as: "participants" })
EventParticipant.belongsTo(Event, { foreignKey: "event_id", as: "event" })
EventParticipant.belongsTo(User, { foreignKey: "user_id", as: "user" })

Notification.belongsTo(User, { foreignKey: "user_id", as: "user" })

ForumPost.belongsTo(User, { foreignKey: "user_id", as: "user" })
ForumPost.belongsTo(ForumCategory, { foreignKey: "category_id", as: "category" })
ForumPost.belongsTo(ForumPost, { foreignKey: "parent_id", as: "parent" })
ForumPost.hasMany(ForumPost, { foreignKey: "parent_id", as: "replies" })

PortfolioPosition.belongsTo(User, { foreignKey: "user_id", as: "user" })
PortfolioTrade.belongsTo(User, { foreignKey: "user_id", as: "user" })

UserAchievement.belongsTo(User, { foreignKey: "user_id", as: "user" })
UserAchievement.belongsTo(Achievement, { foreignKey: "achievement_id", as: "achievement" })

UserPoints.belongsTo(User, { foreignKey: "user_id", as: "user" })
PointsHistory.belongsTo(User, { foreignKey: "user_id", as: "user" })
PointsHistory.belongsTo(Achievement, { foreignKey: "achievement_id", as: "achievement" })

UserSubscription.belongsTo(User, { foreignKey: "user_id", as: "user" })
UserSubscription.belongsTo(SubscriptionPlan, { foreignKey: "plan_id", as: "plan" })

UserSubscriptionHistory.belongsTo(User, { foreignKey: "user_id", as: "user" })
UserSubscriptionHistory.belongsTo(UserSubscription, { foreignKey: "subscription_id", as: "subscription" })
UserSubscriptionHistory.belongsTo(SubscriptionPlan, { foreignKey: "new_plan_id", as: "newPlan" })
UserSubscriptionHistory.belongsTo(SubscriptionPlan, { foreignKey: "previous_plan_id", as: "previousPlan" })

// Website Settings
interface WebsiteSettingsAttributes {
  id: string
  branding: object
  landingPage: object
  created_at: Date
  updated_at: Date
}

type WebsiteSettingsCreation = Optional<
  WebsiteSettingsAttributes,
  "id" | "created_at" | "updated_at"
>

export class WebsiteSettings
  extends Model<WebsiteSettingsAttributes, WebsiteSettingsCreation>
  implements WebsiteSettingsAttributes
{
  declare id: string
  declare branding: object
  declare landingPage: object
  declare created_at: Date
  declare updated_at: Date
}

WebsiteSettings.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    branding: { type: DataTypes.JSON, allowNull: false },
    landingPage: { type: DataTypes.JSON, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "website_settings", tableName: "website_settings", timestamps: false }
)

// Platform Social Links
interface PlatformSocialLinksAttributes {
  id: string
  platform: string // 'discord', 'instagram', 'twitter', 'youtube', 'tiktok'
  name: string // Display name for the link
  url: string
  description: string | null
  required_plan: string | null // For Discord servers - which plan is required to access
  is_active: boolean
  sort_order: number
  created_at: Date
  updated_at: Date
}

type PlatformSocialLinksCreation = Optional<
  PlatformSocialLinksAttributes,
  "id" | "description" | "required_plan" | "is_active" | "sort_order" | "created_at" | "updated_at"
>

export class PlatformSocialLinks
  extends Model<PlatformSocialLinksAttributes, PlatformSocialLinksCreation>
  implements PlatformSocialLinksAttributes
{
  declare id: string
  declare platform: string
  declare name: string
  declare url: string
  declare description: string | null
  declare required_plan: string | null
  declare is_active: boolean
  declare sort_order: number
  declare created_at: Date
  declare updated_at: Date
}

PlatformSocialLinks.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    platform: { type: DataTypes.STRING(50), allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    url: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    required_plan: { type: DataTypes.STRING(50), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "platform_social_links", tableName: "platform_social_links", timestamps: false }
)

// Showcase Stories
interface ShowcaseStoryAttributes {
  id: string
  title: string
  caption: string | null
  image_url: string
  group_name: string | null // For grouping stories like Instagram
  is_active: boolean
  expires_at: Date
  created_at: Date
  updated_at: Date
}

type ShowcaseStoryCreation = Optional<
  ShowcaseStoryAttributes,
  "id" | "caption" | "group_name" | "is_active" | "created_at" | "updated_at"
>

export class ShowcaseStory
  extends Model<ShowcaseStoryAttributes, ShowcaseStoryCreation>
  implements ShowcaseStoryAttributes
{
  declare id: string
  declare title: string
  declare caption: string | null
  declare image_url: string
  declare group_name: string | null
  declare is_active: boolean
  declare expires_at: Date
  declare created_at: Date
  declare updated_at: Date
}

ShowcaseStory.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    caption: { type: DataTypes.TEXT, allowNull: true },
    image_url: { type: DataTypes.TEXT, allowNull: false },
    group_name: { type: DataTypes.STRING(100), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "showcase_stories", tableName: "showcase_stories", timestamps: false }
)

// Payment Methods
interface PaymentMethodAttributes {
  id: string
  user_id: string
  payment_type: string // 'card', 'bank', 'mobile_money', 'crypto', 'digital_wallet'
  payment_provider: string // 'visa', 'mastercard', 'stripe', 'mtn', 'airtel', 'usdt', 'btc', 'google_pay', 'apple_pay', 'opay'
  display_name: string // 'Visa ****0123', 'MTN +233241234567', 'USDT 0x1234...abcd'
  masked_data: string // '**** **** **** 0123', '+233****4567', '0x1234...abcd'
  is_default: boolean
  is_active: boolean
  metadata: object | null
  created_at: Date
  updated_at: Date
}

type PaymentMethodCreation = Optional<
  PaymentMethodAttributes,
  "id" | "is_default" | "is_active" | "metadata" | "created_at" | "updated_at"
>

export class PaymentMethod
  extends Model<PaymentMethodAttributes, PaymentMethodCreation>
  implements PaymentMethodAttributes
{
  declare id: string
  declare user_id: string
  declare payment_type: string
  declare payment_provider: string
  declare display_name: string
  declare masked_data: string
  declare is_default: boolean
  declare is_active: boolean
  declare metadata: object | null
  declare created_at: Date
  declare updated_at: Date
}

PaymentMethod.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    payment_type: { type: DataTypes.STRING(50), allowNull: false },
    payment_provider: { type: DataTypes.STRING(50), allowNull: false },
    display_name: { type: DataTypes.STRING(100), allowNull: false },
    masked_data: { type: DataTypes.STRING(255), allowNull: false },
    is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    metadata: { type: DataTypes.JSON, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "payment_methods", tableName: "payment_methods", timestamps: false }
)

// User Module Progress
interface UserModuleProgressAttributes {
  id: string
  user_id: string
  course_id: string
  module_id: string
  is_completed: boolean
  completed_at: Date | null
  last_accessed: Date | null
}

type UserModuleProgressCreation = Optional<
  UserModuleProgressAttributes,
  | "id"
  | "is_completed"
  | "completed_at"
  | "last_accessed"
>

export class UserModuleProgress extends Model<UserModuleProgressAttributes, UserModuleProgressCreation> implements UserModuleProgressAttributes {
  declare id: string
  declare user_id: string
  declare course_id: string
  declare module_id: string
  declare is_completed: boolean
  declare completed_at: Date | null
  declare last_accessed: Date | null
}

UserModuleProgress.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    course_id: { type: DataTypes.UUID, allowNull: false },
    module_id: { type: DataTypes.UUID, allowNull: false },
    is_completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    completed_at: { type: DataTypes.DATE, allowNull: true },
    last_accessed: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: "user_module_progress", tableName: "user_module_progress", timestamps: false }
)

// Add missing associations
User.hasMany(UserSubscription, { foreignKey: "user_id", as: "subscriptions" })
User.hasMany(UserSubscriptionHistory, { foreignKey: "user_id", as: "subscriptionHistory" })
User.hasMany(PaymentMethod, { foreignKey: "user_id", as: "paymentMethods" })
SubscriptionPlan.hasMany(UserSubscription, { foreignKey: "plan_id", as: "subscriptions" })
UserSubscription.hasMany(UserSubscriptionHistory, { foreignKey: "subscription_id", as: "history" })

User.hasMany(UserCourseProgress, { foreignKey: "user_id", as: "progress" })
User.hasMany(UserModuleProgress, { foreignKey: "user_id", as: "moduleProgress" })
User.hasMany(Event, { foreignKey: "instructor_id", as: "events" })
User.hasMany(EventParticipant, { foreignKey: "user_id", as: "eventParticipants" })
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" })
User.hasMany(ForumPost, { foreignKey: "user_id", as: "posts" })
User.hasMany(PortfolioPosition, { foreignKey: "user_id", as: "positions" })
User.hasMany(PortfolioTrade, { foreignKey: "user_id", as: "trades" })
User.hasMany(UserAchievement, { foreignKey: "user_id", as: "achievements" })
User.hasOne(UserPoints, { foreignKey: "user_id", as: "points" })
User.hasMany(PointsHistory, { foreignKey: "user_id", as: "pointsHistory" })

Course.hasMany(UserCourseProgress, { foreignKey: "course_id", as: "progress" })
Course.hasMany(UserModuleProgress, { foreignKey: "course_id", as: "moduleProgress" })
CourseModule.hasMany(UserModuleProgress, { foreignKey: "module_id", as: "userProgress" })

ForumCategory.hasMany(ForumPost, { foreignKey: "category_id", as: "posts" })
  Achievement.hasMany(UserAchievement, { foreignKey: "achievement_id", as: "userAchievements" })
  
// User Wallets for multi-wallet support
interface UserWalletAttributes {
  id: string
  user_id: string
  wallet_address: string
  wallet_name: string
  is_primary: boolean
  connected_at: Date
  last_used: Date
  created_at: Date
  updated_at: Date
}

type UserWalletCreation = Optional<
  UserWalletAttributes,
  "id" | "is_primary" | "connected_at" | "last_used" | "created_at" | "updated_at"
>

export class UserWallet
  extends Model<UserWalletAttributes, UserWalletCreation>
  implements UserWalletAttributes
{
  declare id: string
  declare user_id: string
  declare wallet_address: string
  declare wallet_name: string
  declare is_primary: boolean
  declare connected_at: Date
  declare last_used: Date
  declare created_at: Date
  declare updated_at: Date
}

UserWallet.init(
  {
    id: { type: DataTypes.CHAR(36), defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.CHAR(36), allowNull: false },
    wallet_address: { type: DataTypes.STRING(255), allowNull: false },
    wallet_name: { type: DataTypes.STRING(100), allowNull: false },
    is_primary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    connected_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    last_used: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "user_wallets", tableName: "user_wallets", timestamps: false }
)

// User Votes for forum posts
interface UserVoteAttributes {
  id: string
  user_id: string
  post_id: string
  vote_type: 'up' | 'down'
  created_at: Date
}

type UserVoteCreation = Optional<
  UserVoteAttributes,
  "id" | "created_at"
>

export class UserVote extends Model<UserVoteAttributes, UserVoteCreation> implements UserVoteAttributes {
  declare id: string
  declare user_id: string
  declare post_id: string
  declare vote_type: 'up' | 'down'
  declare created_at: Date
}

UserVote.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    post_id: { type: DataTypes.UUID, allowNull: false },
    vote_type: { type: DataTypes.ENUM('up', 'down'), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "user_votes", tableName: "user_votes", timestamps: false }
)

// Associations
User.hasMany(UserWallet, { foreignKey: "user_id", as: "wallets" })
UserWallet.belongsTo(User, { foreignKey: "user_id", as: "user" })

User.hasMany(UserVote, { foreignKey: "user_id", as: "votes" })
UserVote.belongsTo(User, { foreignKey: "user_id", as: "user" })
ForumPost.hasMany(UserVote, { foreignKey: "post_id", as: "votes" })
UserVote.belongsTo(ForumPost, { foreignKey: "post_id", as: "post" })

// Resource Categories
interface ResourceCategoryAttributes {
  id: number
  name: string
  description?: string
  icon?: string
  color: string
  created_at: Date
  updated_at: Date
}

type ResourceCategoryCreationAttributes = Optional<
  ResourceCategoryAttributes,
  'id' | 'created_at' | 'updated_at'
>

export class ResourceCategory extends Model<ResourceCategoryAttributes, ResourceCategoryCreationAttributes> implements ResourceCategoryAttributes {
  declare id: number
  declare name: string
  declare description: string
  declare icon: string
  declare color: string
  declare created_at: Date
  declare updated_at: Date
}

ResourceCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: '#3B82F6',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'resource_categories',
    timestamps: false,
    underscored: true,
  }
)

// Resource Videos
interface ResourceVideoAttributes {
  id: number
  title: string
  description?: string
  url: string
  thumbnail_url?: string
  duration_seconds?: number
  source: string
  source_id?: string
  category_id?: number
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  tags?: any
  views_count: number
  rating: number
  is_featured: boolean
  is_active: boolean
  created_at: Date
  updated_at: Date
}

type ResourceVideoCreationAttributes = Optional<
  ResourceVideoAttributes,
  'id' | 'views_count' | 'rating' | 'is_featured' | 'is_active' | 'created_at' | 'updated_at'
>

export class ResourceVideo extends Model<ResourceVideoAttributes, ResourceVideoCreationAttributes> implements ResourceVideoAttributes {
  declare id: number
  declare title: string
  declare description: string
  declare url: string
  declare thumbnail_url: string
  declare duration_seconds: number
  declare source: string
  declare source_id: string
  declare category_id: number
  declare difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  declare tags: any
  declare views_count: number
  declare rating: number
  declare is_featured: boolean
  declare is_active: boolean
  declare created_at: Date
  declare updated_at: Date
}

ResourceVideo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    thumbnail_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    source_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    difficulty_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: false,
      defaultValue: 'beginner',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    views_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'resource_videos',
    timestamps: false,
    underscored: true,
  }
)

// Resource Books
interface ResourceBookAttributes {
  id: number
  title: string
  author: string
  description?: string
  cover_image_url?: string
  file_url: string
  file_size_mb?: number
  file_type?: string
  pages?: number
  isbn?: string
  publisher?: string
  publication_year?: number
  category_id?: number
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  tags?: any
  downloads_count: number
  rating: number
  is_featured: boolean
  is_active: boolean
  created_at: Date
  updated_at: Date
}

type ResourceBookCreationAttributes = Optional<
  ResourceBookAttributes,
  'id' | 'downloads_count' | 'rating' | 'is_featured' | 'is_active' | 'created_at' | 'updated_at'
>

export class ResourceBook extends Model<ResourceBookAttributes, ResourceBookCreationAttributes> implements ResourceBookAttributes {
  declare id: number
  declare title: string
  declare author: string
  declare description: string
  declare cover_image_url: string
  declare file_url: string
  declare file_size_mb: number
  declare file_type: string
  declare pages: number
  declare isbn: string
  declare publisher: string
  declare publication_year: number
  declare category_id: number
  declare difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  declare tags: any
  declare downloads_count: number
  declare rating: number
  declare is_featured: boolean
  declare is_active: boolean
  declare created_at: Date
  declare updated_at: Date
}

ResourceBook.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cover_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    file_size_mb: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    file_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    pages: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isbn: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    publisher: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    publication_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    difficulty_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: false,
      defaultValue: 'beginner',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    downloads_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'resource_books',
    timestamps: false,
    underscored: true,
  }
)

// Resource Podcasts
interface ResourcePodcastAttributes {
  id: number
  title: string
  description?: string
  host?: string
  url: string
  platform: string
  platform_id?: string
  cover_image_url?: string
  duration_seconds?: number
  episode_number?: number
  season_number?: number
  category_id?: number
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  tags?: any
  listens_count: number
  rating: number
  is_featured: boolean
  is_active: boolean
  created_at: Date
  updated_at: Date
}

type ResourcePodcastCreationAttributes = Optional<
  ResourcePodcastAttributes,
  'id' | 'listens_count' | 'rating' | 'is_featured' | 'is_active' | 'created_at' | 'updated_at'
>

export class ResourcePodcast extends Model<ResourcePodcastAttributes, ResourcePodcastCreationAttributes> implements ResourcePodcastAttributes {
  declare id: number
  declare title: string
  declare description: string
  declare host: string
  declare url: string
  declare platform: string
  declare platform_id: string
  declare cover_image_url: string
  declare duration_seconds: number
  declare episode_number: number
  declare season_number: number
  declare category_id: number
  declare difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  declare tags: any
  declare listens_count: number
  declare rating: number
  declare is_featured: boolean
  declare is_active: boolean
  declare created_at: Date
  declare updated_at: Date
}

ResourcePodcast.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    host: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    platform: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    platform_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    cover_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    episode_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    season_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    difficulty_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: false,
      defaultValue: 'beginner',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    listens_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'resource_podcasts',
    timestamps: false,
    underscored: true,
  }
)

// Resource Associations
ResourceCategory.hasMany(ResourceVideo, { foreignKey: "category_id", as: "videos" })
ResourceVideo.belongsTo(ResourceCategory, { foreignKey: "category_id", as: "category" })

ResourceCategory.hasMany(ResourceBook, { foreignKey: "category_id", as: "books" })
ResourceBook.belongsTo(ResourceCategory, { foreignKey: "category_id", as: "category" })

ResourceCategory.hasMany(ResourcePodcast, { foreignKey: "category_id", as: "podcasts" })
ResourcePodcast.belongsTo(ResourceCategory, { foreignKey: "category_id", as: "category" })

// Trading Journal Models
export class TradingJournalStrategy extends Model {
  declare id: number
  declare user_id: string
  declare name: string
  declare description: string | null
  declare entry_rules: string | null
  declare exit_rules: string | null
  declare risk_management_rules: string | null
  declare is_active: boolean
  declare created_at: Date
  declare updated_at: Date
}

TradingJournalStrategy.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.CHAR(36), allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    entry_rules: { type: DataTypes.TEXT, allowNull: true },
    exit_rules: { type: DataTypes.TEXT, allowNull: true },
    risk_management_rules: { type: DataTypes.TEXT, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'trading_journal_strategies',
    timestamps: false,
    underscored: true,
  }
)

export class TradingJournalCategory extends Model {
  declare id: number
  declare user_id: string
  declare name: string
  declare color: string
  declare description: string | null
  declare created_at: Date
}

TradingJournalCategory.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.CHAR(36), allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    color: { type: DataTypes.STRING(7), allowNull: false, defaultValue: '#3B82F6' },
    description: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'trading_journal_categories',
    timestamps: false,
    underscored: true,
  }
)

export class TradingJournalTag extends Model {
  declare id: number
  declare user_id: string
  declare name: string
  declare color: string
  declare created_at: Date
}

TradingJournalTag.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.CHAR(36), allowNull: false },
    name: { type: DataTypes.STRING(50), allowNull: false },
    color: { type: DataTypes.STRING(7), allowNull: false, defaultValue: '#6B7280' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'trading_journal_tags',
    timestamps: false,
    underscored: true,
  }
)

export class TradingJournalTrade extends Model {
  declare id: number
  declare user_id: string
  declare trade_id: string
  declare symbol: string
  declare instrument_type: 'stock' | 'forex' | 'crypto' | 'commodity' | 'index' | 'option' | 'future'
  declare direction: 'long' | 'short'
  declare entry_price: number
  declare entry_time: Date
  declare entry_reason: string | null
  declare entry_confidence: 'low' | 'medium' | 'high'
  declare exit_price: number | null
  declare exit_time: Date | null
  declare exit_reason: string | null
  declare exit_confidence: 'low' | 'medium' | 'high' | null
  declare position_size: number
  declare position_size_currency: string
  declare leverage: number
  declare stop_loss: number | null
  declare take_profit: number | null
  declare risk_amount: number | null
  declare risk_percentage: number | null
  declare pnl_amount: number | null
  declare pnl_percentage: number | null
  declare max_profit: number | null
  declare max_loss: number | null
  declare strategy_id: number | null
  declare category_id: number | null
  declare market_condition: 'trending' | 'ranging' | 'volatile' | 'sideways'
  declare trade_setup_quality: 'poor' | 'fair' | 'good' | 'excellent'
  declare execution_quality: 'poor' | 'fair' | 'good' | 'excellent'
  declare status: 'open' | 'closed' | 'cancelled'
  declare is_winning: boolean | null
  declare notes: string | null
  declare lessons_learned: string | null
  declare next_time_actions: string | null
  declare screenshots: any
  declare created_at: Date
  declare updated_at: Date
}

TradingJournalTrade.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.CHAR(36), allowNull: false },
    trade_id: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    symbol: { type: DataTypes.STRING(20), allowNull: false },
    instrument_type: { type: DataTypes.ENUM('stock', 'forex', 'crypto', 'commodity', 'index', 'option', 'future'), allowNull: false },
    direction: { type: DataTypes.ENUM('long', 'short'), allowNull: false },
    entry_price: { type: DataTypes.DECIMAL(15, 6), allowNull: false },
    entry_time: { type: DataTypes.DATE, allowNull: false },
    entry_reason: { type: DataTypes.TEXT, allowNull: true },
    entry_confidence: { type: DataTypes.ENUM('low', 'medium', 'high'), allowNull: false, defaultValue: 'medium' },
    exit_price: { type: DataTypes.DECIMAL(15, 6), allowNull: true },
    exit_time: { type: DataTypes.DATE, allowNull: true },
    exit_reason: { type: DataTypes.TEXT, allowNull: true },
    exit_confidence: { type: DataTypes.ENUM('low', 'medium', 'high'), allowNull: true },
    position_size: { type: DataTypes.DECIMAL(15, 6), allowNull: false },
    position_size_currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
    leverage: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 1.00 },
    stop_loss: { type: DataTypes.DECIMAL(15, 6), allowNull: true },
    take_profit: { type: DataTypes.DECIMAL(15, 6), allowNull: true },
    risk_amount: { type: DataTypes.DECIMAL(15, 6), allowNull: true },
    risk_percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    pnl_amount: { type: DataTypes.DECIMAL(15, 6), allowNull: true },
    pnl_percentage: { type: DataTypes.DECIMAL(8, 4), allowNull: true },
    max_profit: { type: DataTypes.DECIMAL(15, 6), allowNull: true },
    max_loss: { type: DataTypes.DECIMAL(15, 6), allowNull: true },
    strategy_id: { type: DataTypes.INTEGER, allowNull: true },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    market_condition: { type: DataTypes.ENUM('trending', 'ranging', 'volatile', 'sideways'), allowNull: false, defaultValue: 'trending' },
    trade_setup_quality: { type: DataTypes.ENUM('poor', 'fair', 'good', 'excellent'), allowNull: false, defaultValue: 'fair' },
    execution_quality: { type: DataTypes.ENUM('poor', 'fair', 'good', 'excellent'), allowNull: false, defaultValue: 'fair' },
    status: { type: DataTypes.ENUM('open', 'closed', 'cancelled'), allowNull: false, defaultValue: 'open' },
    is_winning: { type: DataTypes.BOOLEAN, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    lessons_learned: { type: DataTypes.TEXT, allowNull: true },
    next_time_actions: { type: DataTypes.TEXT, allowNull: true },
    screenshots: { type: DataTypes.JSON, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'trading_journal_trades',
    timestamps: false,
    underscored: true,
  }
)

export class TradingJournalNote extends Model {
  declare id: number
  declare trade_id: number
  declare user_id: string
  declare note_type: 'pre_trade' | 'during_trade' | 'post_trade' | 'analysis'
  declare content: string
  declare created_at: Date
  declare updated_at: Date
}

TradingJournalNote.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    trade_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.CHAR(36), allowNull: false },
    note_type: { type: DataTypes.ENUM('pre_trade', 'during_trade', 'post_trade', 'analysis'), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'trading_journal_notes',
    timestamps: false,
    underscored: true,
  }
)

export class TradingJournalChecklist extends Model {
  declare id: number
  declare user_id: string
  declare name: string
  declare description: string | null
  declare checklist_type: 'pre_trade' | 'during_trade' | 'post_trade' | 'weekly' | 'monthly'
  declare is_active: boolean
  declare created_at: Date
  declare updated_at: Date
}

TradingJournalChecklist.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.CHAR(36), allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    checklist_type: { type: DataTypes.ENUM('pre_trade', 'during_trade', 'post_trade', 'weekly', 'monthly'), allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'trading_journal_checklists',
    timestamps: false,
    underscored: true,
  }
)

export class TradingJournalChecklistItem extends Model {
  declare id: number
  declare checklist_id: number
  declare item_text: string
  declare is_required: boolean
  declare order_index: number
  declare created_at: Date
}

TradingJournalChecklistItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    checklist_id: { type: DataTypes.INTEGER, allowNull: false },
    item_text: { type: DataTypes.STRING(255), allowNull: false },
    is_required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'trading_journal_checklist_items',
    timestamps: false,
    underscored: true,
  }
)

export class TradingJournalGoal extends Model {
  declare id: number
  declare user_id: string
  declare title: string
  declare description: string | null
  declare goal_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  declare target_value: number | null
  declare current_value: number
  declare target_date: Date | null
  declare status: 'active' | 'completed' | 'cancelled'
  declare created_at: Date
  declare updated_at: Date
}

TradingJournalGoal.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.CHAR(36), allowNull: false },
    title: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    goal_type: { type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'), allowNull: false },
    target_value: { type: DataTypes.DECIMAL(15, 6), allowNull: true },
    current_value: { type: DataTypes.DECIMAL(15, 6), allowNull: false, defaultValue: 0 },
    target_date: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.ENUM('active', 'completed', 'cancelled'), allowNull: false, defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'trading_journal_goals',
    timestamps: false,
    underscored: true,
  }
)

export class TradingJournalPerformanceMetric extends Model {
  declare id: number
  declare user_id: string
  declare period_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  declare period_start: Date
  declare period_end: Date
  declare total_trades: number
  declare winning_trades: number
  declare losing_trades: number
  declare win_rate: number
  declare total_pnl: number
  declare average_win: number
  declare average_loss: number
  declare largest_win: number
  declare largest_loss: number
  declare profit_factor: number
  declare risk_reward_ratio: number
  declare max_drawdown: number
  declare sharpe_ratio: number
  declare average_trade_duration: number
  declare total_trading_time: number
  declare created_at: Date
  declare updated_at: Date
}

TradingJournalPerformanceMetric.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.CHAR(36), allowNull: false },
    period_type: { type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'), allowNull: false },
    period_start: { type: DataTypes.DATE, allowNull: false },
    period_end: { type: DataTypes.DATE, allowNull: false },
    total_trades: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    winning_trades: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    losing_trades: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    win_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
    total_pnl: { type: DataTypes.DECIMAL(15, 6), allowNull: false, defaultValue: 0 },
    average_win: { type: DataTypes.DECIMAL(15, 6), allowNull: false, defaultValue: 0 },
    average_loss: { type: DataTypes.DECIMAL(15, 6), allowNull: false, defaultValue: 0 },
    largest_win: { type: DataTypes.DECIMAL(15, 6), allowNull: false, defaultValue: 0 },
    largest_loss: { type: DataTypes.DECIMAL(15, 6), allowNull: false, defaultValue: 0 },
    profit_factor: { type: DataTypes.DECIMAL(8, 4), allowNull: false, defaultValue: 0 },
    risk_reward_ratio: { type: DataTypes.DECIMAL(8, 4), allowNull: false, defaultValue: 0 },
    max_drawdown: { type: DataTypes.DECIMAL(15, 6), allowNull: false, defaultValue: 0 },
    sharpe_ratio: { type: DataTypes.DECIMAL(8, 4), allowNull: false, defaultValue: 0 },
    average_trade_duration: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    total_trading_time: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'trading_journal_performance_metrics',
    timestamps: false,
    underscored: true,
  }
)

// Trading Journal Associations
TradingJournalStrategy.hasMany(TradingJournalTrade, { foreignKey: "strategy_id", as: "strategyTrades" })
TradingJournalTrade.belongsTo(TradingJournalStrategy, { foreignKey: "strategy_id", as: "strategy" })

TradingJournalCategory.hasMany(TradingJournalTrade, { foreignKey: "category_id", as: "categoryTrades" })
TradingJournalTrade.belongsTo(TradingJournalCategory, { foreignKey: "category_id", as: "category" })

TradingJournalTrade.hasMany(TradingJournalNote, { foreignKey: "trade_id", as: "tradeNotes" })
TradingJournalNote.belongsTo(TradingJournalTrade, { foreignKey: "trade_id", as: "trade" })

TradingJournalChecklist.hasMany(TradingJournalChecklistItem, { foreignKey: "checklist_id", as: "items" })
TradingJournalChecklistItem.belongsTo(TradingJournalChecklist, { foreignKey: "checklist_id", as: "checklist" })

User.hasMany(TradingJournalTrade, { foreignKey: "user_id", as: "tradingTrades" })
TradingJournalTrade.belongsTo(User, { foreignKey: "user_id", as: "user" })

User.hasMany(TradingJournalStrategy, { foreignKey: "user_id", as: "strategies" })
TradingJournalStrategy.belongsTo(User, { foreignKey: "user_id", as: "user" })

User.hasMany(TradingJournalCategory, { foreignKey: "user_id", as: "categories" })
TradingJournalCategory.belongsTo(User, { foreignKey: "user_id", as: "user" })

User.hasMany(TradingJournalTag, { foreignKey: "user_id", as: "tags" })
TradingJournalTag.belongsTo(User, { foreignKey: "user_id", as: "user" })

User.hasMany(TradingJournalChecklist, { foreignKey: "user_id", as: "checklists" })
TradingJournalChecklist.belongsTo(User, { foreignKey: "user_id", as: "user" })

User.hasMany(TradingJournalGoal, { foreignKey: "user_id", as: "goals" })
TradingJournalGoal.belongsTo(User, { foreignKey: "user_id", as: "user" })

User.hasMany(TradingJournalPerformanceMetric, { foreignKey: "user_id", as: "performanceMetrics" })
TradingJournalPerformanceMetric.belongsTo(User, { foreignKey: "user_id", as: "user" })


