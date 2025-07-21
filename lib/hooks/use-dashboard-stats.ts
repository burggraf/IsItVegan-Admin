import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

interface DashboardStats {
  totalIngredients: number
  totalProducts: number
  veganProducts: number
  totalUsers: number
  classificationDistribution: Array<{ classification: string; count: number; percentage: number }>
  ingredientClassDistribution: Array<{ class: string; count: number; percentage: number }>
  recentActivityCount: number
}

const fallbackStats: DashboardStats = {
  totalIngredients: 227000,
  totalProducts: 410000,
  veganProducts: 85000,
  totalUsers: 15000,
  classificationDistribution: [
    { classification: 'Vegan', count: 85000, percentage: 21 },
    { classification: 'Vegetarian', count: 65000, percentage: 16 },
    { classification: 'Not Vegan', count: 180000, percentage: 44 },
    { classification: 'Unknown', count: 80000, percentage: 19 }
  ],
  ingredientClassDistribution: [
    { class: 'Additives', count: 45000, percentage: 20 },
    { class: 'Spices', count: 38000, percentage: 17 },
    { class: 'Fruits', count: 32000, percentage: 14 },
    { class: 'Vegetables', count: 28000, percentage: 12 },
    { class: 'Grains', count: 25000, percentage: 11 }
  ],
  recentActivityCount: 0
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    console.log('Fetching dashboard stats...')
    const supabase = createClient()
    
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

    if (ingredientError || productError || userError || activityError) {
      console.error('Error fetching dashboard stats:', {
        ingredientError,
        productError,
        userError,
        activityError
      })
      throw new Error('Failed to fetch dashboard stats')
    }

    const userStatsMap: Record<string, number> = {}
    if (Array.isArray(userStats)) {
      userStats.forEach((stat: { stat_type: string; count: number }) => {
        userStatsMap[stat.stat_type] = stat.count
      })
    }

    const result = {
      totalIngredients: (ingredientStats as Record<string, unknown>)?.total_ingredients as number || 0,
      totalProducts: (productStats as Record<string, unknown>)?.total_products as number || 0,
      veganProducts: (productStats as Record<string, unknown>)?.vegan_products as number || 0,
      totalUsers: userStatsMap.total_users || 0,
      classificationDistribution: (productStats as Record<string, unknown>)?.classification_distribution as Array<{ classification: string; count: number; percentage: number }> || [],
      ingredientClassDistribution: (ingredientStats as Record<string, unknown>)?.class_distribution as Array<{ class: string; count: number; percentage: number }> || [],
      recentActivityCount: recentActivity?.length || 0
    }
    
    console.log('Dashboard stats fetched successfully:', result)
    return result
  } catch (error) {
    console.error('Failed to fetch dashboard stats, using fallback:', error)
    throw error
  }
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: fallbackStats,
    throwOnError: false,
  })
}