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

### Step 2: Initialize Project
```bash
pnpm create next-app@latest nextjs-template --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd nextjs-template
```

### Step 3: Install Dependencies
Install all required packages with their latest versions:
```bash
pnpm add @supabase/supabase-js @supabase/ssr prisma @prisma/client
pnpm add -D @types/node
```

### Step 4: Create Project Structure
Create the following directory structure:
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── verify/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── auth/         # Auth-related components
│   ├── layout/       # Layout components (navbar, footer)
│   └── features/     # Feature-specific components
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── prisma/
│   │   └── client.ts
│   └── utils/
│       └── cn.ts
├── hooks/
│   └── use-user.ts
├── types/
│   └── index.ts
└── styles/
    └── globals.css
```

### Step 5: Environment Configuration
Create `.env.local` with these variables (user will fill in values):
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

### Step 6: Configure Prisma
1. Initialize Prisma:
```bash
pnpm prisma init
```

2. Update `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client"
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

### Step 7: Install shadcn/ui
1. Initialize shadcn/ui (use canary if needed for latest compatibility):
```bash
npx shadcn@latest init
```

2. Install ALL components:
```bash
npx shadcn@latest add --all
```

### Step 8: Implement Supabase Clients
Create the following Supabase client files:

**src/lib/supabase/client.ts** - Browser client
**src/lib/supabase/server.ts** - Server client for Server Components
**src/lib/supabase/middleware.ts** - Middleware client

### Step 9: Create Authentication Components
Implement these auth components:
- Login form with email/password
- Registration form with email verification
- Password reset form
- Email verification handler
- Auth context/provider

### Step 10: Build Layout Components
Create a responsive navbar that includes:
- Logo/brand
- Navigation links
- User menu (when authenticated)
- Mobile menu toggle
- Theme toggle (optional)

### Step 11: Implement Middleware
Create `src/middleware.ts` for:
- Protecting dashboard routes
- Redirecting authenticated users from auth pages
- Handling auth callbacks

### Step 12: Create Core Pages
Implement these pages:
- Landing page
- Dashboard
- User profile
- Settings
- 404 page

### Step 13: Set Up Database
1. Create Supabase project (user will do this)
2. Run this SQL in Supabase SQL editor to create profile sync:
```sql
-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Set up RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Step 14: Configure Email Templates
In Supabase dashboard, customize email templates for:
- Confirmation email
- Password reset
- Magic link (if using)

### Step 15: Add TypeScript Types
Create proper TypeScript types for:
- Database models
- Supabase auth types
- Component props

### Step 16: Implement Error Handling
Add proper error boundaries and error pages:
- Global error boundary
- Not found pages
- Error logging

### Step 17: Development Tools
Set up:
- ESLint configuration
- Prettier
- VS Code settings
- Git ignore patterns

### Step 18: Create Helper Scripts
Add to package.json:
```json
{
  "scripts": {
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

## Important Implementation Notes

### Authentication Flow
1. User signs up with email/password
2. Supabase sends verification email automatically
3. User clicks link or enters code
4. Profile is created via database trigger
5. User is redirected to dashboard

### Security Considerations
- Enable RLS on all tables
- Never expose service role key to client
- Validate all inputs
- Use server-side session checks
- Implement rate limiting

### Performance Optimizations
- Use React Server Components by default
- Implement proper loading states
- Use next/image for images
- Configure proper caching headers

### Code Style
- Use TypeScript strictly
- Follow Next.js conventions
- Keep components small and focused
- Use proper error handling
- Implement proper loading states

## Validation Checklist
After building, verify:
- [ ] All routes work correctly
- [ ] Authentication flow is complete
- [ ] Email verification works
- [ ] Password reset works
- [ ] Protected routes redirect properly
- [ ] Navbar is responsive
- [ ] All shadcn/ui components are installed
- [ ] TypeScript has no errors
- [ ] Environment variables are documented
- [ ] Database migrations work

## Final Notes
This template should provide a production-ready starting point for Next.js applications. Ensure all features work correctly before considering the task complete. The user should be able to:
1. Clone the repo
2. Add their Supabase credentials
3. Run database setup
4. Start developing immediately

Remember to search for and use the latest stable versions of all packages!