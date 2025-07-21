'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Package, CheckCircle, XCircle, Leaf, Building } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface ProductStat {
  classification: string | null
  count: number
  percentage: number
}

interface BrandStat {
  brand: string | null
  count: number
  percentage: number
}

interface StatsData {
  total_products: number
  classified_products: number
  unclassified_products: number
  vegan_products: number
  vegetarian_products: number
  classification_distribution: ProductStat[]
  brand_distribution: BrandStat[]
}

export default function ProductStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_get_product_stats')

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
            <Package className="h-5 w-5" />
            Product Statistics
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
            <Package className="h-5 w-5" />
            Product Statistics
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
    (stats.classified_products / stats.total_products) * 100
  )

  const veganRate = Math.round(
    (stats.vegan_products / stats.total_products) * 100
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Statistics
            </CardTitle>
            <Button onClick={fetchStats} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Total Products */}
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.total_products.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Products</div>
            </div>

            {/* Classified */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.classified_products.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Classified</div>
              <div className="text-xs text-green-600 font-medium">
                {classificationRate}%
              </div>
            </div>

            {/* Vegan */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {stats.vegan_products.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Vegan</div>
              <div className="text-xs text-green-500 font-medium">
                {veganRate}%
              </div>
            </div>

            {/* Vegetarian */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.vegetarian_products.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Vegetarian</div>
            </div>

            {/* Unclassified */}
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.unclassified_products.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Unclassified</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Classification Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Classification Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.classification_distribution.length > 0 ? (
                stats.classification_distribution.map((item, index) => {
                  const getClassificationIcon = (classification: string) => {
                    switch (classification.toLowerCase()) {
                      case 'vegan':
                        return <CheckCircle className="h-3 w-3 text-green-500" />
                      case 'vegetarian':
                        return <CheckCircle className="h-3 w-3 text-blue-500" />
                      case 'not vegan':
                      case 'not vegetarian':
                        return <XCircle className="h-3 w-3 text-red-500" />
                      default:
                        return <Package className="h-3 w-3 text-gray-500" />
                    }
                  }

                  const getClassificationColor = (classification: string) => {
                    switch (classification.toLowerCase()) {
                      case 'vegan':
                        return 'bg-green-100 text-green-800 border-green-200'
                      case 'vegetarian':
                        return 'bg-blue-100 text-blue-800 border-blue-200'
                      case 'not vegan':
                      case 'not vegetarian':
                        return 'bg-red-100 text-red-800 border-red-200'
                      case 'unknown':
                        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      default:
                        return 'bg-gray-100 text-gray-800 border-gray-200'
                    }
                  }

                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`text-xs flex items-center gap-1 ${getClassificationColor(item.classification || 'unclassified')}`}
                          variant="outline"
                        >
                          {getClassificationIcon(item.classification || 'unclassified')}
                          {item.classification || 'Unclassified'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{item.count.toLocaleString()}</span>
                        <span className="text-muted-foreground">
                          ({Math.round(item.percentage)}%)
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No classification data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Brand Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Top Brands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.brand_distribution.length > 0 ? (
                stats.brand_distribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {item.brand || 'Unknown Brand'}
                      </span>
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
                  No brand data available
                </p>
              )}
              {stats.brand_distribution.length === 15 && (
                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  Showing top 15 brands
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}