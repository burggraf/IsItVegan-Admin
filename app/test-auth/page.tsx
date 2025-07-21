import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge'

export default async function TestAuthPage() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return (
        <div className="p-4">
          <h1>Auth Test</h1>
          <p className="text-red-500">Error: {error.message}</p>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="p-4">
          <h1>Auth Test</h1>
          <p className="text-yellow-500">No user session found</p>
        </div>
      )
    }

    // Test admin check
    const { data: isAdmin, error: adminError } = await supabase.rpc('admin_check_user_access', {
      user_email: user.email
    })

    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Auth Test Results</h1>
        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-semibold">✅ User Found:</h2>
          <p>Email: {user.email}</p>
          <p>ID: {user.id}</p>
          <p>Created: {user.created_at}</p>
        </div>
        <div className={`p-4 rounded ${isAdmin ? 'bg-green-100' : 'bg-red-100'}`}>
          <h2 className="font-semibold">Admin Check:</h2>
          <p>Is Admin: {isAdmin ? '✅ Yes' : '❌ No'}</p>
          {adminError && <p className="text-red-500">Error: {adminError.message}</p>}
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-4">
        <h1>Auth Test</h1>
        <p className="text-red-500">Exception: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    )
  }
}