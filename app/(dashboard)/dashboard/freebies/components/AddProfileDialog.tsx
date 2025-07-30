'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface AddProfileDialogProps {
  onClose: () => void
  onProfileAdded: () => void
}

export default function AddProfileDialog({ onClose, onProfileAdded }: AddProfileDialogProps) {
  const [email, setEmail] = useState('')
  const [subscriptionLevel, setSubscriptionLevel] = useState('free')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)

  // Apply business rules when subscription level changes
  useEffect(() => {
    if (subscriptionLevel === 'free') {
      setExpiresAt('')
    }
  }, [subscriptionLevel])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      alert('Email is required')
      return
    }

    setLoading(true)

    try {
      let expiresAtTimestamp = null
      if (expiresAt && subscriptionLevel !== 'free') {
        expiresAtTimestamp = new Date(expiresAt + 'T23:59:59.999Z')
      }

      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_create_or_update_profile_by_email', {
        user_email: email.trim(),
        new_subscription_level: subscriptionLevel,
        new_expires_at: expiresAtTimestamp?.toISOString() || null
      })

      if (error) throw error

      console.log('Profile operation result:', data)
      onProfileAdded()
    } catch (error) {
      console.error('Error creating/updating profile:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (message.includes('not found')) {
        alert('User with this email address does not exist in the system.')
      } else {
        alert('Failed to create/update profile. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isLifetime = subscriptionLevel === 'standard' && !expiresAt

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Profile</DialogTitle>
          <DialogDescription>
            Create or update a user profile with subscription information. The email must exist in the system.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
            <p className="text-xs text-gray-500">
              Must be an existing user email address
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscription">Subscription Level</Label>
            <Select value={subscriptionLevel} onValueChange={setSubscriptionLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires">
              Expires At
              {subscriptionLevel === 'free' && (
                <span className="text-xs text-gray-500 ml-2">(Always null for free subscriptions)</span>
              )}
              {isLifetime && (
                <span className="text-xs text-green-600 ml-2">(Lifetime subscription)</span>
              )}
            </Label>
            <Input
              id="expires"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={subscriptionLevel === 'free'}
              className={subscriptionLevel === 'free' ? 'bg-gray-50' : ''}
            />
            <p className="text-xs text-gray-500">
              Leave empty for lifetime standard subscription
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}