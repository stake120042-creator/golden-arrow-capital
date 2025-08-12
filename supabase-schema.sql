-- =============================================================================
-- Golden Arrow Investment Platform - Supabase Database Schema
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    sponsor VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTPs table (if you want to store OTPs in database instead of memory)
CREATE TABLE otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    otp_type VARCHAR(50) NOT NULL CHECK (otp_type IN ('signup', 'login')),
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0,
    is_used BOOLEAN DEFAULT false,
    user_data JSONB, -- Store user signup data for signup OTPs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolios table (for investment data)
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    portfolio_name VARCHAR(255) NOT NULL,
    total_value DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investments table
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    asset_type VARCHAR(100) NOT NULL, -- 'stock', 'crypto', 'bond', 'real_estate', etc.
    asset_symbol VARCHAR(50) NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(20,8) NOT NULL,
    purchase_price DECIMAL(15,2) NOT NULL,
    current_price DECIMAL(15,2),
    purchase_date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'deposit', 'withdrawal', 'dividend')),
    amount DECIMAL(15,2) NOT NULL,
    quantity DECIMAL(20,8),
    price DECIMAL(15,2),
    fees DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    transaction_date TIMESTAMPTZ NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    risk_tolerance VARCHAR(50) DEFAULT 'moderate', -- 'conservative', 'moderate', 'aggressive'
    investment_goals TEXT[],
    notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market data table (for caching asset prices)
CREATE TABLE market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_symbol VARCHAR(50) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    current_price DECIMAL(15,2) NOT NULL,
    previous_close DECIMAL(15,2),
    change_24h DECIMAL(10,4),
    change_percentage DECIMAL(6,2),
    volume DECIMAL(20,2),
    market_cap DECIMAL(20,2),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_otps_email ON otps(email);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_investments_portfolio_id ON investments(portfolio_id);
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_portfolio_id ON transactions(portfolio_id);
CREATE INDEX idx_market_data_symbol ON market_data(asset_symbol);
CREATE INDEX idx_market_data_last_updated ON market_data(last_updated);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_otps_updated_at BEFORE UPDATE ON otps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

-- Portfolio policies
CREATE POLICY "Users can view own portfolios" ON portfolios FOR SELECT USING (true);
CREATE POLICY "Users can insert own portfolios" ON portfolios FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own portfolios" ON portfolios FOR UPDATE USING (true);
CREATE POLICY "Users can delete own portfolios" ON portfolios FOR DELETE USING (true);

-- Investment policies
CREATE POLICY "Users can view own investments" ON investments FOR SELECT USING (true);
CREATE POLICY "Users can insert own investments" ON investments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own investments" ON investments FOR UPDATE USING (true);
CREATE POLICY "Users can delete own investments" ON investments FOR DELETE USING (true);

-- Transaction policies
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (true);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (true);

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (true);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (true);

-- Market data is public (read-only for users)
CREATE POLICY "Anyone can view market data" ON market_data FOR SELECT USING (true);

-- Insert some sample market data
INSERT INTO market_data (asset_symbol, asset_type, current_price, previous_close, change_24h, change_percentage, volume, market_cap) VALUES
('AAPL', 'stock', 175.25, 173.50, 1.75, 1.01, 45234567, 2750000000000),
('MSFT', 'stock', 342.75, 340.25, 2.50, 0.73, 23456789, 2540000000000),
('GOOGL', 'stock', 138.25, 136.75, 1.50, 1.10, 18765432, 1750000000000),
('BTC', 'crypto', 43250.00, 42800.00, 450.00, 1.05, 987654321, 847000000000),
('ETH', 'crypto', 2650.00, 2620.00, 30.00, 1.14, 456789123, 318000000000),
('TSLA', 'stock', 248.50, 245.75, 2.75, 1.12, 67890123, 788000000000);

-- Create a function to get user portfolio summary
CREATE OR REPLACE FUNCTION get_portfolio_summary(user_id_param VARCHAR)
RETURNS TABLE (
    total_portfolios BIGINT,
    total_investments BIGINT,
    total_value DECIMAL,
    total_change_24h DECIMAL,
    total_change_percentage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT p.id) as total_portfolios,
        COUNT(DISTINCT i.id) as total_investments,
        COALESCE(SUM(i.quantity * COALESCE(md.current_price, i.current_price, i.purchase_price)), 0) as total_value,
        COALESCE(SUM(i.quantity * COALESCE(md.change_24h, 0)), 0) as total_change_24h,
        CASE 
            WHEN SUM(i.quantity * i.purchase_price) > 0 THEN
                (COALESCE(SUM(i.quantity * COALESCE(md.current_price, i.current_price, i.purchase_price)), 0) - 
                 SUM(i.quantity * i.purchase_price)) / SUM(i.quantity * i.purchase_price) * 100
            ELSE 0
        END as total_change_percentage
    FROM portfolios p
    LEFT JOIN investments i ON p.id = i.portfolio_id
    LEFT JOIN market_data md ON i.asset_symbol = md.asset_symbol
    WHERE p.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts and authentication data';
COMMENT ON TABLE otps IS 'One-time passwords for authentication';
COMMENT ON TABLE portfolios IS 'User investment portfolios';
COMMENT ON TABLE investments IS 'Individual investment holdings';
COMMENT ON TABLE transactions IS 'Investment transaction history';
COMMENT ON TABLE user_settings IS 'User preferences and settings';
COMMENT ON TABLE market_data IS 'Real-time market data cache';
COMMENT ON FUNCTION get_portfolio_summary IS 'Returns portfolio summary statistics for a user';
