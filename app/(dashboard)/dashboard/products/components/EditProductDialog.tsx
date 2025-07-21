'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

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

interface EditProductDialogProps {
  product: Product
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditProductDialog({ 
  product, 
  open, 
  onClose, 
  onSuccess 
}: EditProductDialogProps) {
  const [formData, setFormData] = useState({
    product_name: product.product_name || '',
    brand: product.brand || '',
    upc: product.upc || '',
    ingredients: product.ingredients || '',
    analysis: product.analysis || '',
    imageurl: product.imageurl || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Prepare updates object - only include fields that have changed
      const updates: Record<string, string | null> = {}
      
      Object.entries(formData).forEach(([key, value]) => {
        const originalValue = product[key as keyof Product] || ''
        const newValue = value.trim() || null
        if (newValue !== originalValue) {
          updates[key] = newValue
        }
      })

      // Only proceed if there are actual changes
      if (Object.keys(updates).length === 0) {
        onSuccess()
        return
      }

      const { error: updateError } = await supabase.rpc('admin_update_product', {
        product_ean13: product.ean13,
        updates: updates
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        // After successful update, classify the product
        try {
          const { error: classifyError } = await supabase.rpc('classify_upc', {
            upc_code: product.ean13
          })

          if (classifyError) {
            console.warn('Product updated but classification failed:', classifyError.message)
          }
        } catch (classifyError) {
          console.warn('Product updated but classification failed:', classifyError)
        }

        onSuccess()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = Object.entries(formData).some(([key, value]) => {
    const originalValue = product[key as keyof Product] || ''
    return (value.trim() || '') !== originalValue
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the product information. Classification and issues will be recalculated automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EAN13 (Read-only) */}
          <div className="space-y-2">
            <Label>EAN13 Barcode</Label>
            <div className="flex items-center gap-2">
              <Input 
                value={product.ean13} 
                disabled 
                className="bg-gray-50"
              />
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                Primary Key
              </Badge>
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="e.g., Coca-Cola Classic"
            />
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g., The Coca-Cola Company"
            />
          </div>

          {/* UPC */}
          <div className="space-y-2">
            <Label htmlFor="upc">UPC Barcode</Label>
            <Input
              id="upc"
              value={formData.upc}
              onChange={(e) => setFormData({ ...formData, upc: e.target.value })}
              placeholder="e.g., 049000028911"
            />
          </div>

          {/* Classification (Read-only - automatically calculated) */}
          <div className="space-y-2">
            <Label htmlFor="classification">Classification</Label>
            <Input
              id="classification"
              value={product.classification || 'Not classified'}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-muted-foreground">
              Automatically calculated after saving changes
            </p>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageurl">Image URL</Label>
            <Input
              id="imageurl"
              value={formData.imageurl}
              onChange={(e) => setFormData({ ...formData, imageurl: e.target.value })}
              placeholder="e.g., https://example.com/product.jpg"
              type="url"
            />
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              placeholder="List of ingredients..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Analysis */}
          <div className="space-y-2">
            <Label htmlFor="analysis">Analysis</Label>
            <Textarea
              id="analysis"
              value={formData.analysis}
              onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
              placeholder="Vegan/vegetarian analysis notes..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Issues (Read-only - automatically calculated) */}
          <div className="space-y-2">
            <Label htmlFor="issues">Issues</Label>
            <Textarea
              id="issues"
              value={product.issues || 'No issues detected'}
              disabled
              rows={2}
              className="resize-none bg-gray-50"
            />
            <p className="text-xs text-muted-foreground">
              Automatically calculated after saving changes
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !hasChanges}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}