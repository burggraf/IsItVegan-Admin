'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Edit2, Trash2, Calendar, Package } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import EditIngredientDialog from './EditIngredientDialog'
import DeleteIngredientDialog from './DeleteIngredientDialog'

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

  const searchIngredients = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setIngredients([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setHasSearched(true)
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_search_ingredients', {
        query: searchQuery,
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
      searchIngredients(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search ingredients by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
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
    </div>
  )
}