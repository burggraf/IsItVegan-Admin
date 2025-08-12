# IsItVegan Admin Dashboard

A comprehensive admin dashboard for managing the IsItVegan food product database. Built with Next.js 15, TypeScript, and Supabase.

## Features

- **Product Management**: Search, view, edit, and classify food products
- **Ingredient Management**: Add, edit, and classify ingredients with controlled vocabularies
- **User Management**: Monitor user accounts and activity
- **Activity Monitoring**: Track database changes and user actions
- **Statistics Dashboard**: Real-time analytics and data visualization
- **Secure Authentication**: Admin-only access with Supabase Auth
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui

## Technology Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with admin whitelist
- **Deployment**: Cloudflare Pages with Edge Runtime

## Prerequisites

- Node.js 18+ and npm
- Supabase project with admin functions configured
- Admin email addresses whitelisted in Supabase

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

Ensure your Supabase database has the required admin functions installed:

```sql
-- Admin functions for privileged access
-- See supabase/admin_functions.sql for complete setup
```

### 4. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

## Key Features

### Product Management
- Search products by UPC, name, or brand
- Edit product details and ingredients
- Automatic product classification after edits
- Image display from OpenFoodFacts API
- Bulk operations and filtering

### Ingredient Management  
- Controlled classification vocabularies:
  - `class`: ignore, may be non-vegetarian, non-vegetarian, typically vegan, typically vegetarian, vegan, vegetarian
  - `primary_class`: Same options as class
- Search by name or classification
- Add new ingredients with proper validation
- Edit existing ingredient classifications

### Activity Monitoring
- Real-time activity feed from database action logs
- User activity tracking and statistics
- Filter by action type, user, and date range

### User Management
- View registered users and their activity
- Monitor user growth and engagement metrics
- Email-based user identification
- **Send Custom Push Notifications**: Send targeted push notifications to individual users

## API Endpoints

The dashboard uses Supabase RPC functions for secure admin operations:

- `admin_search_products()` - Product search with filters
- `admin_update_product()` - Edit product information  
- `admin_classify_upc()` - Automatic product classification
- `admin_search_ingredients()` - Ingredient search
- `admin_get_ingredient_stats()` - Ingredient statistics
- `admin_get_product_stats()` - Product statistics
- `admin_user_stats()` - User analytics

## Push Notifications

The admin dashboard can send custom push notifications to individual users through the secure edge function.

### Configuration

Add these environment variables to your `.env.local`:

```bash
# Supabase configuration (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Push notification security key (required)
NEXT_PUBLIC_ADMIN_API_KEY=07D36FCA-9856-4349-A75F-4E5FF45827DB
```

### Usage

1. Navigate to the **User Management** page
2. Find the user you want to send a notification to
3. Click the **Send Notification** button (bell icon) next to the Edit button
4. Fill out the notification form:
   - **Title**: Notification headline (required)
   - **Message**: Notification body text (required) 
   - **Type**: Categorization (e.g., "admin_message", "system_alert")
   - **Data**: Optional JSON data payload
5. Click **Send Notification**

### Security

- Uses the secured `send-push-notification` edge function
- Requires admin API key authentication
- Only sends to users with active push notification permissions
- All notifications are logged to the notification history

### Notification Types

Common notification types include:
- `admin_message` - General admin communications
- `system_alert` - Important system announcements  
- `account_update` - Account-related notifications
- `feature_announcement` - New feature releases
- `security_alert` - Security-related notifications

The notification system automatically handles user permission checking and only sends to users who have opted in to push notifications.

## Deployment

### Cloudflare Pages (Recommended)

1. Build the application:
```bash
npm run pages:build
```

2. Deploy using Git integration:
   - Connect your repository to Cloudflare Pages
   - Set build command: `npm run pages:build`
   - Set output directory: `.vercel/output/static`
   - Add environment variables in Cloudflare dashboard

3. Configure environment variables in Cloudflare Pages dashboard

For detailed deployment instructions, see `DEPLOYMENT.md`.

## Project Structure

```
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication pages
│   ├── (dashboard)/            # Main dashboard
│   │   └── dashboard/          # Dashboard pages
│   │       ├── page.tsx        # Overview/stats
│   │       ├── products/       # Product management
│   │       ├── ingredients/    # Ingredient management
│   │       ├── users/          # User management
│   │       └── activity/       # Activity monitoring
├── components/                 # Reusable UI components
│   ├── ui/                     # shadcn/ui components
│   └── auth/                   # Authentication components
├── utils/                      # Utility functions
│   └── supabase/               # Supabase client configuration
├── supabase/                   # Database schema and functions
└── public/                     # Static assets
```

## Security

- All admin functions use `SECURITY DEFINER` for privilege escalation
- Row Level Security (RLS) policies protect data access
- Admin whitelist enforced at authentication level
- Edge Runtime for secure serverless deployment

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npm run pages:build` - Build for Cloudflare Pages

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Strict type checking enabled

## Contributing

1. Follow the existing code style and patterns
2. Run type checking and linting before commits
3. Test admin functions thoroughly
4. Update documentation for new features

## License

Private project - All rights reserved.