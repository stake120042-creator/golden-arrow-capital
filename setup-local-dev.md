# Local Development Setup Guide

## Quick Fix for Local Development

The login/signup is failing because Gmail SMTP credentials are not configured locally. Here's how to fix it:

### Option 1: Use Memory Mode (Recommended for Local Dev)

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration (Replace with your actual values)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OTP Configuration - Use Memory Mode for Local Development
OTP_USE_MEMORY=true
EMAIL_SEND_STRICT=false

# Email Configuration (Optional - will simulate sending)
GMAIL_SMTP_HOST=smtp.gmail.com
GMAIL_SMTP_PORT=587
EMAIL_FROM=Golden Arrow Capital <noreply@goldenarrowcapital.com>
```

### Option 2: Set Up Gmail SMTP (For Real Email Testing)

1. **Enable 2FA on your Gmail account**
2. **Generate App Password:**
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password

3. **Add to `.env.local`:**
```env
GMAIL_SMTP_USER=your-email@gmail.com
GMAIL_SMTP_PASS=your-16-digit-app-password
```

### What I Fixed:

1. **✅ Email Service**: Now simulates email sending in development mode
2. **✅ OTP Service**: Disabled strict email mode in development
3. **✅ Better Error Handling**: Won't crash if credentials are missing

### Test Your Setup:

1. **Restart your dev server**: `npm run dev`
2. **Try signing up** - it should work now
3. **Check console logs** - you'll see "DEV MODE" messages

### For Production:

Make sure to set proper Gmail SMTP credentials in Vercel environment variables.
