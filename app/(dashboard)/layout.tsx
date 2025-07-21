import { signOut } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  BarChart3, 
  Package, 
  Users, 
  Activity, 
  LogOut,
  Leaf
} from 'lucide-react'

export const runtime = 'edge';

async function SignOutButton() {
  return (
    <form action={async () => {
      'use server'
      await signOut()
      redirect('/login')
    }}>
      <Button variant="ghost" size="sm" className="w-full justify-start">
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </form>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: BarChart3 },
    { name: 'Ingredients', href: '/dashboard/ingredients', icon: Leaf },
    { name: 'Products', href: '/dashboard/products', icon: Package },
    { name: 'Activity', href: '/dashboard/activity', icon: Activity },
    { name: 'Users', href: '/dashboard/users', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-x-3 px-6 border-b">
            <div className="w-8 h-8 relative">
              <Image
                src="/logo.svg"
                alt="IsItVegan Logo"
                width={32}
                height={32}
                className="rounded"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-primary">IsItVegan</h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User info and sign out */}
          <div className="border-t px-4 py-4 space-y-2">
            <div className="flex items-center gap-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}