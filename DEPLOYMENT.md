# Deployment Guide - IsItVegan Admin Dashboard

This guide covers deploying the IsItVegan Admin Dashboard to Cloudflare Pages.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Supabase Project**: Set up your Supabase project with admin functions
3. **Git Repository**: Code should be in a Git repository (GitHub, GitLab, etc.)

## Environment Variables

Set up the following environment variables in Cloudflare Pages:

### Required Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://your-domain.pages.dev
```

### Optional Variables
```bash
NEXTAUTH_SECRET=your-nextauth-secret-for-production
```

## Supabase Setup

### 1. Deploy Admin Functions
Run the SQL functions from `supabase/admin_functions.sql` in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase/admin_functions.sql
-- This creates all the admin_* functions with proper security
```

### 2. Update Admin Whitelist
In the `admin_check_user_access` function, update the admin email whitelist:

```sql
-- Update the admin email list in the function
RETURN user_email = ANY(ARRAY[
  'your-admin-email@domain.com',
  'another-admin@domain.com'
  -- Add more admin emails here
]);
```

### 3. Test Functions
Verify the functions work by testing them in the Supabase SQL editor:

```sql
-- Test admin access
SELECT admin_check_user_access('your-admin-email@domain.com');

-- Test ingredient search
SELECT * FROM admin_search_ingredients('test', 10);
```

## Cloudflare Pages Deployment

### Method 1: Git Integration (Recommended)

1. **Connect Repository**:
   - Go to Cloudflare Dashboard → Pages
   - Click "Create a project"
   - Connect your Git repository
   - Select the repository containing this code

2. **Build Configuration**:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/` (or subdirectory if needed)
   - **Node.js version**: `18` or `20`

3. **Environment Variables**:
   - Go to Pages → Settings → Environment Variables
   - Add all required environment variables listed above
   - Deploy to both "Production" and "Preview" environments

4. **Deploy**:
   - Click "Save and Deploy"
   - Wait for the build to complete
   - Your admin dashboard will be available at `https://your-project.pages.dev`

### Method 2: Wrangler CLI

1. **Install Wrangler**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Create Pages Project**:
   ```bash
   wrangler pages create isitvegan-admin
   ```

4. **Deploy**:
   ```bash
   npm run build
   wrangler pages deploy .next --project-name=isitvegan-admin
   ```

## Custom Domain (Optional)

1. **Add Custom Domain**:
   - Go to Pages → Custom domains
   - Add your domain (e.g., `admin.isitvegan.com`)
   - Update DNS records as instructed

2. **Update Environment Variables**:
   - Update `NEXT_PUBLIC_APP_URL` to your custom domain
   - Redeploy the application

## Security Considerations

### 1. Admin Access Control
- Only whitelisted email addresses can access admin functions
- Update the whitelist in `admin_check_user_access` function
- Use strong, unique email addresses for admin accounts

### 2. Supabase Row Level Security (RLS)
- Ensure RLS is enabled on sensitive tables
- Admin functions use `SECURITY DEFINER` to bypass RLS safely
- Never expose service role keys in client-side code

### 3. Environment Variables
- Keep all secrets in Cloudflare Pages environment variables
- Never commit `.env` files to version control
- Use different keys for production and preview environments

### 4. HTTPS and Headers
- Cloudflare Pages provides automatic HTTPS
- Security headers are configured in `_headers` file
- Additional security can be configured in Cloudflare settings

## Monitoring and Maintenance

### 1. Error Monitoring
- Monitor Cloudflare Pages build logs
- Check Supabase logs for database errors
- Set up Cloudflare Analytics for usage tracking

### 2. Updates
- Regularly update dependencies: `npm audit` and `npm update`
- Monitor Supabase for service updates
- Test admin functions after Supabase updates

### 3. Backups
- Supabase handles database backups automatically
- Consider exporting critical data periodically
- Keep admin function SQL files in version control

## Troubleshooting

### Build Failures
- Check build logs in Cloudflare Pages
- Verify all environment variables are set
- Test build locally: `npm run build`

### Authentication Issues
- Verify Supabase URL and keys are correct
- Check admin whitelist in `admin_check_user_access`
- Test Supabase connection in browser console

### Function Access Errors
- Ensure admin functions are deployed to Supabase
- Verify admin email is in the whitelist
- Check Supabase logs for detailed error messages

### Performance Issues
- Enable Cloudflare caching for static assets
- Monitor Core Web Vitals in Cloudflare Analytics
- Optimize images and reduce bundle size

## Support

For deployment issues:
1. Check Cloudflare Pages documentation
2. Review Supabase documentation for admin functions
3. Verify all environment variables and admin whitelist settings