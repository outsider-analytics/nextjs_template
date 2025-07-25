#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

console.log('🔍 Validating environment variables...\n');

// Required environment variables
const requiredVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
    validate: (value) => {
      if (!value) return 'Missing value';
      if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
        return 'Invalid Supabase URL format';
      }
      return null;
    }
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key',
    validate: (value) => {
      if (!value) return 'Missing value';
      if (value.length < 100) {
        return 'Key seems too short';
      }
      return null;
    }
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key (optional for basic setup)',
    validate: (value) => {
      if (!value) return 'Missing value (optional)';
      if (value.length < 100) {
        return 'Key seems too short';
      }
      return null;
    },
    optional: true
  },
  {
    name: 'DATABASE_URL',
    description: 'Database URL for migrations (port 5432)',
    validate: (value) => {
      if (!value) return 'Missing value';
      if (!value.includes(':5432/')) {
        return 'Should use port 5432 for migrations';
      }
      if (!value.includes('pooler.supabase.com')) {
        return 'Should use pooler.supabase.com';
      }
      return null;
    }
  },
  {
    name: 'DIRECT_URL',
    description: 'Direct database URL for queries (port 6543)',
    validate: (value) => {
      if (!value) return 'Missing value';
      if (!value.includes(':6543/')) {
        return 'Should use port 6543 for queries';
      }
      if (!value.includes('pgbouncer=true')) {
        return 'Should include pgbouncer=true parameter';
      }
      return null;
    }
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    description: 'Application URL',
    validate: (value) => {
      if (!value) return 'Missing value';
      return null;
    }
  }
];

let hasErrors = false;
let hasWarnings = false;

// Check each required variable
requiredVars.forEach(({ name, description, validate, optional }) => {
  const value = process.env[name];
  const error = validate(value);
  
  if (error) {
    if (optional && error.includes('optional')) {
      console.log(`⚠️  ${name}: ${error}`);
      console.log(`   ${description}`);
      hasWarnings = true;
    } else {
      console.log(`❌ ${name}: ${error}`);
      console.log(`   ${description}`);
      hasErrors = true;
    }
  } else {
    console.log(`✅ ${name}: Set correctly`);
  }
  console.log('');
});

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('   Please copy .env.example to .env.local and fill in your values.\n');
  hasErrors = true;
}

// Check APP_CONFIG.md
const appConfigPath = path.join(__dirname, '..', 'APP_CONFIG.md');
if (fs.existsSync(appConfigPath)) {
  const appConfig = fs.readFileSync(appConfigPath, 'utf8');
  if (appConfig.includes('[YOUR_APP_NAME]')) {
    console.log('⚠️  APP_CONFIG.md still contains placeholder values');
    console.log('   Please update with your actual app name and details\n');
    hasWarnings = true;
  } else {
    console.log('✅ APP_CONFIG.md: Configured\n');
  }
} else {
  console.log('❌ APP_CONFIG.md not found!\n');
  hasErrors = true;
}

// Summary
console.log('='.repeat(50));
if (hasErrors) {
  console.log('\n❌ Environment validation failed!');
  console.log('\nPlease fix the errors above before proceeding.');
  console.log('\nTo get your Supabase credentials:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings → API');
  console.log('4. Copy the Project URL and anon key');
  console.log('5. Go to Settings → Database');
  console.log('6. Copy the connection strings\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('\n⚠️  Environment validation completed with warnings.');
  console.log('\nThe app should work, but some optional features may be limited.\n');
} else {
  console.log('\n✅ All environment variables are properly configured!');
  console.log('\nYou can now run the application with: pnpm dev\n');
}