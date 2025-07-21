// This file is no longer used directly - use utils/supabase/client.ts and utils/supabase/server.ts instead
// Keeping type definitions for reference

// Database types
export interface Ingredient {
  title: string
  class: string | null
  primary_class: string | null
  productcount: number
  lastupdated: string
  created: string
}

export interface Product {
  product_name: string | null
  brand: string | null
  upc: string | null
  ean13: string
  ingredients: string | null
  lastupdated: string
  analysis: string | null
  created: string
  mfg: string | null
  imageurl: string | null
  classification: string | null
  issues: string | null
}

export interface ActionLog {
  id: string
  type: string
  input: string
  userid: string
  created_at: string | null
  result: string | null
  metadata: any
  deviceid: string | null
}

export interface UserSubscription {
  id: string
  user_id: string
  subscription_level: 'free' | 'standard' | 'premium'
  created_at: string | null
  updated_at: string | null
  expires_at: string | null
  is_active: boolean | null
}

export interface AuthUser {
  id: string
  email: string
  created_at: string
  updated_at: string
}

// Admin function call wrapper
export const callAdminFunction = async (functionName: string, params?: any) => {
  const { data, error } = await supabase.rpc(functionName, params)
  if (error) {
    throw new Error(`Admin function ${functionName} failed: ${error.message}`)
  }
  return data
}