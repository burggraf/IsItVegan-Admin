'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RefreshCw, Clock, User, AlertCircle, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Product } from '@/lib/supabase'

interface ActionLogEntry {
  id: string
  type: string
  input: string
  userid: string | null
  user_email: string
  created_at: string
  result: string | null
  metadata: Record<string, unknown> | null
  deviceid: string | null
}

interface ActivityResponse {
  activities: ActionLogEntry[]
  total_count: number
  page_size: number
  page_offset: number
  has_more: boolean
}

interface Ingredient {
  title: string
  class: string
}

export default function ActivityLog() {
  const [activities, setActivities] = useState<ActionLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedActivity, setSelectedActivity] = useState<ActionLogEntry | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [productInfo, setProductInfo] = useState<Product | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loadingIngredients, setLoadingIngredients] = useState(false)
  const pageSize = 20

  const fetchActivities = async (page = 0, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_actionlog_paginated', {
        page_size: pageSize,
        page_offset: page * pageSize
      })

      if (error) {
        console.error('Error fetching activities:', error)
        setActivities([])
        setTotalCount(0)
      } else {
        const response = data as ActivityResponse
        setActivities(response.activities || [])
        setTotalCount(response.total_count || 0)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivities([])
      setTotalCount(0)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchActivities(0)
  }, [])

  const handleRefresh = () => {
    fetchActivities(currentPage, true)
  }

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      fetchActivities(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    const maxPage = Math.ceil(totalCount / pageSize) - 1
    if (currentPage < maxPage) {
      fetchActivities(currentPage + 1)
    }
  }

  const handleViewDetails = async (activity: ActionLogEntry) => {
    setSelectedActivity(activity)
    setShowDetailDialog(true)
    setProductInfo(null)
    setIngredients([])
    
    // Check if this is a product-related action
    if (activity.type.toLowerCase().includes('product') && activity.input) {
      setLoadingProduct(true)
      setLoadingIngredients(true)
      
      try {
        const supabase = createClient()
        
        // Fetch product info and ingredients in parallel
        const [productResult, ingredientsResult] = await Promise.all([
          supabase.rpc('admin_get_product', { product_upc: activity.input }),
          supabase.rpc('admin_get_ingredients_for_upc', { product_upc: activity.input })
        ])
        
        if (!productResult.error && productResult.data) {
          setProductInfo(productResult.data)
        }
        
        if (!ingredientsResult.error && ingredientsResult.data) {
          setIngredients(ingredientsResult.data)
        }
      } catch (error) {
        console.error('Error fetching product info or ingredients:', error)
      } finally {
        setLoadingProduct(false)
        setLoadingIngredients(false)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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

  const formatMetadata = (metadata: Record<string, unknown> | null) => {
    if (!metadata) return 'No metadata'
    
    return (
      <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto max-h-64">
        {JSON.stringify(metadata, null, 2)}
      </pre>
    )
  }

  const totalPages = Math.ceil(totalCount / pageSize)
  const startRecord = currentPage * pageSize + 1
  const endRecord = Math.min((currentPage + 1) * pageSize, totalCount)

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
      {/* Header with stats and refresh */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {startRecord}-{endRecord} of {totalCount} activities
        </div>
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

      {/* Activity Table */}
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-muted-foreground">No activity found</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Input</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow 
                  key={activity.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewDetails(activity)}
                >
                  <TableCell>
                    <Badge 
                      className={`text-xs ${getActionTypeColor(activity.type)}`}
                      variant="outline"
                    >
                      {activity.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={activity.input}>
                      {activity.input || 'No input'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getResultIcon(activity.result)}
                      <span className="max-w-xs truncate" title={activity.result || ''}>
                        {activity.result || 'No result'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="text-xs">
                        {activity.user_email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(activity.created_at)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="h-8"
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              className="h-8"
            >
              Next
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[90vw] max-w-[95vw] w-full max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <div className="mt-1">
                    <Badge 
                      className={`text-xs ${getActionTypeColor(selectedActivity.type)}`}
                      variant="outline"
                    >
                      {selectedActivity.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Created At</label>
                  <div className="mt-1 text-sm">
                    {formatDate(selectedActivity.created_at)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">User</label>
                  <div className="mt-1 text-sm flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {selectedActivity.user_email}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Device ID</label>
                  <div className="mt-1 text-sm">
                    {selectedActivity.deviceid || 'N/A'}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Input</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  {selectedActivity.input || 'No input provided'}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Result</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  {selectedActivity.result || 'No result'}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Metadata</label>
                <div className="mt-1">
                  {formatMetadata(selectedActivity.metadata)}
                </div>
              </div>
              
              {/* Product Information Section */}
              {selectedActivity?.type.toLowerCase().includes('product') && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-4 w-4" />
                    <h3 className="text-lg font-semibold">Product Information</h3>
                  </div>
                  
                  {loadingProduct ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Loading product information...
                    </div>
                  ) : productInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Product Name</label>
                        <div className="mt-1 text-sm">
                          {productInfo.product_name || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Brand</label>
                        <div className="mt-1 text-sm">
                          {productInfo.brand || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">UPC</label>
                        <div className="mt-1 text-sm font-mono">
                          {productInfo.upc || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Classification</label>
                        <div className="mt-1 text-sm">
                          {productInfo.classification || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Created</label>
                        <div className="mt-1 text-sm">
                          {productInfo.created ? formatDate(productInfo.created) : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Updated</label>
                        <div className="mt-1 text-sm">
                          {productInfo.lastupdated ? formatDate(productInfo.lastupdated) : 'N/A'}
                        </div>
                      </div>
                      {productInfo.imageurl && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Image URL</label>
                          <div className="mt-1 text-sm break-all">
                            <a 
                              href={productInfo.imageurl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {productInfo.imageurl}
                            </a>
                          </div>
                        </div>
                      )}
                      {productInfo.ingredients && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Ingredients</label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm max-h-32 overflow-y-auto">
                            {productInfo.ingredients}
                          </div>
                        </div>
                      )}
                      {productInfo.analysis && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Analysis</label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm max-h-32 overflow-y-auto">
                            {productInfo.analysis}
                          </div>
                        </div>
                      )}
                      
                      {/* Ingredients Table */}
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">Ingredients</label>
                        {loadingIngredients ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Loading ingredients...
                          </div>
                        ) : ingredients.length > 0 ? (
                          <div className="mt-1 border rounded-md overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="h-8 text-xs">Title</TableHead>
                                  <TableHead className="h-8 text-xs">Class</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {ingredients.map((ingredient, index) => (
                                  <TableRow key={index} className="h-8">
                                    <TableCell className="py-1 text-xs">{ingredient.title}</TableCell>
                                    <TableCell className="py-1 text-xs">
                                      <Badge 
                                        className={`text-xs ${
                                          ingredient.class === 'vegan' ? 'bg-green-100 text-green-800 border-green-200' :
                                          ingredient.class === 'vegetarian' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                          'bg-red-100 text-red-800 border-red-200'
                                        }`}
                                        variant="outline"
                                      >
                                        {ingredient.class}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="mt-1 text-sm text-muted-foreground">
                            No ingredients found
                          </div>
                        )}
                      </div>
                      
                      {productInfo.issues && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Issues</label>
                          <div className="mt-1 p-3 bg-red-50 rounded-md text-sm max-h-32 overflow-y-auto text-red-800">
                            {productInfo.issues}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No product found with UPC: {selectedActivity?.input}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}