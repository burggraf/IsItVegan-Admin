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
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2, X, AlertTriangle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface Ingredient {
  title: string
  class: string | null
  primary_class: string | null
  productcount: number
  lastupdated: string
  created: string
}

interface DeleteIngredientDialogProps {
  ingredient: Ingredient
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteIngredientDialog({ 
  ingredient, 
  open, 
  onClose, 
  onSuccess 
}: DeleteIngredientDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('admin_delete_ingredient', {
        ingredient_title: ingredient.title
      })

      if (error) {
        setError(error.message)
      } else {
        onSuccess()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Delete failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Ingredient
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the ingredient from the database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ingredient Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{ingredient.title}</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
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
              <Badge variant="destructive" className="text-xs">
                Used in {ingredient.productcount} products
              </Badge>
            </div>
          </div>

          {/* Warning */}
          {ingredient.productcount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Warning:</p>
                  <p className="text-yellow-700">
                    This ingredient is currently used in {ingredient.productcount} products. 
                    Deleting it may affect product classifications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

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
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Ingredient
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}