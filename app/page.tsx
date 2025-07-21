'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('Auth state:', { user: !!user, loading, isAdmin })
    
    if (!loading) {
      if (user && isAdmin) {
        console.log('Redirecting to dashboard')
        router.push('/dashboard')
      } else {
        console.log('Redirecting to login')
        router.push('/login')
      }
    }
  }, [user, loading, isAdmin, router])

  // Add a timeout fallback in case auth never resolves
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Auth timeout, redirecting to login')
        router.push('/login')
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timeout)
  }, [loading, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Redirecting...</span>
      </div>
    </div>
  )
}