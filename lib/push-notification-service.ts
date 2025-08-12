/**
 * Admin Push Notification Service
 * 
 * Service for sending custom push notifications to users from the admin dashboard.
 * Uses the secured send-push-notification Supabase edge function.
 */

interface NotificationPayload {
  userId?: string
  userIds?: string[]
  title: string
  body: string
  data?: Record<string, any>
  type: string
}

interface NotificationResponse {
  message: string
  sent: number
  total: number
  details?: any[]
}

interface NotificationError {
  error: string
}

export class AdminPushNotificationService {
  private supabaseUrl: string
  private adminApiKey: string
  private anonKey: string
  
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    this.adminApiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
    this.anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    if (!this.supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
    }
    if (!this.adminApiKey) {
      throw new Error('NEXT_PUBLIC_ADMIN_API_KEY is required')
    }
    if (!this.anonKey) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
    }
  }
  
  /**
   * Send notification to a single user
   */
  async sendToUser(
    userId: string, 
    title: string, 
    body: string, 
    type: string,
    data?: Record<string, any>
  ): Promise<NotificationResponse> {
    return this.sendNotification({
      userId,
      title,
      body,
      type,
      data
    })
  }
  
  /**
   * Send notification to multiple users
   */
  async sendToUsers(
    userIds: string[], 
    title: string, 
    body: string, 
    type: string,
    data?: Record<string, any>
  ): Promise<NotificationResponse> {
    return this.sendNotification({
      userIds,
      title,
      body,
      type,
      data
    })
  }
  
  /**
   * Send notification with full payload control
   */
  async sendNotification(payload: NotificationPayload): Promise<NotificationResponse> {
    console.log('Sending notification with payload:', payload)
    console.log('Using Supabase URL:', this.supabaseUrl)
    console.log('Admin API Key present:', !!this.adminApiKey)
    
    try {
      const url = `${this.supabaseUrl}/functions/v1/send-push-notification`
      console.log('Fetching URL:', url)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'X-API-Key': this.adminApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      const result = await response.json()
      console.log('Response body:', result)
      
      if (!response.ok) {
        const error = result as NotificationError
        throw new Error(error.error || `HTTP ${response.status}: ${JSON.stringify(result)}`)
      }
      
      return result as NotificationResponse
    } catch (error) {
      console.error('Failed to send notification:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to the notification service. Please check your internet connection and try again.')
      }
      throw error
    }
  }
  
  /**
   * Predefined notification types for common use cases
   */
  
  async sendAdminMessage(userId: string, title: string, message: string): Promise<NotificationResponse> {
    return this.sendToUser(
      userId,
      title,
      message,
      'admin_message'
    )
  }
  
  async sendSystemAlert(userIds: string[], title: string, message: string): Promise<NotificationResponse> {
    return this.sendToUsers(
      userIds,
      title,
      message,
      'system_alert'
    )
  }
  
  async sendAccountUpdate(userId: string, updateType: string): Promise<NotificationResponse> {
    return this.sendToUser(
      userId,
      'Account Update',
      `Your account has been updated: ${updateType}`,
      'account_update',
      { updateType }
    )
  }
  
  async sendFeatureAnnouncement(userIds: string[], featureName: string): Promise<NotificationResponse> {
    return this.sendToUsers(
      userIds,
      'New Feature Available',
      `Check out our new ${featureName} feature!`,
      'feature_announcement',
      { featureName }
    )
  }
  
  async sendSecurityAlert(userId: string, alertType: string): Promise<NotificationResponse> {
    return this.sendToUser(
      userId,
      'Security Alert',
      `Important security notice: ${alertType}`,
      'security_alert',
      { alertType }
    )
  }
}

// Export a singleton instance for use throughout the app
export const pushNotificationService = new AdminPushNotificationService()

// Common notification types
export const NOTIFICATION_TYPES = {
  ADMIN_MESSAGE: 'admin_message',
  SYSTEM_ALERT: 'system_alert', 
  ACCOUNT_UPDATE: 'account_update',
  FEATURE_ANNOUNCEMENT: 'feature_announcement',
  SECURITY_ALERT: 'security_alert',
  MAINTENANCE: 'maintenance',
  PROMOTIONAL: 'promotional',
  USER_ENGAGEMENT: 'user_engagement'
} as const

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]