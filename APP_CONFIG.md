# Application Configuration

This document contains important configuration details about the application that should be used when generating content, emails, or other user-facing materials.

## Application Details

- **App Name**: NextJS Template (Update this to your actual app name)
- **App URL**: http://localhost:3000 (Update in production)
- **Company/Organization**: Your Company Name
- **Support Email**: support@yourcompany.com
- **Brand Color**: #000000 (Update to match your brand)

## Email Templates Configuration

When configuring email templates in Supabase, use these guidelines:

### Email Confirmation Template

**Subject**: Confirm your email for {APP_NAME}

**Body**:
```html
<h2>Welcome to {APP_NAME}!</h2>

<p>Hi there,</p>

<p>Thanks for signing up! To get started, please confirm your email address by clicking the button below:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Confirm Email Address
  </a>
</p>

<p>Or copy and paste this link into your browser:</p>
<p style="color: #666; word-break: break-all;">{{ .ConfirmationURL }}</p>

<p>This link will expire in 24 hours for security reasons.</p>

<p>If you didn't create an account with {APP_NAME}, you can safely ignore this email.</p>

<p>Best regards,<br>The {APP_NAME} Team</p>

<hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 20px;">
<p style="color: #999; font-size: 12px;">
  This email was sent to {{ .Email }} because someone signed up for {APP_NAME} with this email address.
</p>
```

### Password Reset Template

**Subject**: Reset your password for {APP_NAME}

**Body**:
```html
<h2>Password Reset Request</h2>

<p>Hi there,</p>

<p>We received a request to reset your password for your {APP_NAME} account. Click the button below to create a new password:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Reset Password
  </a>
</p>

<p>Or copy and paste this link into your browser:</p>
<p style="color: #666; word-break: break-all;">{{ .ConfirmationURL }}</p>

<p>This link will expire in 1 hour for security reasons.</p>

<p><strong>Didn't request this?</strong><br>
If you didn't request a password reset, please ignore this email. Your password won't be changed unless you click the link above and create a new one.</p>

<p>Best regards,<br>The {APP_NAME} Team</p>

<hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 20px;">
<p style="color: #999; font-size: 12px;">
  This email was sent to {{ .Email }} because a password reset was requested for the {APP_NAME} account associated with this email address.
</p>
```

### Magic Link Template (if enabled)

**Subject**: Sign in to {APP_NAME}

**Body**:
```html
<h2>Sign in to {APP_NAME}</h2>

<p>Hi there,</p>

<p>Click the button below to sign in to your account:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Sign In
  </a>
</p>

<p>Or copy and paste this link into your browser:</p>
<p style="color: #666; word-break: break-all;">{{ .ConfirmationURL }}</p>

<p>This link will expire in 1 hour and can only be used once.</p>

<p>If you didn't request this sign-in link, you can safely ignore this email.</p>

<p>Best regards,<br>The {APP_NAME} Team</p>
```

## How to Configure in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. For each template type:
   - Replace the default template with the HTML provided above
   - Replace `{APP_NAME}` with your actual application name
   - Update the support email and other details as needed
   - Ensure the "Enable custom email" toggle is ON

## Email Best Practices

1. **Clear Subject Lines**: Always include the app name and action in the subject
2. **Explain the Action**: Tell users why they're receiving the email
3. **Security Information**: Include expiration times and what to do if they didn't request the action
4. **Mobile Friendly**: Use large buttons and readable fonts
5. **Plain Text Alternative**: Consider providing a plain text version for better deliverability

## Customization Notes

When customizing these templates:
- Keep the Supabase template variables (like `{{ .ConfirmationURL }}` and `{{ .Email }}`) unchanged
- Update colors to match your brand
- Add your logo if desired (host it publicly and use an img tag)
- Consider adding social media links in the footer
- Test emails across different email clients before going live