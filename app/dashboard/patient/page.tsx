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
      console.log('🔍 Fetching dashboard stats from /api/patient/dashboard-stats...')
      const statsResponse = await fetch('/api/patient/dashboard-stats')
      console.log('📡 Dashboard stats response status:', statsResponse.status)
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log('✅ Dashboard stats fetched successfully:', statsData)
        setStats(statsData)
      } else {
        const errorData = await statsResponse.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Failed to fetch dashboard stats:', statsResponse.status, errorData)
      }

      // Fetch recent activity
      console.log('🔍 Fetching recent activity from /api/patient/recent-activity...')
      const activityResponse = await fetch('/api/patient/recent-activity')
      console.log('📡 Recent activity response status:', activityResponse.status)
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        console.log('✅ Recent activity fetched successfully:', activityData)
        const formattedActivity = activityData.map((item: any) => ({
          ...item,
          icon: getActivityIcon(item.type, item.status),
          href: getActivityHref(item.type, item.id)
        }))
        setRecentActivity(formattedActivity)
      } else {
        const errorData = await activityResponse.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Failed to fetch recent activity:', activityResponse.status, errorData)
      }
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error)
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
      title: 'Order with Prescription',
      description: 'Upload prescription & find pharmacies',
      icon: Upload,
      href: '/dashboard/patient/order-with-prescription',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Order without Prescription',
      description: 'Browse & order medicines directly',
      icon: Pill,
      href: '/dashboard/patient/order-direct',
      color: 'bg-emerald-500 hover:bg-emerald-600'
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-blue-100">
            Manage your health needs all in one place. Upload prescriptions, order medicines, 
            and book appointments with ease.
          </p>
        </div>

      {/* Medicine Ordering Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Medicine Ordering</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {quickActions.slice(0, 2).map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-shadow cursor-pointer h-full border-2 hover:border-blue-500/50 dark:hover:border-blue-400/50">
                <CardHeader className="text-center p-6">
                  <div className={`inline-flex p-4 rounded-full text-white mb-3 ${action.color}`}>
                    <action.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl mb-2 text-gray-900 dark:text-white">{action.title}</CardTitle>
                  <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                    {action.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Other Services */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Other Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.slice(2).map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-shadow cursor-pointer h-full">
                <CardHeader className="text-center">
                  <div className={`inline-flex p-3 rounded-full text-white mb-2 ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{action.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
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
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-blue-500/50 dark:hover:border-blue-400/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalOrders || 0}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {formatGrowth(stats?.monthlyOrderGrowth || 0)}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/patient/labs">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-blue-500/50 dark:hover:border-blue-400/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Lab Tests</CardTitle>
              <TestTube className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalLabTests || 0}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {formatGrowth(stats?.monthlyLabGrowth || 0)}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/patient/consultations">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-blue-500/50 dark:hover:border-blue-400/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Appointments</CardTitle>
              <Stethoscope className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalAppointments || 0}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {formatGrowth(stats?.monthlyAppointmentGrowth || 0)}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Your latest healthcare activities</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDashboardData} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
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
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.message}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Start by uploading a prescription or booking an appointment
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}