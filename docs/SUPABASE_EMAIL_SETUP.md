# Supabase Email Configuration Guide

This guide will help you set up professional email templates in your Supabase project.

## Quick Setup

1. **Access Email Templates**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to **Authentication** → **Email Templates**

2. **Enable Custom Templates**
   - Toggle "Enable custom email" to ON for each template type

3. **Update Each Template**
   - Copy the HTML from APP_CONFIG.md
   - Replace `{APP_NAME}` with your actual app name
   - Save each template

## Template Types to Configure

### 1. Confirm Email (Sign Up)
- **When sent**: After user registers
- **Purpose**: Verify email ownership
- **Expiration**: 24 hours

### 2. Reset Password
- **When sent**: User requests password reset
- **Purpose**: Secure password change
- **Expiration**: 1 hour

### 3. Magic Link (Optional)
- **When sent**: Passwordless login request
- **Purpose**: Quick sign in
- **Expiration**: 1 hour

## Testing Your Email Templates

1. **Test Sign Up Flow**
   ```bash
   # Start your dev server
   pnpm dev
   
   # Navigate to /register
   # Sign up with a real email
   # Check your inbox
   ```

2. **Test Password Reset**
   ```bash
   # Navigate to /reset-password
   # Enter your email
   # Check your inbox
   ```

## Email Settings in Supabase

### SMTP Configuration (Optional)
For production, consider using custom SMTP:

1. Go to **Settings** → **Email**
2. Enable "Custom SMTP"
3. Configure with your email service:
   - SendGrid
   - AWS SES
   - Postmark
   - etc.

### Rate Limits
Default Supabase limits:
- **Free tier**: 3 emails/hour
- **Pro tier**: 30 emails/hour
- **Custom SMTP**: Unlimited

## Troubleshooting

### Emails Not Sending
1. Check spam folder
2. Verify email is confirmed in Supabase Auth settings
3. Check rate limits haven't been exceeded
4. Ensure custom templates are enabled

### Links Not Working
1. Verify `NEXT_PUBLIC_APP_URL` in .env.local
2. Check redirect URLs in Supabase dashboard
3. Ensure `/api/auth/callback` route exists

### Styling Issues
1. Use inline styles (many email clients strip <style> tags)
2. Test with [Litmus](https://litmus.com) or [Email on Acid](https://www.emailonacid.com)
3. Keep HTML simple and table-based for older clients

## Production Checklist

- [ ] Update APP_NAME in all templates
- [ ] Set correct APP_URL for production
- [ ] Configure custom SMTP for higher limits
- [ ] Test all email flows
- [ ] Add company branding (logo, colors)
- [ ] Include unsubscribe links if sending marketing emails
- [ ] Set up email domain authentication (SPF, DKIM)
- [ ] Monitor email deliverability

## Email Variables Reference

Supabase provides these variables in templates:

- `{{ .ConfirmationURL }}` - The action link
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Verification token (if needed)
- `{{ .TokenHash }}` - Hashed token (for security)

Never modify these variable names, only the surrounding HTML.