'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Package, 
  ShoppingBag, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

export default function PharmacyDashboard() {
  const { data: session } = useSession()

  const quickActions = [
    {
      title: 'Manage Medicines',
      description: 'Add, edit, or remove medicines from your catalog',
      icon: Package,
      href: '/dashboard/pharmacy/medicines',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'View Orders',
      description: 'Process and manage customer orders',
      icon: ShoppingBag,
      href: '/dashboard/pharmacy/orders',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Delivery Requests',
      description: 'Manage delivery partner assignments',
      icon: MapPin,
      href: '/dashboard/pharmacy/delivery',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ]

  const recentOrders = [
    {
      id: 'ORD-001',
      patient: 'John Doe',
      medicines: 3,
      amount: 45.99,
      status: 'PENDING',
      time: '10 minutes ago'
    },
    {
      id: 'ORD-002',
      patient: 'Jane Smith',
      medicines: 2,
      amount: 28.50,
      status: 'PROCESSING',
      time: '1 hour ago'
    },
    {
      id: 'ORD-003',
      patient: 'Mike Johnson',
      medicines: 1,
      amount: 15.75,
      status: 'READY_FOR_DELIVERY',
      time: '2 hours ago'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'READY_FOR_DELIVERY':
        return 'bg-green-100 text-green-800'
      case 'DELIVERED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return Clock
      case 'PROCESSING':
        return AlertTriangle
      case 'READY_FOR_DELIVERY':
      case 'DELIVERED':
        return CheckCircle
      default:
        return Clock
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {session?.user?.pharmacy?.name || session?.user?.name}!
        </h1>
        <p className="text-primary-foreground/80">
          Manage your pharmacy operations, process orders, and serve your customers efficiently.
        </p>
        {session?.user?.pharmacy?.isApproved === false && (
          <div className="mt-4 bg-yellow-500/20 border border-yellow-300 text-yellow-900 p-3 rounded-md">
            <AlertTriangle className="h-5 w-5 inline mr-2" />
            Your pharmacy is pending admin approval. You'll be able to receive orders once approved.
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medicines</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">5 low stock items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+23%</div>
            <p className="text-xs text-muted-foreground">Since last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from patients</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/pharmacy/orders">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status)
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <StatusIcon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.patient} • {order.medicines} medicines
                      </p>
                      <p className="text-xs text-gray-400">{order.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">${order.amount}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {recentOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}