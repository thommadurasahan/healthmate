'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

export function AuthHeader() {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-primary fill-current" />
          <h1 className="text-2xl font-bold text-primary">HealthMate</h1>
        </Link>
        <div className="flex space-x-4">
          <Link href="/auth/signin" className="cursor-pointer inline-block">
            <Button variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}