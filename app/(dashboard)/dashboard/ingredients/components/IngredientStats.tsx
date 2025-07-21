'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, Database, PieChart } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface IngredientStat {
  class: string | null
  count: number
  percentage: number
}

interface StatsData {
  total_ingredients: number
  with_classification: number
  without_classification: number
  class_distribution: IngredientStat[]
  primary_class_distribution: IngredientStat[]
}

export default function IngredientStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_get_ingredient_stats')

      if (error) {
        setError(error.message)
      } else {
        setStats(data)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Ingredient Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading statistics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Ingredient Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-destructive mb-4">
              {error || 'Failed to load statistics'}
            </p>
            <Button onClick={fetchStats} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const classificationRate = Math.round(
    (stats.with_classification / stats.total_ingredients) * 100
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Ingredient Statistics
            </CardTitle>
            <Button onClick={fetchStats} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Ingredients */}
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.total_ingredients.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Ingredients</div>
            </div>

            {/* With Classification */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.with_classification.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Classified</div>
            </div>

            {/* Without Classification */}
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.without_classification.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Unclassified</div>
            </div>

            {/* Classification Rate */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {classificationRate}%
              </div>
              <div className="text-sm text-muted-foreground">Classification Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Class Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.class_distribution.length > 0 ? (
                stats.class_distribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.class || 'Unclassified'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{item.count.toLocaleString()}</span>
                      <span className="text-muted-foreground">
                        ({Math.round(item.percentage)}%)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No class data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Primary Class Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Primary Class Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.primary_class_distribution.length > 0 ? (
                stats.primary_class_distribution.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.class || 'Unclassified'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{item.count.toLocaleString()}</span>
                      <span className="text-muted-foreground">
                        ({Math.round(item.percentage)}%)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No primary class data available
                </p>
              )}
              {stats.primary_class_distribution.length > 10 && (
                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  Showing top 10 of {stats.primary_class_distribution.length} primary classes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}