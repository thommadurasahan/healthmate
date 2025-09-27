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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'PHARMACY':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'DOCTOR':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'LABORATORY':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'DELIVERY_PARTNER':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {session?.user?.name}!
        </h1>
        <p className="text-white/90">
          Admin Dashboard - Manage and oversee the entire HealthMate platform
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/dashboard/admin/users">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Manage Users</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Approve, reject, and manage user accounts
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/admin/orders">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Monitor Orders</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Track all platform orders and transactions
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/admin/revenue">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600">
                  <DollarSign className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Revenue Analytics</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                  View platform revenue and commission reports
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/admin/settings">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Platform Settings</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Configure commission rates and system settings
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Platform users</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingApprovals}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Platform revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Commissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalCommissions.toFixed(2)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending User Approvals */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-gray-900 dark:text-white">Pending User Approvals</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Users awaiting approval to join the platform</CardDescription>
          </div>
          <Link href="/dashboard/admin/users">
            <Button className="bg-gray-600 hover:bg-gray-700 text-white dark:bg-gray-700 dark:hover:bg-gray-600">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.pendingUsers.slice(0, 5).map((user) => {
              const RoleIcon = getRoleIcon(user.role)
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <RoleIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
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
                        className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900"
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => rejectUser(user.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900"
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
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending approvals</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Platform Activity */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Recent Platform Activity</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Latest transactions and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentTransactions.slice(0, 10).map((transaction, index) => (
              <div
                key={transaction.id || index}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <DollarSign className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.description || `${transaction.type} Transaction`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      User: {transaction.user?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">${transaction.amount}</p>
                  <Badge className={
                    transaction.status === 'COMPLETED' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : transaction.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {stats.recentTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent transactions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}