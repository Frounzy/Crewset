export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          notes?: string | null
        }
      }
      contracts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          client_id: string
          name: string
          start_date: string
          end_date: string
          renewal_type: 'auto-renew' | 'manual'
          value_amount: number
          value_period: 'monthly' | 'yearly'
          renewal_probability: 'low' | 'medium' | 'high'
          status: 'active' | 'expired' | 'renewed' | 'lost'
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          client_id: string
          name: string
          start_date: string
          end_date: string
          renewal_type: 'auto-renew' | 'manual'
          value_amount: number
          value_period: 'monthly' | 'yearly'
          renewal_probability?: 'low' | 'medium' | 'high'
          status?: 'active' | 'expired' | 'renewed' | 'lost'
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          client_id?: string
          name?: string
          start_date?: string
          end_date?: string
          renewal_type?: 'auto-renew' | 'manual'
          value_amount?: number
          value_period?: 'monthly' | 'yearly'
          renewal_probability?: 'low' | 'medium' | 'high'
          status?: 'active' | 'expired' | 'renewed' | 'lost'
          notes?: string | null
        }
      }
      subscriptions: {
        Row: {
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'free' | 'pro' | 'agency'
          status: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_end: string | null
        }
        Insert: {
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'pro' | 'agency'
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_end?: string | null
        }
        Update: {
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'pro' | 'agency'
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_end?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          username: string | null
          bio: string | null
          title: string | null
          social_links: Json | null
          is_public: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          username?: string | null
          bio?: string | null
          title?: string | null
          social_links?: Json | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          username?: string | null
          bio?: string | null
          title?: string | null
          social_links?: Json | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_items: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          image_url: string | null
          link: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          image_url?: string | null
          link?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          link?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
