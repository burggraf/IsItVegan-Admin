'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

export interface SearchFilters {
  classes: string[]
  primaryClasses: string[]
}

interface SearchFiltersDialogProps {
  open: boolean
  onClose: () => void
  onApplyFilters: (filters: SearchFilters) => void
  currentFilters: SearchFilters
}

const CLASS_OPTIONS = [
  { value: 'ignore', label: 'ignore' },
  { value: 'may be non-vegetarian', label: 'may be non-vegetarian' },
  { value: 'non-vegetarian', label: 'non-vegetarian' },
  { value: 'typically vegan', label: 'typically vegan' },
  { value: 'typically vegetarian', label: 'typically vegetarian' },
  { value: 'vegan', label: 'vegan' },
  { value: 'vegetarian', label: 'vegetarian' },
  { value: 'null', label: 'empty' }
]

const PRIMARY_CLASS_OPTIONS = [
  { value: 'non-vegetarian', label: 'non-vegetarian' },
  { value: 'undetermined', label: 'undetermined' },
  { value: 'vegan', label: 'vegan' },
  { value: 'vegetarian', label: 'vegetarian' },
  { value: 'null', label: 'empty' }
]

export default function SearchFiltersDialog({ 
  open, 
  onClose, 
  onApplyFilters, 
  currentFilters 
}: SearchFiltersDialogProps) {
  const [selectedClasses, setSelectedClasses] = useState<string[]>(currentFilters.classes)
  const [selectedPrimaryClasses, setSelectedPrimaryClasses] = useState<string[]>(currentFilters.primaryClasses)

  // Update local state when currentFilters change
  useEffect(() => {
    setSelectedClasses(currentFilters.classes)
    setSelectedPrimaryClasses(currentFilters.primaryClasses)
  }, [currentFilters])

  const handleClassChange = (classValue: string, checked: boolean) => {
    setSelectedClasses(prev => 
      checked 
        ? [...prev, classValue]
        : prev.filter(c => c !== classValue)
    )
  }

  const handlePrimaryClassChange = (primaryClassValue: string, checked: boolean) => {
    setSelectedPrimaryClasses(prev => 
      checked 
        ? [...prev, primaryClassValue]
        : prev.filter(c => c !== primaryClassValue)
    )
  }

  const handleApply = () => {
    onApplyFilters({
      classes: selectedClasses,
      primaryClasses: selectedPrimaryClasses
    })
    onClose()
  }

  const handleClear = () => {
    setSelectedClasses([])
    setSelectedPrimaryClasses([])
  }

  const handleToggleAllClasses = () => {
    if (selectedClasses.length === CLASS_OPTIONS.length) {
      // All selected, unselect all
      setSelectedClasses([])
    } else {
      // Not all selected, select all
      setSelectedClasses(CLASS_OPTIONS.map(option => option.value))
    }
  }

  const handleToggleAllPrimaryClasses = () => {
    if (selectedPrimaryClasses.length === PRIMARY_CLASS_OPTIONS.length) {
      // All selected, unselect all
      setSelectedPrimaryClasses([])
    } else {
      // Not all selected, select all
      setSelectedPrimaryClasses(PRIMARY_CLASS_OPTIONS.map(option => option.value))
    }
  }

  const totalFilters = selectedClasses.length + selectedPrimaryClasses.length

  const allClassesSelected = selectedClasses.length === CLASS_OPTIONS.length
  const allPrimaryClassesSelected = selectedPrimaryClasses.length === PRIMARY_CLASS_OPTIONS.length

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold">Search Filters</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Filter ingredients by class and primary class. Leave empty to include all.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Filters - Left Side */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Class</h3>
            <div className="flex items-center gap-3">
              <Button 
                variant={allClassesSelected ? "default" : "outline"}
                size="sm"
                onClick={handleToggleAllClasses}
                className="h-7 px-3 text-xs"
              >
                {allClassesSelected ? "Clear All" : "Select All"}
              </Button>
              <Badge variant="secondary" className="h-6 px-2 text-xs">
                {selectedClasses.length} of {CLASS_OPTIONS.length}
              </Badge>
            </div>
            
            <div className="space-y-1">
              {CLASS_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={`class-${option.value}`}
                    checked={selectedClasses.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleClassChange(option.value, checked as boolean)
                    }
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor={`class-${option.value}`}
                    className="text-sm cursor-pointer flex-1 select-none"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Class Filters - Right Side */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Primary Class</h3>
            <div className="flex items-center gap-3">
              <Button 
                variant={allPrimaryClassesSelected ? "default" : "outline"}
                size="sm"
                onClick={handleToggleAllPrimaryClasses}
                className="h-7 px-3 text-xs"
              >
                {allPrimaryClassesSelected ? "Clear All" : "Select All"}
              </Button>
              <Badge variant="secondary" className="h-6 px-2 text-xs">
                {selectedPrimaryClasses.length} of {PRIMARY_CLASS_OPTIONS.length}
              </Badge>
            </div>
            
            <div className="space-y-1">
              {PRIMARY_CLASS_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={`primary-class-${option.value}`}
                    checked={selectedPrimaryClasses.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handlePrimaryClassChange(option.value, checked as boolean)
                    }
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor={`primary-class-${option.value}`}
                    className="text-sm cursor-pointer flex-1 select-none"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-between pt-6 border-t mt-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClear} className="px-4">
              Clear All Filters
            </Button>
            {totalFilters > 0 && (
              <Badge variant="default" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
                {totalFilters} filter{totalFilters !== 1 ? 's' : ''} selected
              </Badge>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button onClick={handleApply} className="px-6 bg-primary text-primary-foreground">
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}