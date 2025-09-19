'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  ShoppingBag,
  Upload,
  Package,
  Users,
  Settings,
  BarChart3,
  TestTube,
  Stethoscope,
  MapPin
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: React.ElementType
  roles: string[]
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['PATIENT', 'PHARMACY', 'ADMIN']
  },
  // Patient items
  {
    name: 'Upload Prescription',
    href: '/dashboard/patient/prescriptions',
    icon: Upload,
    roles: ['PATIENT']
  },
  {
    name: 'My Orders',
    href: '/dashboard/patient/orders',
    icon: ShoppingBag,
    roles: ['PATIENT']
  },
  {
    name: 'Lab Tests',
    href: '/dashboard/patient/labs',
    icon: TestTube,
    roles: ['PATIENT']
  },
  {
    name: 'Consultations',
    href: '/dashboard/patient/consultations',
    icon: Stethoscope,
    roles: ['PATIENT']
  },
  // Pharmacy items
  {
    name: 'Medicine Catalog',
    href: '/dashboard/pharmacy/medicines',
    icon: Package,
    roles: ['PHARMACY']
  },
  {
    name: 'Orders',
    href: '/dashboard/pharmacy/orders',
    icon: ShoppingBag,
    roles: ['PHARMACY']
  },
  {
    name: 'Delivery Requests',
    href: '/dashboard/pharmacy/delivery',
    icon: MapPin,
    roles: ['PHARMACY']
  },
  // Admin items
  {
    name: 'User Management',
    href: '/dashboard/admin/users',
    icon: Users,
    roles: ['ADMIN']
  },
  {
    name: 'Analytics',
    href: '/dashboard/admin/analytics',
    icon: BarChart3,
    roles: ['ADMIN']
  },
  // Common items
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['PATIENT', 'PHARMACY', 'ADMIN']
  }
]

export function DashboardSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session?.user) return null

  const userRole = session.user.role
  const filteredItems = sidebarItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <nav className="p-6">
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}