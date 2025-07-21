import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserPlus, Mail, Calendar } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge'

async function getUserStats() {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase.rpc('admin_user_stats')

    if (error) {
      console.error('Error fetching user stats:', error)
      return {
        total_users: 0,
        email_users: 0,
        recent_users_30d: 0
      }
    }

    // Convert array of stats to object
    const stats: Record<string, number> = {}
    if (data) {
      data.forEach((stat: { stat_type: string; count: number }) => {
        stats[stat.stat_type] = stat.count
      })
    }

    return {
      total_users: stats.total_users || 0,
      email_users: stats.email_users || 0,
      recent_users_30d: stats.recent_users_30d || 0
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      total_users: 0,
      email_users: 0,
      recent_users_30d: 0
    }
  }
}

export default async function UserStats() {
  const stats = await getUserStats()

  // Calculate growth rate (basic calculation)
  const growthRate = stats.total_users > 0 
    ? Math.round((stats.recent_users_30d / stats.total_users) * 100)
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_users.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Registered user accounts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Email Users</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.email_users.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Users with email addresses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recent_users_30d.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            +{growthRate}% of total users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{growthRate}%</div>
          <p className="text-xs text-muted-foreground">
            Monthly growth rate
          </p>
        </CardContent>
      </Card>
    </div>
  )
}