'use client'

import { Heart } from 'lucide-react'

export function AuthFooter() {
  return (
    <footer className="bg-background/80 backdrop-blur-sm border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary fill-current" />
            <h1 className="text-lg font-bold text-primary">HealthMate</h1>
          </div>
          <p className="text-muted-foreground text-center">
            Making healthcare accessible, affordable, and efficient for everyone.
          </p>
        </div>
      </div>
    </footer>
  )
}