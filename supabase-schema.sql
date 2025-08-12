-- Golden Arrow Capital - Supabase Schema
-- Run this in your Supabase SQL Editor to fix the schema

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    sponsor TEXT DEFAULT '',
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================================================
-- OTP TABLE (FIXED SCHEMA)
-- ============================================================================
-- Drop the existing OTP table if it has wrong columns
DROP TABLE IF EXISTS otps;

-- Create the correct OTP table with proper column names
CREATE TABLE otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    otp_type TEXT NOT NULL CHECK (otp_type IN ('signup', 'login')),
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0,
    is_used BOOLEAN DEFAULT FALSE,
    user_data JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Composite unique constraint to allow one active OTP per email+type
    CONSTRAINT otps_email_type_unique UNIQUE (email, otp_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_otps_email_type ON otps(email, otp_type);
CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (true); -- Allow all for now, can be restricted later

-- Allow insert for new users (signup)
CREATE POLICY "Allow user creation" ON users
    FOR INSERT WITH CHECK (true);

-- Allow update for own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (true); -- Can be restricted to own records later

-- OTP policies - allow all operations for server-side operations
CREATE POLICY "Allow OTP operations" ON otps
    FOR ALL USING (true);

-- ============================================================================
-- CLEANUP FUNCTION (OPTIONAL)
-- ============================================================================

-- Function to automatically clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otps WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup every hour
-- (You can enable this later in Supabase dashboard if needed)
-- SELECT cron.schedule('cleanup-expired-otps', '0 * * * *', 'SELECT cleanup_expired_otps();');

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Schema setup complete! Tables created:';
    RAISE NOTICE '✅ users - User accounts';
    RAISE NOTICE '✅ otps - OTP codes with correct column names';
    RAISE NOTICE '✅ RLS policies enabled';
    RAISE NOTICE '✅ Indexes created for performance';
END $$;