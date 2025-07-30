'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit2, Package, Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import EditIngredientDialog from './EditIngredientDialog'

interface Ingredient {
  title: string
  class: string | null
  primary_class: string | null
  productcount: number
  lastupdated: string
  created: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
}

export default function NewestIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  })

  const ITEMS_PER_PAGE = 20

  const fetchNewestIngredients = async (page: number = 1) => {
    setLoading(true)
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_get_newest_ingredients', {
        page_size: ITEMS_PER_PAGE,
        page_offset: (page - 1) * ITEMS_PER_PAGE
      })

      if (error) {
        console.error('Error fetching newest ingredients:', error)
        setIngredients([])
      } else {
        setIngredients(data?.ingredients || [])
        setPagination({
          currentPage: page,
          totalPages: Math.ceil((data?.total_count || 0) / ITEMS_PER_PAGE),
          totalCount: data?.total_count || 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch newest ingredients:', error)
      setIngredients([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNewestIngredients(1)
  }, [])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchNewestIngredients(newPage)
    }
  }

  const handleIngredientUpdated = () => {
    // Refresh current page
    fetchNewestIngredients(pagination.currentPage)
    setEditingIngredient(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getClassificationColor = (classification: string | null) => {
    if (!classification) return 'bg-gray-100 text-gray-800 border-gray-200'
    
    switch (classification.toLowerCase()) {
      case 'vegan':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'vegetarian':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'non-vegetarian':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground mt-2">Loading newest ingredients...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pagination.totalCount} ingredients total, sorted by newest first
        </p>
        
        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      {ingredients.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-muted-foreground">
            No ingredients found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ingredients.map((ingredient) => (
            <Card key={ingredient.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{ingredient.title}</h3>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getClassificationColor(ingredient.class)}`}
                      >
                        {ingredient.class || 'Unclassified'}
                      </Badge>
                      {ingredient.primary_class && (
                        <Badge variant="secondary" className="text-xs">
                          Primary: {ingredient.primary_class}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {ingredient.productcount} products
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created: {formatDateTime(ingredient.created)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Updated: {formatDate(ingredient.lastupdated)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingIngredient(ingredient)}
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

      {/* Bottom Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground px-2">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingIngredient && (
        <EditIngredientDialog
          ingredient={editingIngredient}
          open={!!editingIngredient}
          onClose={() => setEditingIngredient(null)}
          onSuccess={handleIngredientUpdated}
        />
      )}
    </div>
  )
}