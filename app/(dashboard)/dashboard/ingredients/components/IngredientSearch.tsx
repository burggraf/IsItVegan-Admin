'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Edit2, Trash2, Calendar, Package, Filter } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import EditIngredientDialog from './EditIngredientDialog'
import DeleteIngredientDialog from './DeleteIngredientDialog'
import SearchFiltersDialog, { SearchFilters } from './SearchFiltersDialog'

interface Ingredient {
  title: string
  class: string | null
  primary_class: string | null
  productcount: number
  lastupdated: string
  created: string
}

export default function IngredientSearch() {
  const [query, setQuery] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    classes: [],
    primaryClasses: []
  })

  const searchIngredients = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setIngredients([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setHasSearched(true)
    
    // Process wildcard characters (* and %)
    let processedQuery = searchQuery.trim()
    let searchType = 'exact' // exact, starts_with, ends_with, contains
    
    if (processedQuery.includes('*') || processedQuery.includes('%')) {
      // Replace * with % for SQL LIKE pattern
      processedQuery = processedQuery.replace(/\*/g, '%')
      
      // Determine search type based on wildcard position
      if (processedQuery.startsWith('%') && processedQuery.endsWith('%')) {
        searchType = 'contains'
      } else if (processedQuery.startsWith('%')) {
        searchType = 'ends_with'
      } else if (processedQuery.endsWith('%')) {
        searchType = 'starts_with'
      } else {
        searchType = 'pattern' // Custom pattern with % in middle
      }
    }
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_search_ingredients_with_filters', {
        query: processedQuery,
        search_type: searchType,
        filter_classes: filters.classes.length > 0 ? filters.classes : null,
        filter_primary_classes: filters.primaryClasses.length > 0 ? filters.primaryClasses : null,
        limit_count: 50
      })

      if (error) {
        console.error('Search error:', error)
        setIngredients([])
      } else {
        setIngredients(data || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
      setIngredients([])
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        searchIngredients(query)
      } else {
        setIngredients([])
        setHasSearched(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, filters]) // searchIngredients is not included as it uses the latest values via closure

  const handleIngredientUpdated = () => {
    // Refresh search results
    searchIngredients(query)
    setEditingIngredient(null)
  }

  const handleIngredientDeleted = () => {
    // Refresh search results
    searchIngredients(query)
    setDeletingIngredient(null)
  }

  const handleApplyFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({ classes: [], primaryClasses: [] })
  }

  const hasActiveFilters = filters.classes.length > 0 || filters.primaryClasses.length > 0
  const totalFilters = filters.classes.length + filters.primaryClasses.length

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search ingredients by exact title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(true)}
            className={`flex items-center gap-2 ${hasActiveFilters ? 'border-primary text-primary' : ''}`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {totalFilters}
              </Badge>
            )}
          </Button>
        </div>
        
        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {filters.classes.map(cls => (
              <Badge key={`class-${cls}`} variant="outline" className="text-xs">
                class: {cls === 'null' ? 'empty' : cls}
              </Badge>
            ))}
            {filters.primaryClasses.map(primaryCls => (
              <Badge key={`primary-${primaryCls}`} variant="outline" className="text-xs">
                primary: {primaryCls === 'null' ? 'empty' : primaryCls}
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-6 px-2 text-xs"
            >
              Clear filters
            </Button>
          </div>
        )}
        
        {/* Search Help Text */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
          <div className="font-medium mb-1">Search Examples:</div>
          <div className="space-y-1">
            <div><code className="bg-background px-1 rounded">salt</code> → finds exact title &quot;salt&quot;</div>
            <div><code className="bg-background px-1 rounded">salt*</code> → finds titles starting with &quot;salt&quot;</div>
            <div><code className="bg-background px-1 rounded">*salt</code> → finds titles ending with &quot;salt&quot;</div>
            <div><code className="bg-background px-1 rounded">*salt*</code> → finds titles containing &quot;salt&quot;</div>
          </div>
          <div className="mt-2 text-xs opacity-75">Use * or % as wildcards for partial matching</div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground mt-2">Searching ingredients...</p>
        </div>
      )}

      {/* No Results */}
      {hasSearched && !loading && ingredients.length === 0 && (
        <div className="text-center py-8">
          <Search className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-muted-foreground">
            {query ? `No ingredients found for "${query}"` : 'Enter a search term to find ingredients'}
          </p>
        </div>
      )}

      {/* Results */}
      {ingredients.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Found {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
          </p>
          
          {ingredients.map((ingredient) => (
            <Card key={ingredient.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{ingredient.title}</h3>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {ingredient.class && (
                        <Badge variant="secondary" className="text-xs">
                          Class: {ingredient.class}
                        </Badge>
                      )}
                      {ingredient.primary_class && (
                        <Badge variant="outline" className="text-xs">
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
                        <Calendar className="h-3 w-3" />
                        Created: {formatDate(ingredient.created)}
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingIngredient(ingredient)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

      {/* Delete Dialog */}
      {deletingIngredient && (
        <DeleteIngredientDialog
          ingredient={deletingIngredient}
          open={!!deletingIngredient}
          onClose={() => setDeletingIngredient(null)}
          onSuccess={handleIngredientDeleted}
        />
      )}

      {/* Search Filters Dialog */}
      <SearchFiltersDialog
        open={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </div>
  )
}