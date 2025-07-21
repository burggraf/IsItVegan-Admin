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
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface Ingredient {
  title: string
  class: string | null
  primary_class: string | null
  productcount: number
  lastupdated: string
  created: string
}

interface EditIngredientDialogProps {
  ingredient: Ingredient
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditIngredientDialog({ 
  ingredient, 
  open, 
  onClose, 
  onSuccess 
}: EditIngredientDialogProps) {
  const [formData, setFormData] = useState({
    class: ingredient.class || '',
    primary_class: ingredient.primary_class || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('admin_update_ingredient', {
        ingredient_title: ingredient.title,
        new_class: formData.class || null,
        new_primary_class: formData.primary_class || null
      })

      if (error) {
        setError(error.message)
      } else {
        onSuccess()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = formData.class !== (ingredient.class || '') || 
                    formData.primary_class !== (ingredient.primary_class || '')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Ingredient</DialogTitle>
          <DialogDescription>
            Update the classification details for this ingredient
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ingredient Title (Read-only) */}
          <div className="space-y-2">
            <Label>Ingredient Title</Label>
            <Input 
              value={ingredient.title} 
              disabled 
              className="bg-gray-50"
            />
            <Badge variant="outline" className="text-xs">
              Used in {ingredient.productcount} products
            </Badge>
          </div>

          {/* Class */}
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <select
              id="class"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select class...</option>
              <option value="ignore">ignore</option>
              <option value="may be non-vegetarian">may be non-vegetarian</option>
              <option value="non-vegetarian">non-vegetarian</option>
              <option value="typically vegan">typically vegan</option>
              <option value="typically vegetarian">typically vegetarian</option>
              <option value="vegan">vegan</option>
              <option value="vegetarian">vegetarian</option>
            </select>
          </div>

          {/* Primary Class */}
          <div className="space-y-2">
            <Label htmlFor="primary_class">Primary Class</Label>
            <select
              id="primary_class"
              value={formData.primary_class}
              onChange={(e) => setFormData({ ...formData, primary_class: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select primary class...</option>
              <option value="non-vegetarian">non-vegetarian</option>
              <option value="undetermined">undetermined</option>
              <option value="vegan">vegan</option>
              <option value="vegetarian">vegetarian</option>
            </select>
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
              className="min-w-[100px]"
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