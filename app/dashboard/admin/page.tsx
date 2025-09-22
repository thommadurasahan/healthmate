'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  Users, 
  ShoppingBag, 
  TestTube, 
  Stethoscope, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Heart
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  pendingApprovals: number
  totalOrders: number
  totalRevenue: number
  totalCommissions: number
  recentTransactions: any[]
  pendingUsers: any[]
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingApprovals: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    recentTransactions: [],
    pendingUsers: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PUT'
      })

      if (response.ok) {
        fetchDashboardStats()
      }
    } catch (error) {
      console.error('Failed to approve user:', error)
    }
  }

  const rejectUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'PUT'
      })

      if (response.ok) {
        fetchDashboardStats()
      }
    } catch (error) {
      console.error('Failed to reject user:', error)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PATIENT':
        return 'bg-blue-100 text-blue-800'
      case 'PHARMACY':
        return 'bg-green-100 text-green-800'
      case 'DOCTOR':
        return 'bg-purple-100 text-purple-800'
      case 'LABORATORY':
        return 'bg-orange-100 text-orange-800'
      case 'DELIVERY_PARTNER':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'PATIENT':
        return Heart
      case 'PHARMACY':
        return ShoppingBag
      case 'DOCTOR':
        return Stethoscope
      case 'LABORATORY':
        return TestTube
      case 'DELIVERY_PARTNER':
        return MapPin
      default:
        return Users
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {session?.user?.name}!
        </h1>
        <p className="text-primary-foreground/80">
          Admin Dashboard - Manage and oversee the entire HealthMate platform
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/dashboard/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-blue-500 hover:bg-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Manage Users</CardTitle>
                <CardDescription className="text-sm">
                  Approve, reject, and manage user accounts
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/admin/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-green-500 hover:bg-green-600">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Monitor Orders</CardTitle>
                <CardDescription className="text-sm">
                  Track all platform orders and transactions
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/admin/revenue">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-purple-500 hover:bg-purple-600">
                  <DollarSign className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Revenue Analytics</CardTitle>
                <CardDescription className="text-sm">
                  View platform revenue and commission reports
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/admin/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-red-500 hover:bg-red-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Platform Settings</CardTitle>
                <CardDescription className="text-sm">
                  Configure commission rates and system settings
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Platform users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Platform revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending User Approvals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending User Approvals</CardTitle>
            <CardDescription>Users awaiting approval to join the platform</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/admin/users">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.pendingUsers.slice(0, 5).map((user) => {
              const RoleIcon = getRoleIcon(user.role)
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <RoleIcon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        Applied: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => approveUser(user.id)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => rejectUser(user.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {stats.pendingUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending approvals</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Platform Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
          <CardDescription>Latest transactions and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentTransactions.slice(0, 10).map((transaction, index) => (
              <div
                key={transaction.id || index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description || `${transaction.type} Transaction`}
                    </p>
                    <p className="text-sm text-gray-500">
                      User: {transaction.user?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${transaction.amount}</p>
                  <Badge className={
                    transaction.status === 'COMPLETED' 
                      ? 'bg-green-100 text-green-800'
                      : transaction.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {stats.recentTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent transactions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}