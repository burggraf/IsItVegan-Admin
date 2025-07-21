'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Package, Leaf, Users, Activity, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDashboardStats } from '@/lib/hooks/use-dashboard-stats'

export default function DashboardPage() {
  const { data: stats, isLoading: loading, error, refetch } = useDashboardStats()


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your IsItVegan admin panel
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={loading} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          Failed to load dashboard data - Showing fallback data
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Ingredients
            </CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.totalIngredients.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingredients in database
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.totalProducts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Products cataloged
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vegan Products
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {loading ? '...' : stats?.veganProducts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Confirmed vegan products
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Top Classifications */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Classifications</CardTitle>
            <CardDescription>
              Distribution of product classifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-4 bg-gray-200 animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                stats?.classificationDistribution.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {item.classification}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {item.count.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Ingredient Classes</CardTitle>
            <CardDescription>
              Most common ingredient classifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-4 bg-gray-200 animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                stats?.ingredientClassDistribution.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {item.class}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {item.count.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${stats?.recentActivityCount} recent actions logged`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-6 bg-gray-200 animate-pulse rounded" />
              ))}
            </div>
          ) : stats?.recentActivityCount === 0 ? (
            <div className="text-center py-4">
              <Activity className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                No recent activity found
              </p>
              <p className="text-xs text-muted-foreground">
                Activity will appear here as users interact with the IsItVegan app
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Latest {stats?.recentActivityCount} activities • View all in Activity section
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}