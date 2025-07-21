import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { BarChart3, Package, Leaf, Users, Activity } from 'lucide-react'
import { StatRecord } from '@/lib/supabase'

async function getStats() {
  const supabase = await createClient()
  
  try {
    // Get ingredient stats
    const { data: ingredientStats } = await supabase.rpc('admin_ingredient_stats')
    
    // Get product stats  
    const { data: productStats } = await supabase.rpc('admin_product_stats')
    
    // Get user stats
    const { data: userStats } = await supabase.rpc('admin_user_stats')
    
    // Get recent activity count
    const { data: recentActivity } = await supabase.rpc('admin_actionlog_recent', { limit_count: 10 })

    return {
      ingredientStats: ingredientStats || [],
      productStats: productStats || [],
      userStats: userStats || [],
      recentActivityCount: recentActivity?.length || 0
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      ingredientStats: [],
      productStats: [],
      userStats: [],
      recentActivityCount: 0
    }
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  // Calculate totals
  const totalIngredients = stats.ingredientStats
    .filter((stat: StatRecord) => stat.stat_type === 'class')
    .reduce((sum: number, stat: StatRecord) => sum + (stat.count || 0), 0)

  const totalProducts = stats.productStats
    .filter((stat: StatRecord) => stat.stat_type === 'classification')
    .reduce((sum: number, stat: StatRecord) => sum + (stat.count || 0), 0)

  const totalUsers = stats.userStats
    .find((stat: StatRecord) => stat.stat_type === 'total_users')?.count || 0

  const veganProducts = stats.productStats
    .find((stat: StatRecord) => stat.stat_type === 'classification' && stat.stat_value === 'vegan')?.count || 0

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
              {stats.productStats
                .filter((stat: StatRecord) => stat.stat_type === 'classification')
                .slice(0, 5)
                .map((stat: StatRecord, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {stat.stat_value === 'NULL' ? 'Unclassified' : stat.stat_value}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {stat.count?.toLocaleString()}
                    </span>
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
              {stats.ingredientStats
                .filter((stat: StatRecord) => stat.stat_type === 'class')
                .slice(0, 5)
                .map((stat: StatRecord, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {stat.stat_value === 'NULL' ? 'Unclassified' : stat.stat_value}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {stat.count?.toLocaleString()}
                    </span>
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