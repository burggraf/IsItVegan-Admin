import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, Zap, Clock } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

async function getActivityStats() {
  const supabase = await createClient()
  
  try {
    // Get recent activity counts (last 24 hours, last week, etc.)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    // Get activity counts for different time periods
    const [
      { count: todayCount },
      { count: weekCount },
      { count: totalCount }
    ] = await Promise.all([
      supabase
        .from('actionlog')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo),
      supabase
        .from('actionlog')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo),
      supabase
        .from('actionlog')
        .select('*', { count: 'exact', head: true })
    ])

    // Get unique users active today
    const { count: activeUsersToday } = await supabase
      .from('actionlog')
      .select('userid', { count: 'exact', head: true })
      .gte('created_at', oneDayAgo)

    return {
      todayCount: todayCount || 0,
      weekCount: weekCount || 0,
      totalCount: totalCount || 0,
      activeUsersToday: activeUsersToday || 0
    }
  } catch (error) {
    console.error('Error fetching activity stats:', error)
    return {
      todayCount: 0,
      weekCount: 0,
      totalCount: 0,
      activeUsersToday: 0
    }
  }
}

export default async function ActivityStats() {
  const stats = await getActivityStats()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Activity</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayCount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Actions in the last 24 hours
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.weekCount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Actions in the last 7 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users Today</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsersToday.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Unique users active today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            All-time activity count
          </p>
        </CardContent>
      </Card>
    </div>
  )
}