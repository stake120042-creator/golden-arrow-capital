# Dashboard Metrics Debugging Guide

## Issue: Dashboard metrics API not working

### Step 1: Test Database Connection

First, test if your Supabase connection is working:

```bash
curl http://localhost:3000/api/test-db
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": []
}
```

**If this fails:**
- Check your `.env.local` file has correct Supabase credentials
- Verify your Supabase project is active
- Check the console for detailed error messages

### Step 2: Check Environment Variables

Make sure your `.env.local` file has these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
JWT_SECRET=your-jwt-secret-here
```

### Step 3: Verify Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this query to check if functions exist:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_business_metrics', 'get_team_member_metrics');
```

**Expected Result:**
```
routine_name
-------------
get_business_metrics
get_team_member_metrics
```

### Step 4: Check Console Logs

When you access the dashboard, check your terminal/console for these logs:

```
🔍 Dashboard metrics API called
🔍 Verifying token...
✅ Token verified for user: [user-id]
🔍 Fetching business metrics for user: [user-id]
✅ Business metrics fetched: [data]
🔍 Fetching team member metrics for user: [user-id]
✅ Team member metrics fetched: [data]
```

### Step 5: Test Individual Functions

If the functions exist but are failing, test them directly in Supabase SQL Editor:

```sql
-- Test business metrics function
SELECT * FROM get_business_metrics('your-user-id-here');

-- Test team member metrics function  
SELECT * FROM get_team_member_metrics('your-user-id-here');
```

### Step 6: Check User Authentication

Make sure you're logged in and have a valid token:

1. Open browser developer tools
2. Go to **Application** → **Local Storage**
3. Check if `authToken` exists and has a value

### Common Issues and Solutions

#### Issue 1: "Function does not exist"
**Solution:** Run the complete `config/schema.sql` script in Supabase SQL Editor

#### Issue 2: "Invalid token"
**Solution:** 
- Log out and log back in
- Check if JWT_SECRET is set correctly
- Verify token format in localStorage

#### Issue 3: "Database connection failed"
**Solution:**
- Check Supabase project status
- Verify environment variables
- Restart development server

#### Issue 4: "Permission denied"
**Solution:**
- Make sure you're using the `SUPABASE_SERVICE_KEY` (not anon key)
- Check if RLS policies are blocking access

### Step 7: Manual Database Setup

If functions are missing, run this in Supabase SQL Editor:

```sql
-- Enable ltree extension
CREATE EXTENSION IF NOT EXISTS ltree;

-- Add is_active column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create the business metrics function
CREATE OR REPLACE FUNCTION get_business_metrics(p_user_id VARCHAR)
RETURNS TABLE (
    direct_business NUMERIC,
    team_business NUMERIC
) AS $$
DECLARE
    base_path LTREE;
    base_depth INT;
BEGIN
    SELECT path, nlevel(path) INTO base_path, base_depth FROM users WHERE id = p_user_id;
    IF base_path IS NULL THEN
        direct_business := 0; team_business := 0; RETURN NEXT; RETURN;
    END IF;

    -- Direct business: immediate children only
    SELECT COALESCE(SUM(business_value), 0)
    INTO direct_business
    FROM users u
    WHERE u.parent_id = p_user_id;

    -- Team business: all descendants at depth > base (exclude self)
    SELECT COALESCE(SUM(business_value), 0)
    INTO team_business
    FROM users u
    WHERE u.path <@ base_path AND nlevel(u.path) > base_depth;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create the team member metrics function
CREATE OR REPLACE FUNCTION get_team_member_metrics(p_user_id VARCHAR)
RETURNS TABLE (
    direct_members INTEGER,
    direct_active_members INTEGER,
    direct_inactive_members INTEGER,
    total_team_members INTEGER,
    team_active_members INTEGER,
    team_inactive_members INTEGER
) AS $$
DECLARE
    base_path LTREE;
    base_depth INT;
BEGIN
    SELECT path, nlevel(path) INTO base_path, base_depth FROM users WHERE id = p_user_id;
    IF base_path IS NULL THEN
        direct_members := 0; direct_active_members := 0; direct_inactive_members := 0;
        total_team_members := 0; team_active_members := 0; team_inactive_members := 0;
        RETURN NEXT; RETURN;
    END IF;

    -- Direct members metrics
    SELECT 
        COUNT(id),
        COUNT(CASE WHEN is_active = TRUE THEN 1 END),
        COUNT(CASE WHEN is_active = FALSE THEN 1 END)
    INTO 
        direct_members,
        direct_active_members,
        direct_inactive_members
    FROM users u
    WHERE u.parent_id = p_user_id;

    -- Team members metrics (all descendants)
    SELECT 
        COUNT(id),
        COUNT(CASE WHEN is_active = TRUE THEN 1 END),
        COUNT(CASE WHEN is_active = FALSE THEN 1 END)
    INTO 
        total_team_members,
        team_active_members,
        team_inactive_members
    FROM users u
    WHERE u.path <@ base_path AND nlevel(u.path) > base_depth;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql STABLE;
```

### Step 8: Test with Sample Data

If you have no users, create a test user:

```sql
INSERT INTO users (id, username, email, password_hash, first_name, last_name, is_active, path, business_value)
VALUES (
    'test-user-123',
    'testuser',
    'test@example.com',
    'hashed-password',
    'Test',
    'User',
    true,
    'test-user-123',
    1000.00
);
```

Then test the functions with this user ID.

### Still Having Issues?

1. Check the browser's Network tab for the exact API response
2. Look at the server console for detailed error messages
3. Verify all environment variables are set correctly
4. Make sure your Supabase project is not paused or suspended
