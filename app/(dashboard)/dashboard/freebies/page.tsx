import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Gift, Users } from 'lucide-react'
import ProfilesList from './components/ProfilesList'

export default function FreebiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            Freebies Management
          </h1>
          <p className="text-muted-foreground">
            Manage user profiles and subscription levels
          </p>
        </div>
      </div>

      {/* Profiles Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Profiles
          </CardTitle>
          <CardDescription>
            View and manage user profiles, subscription levels, and expiration dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-lg" />}>
            <ProfilesList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}