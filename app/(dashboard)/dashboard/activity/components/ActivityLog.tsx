'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Clock, User, Smartphone, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface ActionLogEntry {
  id: string
  type: string
  input: string
  userid: string | null
  created_at: string
  result: string | null
  metadata: Record<string, unknown> | null
  deviceid: string | null
}

export default function ActivityLog() {
  const [activities, setActivities] = useState<ActionLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchActivities = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_actionlog_recent', {
        limit_count: 100
      })

      if (error) {
        console.error('Error fetching activities:', error)
        setActivities([])
      } else {
        setActivities(data || [])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivities([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const handleRefresh = () => {
    fetchActivities(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'scan':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'search':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'lookup':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'classify':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getResultIcon = (result: string | null) => {
    if (!result) return null
    
    const resultLower = result.toLowerCase()
    if (resultLower.includes('error') || resultLower.includes('failed')) {
      return <AlertCircle className="h-3 w-3 text-red-500" />
    }
    return null
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 animate-pulse h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {activities.length} recent activities
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-8"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Activity List */}
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-muted-foreground">No recent activity found</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {activities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        className={`text-xs ${getActionTypeColor(activity.type)}`}
                        variant="outline"
                      >
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(activity.created_at)}
                      </span>
                      {getResultIcon(activity.result)}
                    </div>
                    
                    <div className="text-sm font-medium mb-1">
                      {activity.input || 'No input provided'}
                    </div>
                    
                    {activity.result && (
                      <div className="text-xs text-muted-foreground mb-2">
                        Result: {activity.result}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {activity.userid && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {activity.userid.substring(0, 8)}...
                        </span>
                      )}
                      {activity.deviceid && (
                        <span className="flex items-center gap-1">
                          <Smartphone className="h-3 w-3" />
                          {activity.deviceid.substring(0, 8)}...
                        </span>
                      )}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <span className="text-blue-600">
                          {Object.keys(activity.metadata).length} metadata fields
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}