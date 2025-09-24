import { createClient } from '@supabase/supabase-js'

// Demo Supabase configuration - replace with your actual credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzenNyY2xwa3BueWNsa3VybHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1OTkyMjEsImV4cCI6MjA3NDE3NTIyMX0.YkNHcJ1B0Kk6dnwMpwsDzx3XR7rDcBhHEHUzJTut994'

// Validate configuration
if (!supabaseUrl || supabaseUrl.includes('your-project') || supabaseUrl.includes('demo-project')) {
  console.warn('⚠️ Using demo Supabase configuration. Please update .env with your actual credentials.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          balance: number
          created_at: string
          last_withdrawal: string | null
          total_invested: number
          total_earned: number
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          balance?: number
          created_at?: string
          last_withdrawal?: string | null
          total_invested?: number
          total_earned?: number
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          balance?: number
          created_at?: string
          last_withdrawal?: string | null
          total_invested?: number
          total_earned?: number
        }
      }
      miners: {
        Row: {
          id: string
          name: string
          price: number
          duration_days: number
          daily_return: number
          total_return_percentage: number
          description: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          duration_days: number
          daily_return: number
          total_return_percentage?: number
          description?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          duration_days?: number
          daily_return?: number
          total_return_percentage?: number
          description?: string | null
          active?: boolean
          created_at?: string
        }
      }
      user_miners: {
        Row: {
          id: string
          user_id: string
          miner_id: string
          purchase_date: string
          end_date: string
          last_drop: string | null
          total_earned: number
          drops_received: number
          active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          miner_id: string
          purchase_date: string
          end_date: string
          last_drop?: string | null
          total_earned?: number
          drops_received?: number
          active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          miner_id?: string
          purchase_date?: string
          end_date?: string
          last_drop?: string | null
          total_earned?: number
          drops_received?: number
          active?: boolean
        }
      }
      withdrawals: {
        Row: {
          id: string
          user_id: string
          amount: number
          status: 'pending' | 'completed' | 'rejected'
          bank_name: string | null
          account_number: string | null
          account_name: string | null
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          status?: 'pending' | 'completed' | 'rejected'
          bank_name?: string | null
          account_number?: string | null
          account_name?: string | null
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          status?: 'pending' | 'completed' | 'rejected'
          bank_name?: string | null
          account_number?: string | null
          account_name?: string | null
          created_at?: string
          processed_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}