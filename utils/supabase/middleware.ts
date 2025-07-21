import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('Middleware - Path:', request.nextUrl.pathname, 'User:', user?.email || 'none')

  // Check if user is accessing dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      console.log('Middleware - No user, redirecting to login')
      // No session, redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Check admin access
    if (user.email) {
      try {
        console.log('Middleware - Checking admin access for:', user.email)
        const { data: isAdmin, error } = await supabase.rpc('admin_check_user_access', {
          user_email: user.email
        })
        
        console.log('Middleware - Admin check result:', { isAdmin, error: error?.message })
        
        if (error || !isAdmin) {
          console.log('Middleware - Access denied, redirecting to login')
          const url = request.nextUrl.clone()
          url.pathname = '/login'
          url.searchParams.set('error', 'unauthorized')
          return NextResponse.redirect(url)
        }
        
        console.log('Middleware - Admin access granted, proceeding to dashboard')
      } catch (error) {
        console.error('Admin check failed:', error)
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('error', 'check_failed')
        return NextResponse.redirect(url)
      }
    } else {
      console.log('Middleware - No email found for user, redirecting to login')
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'no_email')
      return NextResponse.redirect(url)
    }
  }

  // Redirect root to dashboard
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}