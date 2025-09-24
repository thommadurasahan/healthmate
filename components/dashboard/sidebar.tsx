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
  MapPin,
  Calendar,
  Clock,
  FileText,
  Truck,
  DollarSign,
  Activity,
  Heart
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
    roles: ['PATIENT', 'PHARMACY', 'LABORATORY', 'DOCTOR', 'DELIVERY_PARTNER', 'ADMIN']
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
    name: 'Appointments',
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
  // Laboratory items
  {
    name: 'Test Catalog',
    href: '/dashboard/laboratory/tests',
    icon: TestTube,
    roles: ['LABORATORY']
  },
  {
    name: 'Lab Bookings',
    href: '/dashboard/laboratory/bookings',
    icon: Calendar,
    roles: ['LABORATORY']
  },
  {
    name: 'Test Results',
    href: '/dashboard/laboratory/results',
    icon: FileText,
    roles: ['LABORATORY']
  },
  {
    name: 'Reports',
    href: '/dashboard/laboratory/reports',
    icon: BarChart3,
    roles: ['LABORATORY']
  },
  // Doctor items
  {
    name: 'Appointments',
    href: '/dashboard/doctor/appointments',
    icon: Calendar,
    roles: ['DOCTOR']
  },
  {
    name: 'Patient Consultations',
    href: '/dashboard/doctor/consultations',
    icon: Stethoscope,
    roles: ['DOCTOR']
  },
  {
    name: 'Availability',
    href: '/dashboard/doctor/availability',
    icon: Clock,
    roles: ['DOCTOR']
  },
  {
    name: 'Medical Records',
    href: '/dashboard/doctor/records',
    icon: FileText,
    roles: ['DOCTOR']
  },
  // Delivery Partner items
  {
    name: 'Available Deliveries',
    href: '/dashboard/delivery/available',
    icon: Package,
    roles: ['DELIVERY_PARTNER']
  },
  {
    name: 'My Deliveries',
    href: '/dashboard/delivery/orders',
    icon: Truck,
    roles: ['DELIVERY_PARTNER']
  },
  {
    name: 'Earnings',
    href: '/dashboard/delivery/earnings',
    icon: DollarSign,
    roles: ['DELIVERY_PARTNER']
  },
  {
    name: 'Delivery History',
    href: '/dashboard/delivery/history',
    icon: Activity,
    roles: ['DELIVERY_PARTNER']
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
    <div className="w-64 bg-background border-r border-border h-full">
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
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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