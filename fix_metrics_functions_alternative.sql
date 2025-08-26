-- Alternative fix using more flexible type handling
-- Drop existing functions first
DROP FUNCTION IF EXISTS get_team_members_at_level(VARCHAR, INTEGER);
DROP FUNCTION IF EXISTS get_business_metrics(VARCHAR);
DROP FUNCTION IF EXISTS get_team_member_metrics(VARCHAR);

-- Alternative approach: Use OUT parameters instead of RETURNS TABLE
CREATE OR REPLACE FUNCTION get_team_members_at_level(
    p_user_id VARCHAR, 
    p_level INT,
    OUT id VARCHAR,
    OUT username VARCHAR,
    OUT email VARCHAR,
    OUT first_name VARCHAR,
    OUT last_name VARCHAR,
    OUT sponsor VARCHAR,
    OUT is_verified BOOLEAN,
    OUT created_at TIMESTAMP,
    OUT updated_at TIMESTAMP,
    OUT business_value NUMERIC,
    OUT path LTREE,
    OUT level INTEGER,
    OUT join_date TIMESTAMP,
    OUT status VARCHAR,
    OUT direct_members INTEGER,
    OUT total_team_members INTEGER
)
RETURNS SETOF record AS $$
DECLARE
    base_path LTREE;
    base_depth INT;
    rec RECORD;
BEGIN
    SELECT users.path, nlevel(users.path) INTO base_path, base_depth FROM users WHERE users.id = p_user_id;
    IF base_path IS NULL THEN
        RETURN;
    END IF;

    FOR rec IN
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
          AND nlevel(u.path) = base_depth + GREATEST(p_level, 0)
    LOOP
        id := rec.id;
        username := rec.username;
        email := rec.email;
        first_name := rec.first_name;
        last_name := rec.last_name;
        sponsor := rec.sponsor;
        is_verified := rec.is_verified;
        created_at := rec.created_at;
        updated_at := rec.updated_at;
        business_value := rec.business_value;
        path := rec.path;
        level := rec.level;
        join_date := rec.join_date;
        status := rec.status;
        direct_members := rec.direct_members;
        total_team_members := rec.total_team_members;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix for get_business_metrics function
CREATE OR REPLACE FUNCTION get_business_metrics(p_user_id VARCHAR)
RETURNS TABLE (
    direct_business NUMERIC,
    team_business NUMERIC
) AS $$
DECLARE
    base_path LTREE;
    base_depth INT;
BEGIN
    SELECT users.path, nlevel(users.path) INTO base_path, base_depth FROM users WHERE users.id = p_user_id;
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

-- Fix for get_team_member_metrics function
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
    SELECT users.path, nlevel(users.path) INTO base_path, base_depth FROM users WHERE users.id = p_user_id;
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
