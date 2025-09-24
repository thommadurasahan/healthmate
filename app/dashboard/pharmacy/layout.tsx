import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

interface PharmacyLayoutProps {
  children: ReactNode
}

export default async function PharmacyLayout({ children }: PharmacyLayoutProps) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'PHARMACY') {
    redirect('/auth/signin')
  }

  return (
    <div className="pharmacy-section min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="pharmacy-card shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}