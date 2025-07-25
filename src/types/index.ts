import { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  username?: string | null
  fullName?: string | null
  avatarUrl?: string | null
  bio?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser extends User {
  profile?: Profile
}