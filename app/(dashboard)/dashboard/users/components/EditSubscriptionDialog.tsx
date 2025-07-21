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
import { Switch } from '@/components/ui/switch'
import { Loader2, Save, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface UserSubscription {
  id: string
  user_id: string
  subscription_level: string
  created_at: string
  updated_at: string
  expires_at: string | null
  is_active: boolean
}

interface EditSubscriptionDialogProps {
  subscription: UserSubscription
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditSubscriptionDialog({ 
  subscription, 
  open, 
  onClose, 
  onSuccess 
}: EditSubscriptionDialogProps) {
  const [formData, setFormData] = useState({
    subscription_level: subscription.subscription_level,
    expires_at: subscription.expires_at ? subscription.expires_at.split('T')[0] : '', // Format for date input
    is_active: subscription.is_active
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Prepare updates object
      const updates: Record<string, string | boolean | null> = {}
      
      if (formData.subscription_level !== subscription.subscription_level) {
        updates.subscription_level = formData.subscription_level
      }
      
      if (formData.is_active !== subscription.is_active) {
        updates.is_active = formData.is_active
      }

      // Handle expires_at - convert empty string to null, otherwise convert to full timestamp
      const newExpiresAt = formData.expires_at ? new Date(formData.expires_at + 'T23:59:59').toISOString() : null
      const currentExpiresAt = subscription.expires_at
      
      if (newExpiresAt !== currentExpiresAt) {
        updates.expires_at = newExpiresAt
      }

      // Only proceed if there are actual changes
      if (Object.keys(updates).length === 0) {
        onSuccess()
        return
      }

      const { error: updateError } = await supabase.rpc('admin_update_user_subscription', {
        subscription_id: subscription.id,
        updates: updates
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        onSuccess()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = () => {
    const currentExpiresAt = subscription.expires_at
    const newExpiresAt = formData.expires_at ? new Date(formData.expires_at + 'T23:59:59').toISOString() : null
    
    return formData.subscription_level !== subscription.subscription_level ||
           formData.is_active !== subscription.is_active ||
           newExpiresAt !== currentExpiresAt
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User Subscription</DialogTitle>
          <DialogDescription>
            Update subscription level, status, and expiration date
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID (Read-only) */}
          <div className="space-y-2">
            <Label>User ID</Label>
            <div className="text-xs font-mono bg-gray-50 p-2 rounded border break-all">
              {subscription.user_id}
            </div>
          </div>

          {/* Subscription Level */}
          <div className="space-y-2">
            <Label htmlFor="subscription_level">Subscription Level</Label>
            <select
              id="subscription_level"
              value={formData.subscription_level}
              onChange={(e) => setFormData({ ...formData, subscription_level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="plus">Plus</option>
              <option value="premium">Premium</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label>Active Status</Label>
              <div className="text-sm text-muted-foreground">
                Whether this subscription is currently active
              </div>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expires_at">Expiration Date</Label>
            <Input
              id="expires_at"
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              placeholder="Leave empty for no expiration"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for subscriptions that don&apos;t expire
            </p>
          </div>

          {/* Timestamps */}
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Created: {formatDate(subscription.created_at)}</div>
              <div>Last Updated: {formatDate(subscription.updated_at)}</div>
            </div>
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
              disabled={loading || !hasChanges()}
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