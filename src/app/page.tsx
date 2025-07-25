import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
          Welcome to Next.js Template
        </h1>
        <p className="text-xl text-muted-foreground">
          A modern, production-ready Next.js template with Supabase authentication,
          Prisma ORM, and shadcn/ui components.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Login
            </Button>
          </Link>
        </div>
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="space-y-2">
            <h3 className="font-semibold">Supabase Auth</h3>
            <p className="text-sm text-muted-foreground">
              Complete authentication with email verification and password reset
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Prisma ORM</h3>
            <p className="text-sm text-muted-foreground">
              Type-safe database access with PostgreSQL and migrations
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">shadcn/ui</h3>
            <p className="text-sm text-muted-foreground">
              Beautiful, accessible components built with Radix UI and Tailwind
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}