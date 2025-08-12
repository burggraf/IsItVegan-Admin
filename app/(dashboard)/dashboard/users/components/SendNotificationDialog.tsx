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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Send, X, Bell } from 'lucide-react'
import { pushNotificationService, NOTIFICATION_TYPES } from '@/lib/push-notification-service'

interface UserSubscription {
  id: string
  user_id: string
  user_email: string
  subscription_level: string
  created_at: string
  updated_at: string
  expires_at: string | null
  is_active: boolean
}

interface SendNotificationDialogProps {
  user: UserSubscription
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function SendNotificationDialog({ 
  user, 
  open, 
  onClose, 
  onSuccess 
}: SendNotificationDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: NOTIFICATION_TYPES.ADMIN_MESSAGE,
    data: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError('Title is required')
        return
      }
      
      if (!formData.body.trim()) {
        setError('Message is required')
        return
      }

      // Parse optional JSON data
      let parsedData: Record<string, any> | undefined
      if (formData.data.trim()) {
        try {
          parsedData = JSON.parse(formData.data)
        } catch (jsonError) {
          setError('Data must be valid JSON or empty')
          return
        }
      }

      // Send the notification
      const result = await pushNotificationService.sendToUser(
        user.user_id,
        formData.title.trim(),
        formData.body.trim(),
        formData.type,
        parsedData
      )

      if (result.sent > 0) {
        setSuccess(`Notification sent successfully! Delivered to ${result.sent} device(s).`)
        // Reset form on success
        setFormData({
          title: '',
          body: '',
          type: NOTIFICATION_TYPES.ADMIN_MESSAGE,
          data: ''
        })
        onSuccess()
      } else {
        setError(`Notification was processed but not delivered. The user may not have push notifications enabled or may not have any registered devices.`)
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
      setError(error instanceof Error ? error.message : 'Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  const hasValidForm = () => {
    return formData.title.trim() && formData.body.trim()
  }

  const notificationTypeOptions = [
    { value: NOTIFICATION_TYPES.ADMIN_MESSAGE, label: 'Admin Message' },
    { value: NOTIFICATION_TYPES.SYSTEM_ALERT, label: 'System Alert' },
    { value: NOTIFICATION_TYPES.ACCOUNT_UPDATE, label: 'Account Update' },
    { value: NOTIFICATION_TYPES.FEATURE_ANNOUNCEMENT, label: 'Feature Announcement' },
    { value: NOTIFICATION_TYPES.SECURITY_ALERT, label: 'Security Alert' },
    { value: NOTIFICATION_TYPES.MAINTENANCE, label: 'Maintenance' },
    { value: NOTIFICATION_TYPES.PROMOTIONAL, label: 'Promotional' },
    { value: NOTIFICATION_TYPES.USER_ENGAGEMENT, label: 'User Engagement' }
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Send Push Notification
          </DialogTitle>
          <DialogDescription>
            Send a custom push notification to this user
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Info (Read-only) */}
          <div className="space-y-2">
            <Label>Recipient</Label>
            <div className="bg-gray-50 p-3 rounded border space-y-1">
              <div className="font-medium">{user.user_email || 'No email'}</div>
              <div className="text-xs text-muted-foreground font-mono break-all">
                {user.user_id}
              </div>
              <div className="text-xs text-muted-foreground">
                Subscription: {user.subscription_level} • {user.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Notification Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter notification title"
              maxLength={100}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Notification Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Enter notification message"
              maxLength={300}
              rows={3}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {formData.body.length}/300 characters
            </p>
          </div>

          {/* Notification Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select notification type" />
              </SelectTrigger>
              <SelectContent>
                {notificationTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used for categorization and analytics
            </p>
          </div>

          {/* Optional Data */}
          <div className="space-y-2">
            <Label htmlFor="data">Additional Data (Optional)</Label>
            <Textarea
              id="data"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              placeholder='{"key": "value"}'
              rows={2}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Optional JSON data to send with the notification
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

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
              disabled={loading || !hasValidForm()}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}