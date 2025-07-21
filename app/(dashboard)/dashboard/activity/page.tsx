import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Clock } from 'lucide-react'
import ActivityLog from './components/ActivityLog'
import ActivityStats from './components/ActivityStats'

export const runtime = 'edge'

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Activity Monitoring
          </h1>
          <p className="text-muted-foreground">
            Monitor user activity, API calls, and system actions across the IsItVegan platform
          </p>
        </div>
      </div>

      {/* Statistics */}
      <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-lg" />}>
        <ActivityStats />
      </Suspense>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Real-time log of user actions, API calls, and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityLog />
        </CardContent>
      </Card>
    </div>
  )
}