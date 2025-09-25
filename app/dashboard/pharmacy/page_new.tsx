'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SearchComponent } from '@/components/search/SearchComponent'
import Image from 'next/image'
import {
  Package,
  ShoppingBag,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Eye,
  Pill
} from 'lucide-react'

import type { SearchResult } from '@/components/search/SearchComponent'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalMedicines: number
  orderGrowth: number
  revenueGrowth: number
  lowStockMedicines: number
  pendingOrders: number
}

interface RecentOrder {
  id: string
  patient: string
  medicines: number
  amount: number
  status: string
  time: string
  medicinesList: string[]
}

interface TopMedicine {
  id: string
  name: string
  image: string | null
  totalSold: number
  revenue: number
  lastSold: string
}

interface PharmacyInfo {
  name: string
  isApproved: boolean
  address: string | null
  phone: string | null
}

export default function PharmacyDashboard() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topMedicines, setTopMedicines] = useState<TopMedicine[]>([])
  const [pharmacyInfo, setPharmacyInfo] = useState<PharmacyInfo | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pharmacy/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentOrders(data.recentOrders)
        setTopMedicines(data.topMedicines)
        setPharmacyInfo(data.pharmacyInfo)
      } else {
        console.error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : ''
    return `${sign}${growth.toFixed(1)}% from last month`
  }

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
      href: '/dashboard/pharmacy/delivery-requests',
      color: 'bg-purple-500 hover:bg-purple-600'
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
          Welcome, {pharmacyInfo?.name || session?.user?.name}!
        </h1>
        <p className="text-primary-foreground/80">
          Manage your pharmacy operations, process orders, and serve your customers efficiently.
        </p>
        {pharmacyInfo?.isApproved === false && (
          <div className="mt-4 bg-yellow-500/20 border border-yellow-300 text-yellow-900 p-3 rounded-md">
            <AlertTriangle className="h-5 w-5 inline mr-2" />
            Your pharmacy is pending admin approval. You'll be able to receive orders once approved.
          </div>
        )}
      </div>

      {/* Search Component */}
      <div className="flex justify-center">
        <SearchComponent onSearch={setSearchResults} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full hover:scale-105 hover:border-primary">
                <CardHeader className="text-center">
                  <div className={`inline-flex p-3 rounded-full text-white mb-2 ${action.color} transform transition-transform group-hover:scale-110`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-pharmacy-text">{action.title}</CardTitle>
                  <CardDescription className="text-sm text-pharmacy-text-light">
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
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatGrowth(stats?.orderGrowth || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatGrowth(stats?.revenueGrowth || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medicines</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMedicines || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.lowStockMedicines || 0} low stock items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Medicines */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Selling Medicines</CardTitle>
            <CardDescription>Your best performing products</CardDescription>
          </div>
          <Link href="/dashboard/pharmacy/medicines">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topMedicines.length > 0 ? (
              topMedicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    {medicine.image ? (
                      <Image
                        src={medicine.image}
                        alt={medicine.name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Pill className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {medicine.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Sold: {medicine.totalSold} units
                      </p>
                      <p className="text-xs text-gray-400">
                        Last sold: {new Date(medicine.lastSold).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(medicine.revenue)}</p>
                    <p className="text-sm text-gray-500">Revenue</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sales data available</p>
                <p className="text-sm">Start selling medicines to see top performers</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from patients</CardDescription>
          </div>
          <Link href="/dashboard/pharmacy/orders">
            <Button>View All</Button>
          </Link>
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
                        Order #{order.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.patient} • {order.medicines} medicines
                      </p>
                      <p className="text-xs text-gray-400">{order.time}</p>
                      {order.medicinesList.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Medicines: {order.medicinesList.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.amount)}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <Link href={`/dashboard/pharmacy/orders?highlight=${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {recentOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders yet</p>
              <p className="text-sm">Orders will appear here once patients place them</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
