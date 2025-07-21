import { createClient } from '@/utils/supabase/client'

export interface AuthUser {
  id: string
  email: string | undefined
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  return {
    id: user.id,
    email: user.email
  }
}

export const signIn = async (email: string, password: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export const signOut = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message)
  }
}

// Check if user is admin (will be implemented via Supabase function)
export const isUserAdmin = async (email: string): Promise<boolean> => {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('admin_check_user_access', { user_email: email })
    if (error) {
      console.error('Admin check failed:', error)
      return false
    }
    return data === true
  } catch (error) {
    console.error('Admin check error:', error)
    return false
  }
}