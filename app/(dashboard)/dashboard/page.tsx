import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { BarChart3, Package, Leaf, Users, Activity } from 'lucide-react'

async function getStats() {
  const supabase = await createClient()
  
  try {
    // Get comprehensive stats using the newer JSONB functions
    const [
      { data: ingredientStats, error: ingredientError },
      { data: productStats, error: productError },
      { data: userStats, error: userError },
      { data: recentActivity, error: activityError }
    ] = await Promise.all([
      supabase.rpc('admin_get_ingredient_stats'),
      supabase.rpc('admin_get_product_stats'),
      supabase.rpc('admin_user_stats'),
      supabase.rpc('admin_actionlog_recent', { limit_count: 10 })
    ])

    if (ingredientError) console.error('Ingredient stats error:', ingredientError)
    if (productError) console.error('Product stats error:', productError)
    if (userError) console.error('User stats error:', userError)
    if (activityError) console.error('Activity error:', activityError)

    return {
      ingredientStats: ingredientStats || {},
      productStats: productStats || {},
      userStats: userStats || [],
      recentActivityCount: recentActivity?.length || 0
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      ingredientStats: {},
      productStats: {},
      userStats: [],
      recentActivityCount: 0
    }
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  // Extract totals from the JSONB stats
  const totalIngredients = (stats.ingredientStats as any)?.total_ingredients || 0
  const totalProducts = (stats.productStats as any)?.total_products || 0
  const veganProducts = (stats.productStats as any)?.vegan_products || 0
  
  // Convert user stats array to object for easier access
  const userStatsMap: Record<string, number> = {}
  if (Array.isArray(stats.userStats)) {
    stats.userStats.forEach((stat: any) => {
      userStatsMap[stat.stat_type] = stat.count
    })
  }
  const totalUsers = userStatsMap.total_users || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your IsItVegan admin panel
        </p>
      </div>

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
            <div className="text-2xl font-bold">{totalIngredients.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">{totalProducts.toLocaleString()}</div>
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
            <div className="text-2xl font-bold text-primary">{veganProducts.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
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
              {((stats.productStats as any)?.classification_distribution || [])
                .slice(0, 5)
                .map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {item.classification}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {item.count?.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
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
              {((stats.ingredientStats as any)?.class_distribution || [])
                .slice(0, 5)
                .map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {item.class}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {item.count?.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
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
            {stats.recentActivityCount} recent actions logged
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            View detailed activity logs in the Activity section.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}