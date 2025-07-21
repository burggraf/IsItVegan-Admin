import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Clock } from 'lucide-react'

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

      {/* Placeholder for future implementation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>
            Activity monitoring will be implemented in a future update
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}