# Build a Modern Next.js Template - LLM Instructions

You are tasked with building a production-ready Next.js template with the following requirements. **IMPORTANT**: Before starting, verify all package versions are the latest stable releases by searching for their current versions.

## Required Technology Stack

### Core Requirements
- **Next.js** (verify latest stable version - expected 15.x)
- **pnpm** as package manager
- **TypeScript** with strict mode
- **Tailwind CSS** (verify if v4 is stable or use latest v3)
- **App Router** (not Pages Router)

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
- shadcn/ui compatibility with current Next.js/Tailwind versions

### Step 2: Prepare for Project Initialization
**IMPORTANT**: Before running `create-next-app`, check if the current directory has any files:
1. If there are existing files (like README.md, SETUP_PLAN.md), temporarily move them to the parent directory
2. Run the initialization command
3. Move the files back after initialization

### Step 3: Initialize Project
```bash
# If directory has files, move them first:
# mv * ../temp_backup/

# Then initialize (use printf to auto-answer prompts):
printf "n\n" | pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Move files back if needed:
# mv ../temp_backup/* .
```

### Step 4: Install Dependencies
Install all required packages with their latest versions:
```bash
pnpm add @supabase/supabase-js @supabase/ssr prisma @prisma/client
pnpm add -D @types/node
```

### Step 5: Create Project Structure
**IMPORTANT**: Use proper escaping for parentheses in bash commands:
```bash
# Create directories with proper escaping for route groups
mkdir -p src/app/\(auth\)/{login,register,verify,reset-password}
mkdir -p src/app/\(auth\)/reset-password/update
mkdir -p src/app/\(dashboard\)/{dashboard,profile,settings}
mkdir -p src/app/api/auth/callback
mkdir -p src/app/api/profile
mkdir -p src/components/{ui,auth,layout,features}
mkdir -p src/lib/{supabase,prisma,utils}
mkdir -p src/hooks src/types src/styles
mkdir -p .vscode
```

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

### Step 8: Install shadcn/ui
**IMPORTANT**: Use printf to auto-answer prompts:
```bash
# Initialize with auto-answer (chooses default Neutral color)
printf "y\n" | npx shadcn@latest init

# Install all components with --yes flag
npx shadcn@latest add --all --yes
```

### Step 9: Update Root Layout
**IMPORTANT**: The root layout needs to import and include the Navbar component:
```tsx
import { Navbar } from "@/components/layout/navbar";
// ... other imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
```

### Step 10: Create API Routes First
**IMPORTANT**: Create API routes before pages that use them:
1. Create `/api/profile/route.ts` for profile updates
2. Create `/api/auth/callback/route.ts` for auth callbacks

### Step 11: Implement Middleware Early
**IMPORTANT**: Create middleware before testing protected routes:
1. Create `src/middleware.ts` with the main middleware logic
2. Update `src/lib/supabase/middleware.ts` to include route protection logic

### Step 12: Package.json Scripts
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
    "db:studio": "prisma studio"
  }
}
```

### Step 13: Create Components in Order
Create components in this specific order to avoid missing dependencies:
1. Types (`src/types/index.ts`)
2. Supabase clients (`src/lib/supabase/*.ts`)
3. Hooks (`src/hooks/use-user.ts`)
4. Auth components (`src/components/auth/*.tsx`)
5. Layout components (`src/components/layout/*.tsx`)
6. Feature components (`src/components/features/*.tsx`)
7. Pages (`src/app/**/*.tsx`)

### Step 14: Handle File Creation Properly
**IMPORTANT** for file operations:
- Always use `Write` for new files (don't use `Edit` on non-existent files)
- For existing files that need complete replacement, read first then write
- Create parent directories before creating files
- Remove and recreate README.md if needed instead of trying to edit

### Step 15: Create Supporting Files
Don't forget these important files:
1. `.prettierrc` - Prettier configuration
2. `.vscode/settings.json` - VS Code settings
3. `supabase-setup.sql` - Database setup script
4. Update `.gitignore` to include `!.env.example`

### Step 16: Error Page Implementation
Create error handling pages:
1. `src/app/error.tsx` - Client-side error boundary
2. `src/app/not-found.tsx` - 404 page
3. Include proper error states in forms

### Step 17: Add Missing Features
Ensure all features are implemented:
1. Update password form at `/reset-password/update`
2. Profile API route for updating user profiles
3. Account settings with delete account option
4. Security settings for password changes

## Common Pitfalls to Avoid

1. **Directory Creation**: Always escape parentheses in bash commands when creating route groups
2. **File Creation**: Use `Write` for new files, not `Edit`
3. **Prompts**: Use `printf` to auto-answer interactive prompts
4. **Import Order**: Create dependencies before files that use them
5. **Middleware**: Implement route protection in the middleware client, not just the main middleware
6. **API Routes**: Create API routes before pages that call them
7. **Package.json**: Remove `--turbopack` flag if it causes issues

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
- [ ] Environment variables are documented
- [ ] Database migrations work
- [ ] Profile updates work through API

## Final Notes
This template should provide a production-ready starting point for Next.js applications. Ensure all features work correctly before considering the task complete. The user should be able to:
1. Clone the repo
2. Add their Supabase credentials
3. Run database setup
4. Start developing immediately

Remember to search for and use the latest stable versions of all packages!