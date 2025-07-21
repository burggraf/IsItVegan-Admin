# IsItVegan Admin Dashboard

## Project Overview
A secure administrative dashboard for managing the IsItVegan food classification database. Built with Next.js 15, Supabase, and deployed on Cloudflare Pages.

## Architecture
- **Frontend**: Next.js 15 with App Router, TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components with IsItVegan brand colors
- **Authentication**: Supabase Auth with admin email whitelist
- **Database**: Supabase with RLS enabled, accessed via admin-prefixed functions
- **Deployment**: Cloudflare Pages (free tier)

## Brand Colors
- Primary: `#95bf0a` (lime green from logo gradient)
- Accent: `#00a32c` (forest green from logo) 
- Yellow: `#f9e700` (from logo gradient)

## Database Tables
### Main Tables:
- **ingredients** (227k+ records): title, class, primary_class, productcount
- **products** (410k+ records): product_name, brand, upc (primary key), ean13 (legacy), ingredients, analysis, classification  
- **actionlog** (1k+ records): user activity tracking
- **user_subscription**: subscription management
- **auth.users**: Supabase auth users (read-only)

## Admin Functions Required
All Supabase functions prefixed with `admin_` for security:

### Ingredients Management:
- `admin_search_ingredients(query text)` - Search ingredients by title
- `admin_update_ingredient(title, class, primary_class)` - Update ingredient data  
- `admin_create_ingredient(title, class, primary_class)` - Add new ingredient
- `admin_delete_ingredient(title)` - Delete ingredient
- `admin_ingredient_stats()` - Aggregate stats by class/primary_class

### Products Management:
- `admin_search_products(query text)` - Search products by name/brand/barcode
- `admin_update_product(upc, fields jsonb)` - Update product data
- `admin_product_stats()` - Product aggregate statistics

### Activity & User Management:
- `admin_actionlog_recent(limit int)` - Latest activity records
- `admin_user_subscription_crud()` - User subscription CRUD operations  
- `admin_user_stats()` - Auth user statistics
- `admin_check_user_access(user_email text)` - Admin whitelist validation

## Security Model
- RLS enabled on all tables with no public policies
- All data access through admin functions only
- Email-based admin whitelist in `admin_check_user_access` function
- Session-based authentication via Supabase Auth
- Input validation and sanitization on all forms
- Audit logging for admin actions

## Key Features
1. **Secure Login** - Admin-only access with email whitelist
2. **Ingredients Management** - Search, edit, add, delete ingredients with stats
3. **Products Management** - Search, edit products with aggregate data  
4. **Activity Monitoring** - View recent user actions and system activity
5. **User Management** - Manage subscriptions and view user statistics
6. **Responsive Design** - Mobile-friendly interface with IsItVegan branding

## Development Setup
1. Clone repository and run `npm install`
2. Configure `.env.local` with Supabase credentials
3. Deploy admin functions to Supabase
4. Add admin emails to whitelist function
5. Run `npm run dev` for development

## Deployment
- Build: `npm run build` (static export)
- Deploy: Cloudflare Pages with GitHub integration
- Environment variables: Set Supabase URL/key in Cloudflare dashboard

## File Structure
```
/
├── app/
│   ├── (auth)/login/ - Authentication pages
│   ├── (dashboard)/ - Protected admin pages
│   │   ├── ingredients/ - Ingredients management
│   │   ├── products/ - Products management  
│   │   ├── activity/ - Activity monitoring
│   │   └── users/ - User management
│   ├── api/ - API routes if needed
│   └── layout.tsx - Root layout
├── components/
│   ├── ui/ - shadcn/ui components
│   ├── dashboard/ - Dashboard-specific components
│   └── forms/ - Form components
├── lib/
│   ├── supabase.ts - Supabase client setup
│   ├── auth.ts - Authentication utilities
│   └── utils.ts - General utilities
├── supabase/functions/ - Admin database functions
└── CLAUDE.md - This documentation
```

## Next Steps
1. Create and deploy admin Supabase functions
2. Build authentication system with admin middleware
3. Create dashboard layout and navigation
4. Implement management interfaces for each data type
5. Configure Cloudflare Pages deployment