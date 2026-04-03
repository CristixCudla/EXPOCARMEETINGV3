import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper to get user profile with role
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

// Helper to check if user is admin
export async function isAdmin() {
  try {
    const user = await getCurrentUser()
    if (!user) return false
    const profile = await getUserProfile(user.id)
    return profile.role === 'admin'
  } catch {
    return false
  }
}

// Helper to check if user is organizer or admin
export async function isOrganizerOrAdmin() {
  try {
    const user = await getCurrentUser()
    if (!user) return false
    const profile = await getUserProfile(user.id)
    return profile.role === 'admin' || profile.role === 'organizer'
  } catch {
    return false
  }
}
