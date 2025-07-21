-- Admin functions for IsItVegan Admin Dashboard
-- All functions prefixed with admin_ for security

-- Check if user has admin access (whitelist-based)
CREATE OR REPLACE FUNCTION admin_check_user_access(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Admin email whitelist - update with actual admin emails
  RETURN user_email = ANY(ARRAY[
    'markb@mantisbible.com',
    'cburggraf@me.com'
    -- Add more admin emails here
  ]);
END;
$$;

-- Search ingredients by title
CREATE OR REPLACE FUNCTION admin_search_ingredients(query TEXT, limit_count INT DEFAULT 50)
RETURNS TABLE(
  title TEXT,
  class TEXT,
  primary_class TEXT,
  productcount INT,
  lastupdated TIMESTAMPTZ,
  created TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin access first
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT i.title, i.class, i.primary_class, i.productcount, i.lastupdated, i.created
  FROM ingredients i
  WHERE i.title ILIKE '%' || query || '%'
  ORDER BY i.title
  LIMIT limit_count;
END;
$$;

-- Update ingredient
CREATE OR REPLACE FUNCTION admin_update_ingredient(
  ingredient_title TEXT,
  new_class TEXT DEFAULT NULL,
  new_primary_class TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  UPDATE ingredients 
  SET 
    class = COALESCE(new_class, class),
    primary_class = COALESCE(new_primary_class, primary_class),
    lastupdated = NOW()
  WHERE title = ingredient_title;

  RETURN FOUND;
END;
$$;

-- Create new ingredient
CREATE OR REPLACE FUNCTION admin_create_ingredient(
  ingredient_title TEXT,
  ingredient_class TEXT DEFAULT NULL,
  ingredient_primary_class TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  INSERT INTO ingredients (title, class, primary_class, productcount, lastupdated, created)
  VALUES (ingredient_title, ingredient_class, ingredient_primary_class, 0, NOW(), NOW());

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Ingredient with title "%" already exists', ingredient_title;
END;
$$;

-- Delete ingredient
CREATE OR REPLACE FUNCTION admin_delete_ingredient(ingredient_title TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  DELETE FROM ingredients WHERE title = ingredient_title;
  
  RETURN FOUND;
END;
$$;

-- Get ingredient statistics (legacy)
CREATE OR REPLACE FUNCTION admin_ingredient_stats()
RETURNS TABLE(
  stat_type TEXT,
  stat_value TEXT,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return stats for classes
  RETURN QUERY
  SELECT 'class'::TEXT, COALESCE(i.class, 'NULL'), COUNT(*)
  FROM ingredients i
  GROUP BY i.class
  ORDER BY COUNT(*) DESC;

  -- Return stats for primary_classes
  RETURN QUERY
  SELECT 'primary_class'::TEXT, COALESCE(i.primary_class, 'NULL'), COUNT(*)
  FROM ingredients i
  GROUP BY i.primary_class
  ORDER BY COUNT(*) DESC;
END;
$$;

-- Get comprehensive ingredient statistics for dashboard
CREATE OR REPLACE FUNCTION admin_get_ingredient_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSONB := '{}';
  total_count BIGINT;
  classified_count BIGINT;
  unclassified_count BIGINT;
  class_distribution JSONB;
  primary_class_distribution JSONB;
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get total ingredient count
  SELECT COUNT(*) INTO total_count FROM ingredients;

  -- Get classified count (has class OR primary_class)
  SELECT COUNT(*) INTO classified_count 
  FROM ingredients 
  WHERE class IS NOT NULL OR primary_class IS NOT NULL;

  -- Calculate unclassified
  unclassified_count := total_count - classified_count;

  -- Get class distribution
  SELECT jsonb_agg(
    jsonb_build_object(
      'class', COALESCE(class, 'Unclassified'),
      'count', count,
      'percentage', ROUND((count::DECIMAL / total_count) * 100, 1)
    )
    ORDER BY count DESC
  ) INTO class_distribution
  FROM (
    SELECT COALESCE(class, 'Unclassified') as class, COUNT(*) as count
    FROM ingredients
    GROUP BY class
  ) class_stats;

  -- Get primary class distribution  
  SELECT jsonb_agg(
    jsonb_build_object(
      'class', COALESCE(primary_class, 'Unclassified'),
      'count', count,
      'percentage', ROUND((count::DECIMAL / total_count) * 100, 1)
    )
    ORDER BY count DESC
  ) INTO primary_class_distribution
  FROM (
    SELECT COALESCE(primary_class, 'Unclassified') as primary_class, COUNT(*) as count
    FROM ingredients
    GROUP BY primary_class
  ) primary_class_stats;

  -- Build final result
  stats := jsonb_build_object(
    'total_ingredients', total_count,
    'with_classification', classified_count,
    'without_classification', unclassified_count,
    'class_distribution', COALESCE(class_distribution, '[]'::jsonb),
    'primary_class_distribution', COALESCE(primary_class_distribution, '[]'::jsonb)
  );

  RETURN stats;
END;
$$;

-- Search products
CREATE OR REPLACE FUNCTION admin_search_products(query TEXT, limit_count INT DEFAULT 50)
RETURNS TABLE(
  product_name TEXT,
  brand TEXT,
  upc TEXT,
  ean13 TEXT,
  ingredients TEXT,
  analysis TEXT,
  classification TEXT,
  lastupdated TIMESTAMPTZ,
  created TIMESTAMPTZ,
  mfg TEXT,
  imageurl TEXT,
  issues TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT p.product_name, p.brand, p.upc, p.ean13, p.ingredients, p.analysis, 
         p.classification, p.lastupdated, p.created, p.mfg, p.imageurl, p.issues
  FROM products p
  WHERE p.product_name ILIKE '%' || query || '%' 
     OR p.brand ILIKE '%' || query || '%'
     OR p.ean13 = query
     OR p.upc = query
  ORDER BY p.lastupdated DESC
  LIMIT limit_count;
END;
$$;

-- Update product
CREATE OR REPLACE FUNCTION admin_update_product(
  product_ean13 TEXT,
  updates JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  UPDATE products 
  SET 
    product_name = COALESCE((updates ->> 'product_name')::TEXT, product_name),
    brand = COALESCE((updates ->> 'brand')::TEXT, brand),
    upc = COALESCE((updates ->> 'upc')::TEXT, upc),
    ingredients = COALESCE((updates ->> 'ingredients')::TEXT, ingredients),
    analysis = COALESCE((updates ->> 'analysis')::TEXT, analysis),
    classification = COALESCE((updates ->> 'classification')::TEXT, classification),
    mfg = COALESCE((updates ->> 'mfg')::TEXT, mfg),
    imageurl = COALESCE((updates ->> 'imageurl')::TEXT, imageurl),
    issues = COALESCE((updates ->> 'issues')::TEXT, issues),
    lastupdated = NOW()
  WHERE ean13 = product_ean13;

  RETURN FOUND;
END;
$$;

-- Get product statistics
CREATE OR REPLACE FUNCTION admin_product_stats()
RETURNS TABLE(
  stat_type TEXT,
  stat_value TEXT,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Classification stats
  RETURN QUERY
  SELECT 'classification'::TEXT, COALESCE(p.classification, 'NULL'), COUNT(*)
  FROM products p
  GROUP BY p.classification
  ORDER BY COUNT(*) DESC;

  -- Brand stats (top 20)
  RETURN QUERY
  SELECT 'brand'::TEXT, COALESCE(p.brand, 'NULL'), COUNT(*)
  FROM products p
  GROUP BY p.brand
  ORDER BY COUNT(*) DESC
  LIMIT 20;
END;
$$;

-- Get recent action log entries
CREATE OR REPLACE FUNCTION admin_actionlog_recent(limit_count INT DEFAULT 100)
RETURNS TABLE(
  id UUID,
  type TEXT,
  input TEXT,
  userid UUID,
  created_at TIMESTAMPTZ,
  result TEXT,
  metadata JSONB,
  deviceid UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT a.id, a.type, a.input, a.userid, a.created_at, a.result, a.metadata, a.deviceid
  FROM actionlog a
  ORDER BY a.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Search user subscriptions
CREATE OR REPLACE FUNCTION admin_user_subscription_search(query TEXT DEFAULT '', limit_count INT DEFAULT 50)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  subscription_level TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT us.id, us.user_id, us.subscription_level, us.created_at, us.updated_at, us.expires_at, us.is_active
  FROM user_subscription us
  WHERE query = '' OR us.user_id::TEXT ILIKE '%' || query || '%'
  ORDER BY us.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Update user subscription
CREATE OR REPLACE FUNCTION admin_update_user_subscription(
  subscription_id UUID,
  updates JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  UPDATE user_subscription 
  SET 
    subscription_level = COALESCE((updates ->> 'subscription_level')::TEXT, subscription_level),
    expires_at = COALESCE((updates ->> 'expires_at')::TIMESTAMPTZ, expires_at),
    is_active = COALESCE((updates ->> 'is_active')::BOOLEAN, is_active),
    updated_at = NOW()
  WHERE id = subscription_id;

  RETURN FOUND;
END;
$$;

-- Get user statistics from auth.users
CREATE OR REPLACE FUNCTION admin_user_stats()
RETURNS TABLE(
  stat_type TEXT,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Total users
  RETURN QUERY
  SELECT 'total_users'::TEXT, COUNT(*)
  FROM auth.users;

  -- Users by authentication method (if available in raw_user_meta_data)
  RETURN QUERY
  SELECT 'email_users'::TEXT, COUNT(*)
  FROM auth.users
  WHERE email IS NOT NULL;

  -- Recent users (last 30 days)
  RETURN QUERY
  SELECT 'recent_users_30d'::TEXT, COUNT(*)
  FROM auth.users
  WHERE created_at >= NOW() - INTERVAL '30 days';
END;
$$;