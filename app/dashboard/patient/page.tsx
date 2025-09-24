'use client'

import { useSession } from 'next-auth/react'
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
  AlertCircle 
} from 'lucide-react'

export default function PatientDashboard() {
  const { data: session } = useSession()

  const quickActions = [
    {
      title: 'Upload Prescription',
      description: 'Upload your prescription to find medicines',
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

  const recentActivity = [
    {
      type: 'order',
      message: 'Order #12345 has been delivered',
      time: '2 hours ago',
      status: 'completed',
      icon: CheckCircle
    },
    {
      type: 'prescription',
      message: 'Prescription uploaded successfully',
      time: '1 day ago',
      status: 'completed',
      icon: CheckCircle
    },
    {
      type: 'order',
      message: 'Order #12344 is being processed',
      time: '2 days ago',
      status: 'pending',
      icon: Clock
    }
  ]

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lab Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest healthcare activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${
                  activity.status === 'completed' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.message}
                  </p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}