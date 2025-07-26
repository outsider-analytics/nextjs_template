# Troubleshooting Guide

This guide addresses common issues encountered during template setup and development, incorporating lessons learned from multiple implementations.

## 🚨 Pre-Flight Checklist

Before troubleshooting, ensure:
- [ ] All environment variables set (`pnpm validate-env`)
- [ ] Prisma client generated (`pnpm db:generate`)
- [ ] TypeScript passes (`pnpm type-check`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] Database initialized (run SQL script in Supabase)
- [ ] Email templates configured in Supabase

## Common Issues and Solutions

### 1. ESLint Errors

#### Unescaped Apostrophes
```tsx
// Error: `'` can be escaped with `&apos;`
// ❌ Wrong
<p>Don't have an account?</p>

// ✅ Fix
<p>Don&apos;t have an account?</p>
```

#### Unused Variables
```tsx
// Error: 'err' is defined but never used
// ❌ Wrong
} catch (err) {
  setError('Error occurred');
}

// ✅ Fix
} catch {
  setError('Error occurred');
}
```

#### Unused Imports
```tsx
// Error: 'X' is defined but never used
// ❌ Wrong
import { Menu, X } from 'lucide-react';

// ✅ Fix - Remove unused import
import { Menu } from 'lucide-react';
```

### 2. TypeScript Errors

#### Missing Prisma Types
```bash
# Error: Module '"@prisma/client"' has no exported member 'PrismaClient'
# Fix: Generate Prisma client
pnpm db:generate
```

#### Type 'any' Issues
```tsx
// Error: Unexpected any. Specify a different type
// ❌ Wrong
export interface ApiResponse<T = any> {

// ✅ Fix
export interface ApiResponse<T = unknown> {
```

### 3. Environment Variable Issues

#### Validation Script Fails
```bash
# Error: Missing required environment variables
# Fix: Install dotenv and update script
pnpm add -D dotenv

# Update scripts/validate-env.js to include:
require('dotenv').config({ path: '.env.local' });
```

#### Wrong Database Ports
```env
# ❌ Wrong (swapped ports)
DATABASE_URL="...supabase.com:5432/postgres"
DIRECT_URL="...supabase.com:6543/postgres?pgbouncer=true"

# ✅ Correct
DATABASE_URL="...supabase.com:6543/postgres?pgbouncer=true"  # Transaction pooler for app queries
DIRECT_URL="...supabase.com:5432/postgres"                   # Direct connection for migrations
```

**Note:** The validation script now checks for correct port usage:
```javascript
// Validate DATABASE_URL uses port 6543 for pooling
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes(':6543')) {
  console.warn('⚠️  WARNING: DATABASE_URL should use port 6543 for connection pooling');
}
```

### 4. Build/Runtime Errors

#### Turbopack Issues
```json
// Error: Various build errors with --turbopack
// ❌ Wrong
"dev": "next dev --turbopack"

// ✅ Fix
"dev": "next dev"
```

#### Missing Components
```tsx
// Error: Cannot find module '@/components/layout/navbar'
// Fix: Ensure components are created in correct order:
// 1. Types → 2. Utils → 3. Hooks → 4. Components → 5. Pages
```

### 5. File Operation Errors

#### Can't Edit Non-Existent File
```typescript
// Error: File has not been read yet
// ❌ Wrong - Using Edit on new file
Edit({ file_path: "/new/file.ts", ... })

// ✅ Fix - Use Write for new files
Write({ file_path: "/new/file.ts", content: "..." })
```

#### Can't Remove README.md
```bash
# Error when trying to edit Next.js default README
# Fix: Remove and recreate
rm -f README.md
# Then use Write to create new one
```

### 6. Authentication Issues

#### Supabase Auth Not Working
1. Check email templates are configured in Supabase
2. Verify redirect URLs in Supabase dashboard
3. Ensure middleware is properly configured
4. Check that profiles table and triggers exist

#### Profile Creation Fails
```sql
-- Ensure trigger exists in Supabase:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 7. Quick Fixes Script

```bash
#!/bin/bash
# fix-common-issues.sh

# Fix ESLint apostrophes
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i "s/Don't/Don\&apos;t/g"
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i "s/don't/don\&apos;t/g"
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i "s/We've/We\&apos;ve/g"
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i "s/you're/you\&apos;re/g"

# Generate Prisma client
pnpm db:generate

# Run all checks
pnpm validate-env && pnpm type-check && pnpm lint
```

## Validation Commands

Always run these in order:
```bash
# 1. Validate environment
pnpm validate-env

# 2. Generate Prisma types (if needed)
pnpm db:generate

# 3. Check TypeScript
pnpm type-check

# 4. Check ESLint
pnpm lint

# 5. Attempt build
pnpm build
```

## 💡 Performance & Efficiency Tips

### Batch Operations
```bash
# Install all dependencies at once
pnpm add @supabase/supabase-js @supabase/ssr prisma @prisma/client @tanstack/react-query @tanstack/react-query-devtools
pnpm add -D @types/node dotenv

# Create all directories at once
mkdir -p src/app/\(auth\)/{login,register,verify,reset-password,reset-password/update} \
         src/app/\(dashboard\)/{dashboard,profile,settings} \
         src/app/api/{auth/callback,profile,setup/database} \
         src/components/{ui,auth,layout,features} \
         src/lib/{supabase,prisma,utils,tanstack-query} \
         src/{hooks,types,styles} \
         {.vscode,docs,scripts}
```

### Parallel Validation
```bash
# Run checks in parallel
pnpm validate-env & pnpm type-check & wait
```

### Quick Reset
```bash
# Complete reset script
rm -rf node_modules .next
pnpm install
pnpm db:generate
pnpm validate-env && pnpm type-check && pnpm lint
```

## 🔄 Implementation Order (Critical)

To avoid dependency issues, always follow this order:
1. **Types** (`src/types/index.ts`)
2. **Utilities** (Supabase clients, Prisma client)
3. **TanStack Query Provider** (`src/lib/tanstack-query/providers.tsx`)
4. **Hooks** (`src/hooks/use-user.ts`)
5. **Components** (Auth → Layout → Features)
6. **Pages** (Last, after all dependencies exist)

## Need Help?

1. Check this troubleshooting guide first
2. Review the implementation order above
3. Ensure all dependencies are installed: `pnpm install`
4. Clear Next.js cache: `rm -rf .next`
5. Restart dev server
6. Check Supabase service status

Remember: Most issues stem from:
- Missing environment variables
- Incorrect file operation order
- Ungenerated Prisma client
- ESLint rule violations
- Wrong implementation order