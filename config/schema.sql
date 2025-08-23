-- Golden Arrow Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    sponsor VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable ltree extension for hierarchical queries
CREATE EXTENSION IF NOT EXISTS ltree;

-- Hybrid hierarchical model: adjacency + materialized path (ltree)
ALTER TABLE IF EXISTS users
    ADD COLUMN IF NOT EXISTS parent_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS path LTREE,
    ADD COLUMN IF NOT EXISTS business_value NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_direct_business NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_team_business NUMERIC DEFAULT 0;

-- Indexes for hierarchical performance
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_path_gist ON users USING GIST(path);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Wallets table
CREATE TABLE IF NOT EXISTS user_wallets (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deposit_address VARCHAR(255) UNIQUE NOT NULL,
    derivation_index INTEGER NOT NULL,
    derivation_path VARCHAR(100) NOT NULL,
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_wallets_derivation_index ON user_wallets(derivation_index);

-- OTPs table (already exists in otpService)
CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('signup', 'login')),
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER DEFAULT 0,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email, type)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_otps_email_type ON otps(email, type);
CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at);

-- Function to set ltree path on insert/update based on parent_id
-- For root users (no parent), path = text2ltree(id)
-- For referred users, path = parent.path || text2ltree(id)
CREATE OR REPLACE FUNCTION set_user_path()
RETURNS TRIGGER AS $$
DECLARE
    parent_path LTREE;
BEGIN
    IF NEW.parent_id IS NULL OR NEW.parent_id = '' THEN
        NEW.path := text2ltree(NEW.id);
    ELSE
        SELECT path INTO parent_path FROM users WHERE id = NEW.parent_id;
        IF parent_path IS NULL THEN
            -- Orphaned parent_id; treat as root to avoid blocking insert
            NEW.path := text2ltree(NEW.id);
        ELSE
            NEW.path := parent_path || text2ltree(NEW.id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_user_path_before_insert ON users;
CREATE TRIGGER trg_set_user_path_before_insert
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION set_user_path();

-- Keep path correct if parent_id changes after insert
DROP TRIGGER IF EXISTS trg_set_user_path_before_update ON users;
CREATE TRIGGER trg_set_user_path_before_update
BEFORE UPDATE OF parent_id ON users
FOR EACH ROW
EXECUTE FUNCTION set_user_path();

-- RPC: get team members at exact level distance from a user
-- p_level = 0 returns the user themself; >=1 returns descendants at that depth
CREATE OR REPLACE FUNCTION get_team_members_at_level(p_user_id VARCHAR, p_level INT)
RETURNS TABLE (
    id VARCHAR(255),
    username VARCHAR(100),
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    sponsor VARCHAR(100),
    is_verified BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    business_value NUMERIC,
    path LTREE,
    level INTEGER,
    join_date TIMESTAMP,
    status VARCHAR(20),
    direct_members INTEGER,
    total_team_members INTEGER
) AS $$
DECLARE
    base_path LTREE;
    base_depth INT;
BEGIN
    SELECT u.path, nlevel(u.path) INTO base_path, base_depth FROM users u WHERE u.id = p_user_id;
    IF base_path IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.sponsor, 
        u.is_verified,
        u.created_at, 
        u.updated_at, 
        u.business_value, 
        u.path,
        GREATEST(p_level, 0) as level,
        u.created_at as join_date,
        CASE WHEN u.is_active THEN 'active' ELSE 'inactive' END as status,
        (SELECT COUNT(*) FROM users d WHERE d.parent_id = u.id) as direct_members,
        (SELECT COUNT(*) FROM users t WHERE t.path <@ u.path AND nlevel(t.path) > nlevel(u.path)) as total_team_members
    FROM users u
    WHERE u.path <@ base_path
      AND nlevel(u.path) = base_depth + GREATEST(p_level, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- RPC: get business metrics (direct and team totals) for a user
CREATE OR REPLACE FUNCTION get_business_metrics(p_user_id VARCHAR)
RETURNS TABLE (
    direct_business NUMERIC,
    team_business NUMERIC
) AS $$
DECLARE
    base_path LTREE;
    base_depth INT;
BEGIN
    SELECT u.path, nlevel(u.path) INTO base_path, base_depth FROM users u WHERE u.id = p_user_id;
    IF base_path IS NULL THEN
        direct_business := 0; team_business := 0; RETURN NEXT; RETURN;
    END IF;

    -- Direct business: immediate children only
    SELECT COALESCE(SUM(u.business_value), 0)
    INTO direct_business
    FROM users u
    WHERE u.parent_id = p_user_id;

    -- Team business: all descendants at depth > base (exclude self)
    SELECT COALESCE(SUM(u.business_value), 0)
    INTO team_business
    FROM users u
    WHERE u.path <@ base_path AND nlevel(u.path) > base_depth;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql STABLE;

-- RPC: get team member metrics (direct and team counts with active/inactive status)
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
    SELECT u.path, nlevel(u.path) INTO base_path, base_depth FROM users u WHERE u.id = p_user_id;
    IF base_path IS NULL THEN
        direct_members := 0; direct_active_members := 0; direct_inactive_members := 0;
        total_team_members := 0; team_active_members := 0; team_inactive_members := 0;
        RETURN NEXT; RETURN;
    END IF;

    -- Direct members metrics
    SELECT 
        COUNT(u.id),
        COUNT(CASE WHEN u.is_active = TRUE THEN 1 END),
        COUNT(CASE WHEN u.is_active = FALSE THEN 1 END)
    INTO 
        direct_members,
        direct_active_members,
        direct_inactive_members
    FROM users u
    WHERE u.parent_id = p_user_id;

    -- Team members metrics (all descendants)
    SELECT 
        COUNT(u.id),
        COUNT(CASE WHEN u.is_active = TRUE THEN 1 END),
        COUNT(CASE WHEN u.is_active = FALSE THEN 1 END)
    INTO 
        total_team_members,
        team_active_members,
        team_inactive_members
    FROM users u
    WHERE u.path <@ base_path AND nlevel(u.path) > base_depth;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql STABLE;

-- Investment Details table
CREATE TABLE IF NOT EXISTS investment_details (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_investment NUMERIC DEFAULT 0,
    active_investment NUMERIC DEFAULT 0,
    expired_investment NUMERIC DEFAULT 0,
    referral_income NUMERIC DEFAULT 0,
    rank_income NUMERIC DEFAULT 0,
    self_income NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Indexes for investment_details
CREATE INDEX IF NOT EXISTS idx_investment_details_user_id ON investment_details(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_details_updated_at ON investment_details(updated_at);

-- Function to update investment details
CREATE OR REPLACE FUNCTION update_investment_details(
    p_user_id VARCHAR,
    p_total_investment NUMERIC DEFAULT NULL,
    p_active_investment NUMERIC DEFAULT NULL,
    p_expired_investment NUMERIC DEFAULT NULL,
    p_referral_income NUMERIC DEFAULT NULL,
    p_rank_income NUMERIC DEFAULT NULL,
    p_self_income NUMERIC DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO investment_details (
        user_id, 
        total_investment, 
        active_investment, 
        expired_investment, 
        referral_income, 
        rank_income, 
        self_income,
        updated_at
    ) VALUES (
        p_user_id,
        COALESCE(p_total_investment, 0),
        COALESCE(p_active_investment, 0),
        COALESCE(p_expired_investment, 0),
        COALESCE(p_referral_income, 0),
        COALESCE(p_rank_income, 0),
        COALESCE(p_self_income, 0),
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_investment = COALESCE(p_total_investment, investment_details.total_investment),
        active_investment = COALESCE(p_active_investment, investment_details.active_investment),
        expired_investment = COALESCE(p_expired_investment, investment_details.expired_investment),
        referral_income = COALESCE(p_referral_income, investment_details.referral_income),
        rank_income = COALESCE(p_rank_income, investment_details.rank_income),
        self_income = COALESCE(p_self_income, investment_details.self_income),
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to get investment details for a user
CREATE OR REPLACE FUNCTION get_investment_details(p_user_id VARCHAR)
RETURNS TABLE (
    total_investment NUMERIC,
    active_investment NUMERIC,
    expired_investment NUMERIC,
    referral_income NUMERIC,
    rank_income NUMERIC,
    self_income NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(id.total_investment, 0),
        COALESCE(id.active_investment, 0),
        COALESCE(id.expired_investment, 0),
        COALESCE(id.referral_income, 0),
        COALESCE(id.rank_income, 0),
        COALESCE(id.self_income, 0)
    FROM investment_details id
    WHERE id.user_id = p_user_id;
    
    -- If no record found, return zeros
    IF NOT FOUND THEN
        total_investment := 0;
        active_investment := 0;
        expired_investment := 0;
        referral_income := 0;
        rank_income := 0;
        self_income := 0;
        RETURN NEXT;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    interest NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default packages
INSERT INTO packages (id, interest) VALUES 
    (1, 0.4),  -- Basic Package
    (2, 0.45), -- Silver Package
    (3, 0.5),  -- Gold Package
    (4, 0.6)   -- Platinum Package
ON CONFLICT (id) DO NOTHING;

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,
    userid VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id INTEGER NOT NULL REFERENCES packages(id),
    amount NUMERIC NOT NULL,
    isactive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for investments table
CREATE INDEX IF NOT EXISTS idx_investments_userid ON investments(userid);
CREATE INDEX IF NOT EXISTS idx_investments_package_id ON investments(package_id);
CREATE INDEX IF NOT EXISTS idx_investments_isactive ON investments(isactive);
CREATE INDEX IF NOT EXISTS idx_investments_created_at ON investments(created_at);

-- Optional RLS helpers (policies can be enabled when Supabase Auth is in place)
-- CREATE OR REPLACE FUNCTION get_user_downline_ids()
-- RETURNS SETOF VARCHAR LANGUAGE plpgsql SECURITY DEFINER AS $$
-- DECLARE
--     base_path LTREE;
-- BEGIN
--     SELECT path INTO base_path FROM users WHERE id = auth.uid();
--     RETURN QUERY SELECT id FROM users WHERE path <@ base_path;
-- END; $$;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY users_select_downline ON users FOR SELECT TO authenticated
-- USING (id IN (SELECT get_user_downline_ids()));
