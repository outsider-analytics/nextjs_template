# Build a Modern Next.js Template - LLM Instructions

You are tasked with building a production-ready Next.js template with the following requirements. **IMPORTANT**: Before starting, verify all package versions are the latest stable releases by searching for their current versions.

## Required Technology Stack

### Core Requirements
- **Next.js** (verify latest stable version - expected 15.x)
- **pnpm** as package manager
- **TypeScript** with strict mode
- **Tailwind CSS** (verify if v4 is stable or use latest v3)
- **App Router** (not Pages Router)
- **TanStack Query** (React Query) for server state management

### Database & Authentication
- **Supabase** for database (PostgreSQL) and authentication
- **Prisma** ORM (verify latest version - expected 6.x)
- **Email authentication** using Supabase's built-in email service (no OAuth, just email/password with verification codes)

### UI Components
- **shadcn/ui** with ALL components installed
- Use canary version if needed for latest Tailwind CSS compatibility

### Additional Features
- Responsive navbar that's always visible at the top
- Protected routes with middleware
- User profile management
- Email verification flow
- Password reset functionality

## Step-by-Step Build Instructions

### Step 1: Verify Latest Versions
Before starting, search for and confirm the latest stable versions of:
- Next.js
- Prisma
- @supabase/supabase-js
- @supabase/ssr
- @tanstack/react-query
- shadcn/ui compatibility with current Next.js/Tailwind versions

### Step 2: Prepare for Project Initialization
**IMPORTANT**: Before running `create-next-app`, check if the current directory has any files:
1. If there are existing files (including hidden files like .env.local), temporarily move them to a backup directory
2. Run the initialization command
3. Move the files back after initialization, except for .env.local which should remain excluded

### Step 3: Initialize Project
```bash
# Create backup directory
mkdir -p ../temp_backup

# Move all files including hidden files (except .git)
find . -maxdepth 1 ! -name . ! -name .git -exec mv {} ../temp_backup/ \;

# Then initialize (use printf to auto-answer prompts):
printf "n\n" | pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Move files back except .env files
find ../temp_backup -maxdepth 1 -type f ! -name ".env*" -exec mv {} . \;
find ../temp_backup -maxdepth 1 -type d ! -name "temp_backup" -exec mv {} . \;

# Clean up backup directory
rm -rf ../temp_backup
```

### Step 4: Install Dependencies
Install all required packages with their latest versions (batch installation for efficiency):
```bash
pnpm add @supabase/supabase-js @supabase/ssr prisma @prisma/client @tanstack/react-query @tanstack/react-query-devtools
pnpm add -D @types/node dotenv
```

### Step 5: Create Project Structure
**IMPORTANT**: Create all directories in one command for efficiency:
```bash
mkdir -p src/app/\(auth\)/{login,register,verify,reset-password,reset-password/update} \
         src/app/\(dashboard\)/{dashboard,profile,settings} \
         src/app/api/{auth/callback,profile,setup/database} \
         src/components/{ui,auth,layout,features} \
         src/lib/{supabase,prisma,utils,tanstack-query} \
         src/{hooks,types,styles} \
         {.vscode,docs,scripts}
```

### Step 5.5: Configure Application Details
**IMPORTANT**: Create application configuration before proceeding:

1. Create `APP_CONFIG.md` with application details:
```markdown
# Application Configuration

## Application Details
- **App Name**: [YOUR_APP_NAME] (Update this!)
- **App URL**: http://localhost:3000 (Update in production)
- **Company/Organization**: [YOUR_COMPANY]
- **Support Email**: [YOUR_SUPPORT_EMAIL]
- **Brand Color**: #000000 (Update to match your brand)
```

2. Create `docs/SUPABASE_EMAIL_SETUP.md` with email template instructions

3. **STOP AND CONFIGURE**: Before proceeding, ensure the user has:
   - [ ] Updated APP_CONFIG.md with their actual app name
   - [ ] Chosen their brand colors
   - [ ] Set their support email

### Step 6: Environment Configuration
Create both `.env.local` and `.env.example` with these variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database URLs for Prisma
# Session pooler for migrations (port 5432)
DATABASE_URL="postgres://[user].[project-ref]:[password]@[region].pooler.supabase.com:5432/postgres"
# Transaction pooler for app queries (port 6543)
DIRECT_URL="postgres://[user].[project-ref]:[password]@[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 6.5: Verify Environment Configuration
**CRITICAL**: Before proceeding, verify all environment variables are properly set:

1. Create `scripts/validate-env.js`:
```javascript
require('dotenv').config({ path: '.env.local' });

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DATABASE_URL',
  'DIRECT_URL'
];

const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  process.exit(1);
}

// Validate DATABASE_URL uses port 6543 for pooling
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes(':6543')) {
  console.warn('⚠️  WARNING: DATABASE_URL should use port 6543 for connection pooling');
}

// Validate DIRECT_URL uses port 5432 for direct connections
if (process.env.DIRECT_URL && !process.env.DIRECT_URL.includes(':5432')) {
  console.warn('⚠️  WARNING: DIRECT_URL should use port 5432 for direct connections');
}

console.log('✅ All required environment variables are set!');
console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('🔑 Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...');
console.log('🗄️  Database configured for Prisma');
```

2. Run validation:
```bash
node scripts/validate-env.js
```

3. **STOP if validation fails!** The user must:
   - [ ] Create a Supabase project
   - [ ] Copy all credentials from Supabase dashboard
   - [ ] Ensure DATABASE_URL uses port 5432
   - [ ] Ensure DIRECT_URL uses port 6543

### Step 7: Configure Prisma
1. Initialize Prisma:
```bash
pnpm prisma init
```

2. **IMPORTANT**: Replace the entire `prisma/schema.prisma` file (don't just edit):
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Profile {
  id        String   @id @db.Uuid
  email     String   @unique
  username  String?  @unique
  fullName  String?  @map("full_name")
  avatarUrl String?  @map("avatar_url")
  bio       String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("profiles")
}
```

3. **CRITICAL**: Generate Prisma Client immediately:
```bash
pnpm db:generate
```

### Step 8: Install shadcn/ui
**IMPORTANT**: Use printf to auto-answer prompts:
```bash
# Initialize with auto-answer (chooses default Neutral color)
printf "y\n" | npx shadcn@latest init

# Install all components with --yes flag
npx shadcn@latest add --all --yes
```

### Step 9: Set up TanStack Query
**IMPORTANT**: Create the QueryClient provider before updating the root layout:

1. Create `src/lib/tanstack-query/providers.tsx`:
```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Step 10: Update Root Layout
**IMPORTANT**: The root layout needs to import and include the Navbar component and QueryProvider:
```tsx
import { Navbar } from "@/components/layout/navbar";
import { QueryProvider } from "@/lib/tanstack-query/providers";
// ... other imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
```

### Step 11: Create API Routes First
**IMPORTANT**: Create API routes before pages that use them:
1. Create `/api/profile/route.ts` for profile updates
2. Create `/api/auth/callback/route.ts` for auth callbacks
3. Create `/api/setup/database/route.ts` for database initialization (development only)

### Step 12: Implement Middleware Early
**IMPORTANT**: Create middleware before testing protected routes:
1. Create `src/middleware.ts` with the main middleware logic
2. Update `src/lib/supabase/middleware.ts` to include route protection logic

### Step 13: Package.json Scripts
**IMPORTANT**: Update package.json scripts (remove --turbopack if present):
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "validate-env": "node scripts/validate-env.js",
    "setup:db": "node scripts/setup-database.js"
  }
}
```

### Step 14: Create Components in Order
Create components in this specific order to avoid missing dependencies:
1. Types (`src/types/index.ts`)
2. Supabase clients (`src/lib/supabase/*.ts`)
3. TanStack Query providers (`src/lib/tanstack-query/providers.tsx`)
4. Hooks (`src/hooks/use-user.ts`) - Use TanStack Query for data fetching
5. Auth components (`src/components/auth/*.tsx`)
6. Layout components (`src/components/layout/*.tsx`)
7. Feature components (`src/components/features/*.tsx`)
8. Pages (`src/app/**/*.tsx`)

### Step 15: Handle File Creation Properly
**IMPORTANT** for file operations:
- Always use `Write` for new files (don't use `Edit` on non-existent files)
- For existing files that need complete replacement, read first then write
- Create parent directories before creating files
- Remove and recreate README.md if needed instead of trying to edit

### Step 16: Create Supporting Files
Don't forget these important files:
1. `.prettierrc` - Prettier configuration
2. `.vscode/settings.json` - VS Code settings
3. `supabase-setup.sql` - Database setup script
4. Update `.gitignore` to include `!.env.example`

### Step 17: Error Page Implementation
Create error handling pages:
1. `src/app/error.tsx` - Client-side error boundary
2. `src/app/not-found.tsx` - 404 page
3. Include proper error states in forms

### Step 18: Add Missing Features
Ensure all features are implemented:
1. Update password form at `/reset-password/update`
2. Profile API route for updating user profiles
3. Account settings with delete account option
4. Security settings for password changes

### Step 19: Initialize Database
**IMPORTANT**: The database must be initialized before the app will work properly.

Option 1: Manual Setup (Recommended)
1. Go to Supabase SQL Editor
2. Copy contents of `supabase-setup.sql`
3. Run the SQL script
4. Verify tables were created

Option 2: Automated Setup (Development Only)
```bash
# Start the dev server first
pnpm dev

# In another terminal, run:
curl -X POST http://localhost:3000/api/setup/database \
  -H "Content-Type: application/json" \
  -H "X-Setup-Secret: development-only"
```

### Step 20: Configure Email Templates
**CRITICAL**: Update Supabase email templates with your app name:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Enable custom emails for each template
3. Copy templates from `APP_CONFIG.md`
4. Replace `{APP_NAME}` with your actual app name
5. Save each template

## Common Pitfalls to Avoid

1. **Directory Creation**: Always escape parentheses in bash commands when creating route groups
2. **File Creation**: Use `Write` for new files, not `Edit`
3. **Prompts**: Use `printf` to auto-answer interactive prompts
4. **Import Order**: Create dependencies before files that use them
5. **Middleware**: Implement route protection in the middleware client, not just the main middleware
6. **API Routes**: Create API routes before pages that call them
7. **Package.json**: Remove `--turbopack` flag if it causes issues
8. **Environment Variables**: Always validate env vars before proceeding
9. **App Configuration**: Ensure APP_CONFIG.md is filled out before building components

## Pre-Flight Checklist
Before starting development, verify:
- [ ] APP_CONFIG.md has been updated with actual app details
- [ ] All environment variables are set (`pnpm validate-env`)
- [ ] Supabase project is created and accessible
- [ ] Database connection strings use correct ports
- [ ] Email templates are configured in Supabase

## Validation Checklist
After building, verify:
- [ ] All routes work correctly
- [ ] Authentication flow is complete
- [ ] Email verification works
- [ ] Password reset works with update form
- [ ] Protected routes redirect properly
- [ ] Navbar is responsive and shows user state
- [ ] All shadcn/ui components are installed
- [ ] TypeScript has no errors (`pnpm type-check`)
- [ ] Environment variables are validated (`pnpm validate-env`)
- [ ] Database is initialized and accessible
- [ ] Profile updates work through API
- [ ] Email templates use correct app name

## Final Notes
This template should provide a production-ready starting point for Next.js applications. Ensure all features work correctly before considering the task complete. The user should be able to:
1. Clone the repo
2. Configure APP_CONFIG.md
3. Add their Supabase credentials
4. Run database setup
5. Configure email templates
6. Start developing immediately

Remember to search for and use the latest stable versions of all packages!

## 📋 Quick Reference Commands

For quick copy-paste during implementation:
```bash
# 1. Initialize project
printf "n\n" | pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Install all dependencies
pnpm add @supabase/supabase-js @supabase/ssr prisma @prisma/client @tanstack/react-query @tanstack/react-query-devtools
pnpm add -D @types/node dotenv

# 3. Create complete structure
mkdir -p src/app/\(auth\)/{login,register,verify,reset-password,reset-password/update} \
         src/app/\(dashboard\)/{dashboard,profile,settings} \
         src/app/api/{auth/callback,profile,setup/database} \
         src/components/{ui,auth,layout,features} \
         src/lib/{supabase,prisma,utils,tanstack-query} \
         src/{hooks,types,styles} \
         {.vscode,docs,scripts}

# 4. Setup Prisma
pnpm prisma init
# Replace schema.prisma content
pnpm db:generate

# 5. Install shadcn/ui
printf "y\n" | npx shadcn@latest init
npx shadcn@latest add --all --yes

# 6. Validate everything
pnpm validate-env && pnpm type-check && pnpm lint
```