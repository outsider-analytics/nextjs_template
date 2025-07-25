'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { user, loading } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleNavigation = (href: string) => {
    setIsNavigating(true)
    setNavigatingTo(href)
    router.push(href)
    // Reset after navigation completes
    setTimeout(() => {
      setIsNavigating(false)
      setNavigatingTo(null)
    }, 500)
  }

  const handleSignOut = async () => {
    setIsNavigating(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
    setIsNavigating(false)
  }

  const navItems = user
    ? [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/profile', label: 'Profile' },
        { href: '/settings', label: 'Settings' },
      ]
    : []

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2"
              onClick={(e) => {
                e.preventDefault()
                handleNavigation('/')
              }}
            >
              <span className="text-2xl font-bold">Logo</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigation(item.href)
                    }}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary",
                      (isNavigating && navigatingTo === item.href) && "opacity-50 pointer-events-none"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {loading ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      asChild 
                      disabled={isNavigating}
                      className={cn(isNavigating && "opacity-50")}
                    >
                      <Link 
                        href="/profile"
                        onClick={(e) => {
                          e.preventDefault()
                          handleNavigation('/profile')
                        }}
                      >
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      asChild 
                      disabled={isNavigating}
                      className={cn(isNavigating && "opacity-50")}
                    >
                      <Link 
                        href="/settings"
                        onClick={(e) => {
                          e.preventDefault()
                          handleNavigation('/settings')
                        }}
                      >
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      disabled={isNavigating}
                      className={cn(isNavigating && "opacity-50")}
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost"
                    disabled={isNavigating}
                    onClick={() => handleNavigation('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    disabled={isNavigating}
                    onClick={() => handleNavigation('/register')}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flow-root">
                  <div className="-my-6 divide-y divide-gray-500/10">
                    <div className="space-y-2 py-6">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted",
                            pathname === item.href && "bg-muted",
                            (isNavigating && navigatingTo === item.href) && "opacity-50 pointer-events-none"
                          )}
                          onClick={(e) => {
                            e.preventDefault()
                            handleNavigation(item.href)
                            setIsOpen(false)
                          }}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="py-6">
                      {loading ? (
                        <div className="h-10 animate-pulse rounded bg-muted" />
                      ) : user ? (
                        <div className="space-y-2">
                          <div className="px-3 py-2">
                            <p className="text-sm font-medium">{user.email}</p>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            disabled={isNavigating}
                            onClick={() => {
                              handleSignOut()
                              setIsOpen(false)
                            }}
                          >
                            Sign out
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            disabled={isNavigating}
                            onClick={() => {
                              handleNavigation('/login')
                              setIsOpen(false)
                            }}
                          >
                            Login
                          </Button>
                          <Button 
                            className="w-full"
                            disabled={isNavigating}
                            onClick={() => {
                              handleNavigation('/register')
                              setIsOpen(false)
                            }}
                          >
                            Sign up
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}