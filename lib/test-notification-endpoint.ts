/**
 * Simple test function to verify the notification endpoint is accessible
 * This can be called from the browser console for debugging
 */

export async function testNotificationEndpoint() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const adminApiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''

  console.log('Testing notification endpoint...')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Admin API Key:', adminApiKey ? '✓ Present' : '✗ Missing')
  console.log('Anon Key:', anonKey ? '✓ Present' : '✗ Missing')

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-push-notification`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'X-API-Key': adminApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'test-user-id',
          title: 'Test Notification',
          body: 'This is a test notification from admin dashboard',
          type: 'admin_message'
        })
      }
    )

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    const result = await response.json()
    console.log('Response body:', result)

    return {
      success: response.ok,
      status: response.status,
      data: result
    }
  } catch (error) {
    console.error('Fetch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Make it available globally for testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testNotificationEndpoint = testNotificationEndpoint
}