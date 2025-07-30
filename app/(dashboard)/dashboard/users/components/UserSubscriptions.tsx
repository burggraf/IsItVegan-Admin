'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, RefreshCw, User, Calendar, CheckCircle, XCircle, Edit2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import EditSubscriptionDialog from './EditSubscriptionDialog'

interface UserSubscription {
  id: string
  user_id: string
  user_email: string
  subscription_level: string
  created_at: string
  updated_at: string
  expires_at: string | null
  is_active: boolean
}

export default function UserSubscriptions() {
  const [query, setQuery] = useState('')
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<UserSubscription | null>(null)

  const searchSubscriptions = async (searchQuery: string = '', isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_user_subscription_search', {
        query: searchQuery.trim(),
        limit_count: 50
      })

      if (error) {
        console.error('Search error:', error)
        setSubscriptions([])
      } else {
        setSubscriptions(data || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
      setSubscriptions([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchSubscriptions(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleRefresh = () => {
    searchSubscriptions(query, true)
  }

  const handleSubscriptionUpdated = () => {
    searchSubscriptions(query, true)
    setEditingSubscription(null)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSubscriptionColor = (level: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-800 border-gray-200'
    
    switch (level.toLowerCase()) {
      case 'premium':
      case 'pro':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'plus':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'basic':
      case 'free':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
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
      {/* Search and Controls */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search Help */}
      <div className="text-xs text-muted-foreground">
        💡 Search by email address or leave empty to show all subscriptions
      </div>

      {/* Results */}
      {subscriptions.length === 0 ? (
        <div className="text-center py-8">
          <User className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-muted-foreground">
            {query ? `No subscriptions found for "${query}"` : 'No active subscriptions found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Found {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
          </p>
          
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        className={`text-xs ${getSubscriptionColor(subscription.subscription_level, subscription.is_active)}`}
                        variant="outline"
                      >
                        {subscription.subscription_level}
                      </Badge>
                      {subscription.is_active ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {isExpired(subscription.expires_at) && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">
                          {subscription.user_email || 'No email'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>
                        <p className={`font-medium ${isExpired(subscription.expires_at) ? 'text-red-600' : subscription.expires_at ? 'text-orange-600' : 'text-gray-600'}`}>
                          {formatDate(subscription.expires_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
                      <div>
                        <span className="text-muted-foreground">User ID:</span>
                        <p className="font-mono text-xs break-all">
                          {subscription.user_id}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <p className={subscription.is_active ? 'text-green-600' : 'text-red-600'}>
                          {subscription.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created: {formatDate(subscription.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Updated: {formatDate(subscription.updated_at)}
                      </span>
                      {subscription.expires_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {formatDate(subscription.expires_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSubscription(subscription)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingSubscription && (
        <EditSubscriptionDialog
          subscription={editingSubscription}
          open={!!editingSubscription}
          onClose={() => setEditingSubscription(null)}
          onSuccess={handleSubscriptionUpdated}
        />
      )}
    </div>
  )
}