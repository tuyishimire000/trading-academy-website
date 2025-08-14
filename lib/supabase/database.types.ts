export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          first_name: string
          last_name: string
          phone: string | null
          avatar_url: string | null
          is_email_verified: boolean
          email_verification_token: string | null
          password_reset_token: string | null
          password_reset_expires: string | null
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          first_name: string
          last_name: string
          phone?: string | null
          avatar_url?: string | null
          is_email_verified?: boolean
          email_verification_token?: string | null
          password_reset_token?: string | null
          password_reset_expires?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          avatar_url?: string | null
          is_email_verified?: boolean
          email_verification_token?: string | null
          password_reset_token?: string | null
          password_reset_expires?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          price: number
          billing_cycle: string
          features: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          price: number
          billing_cycle: string
          features?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          price?: number
          billing_cycle?: string
          features?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          title: string
          description?: string | null
          thumbnail_url?: string | null
          difficulty_level?: string
          estimated_duration?: number | null
          required_plan?: string
          sort_order?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          difficulty_level?: string
          estimated_duration?: number | null
          required_plan?: string
          sort_order?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      course_modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          content_type: string
          content_url: string | null
          content_data: Json | null
          duration: number | null
          sort_order: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          content_type: string
          content_url?: string | null
          content_data?: Json | null
          duration?: number | null
          sort_order?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          content_type?: string
          content_url?: string | null
          content_data?: Json | null
          duration?: number | null
          sort_order?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_course_progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          status: string
          progress_percentage: number
          started_at: string | null
          completed_at: string | null
          last_accessed: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          status?: string
          progress_percentage?: number
          started_at?: string | null
          completed_at?: string | null
          last_accessed?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          status?: string
          progress_percentage?: number
          started_at?: string | null
          completed_at?: string | null
          last_accessed?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_type: string
          start_time: string
          end_time: string
          timezone: string
          meeting_url: string | null
          max_participants: number | null
          required_plan: string
          instructor_id: string | null
          is_recurring: boolean
          recurrence_pattern: Json | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_type: string
          start_time: string
          end_time: string
          timezone?: string
          meeting_url?: string | null
          max_participants?: number | null
          required_plan?: string
          instructor_id?: string | null
          is_recurring?: boolean
          recurrence_pattern?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_type?: string
          start_time?: string
          end_time?: string
          timezone?: string
          meeting_url?: string | null
          max_participants?: number | null
          required_plan?: string
          instructor_id?: string | null
          is_recurring?: boolean
          recurrence_pattern?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
