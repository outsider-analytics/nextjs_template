import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username, fullName, bio } = await request.json()

    // Check if username is already taken
    if (username) {
      const existingUser = await prisma.profile.findFirst({
        where: {
          username,
          NOT: {
            id: user.id,
          },
        },
      })

      if (existingUser) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
    }

    const profile = await prisma.profile.upsert({
      where: {
        id: user.id,
      },
      update: {
        username: username || null,
        fullName: fullName || null,
        bio: bio || null,
      },
      create: {
        id: user.id,
        email: user.email!,
        username: username || null,
        fullName: fullName || null,
        bio: bio || null,
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}