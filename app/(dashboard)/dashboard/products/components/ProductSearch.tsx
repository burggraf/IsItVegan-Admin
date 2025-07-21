'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Edit2, Calendar, Barcode, Building } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import EditProductDialog from './EditProductDialog'
import Image from 'next/image'

interface Product {
  product_name: string | null
  brand: string | null
  upc: string | null
  ean13: string
  ingredients: string | null
  analysis: string | null
  classification: string | null
  lastupdated: string
  created: string
  mfg: string | null
  imageurl: string | null
  issues: string | null
}

export default function ProductSearch() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const searchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setHasSearched(true)
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_search_products', {
        query: searchQuery,
        limit_count: 50
      })

      if (error) {
        console.error('Search error:', error)
        setProducts([])
      } else {
        setProducts(data || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleProductUpdated = () => {
    // Refresh search results
    searchProducts(query)
    setEditingProduct(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getClassificationColor = (classification: string | null) => {
    switch (classification?.toLowerCase()) {
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
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search products by name, brand, UPC, or EAN13..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Search Help */}
      <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
        <span>💡 Try:</span>
        <code className="bg-muted px-1.5 py-0.5 rounded">Coca Cola</code>
        <code className="bg-muted px-1.5 py-0.5 rounded">Pepsi</code>
        <code className="bg-muted px-1.5 py-0.5 rounded">012345678901</code>
        <span className="text-muted-foreground">(brand, product, or barcode)</span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground mt-2">Searching products...</p>
        </div>
      )}

      {/* No Results */}
      {hasSearched && !loading && products.length === 0 && (
        <div className="text-center py-8">
          <Search className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-muted-foreground">
            {query ? `No products found for "${query}"` : 'Enter a search term to find products'}
          </p>
        </div>
      )}

      {/* Results */}
      {products.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Found {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
          
          {products.map((product) => (
            <Card key={product.ean13} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      {product.imageurl && (
                        <Image 
                          src={product.imageurl} 
                          alt={product.product_name || 'Product'} 
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {product.product_name || 'Unnamed Product'}
                        </h3>
                        {product.brand && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {product.brand}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.classification && (
                        <Badge 
                          className={`text-xs ${getClassificationColor(product.classification)}`}
                          variant="outline"
                        >
                          {product.classification}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Barcode className="h-3 w-3" />
                        EAN: {product.ean13}
                      </Badge>
                      {product.upc && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Barcode className="h-3 w-3" />
                          UPC: {product.upc}
                        </Badge>
                      )}
                      {product.mfg && (
                        <Badge variant="secondary" className="text-xs">
                          Mfg: {product.mfg}
                        </Badge>
                      )}
                    </div>

                    {product.ingredients && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Ingredients:</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.ingredients}
                        </p>
                      </div>
                    )}

                    {product.analysis && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Analysis:</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.analysis}
                        </p>
                      </div>
                    )}

                    {product.issues && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-red-600 mb-1">Issues:</p>
                        <p className="text-sm text-red-600 line-clamp-1">
                          {product.issues}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created: {formatDate(product.created)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Updated: {formatDate(product.lastupdated)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingProduct(product)}
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

      {/* Edit Dialog */}
      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={handleProductUpdated}
        />
      )}
    </div>
  )
}