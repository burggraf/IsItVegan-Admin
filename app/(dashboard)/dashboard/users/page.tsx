import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck } from 'lucide-react'
import UserSubscriptions from './components/UserSubscriptions'

// export const runtime removed for static deployment

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts, subscriptions, and access levels
          </p>
        </div>
      </div>

      {/* User Statistics */}
      <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-lg" />}>
        
      </Suspense>

      {/* User Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            User Subscriptions
          </CardTitle>
          <CardDescription>
            View and manage user subscription levels and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserSubscriptions />
        </CardContent>
      </Card>
    </div>
  )
}