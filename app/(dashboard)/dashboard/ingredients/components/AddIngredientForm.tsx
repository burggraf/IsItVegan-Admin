'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, CheckCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function AddIngredientForm() {
  const [formData, setFormData] = useState({
    title: '',
    class: '',
    primary_class: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Ingredient title is required')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('admin_create_ingredient', {
        ingredient_title: formData.title.trim(),
        ingredient_class: formData.class.trim() === '' ? null : formData.class.trim(),
        ingredient_primary_class: formData.primary_class.trim() === '' ? null : formData.primary_class.trim()
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setFormData({ title: '', class: '', primary_class: '' })
        // Hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Creation failed')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: '', class: '', primary_class: '' })
    setError(null)
    setSuccess(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Ingredient created successfully!
            </span>
          </div>
        </div>
      )}

      {/* Ingredient Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Ingredient Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Organic Cane Sugar"
          disabled={loading}
          required
        />
      </div>

      {/* Class */}
      <div className="space-y-2">
        <Label htmlFor="add-class">Class</Label>
        <select
          id="add-class"
          value={formData.class}
          onChange={(e) => setFormData({ ...formData, class: e.target.value })}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">(No classification)</option>
          <option value="ignore">ignore</option>
          <option value="may be non-vegetarian">may be non-vegetarian</option>
          <option value="non-vegetarian">non-vegetarian</option>
          <option value="typically vegan">typically vegan</option>
          <option value="typically vegetarian">typically vegetarian</option>
          <option value="vegan">vegan</option>
          <option value="vegetarian">vegetarian</option>
        </select>
        <p className="text-xs text-muted-foreground">
          General dietary classification of the ingredient
        </p>
      </div>

      {/* Primary Class */}
      <div className="space-y-2">
        <Label htmlFor="add-primary-class">Primary Class</Label>
        <select
          id="add-primary-class"
          value={formData.primary_class}
          onChange={(e) => setFormData({ ...formData, primary_class: e.target.value })}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">(No primary class)</option>
          <option value="non-vegetarian">non-vegetarian</option>
          <option value="undetermined">undetermined</option>
          <option value="vegan">vegan</option>
          <option value="vegetarian">vegetarian</option>
        </select>
        <p className="text-xs text-muted-foreground">
          Primary dietary classification
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-2 pt-2">
        <Button 
          type="submit" 
          disabled={loading || !formData.title.trim()}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </>
          )}
        </Button>
        
        {(formData.title || formData.class || formData.primary_class) && !loading && (
          <Button 
            type="button" 
            variant="outline"
            onClick={resetForm}
          >
            Clear
          </Button>
        )}
      </div>
    </form>
  )
}