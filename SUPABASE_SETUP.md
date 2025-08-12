# 🚀 Supabase Setup Guide for Golden Arrow Investment Platform

## 📋 Prerequisites
- Supabase account (free tier available)
- Node.js installed
- Golden Arrow project cloned

## 🏗️ Step 1: Create Supabase Project

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Fill in project details:**
   - Organization: Select your organization
   - Name: `golden-arrow-investment`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
4. **Click "Create new project"**
5. **Wait for project to be created** (takes ~2 minutes)

## 🔧 Step 2: Get Project Credentials

1. **Go to Project Settings** → **API**
2. **Copy the following values:**
   - Project URL
   - `anon` `public` API key

## 🔐 Step 3: Update Environment Variables

1. **Update `.env.local`** with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. **Replace placeholders:**
   - `your-project-ref` → Your actual project reference
   - `your_supabase_anon_key` → Your actual anon key

## 📊 Step 4: Create Database Schema

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Create a new query**
3. **Copy and paste the contents of `supabase-schema.sql`**
4. **Run the query** (click the play button)

## ✅ Step 5: Verify Setup

1. **Check Tables Created:**
   - Go to **Table Editor**
   - You should see: `users`, `otps`, `portfolios`, `investments`, `transactions`, `user_settings`, `market_data`

2. **Test the Application:**
   ```bash
   npm run dev
   ```

3. **Try signing up** with a new account
4. **Check Supabase Dashboard** → **Table Editor** → **users** to see your new user

## 🔒 Step 6: Security Configuration (Production)

### Row Level Security (RLS)
- RLS is already enabled in the schema
- Users can only access their own data
- Market data is public (read-only)

### API Keys
- **Development:** Use the `anon` key (already configured)
- **Production:** Consider using service role key for server-side operations

## 📈 Step 7: Optional Enhancements

### Real-time Subscriptions
Enable real-time updates for portfolio changes:

```typescript
// Example: Listen to portfolio updates
const { data, error } = await supabase
  .from('portfolios')
  .select('*')
  .eq('user_id', userId)
  .on('*', (payload) => {
    console.log('Portfolio updated:', payload)
  })
  .subscribe()
```

### Database Functions
The schema includes a `get_portfolio_summary` function for efficient queries:

```sql
SELECT * FROM get_portfolio_summary('user_123');
```

### Triggers and Functions
- Automatic `updated_at` timestamps
- Row Level Security policies
- Portfolio summary calculations

## 🚀 Step 8: Deploy to Production

### Vercel Deployment
1. **Add environment variables** to Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Deploy:**
   ```bash
   vercel --prod
   ```

### Supabase Production Checklist
- ✅ Enable RLS on all tables
- ✅ Review API usage limits
- ✅ Set up database backups
- ✅ Monitor performance
- ✅ Configure custom domain (optional)

## 🔧 Development Tips

### Database Migration
If you need to modify the schema:
1. Create new SQL file with changes
2. Run in Supabase SQL Editor
3. Update TypeScript types if needed

### Debugging
- Check Supabase Dashboard → **Logs** for errors
- Use browser DevTools Network tab
- Check Next.js console for Supabase client errors

### Backup Strategy
- Supabase Pro includes automatic backups
- Free tier: Export data manually if needed

## 📚 Helpful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Client Reference](https://supabase.com/docs/reference/javascript)

## 🆘 Troubleshooting

### Common Issues

**"Missing env.NEXT_PUBLIC_SUPABASE_URL"**
- Ensure environment variables are set correctly
- Restart development server after updating `.env.local`

**"Failed to create user"**
- Check Supabase logs for detailed error
- Verify database schema is applied correctly
- Check RLS policies

**Network Errors**
- Verify Supabase project is running
- Check API key permissions
- Ensure correct project URL

### Getting Help
- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- GitHub Issues: Report bugs
- Documentation: [supabase.com/docs](https://supabase.com/docs)

---

🎉 **Congratulations!** Your Golden Arrow Investment Platform is now powered by Supabase! Enjoy the benefits of real-time updates, automatic scaling, and enterprise-grade security.
