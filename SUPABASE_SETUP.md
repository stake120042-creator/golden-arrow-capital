# Supabase Setup Guide

This guide will help you set up Supabase for the Golden Arrow Capital project.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be set up

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# JWT Secret (generate a random string)
JWT_SECRET=your-jwt-secret-here

# Database Configuration
DB_DISABLED=false
```

## 4. Set Up the Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `config/schema.sql`
4. Run the SQL script to create all tables and functions

## 5. Run the Migration

If you have existing data, run the migration script:

```sql
-- Add is_active column with default value TRUE
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update existing users to be active by default
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_parent_id_is_active ON users(parent_id, is_active);
```

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Check the console for any Supabase-related errors
3. Try accessing the dashboard to see if metrics are loading

## Environment Variables Explained

- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public key for client-side operations
- **SUPABASE_SERVICE_KEY**: Service role key for server-side operations (keep secret!)
- **JWT_SECRET**: Secret key for JWT token signing
- **DB_DISABLED**: Set to 'true' to disable database operations (for testing)

## Troubleshooting

### "supabaseKey is required" Error
This means your environment variables are not set. Make sure:
1. You have a `.env.local` file in your project root
2. All required variables are set
3. You've restarted your development server after adding the variables

### Database Connection Issues
1. Check if your Supabase project is active
2. Verify your project URL and keys are correct
3. Make sure you've run the schema.sql script

### RPC Function Errors
If you get errors about missing RPC functions:
1. Make sure you've run the complete `config/schema.sql` script
2. Check that the `get_team_member_metrics` function exists in your database

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your `SUPABASE_SERVICE_KEY` secret - it has elevated privileges
- Use Row Level Security (RLS) policies in production
- Regularly rotate your JWT secret
