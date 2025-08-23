# Investment System Setup Guide

This guide explains how to set up the investment system with package mapping and database integration.

## Overview

The investment system allows users to:
- Select from 4 predefined investment packages (Basic, Silver, Gold, Platinum)
- Invest in multiple packages simultaneously
- Track their investment history and earnings
- View active and inactive investments

## Database Tables

### 1. Packages Table
```sql
CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    interest NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default packages
INSERT INTO packages (id, interest) VALUES 
    (1, 0.4),  -- Basic Package
    (2, 0.45), -- Silver Package
    (3, 0.5),  -- Gold Package
    (4, 0.6);  -- Platinum Package
```

### 2. Investments Table
```sql
CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    userid VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id INTEGER NOT NULL REFERENCES packages(id),
    amount NUMERIC NOT NULL,
    isactive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_investments_userid ON investments(userid);
CREATE INDEX idx_investments_package_id ON investments(package_id);
CREATE INDEX idx_investments_isactive ON investments(isactive);
CREATE INDEX idx_investments_created_at ON investments(created_at);
```

## Package Mapping

The dropdown packages are mapped to database IDs as follows:

| Package Name | Database ID | Interest Rate |
|--------------|-------------|---------------|
| Basic Package | 1 | 0.4% |
| Silver Package | 2 | 0.45% |
| Gold Package | 3 | 0.5% |
| Platinum Package | 4 | 0.6% |

## Setup Instructions

### 1. Database Setup

Run the following SQL commands in your Supabase SQL editor:

```sql
-- Create packages table
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

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,
    userid VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id INTEGER NOT NULL REFERENCES packages(id),
    amount NUMERIC NOT NULL,
    isactive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_investments_userid ON investments(userid);
CREATE INDEX IF NOT EXISTS idx_investments_package_id ON investments(package_id);
CREATE INDEX IF NOT EXISTS idx_investments_isactive ON investments(isactive);
CREATE INDEX IF NOT EXISTS idx_investments_created_at ON investments(created_at);
```

### 2. API Endpoints

The following API endpoints have been created:

- `POST /api/investment/create` - Create a new investment
- `GET /api/investment/user` - Get user's investments
- `POST /api/investment/update` - Update investment summary (existing)

### 3. Frontend Pages

- `/dashboard/invest` - Investment creation page (updated)
- `/dashboard/investments` - Investment history page (new)

## Features

### Investment Creation
- Users can select from 4 predefined packages
- Each package has specific interest rates and investment ranges
- Multiple investments per user are supported
- Wallet balance is automatically deducted when investing

### Investment Tracking
- View all investment history
- See active vs inactive investments
- Track daily earnings based on interest rates
- Investment summary with total amounts

### Package Management
- Packages are stored in the database
- Interest rates can be modified in the database
- Package names are mapped to IDs in the frontend

## Usage Flow

1. User navigates to `/dashboard/invest`
2. Selects a package from the dropdown
3. Enters investment amount
4. System validates amount against package limits and wallet balance
5. Investment is created in the database with package_id mapping
6. Wallet balance is deducted
7. User can view their investments at `/dashboard/investments`

## Error Handling

- Invalid package IDs are rejected
- Insufficient wallet balance prevents investment
- Investment amounts must be within package limits
- Failed investments revert wallet balance changes

## Security

- All API endpoints require authentication
- User can only access their own investments
- Package validation prevents invalid investments
- Database constraints ensure data integrity

## Testing

To test the investment system:

1. Create a user account
2. Deposit funds to wallet
3. Navigate to invest page
4. Select a package and invest
5. Check investment history page
6. Verify wallet balance deduction

## Troubleshooting

### Common Issues

1. **"Package not found" error**
   - Ensure packages table exists with correct data
   - Verify package IDs 1-4 are present

2. **"Insufficient balance" error**
   - Check user's wallet balance
   - Ensure sufficient funds before investing

3. **Investment not appearing**
   - Check database for investment records
   - Verify API endpoints are working
   - Check browser console for errors

### Database Verification

```sql
-- Check packages
SELECT * FROM packages;

-- Check user investments
SELECT i.*, p.interest 
FROM investments i 
JOIN packages p ON i.package_id = p.id 
WHERE i.userid = 'your_user_id';

-- Check wallet balance
SELECT balance FROM user_wallets WHERE user_id = 'your_user_id';
```
