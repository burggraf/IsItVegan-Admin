import { Activity } from 'lucide-react'
import ActivityLog from './components/ActivityLog'

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

      <ActivityLog />
    </div>
  )
}