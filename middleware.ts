import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🚀 Middleware triggered for:', request.nextUrl.pathname)
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/',
  ],
}