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

-- Search ingredients by title (legacy function - kept for compatibility)
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
  SELECT i.title::TEXT, i.class::TEXT, i.primary_class, i.productcount, i.lastupdated, i.created
  FROM ingredients i
  WHERE i.title ILIKE '%' || query || '%'
  ORDER BY i.productcount DESC, i.title ASC
  LIMIT limit_count;
END;
$$;

-- Search ingredients with exact matching and wildcard support
CREATE OR REPLACE FUNCTION admin_search_ingredients_exact(
  query TEXT, 
  search_type TEXT DEFAULT 'exact',
  limit_count INT DEFAULT 50
)
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

  -- Execute different search based on search_type
  IF search_type = 'exact' THEN
    -- Exact match
    RETURN QUERY
    SELECT i.title::TEXT, i.class::TEXT, i.primary_class, i.productcount, i.lastupdated, i.created
    FROM ingredients i
    WHERE i.title = query
    ORDER BY i.productcount DESC, i.title ASC
    LIMIT limit_count;
    
  ELSIF search_type = 'starts_with' THEN
    -- Starts with pattern (query should end with %)
    RETURN QUERY
    SELECT i.title::TEXT, i.class::TEXT, i.primary_class, i.productcount, i.lastupdated, i.created
    FROM ingredients i
    WHERE i.title ILIKE query
    ORDER BY i.productcount DESC, i.title ASC
    LIMIT limit_count;
    
  ELSIF search_type = 'ends_with' THEN
    -- Ends with pattern (query should start with %)
    RETURN QUERY
    SELECT i.title::TEXT, i.class::TEXT, i.primary_class, i.productcount, i.lastupdated, i.created
    FROM ingredients i
    WHERE i.title ILIKE query
    ORDER BY i.productcount DESC, i.title ASC
    LIMIT limit_count;
    
  ELSIF search_type = 'contains' THEN
    -- Contains pattern (query should start and end with %)
    RETURN QUERY
    SELECT i.title::TEXT, i.class::TEXT, i.primary_class, i.productcount, i.lastupdated, i.created
    FROM ingredients i
    WHERE i.title ILIKE query
    ORDER BY i.productcount DESC, i.title ASC
    LIMIT limit_count;
    
  ELSIF search_type = 'pattern' THEN
    -- Custom pattern (query contains % in middle or other positions)
    RETURN QUERY
    SELECT i.title::TEXT, i.class::TEXT, i.primary_class, i.productcount, i.lastupdated, i.created
    FROM ingredients i
    WHERE i.title ILIKE query
    ORDER BY i.productcount DESC, i.title ASC
    LIMIT limit_count;
    
  ELSE
    -- Default to exact match for unknown search types
    RETURN QUERY
    SELECT i.title::TEXT, i.class::TEXT, i.primary_class, i.productcount, i.lastupdated, i.created
    FROM ingredients i
    WHERE i.title = query
    ORDER BY i.productcount DESC, i.title ASC
    LIMIT limit_count;
  END IF;
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
  SELECT p.product_name::TEXT, p.brand::TEXT, p.upc::TEXT, p.ean13::TEXT, 
         p.ingredients::TEXT, p.analysis::TEXT, p.classification, 
         p.lastupdated, p.created, p.mfg::TEXT, p.imageurl, p.issues
  FROM products p
  WHERE p.product_name ILIKE '%' || query || '%' 
     OR p.brand ILIKE '%' || query || '%'
     OR p.upc = query
  ORDER BY p.lastupdated DESC
  LIMIT limit_count;
END;
$$;

-- Update product (using UPC as primary identifier)
CREATE OR REPLACE FUNCTION admin_update_product(
  product_upc TEXT,
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
  WHERE upc = product_upc;

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

-- Get comprehensive product statistics for dashboard
CREATE OR REPLACE FUNCTION admin_get_product_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSONB := '{}';
  total_count BIGINT;
  classified_count BIGINT;
  unclassified_count BIGINT;
  vegan_count BIGINT;
  vegetarian_count BIGINT;
  classification_distribution JSONB;
  brand_distribution JSONB;
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get total product count
  SELECT COUNT(*) INTO total_count FROM products;

  -- Get classified count (has classification)
  SELECT COUNT(*) INTO classified_count 
  FROM products 
  WHERE classification IS NOT NULL AND classification != '';

  -- Calculate unclassified
  unclassified_count := total_count - classified_count;

  -- Get vegan count
  SELECT COUNT(*) INTO vegan_count 
  FROM products 
  WHERE LOWER(classification) = 'vegan';

  -- Get vegetarian count  
  SELECT COUNT(*) INTO vegetarian_count 
  FROM products 
  WHERE LOWER(classification) = 'vegetarian';

  -- Get classification distribution
  SELECT jsonb_agg(
    jsonb_build_object(
      'classification', COALESCE(classification, 'Unclassified'),
      'count', count,
      'percentage', ROUND((count::DECIMAL / total_count) * 100, 1)
    )
    ORDER BY count DESC
  ) INTO classification_distribution
  FROM (
    SELECT COALESCE(classification, 'Unclassified') as classification, COUNT(*) as count
    FROM products
    GROUP BY classification
  ) class_stats;

  -- Get brand distribution (top 15)
  SELECT jsonb_agg(
    jsonb_build_object(
      'brand', COALESCE(brand, 'Unknown'),
      'count', count,
      'percentage', ROUND((count::DECIMAL / total_count) * 100, 1)
    )
    ORDER BY count DESC
  ) INTO brand_distribution
  FROM (
    SELECT COALESCE(brand, 'Unknown') as brand, COUNT(*) as count
    FROM products
    GROUP BY brand
    ORDER BY COUNT(*) DESC
    LIMIT 15
  ) brand_stats;

  -- Build final result
  stats := jsonb_build_object(
    'total_products', total_count,
    'classified_products', classified_count,
    'unclassified_products', unclassified_count,
    'vegan_products', vegan_count,
    'vegetarian_products', vegetarian_count,
    'classification_distribution', COALESCE(classification_distribution, '[]'::jsonb),
    'brand_distribution', COALESCE(brand_distribution, '[]'::jsonb)
  );

  RETURN stats;
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

-- Get unclassified ingredients with pagination
CREATE OR REPLACE FUNCTION admin_get_unclassified_ingredients(
  page_size INT DEFAULT 20,
  page_offset INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  ingredients_data JSONB;
  total_count BIGINT;
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get total count of unclassified ingredients
  SELECT COUNT(*) INTO total_count
  FROM ingredients
  WHERE class IS NULL;

  -- Get paginated unclassified ingredients ordered by product count descending
  SELECT jsonb_agg(
    jsonb_build_object(
      'title', title,
      'class', class,
      'primary_class', primary_class,
      'productcount', productcount,
      'lastupdated', lastupdated,
      'created', created
    )
    ORDER BY productcount DESC
  ) INTO ingredients_data
  FROM (
    SELECT title, class, primary_class, productcount, lastupdated, created
    FROM ingredients
    WHERE class IS NULL
    ORDER BY productcount DESC
    LIMIT page_size OFFSET page_offset
  ) paginated_ingredients;

  -- Build result with both ingredients and pagination info
  result := jsonb_build_object(
    'ingredients', COALESCE(ingredients_data, '[]'::jsonb),
    'total_count', total_count
  );

  RETURN result;
END;
$$;

-- Search ingredients with exact matching, wildcard support, and filters
CREATE OR REPLACE FUNCTION admin_search_ingredients_with_filters(
  query TEXT, 
  search_type TEXT DEFAULT 'exact',
  filter_classes TEXT[] DEFAULT NULL,
  filter_primary_classes TEXT[] DEFAULT NULL,
  limit_count INT DEFAULT 50
)
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
DECLARE
  base_query TEXT;
  where_conditions TEXT[] := ARRAY[]::TEXT[];
  final_query TEXT;
BEGIN
  -- Check admin access first
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Build base query
  base_query := 'SELECT i.title::TEXT, i.class::TEXT, i.primary_class, i.productcount, i.lastupdated, i.created FROM ingredients i';

  -- Add search condition based on search_type
  IF search_type = 'exact' THEN
    where_conditions := array_append(where_conditions, 'i.title = ' || quote_literal(query));
  ELSIF search_type = 'starts_with' OR search_type = 'ends_with' OR search_type = 'contains' OR search_type = 'pattern' THEN
    where_conditions := array_append(where_conditions, 'i.title ILIKE ' || quote_literal(query));
  ELSE
    -- Default to exact match for unknown search types
    where_conditions := array_append(where_conditions, 'i.title = ' || quote_literal(query));
  END IF;

  -- Add class filter if provided
  IF filter_classes IS NOT NULL AND array_length(filter_classes, 1) > 0 THEN
    -- Handle null values in the filter
    IF 'null' = ANY(filter_classes) THEN
      -- Include both specified classes and null values
      IF array_length(filter_classes, 1) > 1 THEN
        where_conditions := array_append(where_conditions, 
          '(i.class = ANY(' || quote_literal(filter_classes) || '::TEXT[]) OR i.class IS NULL)');
      ELSE
        -- Only null requested
        where_conditions := array_append(where_conditions, 'i.class IS NULL');
      END IF;
    ELSE
      -- No null values, just use IN clause
      where_conditions := array_append(where_conditions, 
        'i.class = ANY(' || quote_literal(filter_classes) || '::TEXT[])');
    END IF;
  END IF;

  -- Add primary_class filter if provided
  IF filter_primary_classes IS NOT NULL AND array_length(filter_primary_classes, 1) > 0 THEN
    -- Handle null values in the filter
    IF 'null' = ANY(filter_primary_classes) THEN
      -- Include both specified primary_classes and null values
      IF array_length(filter_primary_classes, 1) > 1 THEN
        where_conditions := array_append(where_conditions, 
          '(i.primary_class = ANY(' || quote_literal(filter_primary_classes) || '::TEXT[]) OR i.primary_class IS NULL)');
      ELSE
        -- Only null requested
        where_conditions := array_append(where_conditions, 'i.primary_class IS NULL');
      END IF;
    ELSE
      -- No null values, just use IN clause
      where_conditions := array_append(where_conditions, 
        'i.primary_class = ANY(' || quote_literal(filter_primary_classes) || '::TEXT[])');
    END IF;
  END IF;

  -- Build final query
  final_query := base_query;
  IF array_length(where_conditions, 1) > 0 THEN
    final_query := final_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
  END IF;
  final_query := final_query || ' ORDER BY i.productcount DESC, i.title ASC LIMIT ' || limit_count;

  -- Execute and return
  RETURN QUERY EXECUTE final_query;
END;
$$;

-- Search ingredients with pagination, exact matching, wildcard support, and filters
CREATE OR REPLACE FUNCTION admin_search_ingredients_with_filters_paginated(
  query TEXT, 
  search_type TEXT DEFAULT 'exact',
  filter_classes TEXT[] DEFAULT NULL,
  filter_primary_classes TEXT[] DEFAULT NULL,
  page_size INT DEFAULT 50,
  page_offset INT DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_query TEXT;
  count_query TEXT;
  where_conditions TEXT[] := ARRAY[]::TEXT[];
  final_query TEXT;
  total_count INT;
  result_ingredients JSON;
  has_more BOOLEAN;
BEGIN
  -- Check admin access first
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Build base query
  base_query := 'SELECT i.title::TEXT, i.class::TEXT, i.primary_class, i.productcount, i.lastupdated, i.created FROM ingredients i';
  count_query := 'SELECT COUNT(*) FROM ingredients i';

  -- Add search condition based on search_type
  IF search_type = 'exact' THEN
    where_conditions := array_append(where_conditions, 'i.title = ' || quote_literal(query));
  ELSIF search_type = 'starts_with' OR search_type = 'ends_with' OR search_type = 'contains' OR search_type = 'pattern' THEN
    where_conditions := array_append(where_conditions, 'i.title ILIKE ' || quote_literal(query));
  ELSE
    -- Default to exact match for unknown search types
    where_conditions := array_append(where_conditions, 'i.title = ' || quote_literal(query));
  END IF;

  -- Add class filter if provided
  IF filter_classes IS NOT NULL AND array_length(filter_classes, 1) > 0 THEN
    -- Handle null values in the filter
    IF 'null' = ANY(filter_classes) THEN
      -- Include both specified classes and null values
      IF array_length(filter_classes, 1) > 1 THEN
        where_conditions := array_append(where_conditions, 
          '(i.class = ANY(' || quote_literal(filter_classes) || '::TEXT[]) OR i.class IS NULL)');
      ELSE
        -- Only null requested
        where_conditions := array_append(where_conditions, 'i.class IS NULL');
      END IF;
    ELSE
      -- No null values, just use IN clause
      where_conditions := array_append(where_conditions, 
        'i.class = ANY(' || quote_literal(filter_classes) || '::TEXT[])');
    END IF;
  END IF;

  -- Add primary_class filter if provided
  IF filter_primary_classes IS NOT NULL AND array_length(filter_primary_classes, 1) > 0 THEN
    -- Handle null values in the filter
    IF 'null' = ANY(filter_primary_classes) THEN
      -- Include both specified primary_classes and null values
      IF array_length(filter_primary_classes, 1) > 1 THEN
        where_conditions := array_append(where_conditions, 
          '(i.primary_class = ANY(' || quote_literal(filter_primary_classes) || '::TEXT[]) OR i.primary_class IS NULL)');
      ELSE
        -- Only null requested
        where_conditions := array_append(where_conditions, 'i.primary_class IS NULL');
      END IF;
    ELSE
      -- No null values, just use IN clause
      where_conditions := array_append(where_conditions, 
        'i.primary_class = ANY(' || quote_literal(filter_primary_classes) || '::TEXT[])');
    END IF;
  END IF;

  -- Build WHERE clause
  IF array_length(where_conditions, 1) > 0 THEN
    base_query := base_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
    count_query := count_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
  END IF;

  -- Get total count
  EXECUTE count_query INTO total_count;

  -- Build final query with pagination
  final_query := base_query || ' ORDER BY i.productcount DESC, i.title ASC LIMIT ' || page_size || ' OFFSET ' || page_offset;

  -- Execute and get results as JSON
  EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || final_query || ') t' INTO result_ingredients;

  -- Determine if there are more results
  has_more := (page_offset + page_size) < total_count;

  -- Return structured response
  RETURN json_build_object(
    'ingredients', COALESCE(result_ingredients, '[]'::json),
    'total_count', total_count,
    'page_size', page_size,
    'page_offset', page_offset,
    'has_more', has_more
  );
END;
$$;

-- Admin wrapper for classify_upc function
CREATE OR REPLACE FUNCTION admin_classify_upc(upc_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Call the existing classify_upc function with elevated privileges
  RETURN classify_upc(upc_code);
END;
$$;

-- Get paginated action log entries with user email lookup
CREATE OR REPLACE FUNCTION admin_actionlog_paginated(
  page_size INT DEFAULT 20,
  page_offset INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  activity_data JSONB;
  total_count BIGINT;
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get total count of activity logs
  SELECT COUNT(*) INTO total_count FROM actionlog;

  -- Get paginated activity logs with user email lookup
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', a.id,
      'type', a.type,
      'input', a.input,
      'result', a.result,
      'created_at', a.created_at,
      'userid', a.userid,
      'user_email', COALESCE(u.email, 'anonymous user'),
      'metadata', a.metadata,
      'deviceid', a.deviceid
    )
    ORDER BY a.created_at DESC
  ) INTO activity_data
  FROM (
    SELECT id, type, input, result, created_at, userid, metadata, deviceid
    FROM actionlog
    ORDER BY created_at DESC
    LIMIT page_size OFFSET page_offset
  ) a
  LEFT JOIN auth.users u ON a.userid = u.id;

  -- Build result with both activities and pagination info
  result := jsonb_build_object(
    'activities', COALESCE(activity_data, '[]'::jsonb),
    'total_count', total_count,
    'page_size', page_size,
    'page_offset', page_offset,
    'has_more', (page_offset + page_size) < total_count
  );

  RETURN result;
END;
$$;

-- Get single product by UPC
CREATE OR REPLACE FUNCTION admin_get_product(product_upc TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  product_data JSONB;
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get product by UPC
  SELECT to_jsonb(p.*) INTO product_data
  FROM products p
  WHERE p.upc = product_upc;

  -- Return product data or null if not found
  RETURN product_data;
END;
$$;

-- Admin wrapper for get_ingredients_for_upc function
CREATE OR REPLACE FUNCTION admin_get_ingredients_for_upc(product_upc TEXT)
RETURNS TABLE(title TEXT, class TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin access
  IF NOT admin_check_user_access(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return ingredients for the given UPC
  RETURN QUERY
  SELECT (get_ingredients_for_upc(product_upc)).title,
         (get_ingredients_for_upc(product_upc)).class;
END;
$$;