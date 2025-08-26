# Team Member Metrics Implementation

This document outlines the implementation of team member metrics functionality for the Golden Arrow Capital platform.

## Overview

The implementation adds comprehensive team member tracking with active/inactive status, providing detailed metrics for both direct members and entire team networks.

## Database Changes

### 1. Schema Updates (`config/schema.sql`)

- **Added `is_active` column** to the `users` table with default value `TRUE`
- **Created indexes** for performance optimization:
  - `idx_users_is_active` - for filtering by active status
  - `idx_users_parent_id_is_active` - for parent_id + active status queries

### 2. New Database Function

**`get_team_member_metrics(p_user_id VARCHAR)`**
- Returns comprehensive team member metrics including:
  - `direct_members` - Count of direct referrals
  - `direct_active_members` - Count of active direct referrals
  - `direct_inactive_members` - Count of inactive direct referrals
  - `total_team_members` - Count of all team members (entire downline)
  - `team_active_members` - Count of active team members
  - `team_inactive_members` - Count of inactive team members

## API Endpoints

### 1. Updated Metrics Endpoint (`/api/dashboard/metrics`)

Now returns both business metrics and team member metrics:
```json
{
  "success": true,
  "data": {
    "direct_business": 1000.00,
    "team_business": 5000.00,
    "direct_members": 5,
    "direct_active_members": 4,
    "direct_inactive_members": 1,
    "total_team_members": 25,
    "team_active_members": 20,
    "team_inactive_members": 5
  }
}
```

### 2. Team Members Endpoint (`/api/my-team`)

Returns detailed team member information:
- **Query Parameters:**
  - `type=direct` - Returns only direct members
  - `type=team` - Returns only team members (entire downline)
  - `type=all` - Returns both (default)

- **Response Format:**
```json
{
  "success": true,
  "data": {
    "directMembers": [
      {
        "id": "user_id",
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "is_active": true,
        "business_value": 500.00,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "teamMembers": [...]
  }
}
```

### 3. User Status Management (`/api/user/status`)

Allows updating user active status:
- **Method:** PUT
- **Body:** `{ "userId": "user_id", "isActive": true/false }`

## Frontend Updates

### 1. Dashboard Page (`app/dashboard/page.tsx`)

Updated to display real team member metrics:
- Direct Members count with active/inactive breakdown
- Team Members count with active/inactive breakdown
- Real-time data from the metrics API

### 2. Team Page (`app/dashboard/team/page.tsx`)

Completely redesigned with:
- **Statistics Cards:** Showing direct/team member counts and active status
- **Tabbed Interface:** Separate views for direct and team members
- **Enhanced Table:** Includes status indicators, business value, and join date
- **Real-time Data:** Fetches from the updated team API

## Services

### UserService (`services/userService.ts`)

New service methods for team management:
- `updateUserStatus()` - Update user active/inactive status
- `getUserById()` - Get user details
- `updateUser()` - Update user information
- `getDirectMembers()` - Get direct referrals
- `getTeamMembers()` - Get entire team (downline)

## Migration

### Migration Script (`config/migration_add_is_active.sql`)

Run this script to update existing databases:
```sql
-- Add is_active column with default value TRUE
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update existing users to be active by default
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_parent_id_is_active ON users(parent_id, is_active);
```

## Usage Examples

### 1. Fetching Dashboard Metrics
```javascript
const response = await fetch('/api/dashboard/metrics', {
  headers: { Authorization: `Bearer ${token}` }
});
const { data } = await response.json();
console.log(`Direct Members: ${data.direct_members} (${data.direct_active_members} active)`);
```

### 2. Getting Team Members
```javascript
const response = await fetch('/api/my-team?type=all', {
  headers: { Authorization: `Bearer ${token}` }
});
const { data } = await response.json();
console.log('Direct members:', data.directMembers);
console.log('Team members:', data.teamMembers);
```

### 3. Updating User Status
```javascript
const response = await fetch('/api/user/status', {
  method: 'PUT',
  headers: { 
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ userId: 'user_id', isActive: false })
});
```

## Performance Considerations

1. **Database Indexes:** Optimized queries with composite indexes
2. **Efficient Queries:** Uses PostgreSQL's ltree for hierarchical queries
3. **Caching:** API responses can be cached for better performance
4. **Pagination:** Consider adding pagination for large teams

## Security

1. **Authorization:** All endpoints require valid JWT tokens
2. **User Isolation:** Users can only access their own team data
3. **Input Validation:** All inputs are validated and sanitized
4. **Rate Limiting:** Consider implementing rate limiting for API endpoints

## Future Enhancements

1. **Team Analytics:** Add charts and graphs for team performance
2. **Member Search:** Add search and filtering capabilities
3. **Bulk Operations:** Allow bulk status updates
4. **Export Features:** Add CSV/PDF export for team data
5. **Real-time Updates:** Implement WebSocket for real-time team updates
