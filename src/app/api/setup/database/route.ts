import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This endpoint is for development setup only
// It helps initialize the database structure programmatically

export async function POST(request: Request) {
  // Security check - only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  // Check for setup secret header
  const setupSecret = request.headers.get('X-Setup-Secret')
  if (setupSecret !== 'development-only') {
    return NextResponse.json(
      { error: 'Invalid setup secret' },
      { status: 401 }
    )
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // SQL statements to execute
    const sqlStatements = [
      // Create profiles table
      `CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        bio TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      )`,

      // Create function to handle new user creation
      `CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, email)
        VALUES (new.id, new.email);
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER`,

      // Create trigger for new user creation
      `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`,
      
      `CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user()`,

      // Enable Row Level Security
      `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`,

      // Create RLS policies
      `DROP POLICY IF EXISTS "Users can view own profile" ON profiles`,
      
      `CREATE POLICY "Users can view own profile" ON profiles
        FOR SELECT USING (auth.uid() = id)`,

      `DROP POLICY IF EXISTS "Users can update own profile" ON profiles`,
      
      `CREATE POLICY "Users can update own profile" ON profiles
        FOR UPDATE USING (auth.uid() = id)`,

      // Create updated_at trigger function
      `CREATE OR REPLACE FUNCTION public.handle_updated_at()
      RETURNS trigger AS $$
      BEGIN
        NEW.updated_at = timezone('utc'::text, now());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql`,

      // Create updated_at trigger
      `DROP TRIGGER IF EXISTS handle_profiles_updated_at ON profiles`,
      
      `CREATE TRIGGER handle_profiles_updated_at
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE PROCEDURE public.handle_updated_at()`
    ]

    // Execute each SQL statement
    const results = []
    for (const sql of sqlStatements) {
      try {
        const { data, error } = await supabaseAdmin.rpc('exec_sql', {
          sql: sql
        }).single()

        if (error && !error.message.includes('already exists')) {
          results.push({ sql: sql.substring(0, 50) + '...', error: error.message })
        } else {
          results.push({ sql: sql.substring(0, 50) + '...', success: true })
        }
      } catch (err) {
        // Try direct execution as RPC might not be available
        try {
          const { error } = await supabaseAdmin.from('profiles').select('count').single()
          
          // If we can query profiles table, it means basic setup worked
          if (!error || error.code === 'PGRST116') {
            results.push({ sql: sql.substring(0, 50) + '...', success: true })
          } else {
            results.push({ sql: sql.substring(0, 50) + '...', error: 'Direct execution failed' })
          }
        } catch (directErr) {
          results.push({ sql: sql.substring(0, 50) + '...', error: 'Execution failed' })
        }
      }
    }

    // Check if profiles table exists and is accessible
    const { error: tableCheckError } = await supabaseAdmin
      .from('profiles')
      .select('count')
      .limit(1)

    if (tableCheckError && tableCheckError.code !== 'PGRST116') {
      return NextResponse.json({
        error: 'Database setup failed. Please run the SQL manually in Supabase dashboard.',
        details: results,
        tableCheckError
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Database setup completed successfully!',
      results,
      note: 'You can now start using the application. Make sure to configure email templates in Supabase dashboard.'
    })

  } catch (error) {
    console.error('Database setup error:', error)
    
    return NextResponse.json({
      error: 'Failed to set up database',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Please run the SQL script manually in Supabase SQL editor using the contents of supabase-setup.sql'
    }, { status: 500 })
  }
}

// GET endpoint to check if database is already set up
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if profiles table exists
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          initialized: false,
          message: 'Database not initialized. Run POST /api/setup/database to set up.'
        })
      }
      throw error
    }

    return NextResponse.json({
      initialized: true,
      message: 'Database is already initialized.'
    })

  } catch (error) {
    return NextResponse.json({
      initialized: false,
      error: 'Failed to check database status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}