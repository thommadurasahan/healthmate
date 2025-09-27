'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Heart, LogOut, User } from 'lucide-react'
import Link from 'next/link'

export function DashboardHeader() {
  const { data: session } = useSession()

  const handleSignOut = async () => {
    try {
      console.log('Initiating sign out...')
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
    } catch (error) {
      console.error('Sign out error:', error)
      // Fallback redirect to home page
      window.location.href = '/'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PATIENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'PHARMACY':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'LABORATORY':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'DOCTOR':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'DELIVERY_PARTNER':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'ADMIN':
        return 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary fill-current" />
            <h1 className="text-2xl font-bold text-primary">HealthMate</h1>
          </Link>
          
          {session?.user && (
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(session.user.role)}`}>
                {session.user.role.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {session?.user && (
            <>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{session.user.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}