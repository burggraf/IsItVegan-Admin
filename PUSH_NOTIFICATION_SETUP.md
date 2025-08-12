# Push Notification Setup Guide

This guide walks you through setting up and testing the custom push notification feature in the admin dashboard.

## 1. Environment Configuration

### Create `.env.local` file

Copy the example file and configure your environment:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:

```bash
# For Development Environment
NEXT_PUBLIC_SUPABASE_URL=https://wpjqtgkfgvheisgcxhxu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_dev_anon_key_here
NEXT_PUBLIC_ADMIN_API_KEY=07D36FCA-9856-4349-A75F-4E5FF45827DB

# For Production Environment
# NEXT_PUBLIC_SUPABASE_URL=https://isitvegan.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key_here
# NEXT_PUBLIC_ADMIN_API_KEY=07D36FCA-9856-4349-A75F-4E5FF45827DB
```

## 2. Development Testing

### Start Development Server

```bash
npm run dev
```

### Test the Feature

1. Navigate to `/dashboard/users`
2. Find a user in the subscription list
3. Click the bell icon (🔔) next to the edit button
4. Fill out the notification form:
   - **Title**: "Test Admin Notification"
   - **Message**: "This is a test message from the admin dashboard"
   - **Type**: "admin_message"
   - **Data**: `{"test": true}` (optional)
5. Click "Send Notification"

### Expected Behavior

- ✅ **Success**: "Notification sent successfully! Delivered to X device(s)."
- ⚠️ **No Devices**: "Notification was processed but not delivered. The user may not have push notifications enabled..."
- ❌ **Error**: Authentication or API errors will be displayed

## 3. Troubleshooting

### Common Issues

#### "NEXT_PUBLIC_ADMIN_API_KEY is required"
- Ensure `.env.local` file exists and contains the API key
- Restart the development server after adding environment variables

#### "Authentication required" 
- Check that SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Verify you're using the correct environment (dev vs prod)

#### "Invalid or expired token"
- The admin API key might be incorrect
- Check that the edge function has the same ADMIN_API_KEY in Supabase secrets

### Testing Without Mobile App

You can test the API directly using curl:

```bash
# Test with valid admin API key
curl -X POST https://wpjqtgkfgvheisgcxhxu.supabase.co/functions/v1/send-push-notification \
  -H "Authorization: Bearer your_anon_key_here" \
  -H "X-API-Key: 07D36FCA-9856-4349-A75F-4E5FF45827DB" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "title": "Test Notification",
    "body": "This is a test notification",
    "type": "admin_message"
  }'

# Expected response:
# {"message":"Notifications processed","sent":0,"total":0,"details":[]}
```

## 4. Production Deployment

### Build and Deploy

```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run pages:build
```

### Environment Variables in Cloudflare

Add these variables in your Cloudflare Pages dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `NEXT_PUBLIC_ADMIN_API_KEY`

## 5. Security Considerations

### Admin API Key Management

- ✅ **Keep the key secure**: Never commit to version control
- ✅ **Rotate regularly**: Generate new UUIDs periodically  
- ✅ **Environment-specific**: Use different keys for dev/prod
- ✅ **Monitor usage**: Check Supabase logs for unauthorized attempts

### User Access Control

- Only admin users can access the dashboard
- Notifications only send to users with active push permissions
- All notifications are logged to the notification history table

## 6. Usage Guidelines

### Notification Best Practices

1. **Keep it concise**: Titles ≤100 chars, messages ≤300 chars
2. **Use appropriate types**: Choose the correct notification type for analytics
3. **Test first**: Always test notifications with your own account
4. **Monitor delivery**: Check the response to see how many devices received it

### Common Notification Types

- `admin_message` - General admin communications
- `system_alert` - Critical system announcements  
- `account_update` - Account changes or subscription updates
- `feature_announcement` - New feature releases
- `security_alert` - Security-related notifications
- `maintenance` - Scheduled maintenance notices

## 7. API Reference

### Send Notification Endpoint

```
POST {SUPABASE_URL}/functions/v1/send-push-notification
```

**Headers:**
- `Authorization: Bearer {SUPABASE_ANON_KEY}`
- `X-API-Key: {ADMIN_API_KEY}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "userId": "string",           // Target user ID
  "title": "string",            // Notification title (required)
  "body": "string",             // Notification message (required)
  "type": "string",             // Notification type (required)
  "data": {}                    // Optional JSON data
}
```

**Response:**
```json
{
  "message": "Notifications processed",
  "sent": 1,
  "total": 1,
  "details": [...]
}
```

This completes the push notification setup. The feature is now ready for production use!