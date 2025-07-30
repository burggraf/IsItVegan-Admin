'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { X } from 'lucide-react'

export interface ActivityFilter {
  types: string[]
  input: string
  result: string
  user: string
  startDate: string
  endDate: string
}

interface ActivityFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilter: (filter: ActivityFilter) => void
  currentFilter: ActivityFilter
  availableTypes: string[]
}

export default function ActivityFilterModal({
  isOpen,
  onClose,
  onApplyFilter,
  currentFilter,
  availableTypes
}: ActivityFilterModalProps) {
  const [filter, setFilter] = useState<ActivityFilter>(currentFilter)

  useEffect(() => {
    setFilter(currentFilter)
  }, [currentFilter])

  const handleTypeToggle = (type: string, checked: boolean) => {
    if (checked) {
      setFilter(prev => ({
        ...prev,
        types: [...prev.types, type]
      }))
    } else {
      setFilter(prev => ({
        ...prev,
        types: prev.types.filter(t => t !== type)
      }))
    }
  }

  const handleApply = () => {
    onApplyFilter(filter)
    onClose()
  }

  const handleReset = () => {
    const emptyFilter: ActivityFilter = {
      types: [],
      input: '',
      result: '',
      user: '',
      startDate: '',
      endDate: ''
    }
    setFilter(emptyFilter)
  }

  const isFilterEmpty = () => {
    return filter.types.length === 0 &&
           filter.input === '' &&
           filter.result === '' &&
           filter.user === '' &&
           filter.startDate === '' &&
           filter.endDate === ''
  }

  const getTypeColor = (type: string) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Activity</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Type Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Types</Label>
            <div className="text-xs text-muted-foreground mb-2">
              Select which activity types to include (default: all)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availableTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filter.types.includes(type)}
                    onCheckedChange={(checked) => handleTypeToggle(type, checked as boolean)}
                  />
                  <Label 
                    htmlFor={`type-${type}`} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    <Badge 
                      className={`text-xs ${getTypeColor(type)}`}
                      variant="outline"
                    >
                      {type}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
            {filter.types.length === 0 && (
              <div className="text-xs text-muted-foreground">
                No types selected (will show all types)
              </div>
            )}
          </div>

          {/* Input Filter */}
          <div className="space-y-2">
            <Label htmlFor="input-filter" className="text-sm font-medium">Input</Label>
            <div className="text-xs text-muted-foreground">
              Enter a specific input value to match exactly
            </div>
            <Input
              id="input-filter"
              type="text"
              placeholder="e.g., 123456789012"
              value={filter.input}
              onChange={(e) => setFilter(prev => ({ ...prev, input: e.target.value }))}
            />
          </div>

          {/* Result Filter */}
          <div className="space-y-2">
            <Label htmlFor="result-filter" className="text-sm font-medium">Result</Label>
            <div className="text-xs text-muted-foreground">
              Enter a specific result value to match exactly
            </div>
            <Input
              id="result-filter"
              type="text"
              placeholder="e.g., success, error, vegan"
              value={filter.result}
              onChange={(e) => setFilter(prev => ({ ...prev, result: e.target.value }))}
            />
          </div>

          {/* User Filter */}
          <div className="space-y-2">
            <Label htmlFor="user-filter" className="text-sm font-medium">User</Label>
            <div className="text-xs text-muted-foreground">
              Enter a specific user email to match exactly
            </div>
            <Input
              id="user-filter"
              type="email"
              placeholder="e.g., user@example.com"
              value={filter.user}
              onChange={(e) => setFilter(prev => ({ ...prev, user: e.target.value }))}
            />
          </div>

          {/* Date Range Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">Starting Date</Label>
              <div className="text-xs text-muted-foreground">
                Filter activities from this date/time onwards
              </div>
              <Input
                id="start-date"
                type="datetime-local"
                value={filter.startDate}
                onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
              />
              {filter.startDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter(prev => ({ ...prev, startDate: '' }))}
                  className="h-6 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm font-medium">Ending Date</Label>
              <div className="text-xs text-muted-foreground">
                Filter activities up to this date/time
              </div>
              <Input
                id="end-date"
                type="datetime-local"
                value={filter.endDate}
                onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
              />
              {filter.endDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter(prev => ({ ...prev, endDate: '' }))}
                  className="h-6 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isFilterEmpty()}>
            Reset
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} className="bg-primary hover:bg-primary/90">
            Apply Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}