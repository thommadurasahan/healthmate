'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Upload, 
  ShoppingBag, 
  TestTube, 
  Stethoscope, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  Pill
} from 'lucide-react'

interface DashboardStats {
  totalOrders: number
  totalLabTests: number
  totalAppointments: number
  monthlyOrderGrowth: number
  monthlyLabGrowth: number
  monthlyAppointmentGrowth: number
}

interface RecentActivity {
  id: string
  type: 'order' | 'prescription' | 'lab_booking' | 'appointment'
  message: string
  time: string
  status: 'completed' | 'pending' | 'processing' | 'confirmed'
  icon: React.ElementType
  href?: string
}

export default function PatientDashboard() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/patient/dashboard-stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/patient/recent-activity')
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        const formattedActivity = activityData.map((item: any) => ({
          ...item,
          icon: getActivityIcon(item.type, item.status),
          href: getActivityHref(item.type, item.id)
        }))
        setRecentActivity(formattedActivity)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Fallback to sample data if API fails
      setStats({
        totalOrders: 0,
        totalLabTests: 0,
        totalAppointments: 0,
        monthlyOrderGrowth: 0,
        monthlyLabGrowth: 0,
        monthlyAppointmentGrowth: 0
      })
      setRecentActivity([])
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string, status: string) => {
    if (status === 'completed') return CheckCircle
    if (status === 'pending' || status === 'processing') return Clock
    
    switch (type) {
      case 'order':
        return ShoppingBag
      case 'prescription':
        return Pill
      case 'lab_booking':
        return TestTube
      case 'appointment':
        return Stethoscope
      default:
        return FileText
    }
  }

  const getActivityHref = (type: string, id: string) => {
    switch (type) {
      case 'order':
        return `/dashboard/patient/orders?highlight=${id}`
      case 'prescription':
        return `/dashboard/patient/prescriptions?highlight=${id}`
      case 'lab_booking':
        return `/dashboard/patient/labs?highlight=${id}`
      case 'appointment':
        return `/dashboard/patient/consultations?highlight=${id}`
      default:
        return '#'
    }
  }

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : ''
    return `${sign}${growth} from last month`
  }

  const quickActions = [
    {
      title: 'Upload Prescription',
      description: 'Upload your prescriptions',
      icon: Upload,
      href: '/dashboard/patient/prescriptions',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'View Orders',
      description: 'Track your medicine orders',
      icon: ShoppingBag,
      href: '/dashboard/patient/orders',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Book Lab Test',
      description: 'Schedule laboratory tests',
      icon: TestTube,
      href: '/dashboard/patient/labs',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Book Doctor',
      description: 'Book appointment with doctors',
      icon: Stethoscope,
      href: '/dashboard/patient/consultations',
      color: 'bg-red-500 hover:bg-red-600'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-primary-foreground/80">
          Manage your health needs all in one place. Upload prescriptions, order medicines, 
          and book appointments with ease.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="text-center">
                  <div className={`inline-flex p-3 rounded-full text-white mb-2 ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {action.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/patient/orders">
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                {formatGrowth(stats?.monthlyOrderGrowth || 0)}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/patient/labs">
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lab Tests</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLabTests || 0}</div>
              <p className="text-xs text-muted-foreground">
                {formatGrowth(stats?.monthlyLabGrowth || 0)}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/patient/consultations">
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAppointments || 0}</div>
              <p className="text-xs text-muted-foreground">
                {formatGrowth(stats?.monthlyAppointmentGrowth || 0)}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest healthcare activities</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="group">
                  {activity.href && activity.href !== '#' ? (
                    <Link href={activity.href}>
                      <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className={`p-1 rounded-full ${
                          activity.status === 'completed' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200' 
                            : activity.status === 'pending' || activity.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          <activity.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {activity.message}
                          </p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-start space-x-3 p-3">
                      <div className={`p-1 rounded-full ${
                        activity.status === 'completed' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200' 
                          : activity.status === 'pending' || activity.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {activity.message}
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start by uploading a prescription or booking an appointment
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}