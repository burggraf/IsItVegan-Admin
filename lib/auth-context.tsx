'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const checkingAdmin = useRef(false)
  const supabase = createClient()

  const checkAdminStatus = useCallback(async (email: string): Promise<boolean> => {
    if (checkingAdmin.current) {
      console.log('Admin check already in progress, skipping')
      return isAdmin
    }
    
    checkingAdmin.current = true
    
    try {
      console.log('Checking admin status for:', email)
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Admin check timeout')), 3000)
      })
      
      const adminCheckPromise = supabase.rpc('admin_check_user_access', {
        user_email: email
      })
      
      const { data, error } = await Promise.race([adminCheckPromise, timeoutPromise])
      
      console.log('Admin check result:', { data, error })
      
      if (!error && data) {
        console.log('User is admin')
        setIsAdmin(true)
        return true
      } else if (error?.message?.includes('function') && process.env.NODE_ENV === 'development') {
        // Fallback for development when admin function doesn't exist
        console.log('Admin function not found, allowing access in development')
        setIsAdmin(true)
        return true
      } else {
        console.log('User is not admin or error occurred')
        setIsAdmin(false)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.log('Admin check failed:', errorMessage)
      
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Allowing access despite admin check failure')
        setIsAdmin(true)
        return true
      }
      
      console.log('Production mode: Denying access due to admin check failure')
      setIsAdmin(false)
      return false
    } finally {
      checkingAdmin.current = false
    }
  }, [supabase, isAdmin])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session:', !!session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await checkAdminStatus(session.user.email!)
        } else {
          console.log('No session found')
        }
      } catch (err) {
        console.error('Error getting initial session:', err)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await checkAdminStatus(session.user.email!)
        } else {
          setIsAdmin(false)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [checkAdminStatus, supabase.auth])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      // Check admin status after successful login
      if (data.user?.email) {
        const isUserAdmin = await checkAdminStatus(data.user.email)
        if (!isUserAdmin && process.env.NODE_ENV !== 'development') {
          await supabase.auth.signOut()
          return { error: 'Access denied: Admin privileges required' }
        }
        // In development mode, allow login even if admin check fails
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Login allowed regardless of admin status')
        }
      }

      return {}
    } catch {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}