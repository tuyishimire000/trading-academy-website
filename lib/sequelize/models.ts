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

// User Progress
interface UserProgressAttributes {
  id: string
  user_id: string
  course_id: string
  module_id: string | null
  progress_percentage: number
  completed_at: Date | null
  last_accessed_at: Date | null
  created_at: Date
  updated_at: Date
}

type UserProgressCreation = Optional<
  UserProgressAttributes,
  | "id"
  | "module_id"
  | "progress_percentage"
  | "completed_at"
  | "last_accessed_at"
  | "created_at"
  | "updated_at"
>

export class UserProgress extends Model<UserProgressAttributes, UserProgressCreation> implements UserProgressAttributes {
  declare id: string
  declare user_id: string
  declare course_id: string
  declare module_id: string | null
  declare progress_percentage: number
  declare completed_at: Date | null
  declare last_accessed_at: Date | null
  declare created_at: Date
  declare updated_at: Date
}

UserProgress.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    course_id: { type: DataTypes.UUID, allowNull: false },
    module_id: { type: DataTypes.UUID, allowNull: true },
    progress_percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
    completed_at: { type: DataTypes.DATE, allowNull: true },
    last_accessed_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "user_progress", tableName: "user_progress", timestamps: false }
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
  id: string
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
  declare id: string
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
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
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
  achievement_id: string
  earned_at: Date
  created_at: Date
}

type UserAchievementCreation = Optional<
  UserAchievementAttributes,
  | "id"
  | "earned_at"
  | "created_at"
>

export class UserAchievement extends Model<UserAchievementAttributes, UserAchievementCreation> implements UserAchievementAttributes {
  declare id: string
  declare user_id: string
  declare achievement_id: string
  declare earned_at: Date
  declare created_at: Date
}

UserAchievement.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    achievement_id: { type: DataTypes.UUID, allowNull: false },
    earned_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "user_achievements", tableName: "user_achievements", timestamps: false }
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

UserProgress.belongsTo(User, { foreignKey: "user_id", as: "user" })
UserProgress.belongsTo(Course, { foreignKey: "course_id", as: "course" })
UserProgress.belongsTo(CourseModule, { foreignKey: "module_id", as: "module" })

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

UserSubscription.belongsTo(User, { foreignKey: "user_id", as: "user" })
UserSubscription.belongsTo(SubscriptionPlan, { foreignKey: "plan_id", as: "plan" })

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

// Add missing associations
User.hasMany(UserSubscription, { foreignKey: "user_id", as: "subscriptions" })
SubscriptionPlan.hasMany(UserSubscription, { foreignKey: "plan_id", as: "subscriptions" })

User.hasMany(UserProgress, { foreignKey: "user_id", as: "progress" })
User.hasMany(Event, { foreignKey: "instructor_id", as: "events" })
User.hasMany(EventParticipant, { foreignKey: "user_id", as: "eventParticipants" })
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" })
User.hasMany(ForumPost, { foreignKey: "user_id", as: "posts" })
User.hasMany(PortfolioPosition, { foreignKey: "user_id", as: "positions" })
User.hasMany(PortfolioTrade, { foreignKey: "user_id", as: "trades" })
User.hasMany(UserAchievement, { foreignKey: "user_id", as: "achievements" })

Course.hasMany(UserProgress, { foreignKey: "course_id", as: "progress" })
CourseModule.hasMany(UserProgress, { foreignKey: "module_id", as: "progress" })

ForumCategory.hasMany(ForumPost, { foreignKey: "category_id", as: "posts" })
Achievement.hasMany(UserAchievement, { foreignKey: "achievement_id", as: "userAchievements" })






