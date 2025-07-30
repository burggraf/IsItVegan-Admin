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

interface Profile {
  id: string
  email: string
  subscription_level: string
  expires_at: string | null
  created_at: string
  updated_at: string
}

interface EditProfileDialogProps {
  profile: Profile
  onClose: () => void
  onProfileUpdated: () => void
}

export default function EditProfileDialog({ profile, onClose, onProfileUpdated }: EditProfileDialogProps) {
  const [subscriptionLevel, setSubscriptionLevel] = useState(profile.subscription_level)
  const [expiresAt, setExpiresAt] = useState(
    profile.expires_at ? new Date(profile.expires_at).toISOString().split('T')[0] : ''
  )
  const [loading, setLoading] = useState(false)

  // Apply business rules when subscription level changes
  useEffect(() => {
    if (subscriptionLevel === 'free') {
      setExpiresAt('')
    }
  }, [subscriptionLevel])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let expiresAtTimestamp = null
      if (expiresAt && subscriptionLevel !== 'free') {
        expiresAtTimestamp = new Date(expiresAt + 'T23:59:59.999Z')
      }

      const supabase = createClient()
      const { error } = await supabase.rpc('admin_update_profile', {
        profile_id: profile.id,
        new_subscription_level: subscriptionLevel,
        new_expires_at: expiresAtTimestamp?.toISOString() || null
      })

      if (error) throw error

      onProfileUpdated()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isLifetime = subscriptionLevel === 'standard' && !expiresAt

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update subscription level and expiration date for {profile.email}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              className="bg-gray-50"
            />
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
              Update Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}