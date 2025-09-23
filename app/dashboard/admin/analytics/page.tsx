'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  TestTube,
  Stethoscope,
  MapPin,
  Calendar,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Download,
  RefreshCw
} from 'lucide-react'

interface PlatformAnalytics {
  overview: {
    totalUsers: number
    activeUsers: number
    totalOrders: number
    totalRevenue: number
    totalCommissions: number
    growthRate: number
  }
  userMetrics: {
    byRole: {
      patients: number
      pharmacies: number
      doctors: number
      laboratories: number
      deliveryPartners: number
    }
    registrationTrend: {
      date: string
      count: number
    }[]
    activeUserTrend: {
      date: string
      count: number
    }[]
  }
  businessMetrics: {
    orderTrend: {
      date: string
      orders: number
      revenue: number
      commissions: number
    }[]
    topPharmacies: {
      id: string
      name: string
      orders: number
      revenue: number
    }[]
    topDoctors: {
      id: string
      name: string
      appointments: number
      revenue: number
    }[]
    topLaboratories: {
      id: string
      name: string
      tests: number
      revenue: number
    }[]
  }
  deliveryMetrics: {
    totalDeliveries: number
    successRate: number
    averageDeliveryTime: number
    topDeliveryPartners: {
      id: string
      name: string
      deliveries: number
      earnings: number
      rating: number
    }[]
  }
  financialMetrics: {
    revenueByCategory: {
      category: string
      amount: number
      percentage: number
    }[]
    commissionBreakdown: {
      source: string
      amount: number
      percentage: number
    }[]
    monthlyRecurring: number
    averageOrderValue: number
  }
}

export default function AdminAnalyticsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  const [timeRange, setTimeRange] = useState('month')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setRefreshing(true)
    try {
      // Mock data - in real app, fetch from API
      const mockAnalytics: PlatformAnalytics = {
        overview: {
          totalUsers: 1247,
          activeUsers: 892,
          totalOrders: 3456,
          totalRevenue: 125780.50,
          totalCommissions: 6289.03,
          growthRate: 12.5
        },
        userMetrics: {
          byRole: {
            patients: 856,
            pharmacies: 145,
            doctors: 124,
            laboratories: 67,
            deliveryPartners: 55
          },
          registrationTrend: [
            { date: '2024-01-01', count: 45 },
            { date: '2024-01-02', count: 52 },
            { date: '2024-01-03', count: 38 },
            { date: '2024-01-04', count: 67 },
            { date: '2024-01-05', count: 71 },
            { date: '2024-01-06', count: 59 },
            { date: '2024-01-07', count: 83 }
          ],
          activeUserTrend: [
            { date: '2024-01-01', count: 234 },
            { date: '2024-01-02', count: 267 },
            { date: '2024-01-03', count: 298 },
            { date: '2024-01-04', count: 312 },
            { date: '2024-01-05', count: 345 },
            { date: '2024-01-06', count: 367 },
            { date: '2024-01-07', count: 389 }
          ]
        },
        businessMetrics: {
          orderTrend: [
            { date: '2024-01-01', orders: 45, revenue: 2345.67, commissions: 117.28 },
            { date: '2024-01-02', orders: 52, revenue: 2789.34, commissions: 139.47 },
            { date: '2024-01-03', orders: 38, revenue: 1956.78, commissions: 97.84 },
            { date: '2024-01-04', orders: 67, revenue: 3456.89, commissions: 172.84 },
            { date: '2024-01-05', orders: 71, revenue: 3789.12, commissions: 189.46 },
            { date: '2024-01-06', orders: 59, revenue: 3123.45, commissions: 156.17 },
            { date: '2024-01-07', orders: 83, revenue: 4567.89, commissions: 228.39 }
          ],
          topPharmacies: [
            { id: '1', name: 'Central Pharmacy', orders: 234, revenue: 12345.67 },
            { id: '2', name: 'HealthPlus Pharmacy', orders: 189, revenue: 9876.54 },
            { id: '3', name: 'MediCare Pharmacy', orders: 156, revenue: 8234.21 },
            { id: '4', name: 'QuickMeds Pharmacy', orders: 134, revenue: 7123.45 },
            { id: '5', name: 'PharmaCare', orders: 98, revenue: 5432.10 }
          ],
          topDoctors: [
            { id: '1', name: 'Dr. Sarah Wilson', appointments: 145, revenue: 7250.00 },
            { id: '2', name: 'Dr. Michael Chen', appointments: 132, revenue: 6600.00 },
            { id: '3', name: 'Dr. Emily Davis', appointments: 118, revenue: 5900.00 },
            { id: '4', name: 'Dr. Robert Johnson', appointments: 97, revenue: 4850.00 },
            { id: '5', name: 'Dr. Amanda White', appointments: 84, revenue: 4200.00 }
          ],
          topLaboratories: [
            { id: '1', name: 'CityLab Diagnostics', tests: 234, revenue: 11700.00 },
            { id: '2', name: 'HealthCheck Labs', tests: 189, revenue: 9450.00 },
            { id: '3', name: 'QuickTest Laboratory', tests: 156, revenue: 7800.00 },
            { id: '4', name: 'DiagnoTech Labs', tests: 134, revenue: 6700.00 },
            { id: '5', name: 'MedLab Services', tests: 98, revenue: 4900.00 }
          ]
        },
        deliveryMetrics: {
          totalDeliveries: 2456,
          successRate: 97.8,
          averageDeliveryTime: 28,
          topDeliveryPartners: [
            { id: '1', name: 'John Delivery', deliveries: 156, earnings: 1872.00, rating: 4.9 },
            { id: '2', name: 'Express Mike', deliveries: 134, earnings: 1608.00, rating: 4.8 },
            { id: '3', name: 'Fast Sarah', deliveries: 123, earnings: 1476.00, rating: 4.7 },
            { id: '4', name: 'Quick Tom', deliveries: 98, earnings: 1176.00, rating: 4.6 },
            { id: '5', name: 'Speed Lisa', deliveries: 87, earnings: 1044.00, rating: 4.5 }
          ]
        },
        financialMetrics: {
          revenueByCategory: [
            { category: 'Medicine Orders', amount: 89456.78, percentage: 71.2 },
            { category: 'Doctor Consultations', amount: 23456.89, percentage: 18.6 },
            { category: 'Lab Tests', amount: 12867.34, percentage: 10.2 }
          ],
          commissionBreakdown: [
            { source: 'Medicine Orders', amount: 4472.84, percentage: 71.2 },
            { source: 'Doctor Consultations', amount: 1172.84, percentage: 18.6 },
            { source: 'Lab Tests', amount: 643.35, percentage: 10.2 }
          ],
          monthlyRecurring: 45670.23,
          averageOrderValue: 36.78
        }
      }

      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-violet-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Platform Analytics</h1>
            <p className="text-violet-100">
              Comprehensive insights into platform performance and user engagement
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <label htmlFor="time-range" className="sr-only">Select time range for analytics</label>
            <select
              id="time-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="h-10 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md text-sm"
            >
              <option value="week" className="text-black">This Week</option>
              <option value="month" className="text-black">This Month</option>
              <option value="quarter" className="text-black">This Quarter</option>
              <option value="year" className="text-black">This Year</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
              disabled={refreshing}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.overview.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.financialMetrics.averageOrderValue)} avg value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(analytics.overview.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {formatPercentage(analytics.overview.growthRate)} growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(analytics.overview.totalCommissions)}
            </div>
            <p className="text-xs text-muted-foreground">
              Platform earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {formatPercentage(analytics.deliveryMetrics.successRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              Delivery success
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              User Distribution by Role
            </CardTitle>
            <CardDescription>Breakdown of platform users by their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Patients</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-600">
                    {analytics.userMetrics.byRole.patients}
                  </span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {formatPercentage((analytics.userMetrics.byRole.patients / analytics.overview.totalUsers) * 100)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Pharmacies</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600">
                    {analytics.userMetrics.byRole.pharmacies}
                  </span>
                  <Badge className="bg-green-100 text-green-800">
                    {formatPercentage((analytics.userMetrics.byRole.pharmacies / analytics.overview.totalUsers) * 100)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Doctors</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-purple-600">
                    {analytics.userMetrics.byRole.doctors}
                  </span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {formatPercentage((analytics.userMetrics.byRole.doctors / analytics.overview.totalUsers) * 100)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TestTube className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Laboratories</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-orange-600">
                    {analytics.userMetrics.byRole.laboratories}
                  </span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {formatPercentage((analytics.userMetrics.byRole.laboratories / analytics.overview.totalUsers) * 100)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Delivery Partners</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-yellow-600">
                    {analytics.userMetrics.byRole.deliveryPartners}
                  </span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {formatPercentage((analytics.userMetrics.byRole.deliveryPartners / analytics.overview.totalUsers) * 100)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Distribution
            </CardTitle>
            <CardDescription>Revenue breakdown by service category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.financialMetrics.revenueByCategory.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{formatCurrency(category.amount)}</span>
                      <Badge variant="outline">{formatPercentage(category.percentage)}</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-primary h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Pharmacies</CardTitle>
            <CardDescription>Highest performing pharmacy partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.businessMetrics.topPharmacies.map((pharmacy, index) => (
                <div key={pharmacy.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{pharmacy.name}</p>
                      <p className="text-xs text-gray-500">{pharmacy.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(pharmacy.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Doctors</CardTitle>
            <CardDescription>Most active healthcare providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.businessMetrics.topDoctors.map((doctor, index) => (
                <div key={doctor.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doctor.name}</p>
                      <p className="text-xs text-gray-500">{doctor.appointments} appointments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{formatCurrency(doctor.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Laboratories</CardTitle>
            <CardDescription>Leading diagnostic service providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.businessMetrics.topLaboratories.map((lab, index) => (
                <div key={lab.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{lab.name}</p>
                      <p className="text-xs text-gray-500">{lab.tests} tests</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">{formatCurrency(lab.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Delivery Performance Metrics
          </CardTitle>
          <CardDescription>Analysis of delivery operations and partner performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{analytics.deliveryMetrics.totalDeliveries}</p>
              <p className="text-sm text-gray-600">Total Deliveries</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{formatPercentage(analytics.deliveryMetrics.successRate)}</p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{analytics.deliveryMetrics.averageDeliveryTime}m</p>
              <p className="text-sm text-gray-600">Avg Delivery Time</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{analytics.deliveryMetrics.topDeliveryPartners.length}</p>
              <p className="text-sm text-gray-600">Active Partners</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Top Delivery Partners</h4>
            <div className="space-y-3">
              {analytics.deliveryMetrics.topDeliveryPartners.map((partner, index) => (
                <div key={partner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 text-sm flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{partner.name}</p>
                      <p className="text-sm text-gray-500">{partner.deliveries} deliveries • Rating: {partner.rating}/5</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600">{formatCurrency(partner.earnings)}</p>
                    <p className="text-sm text-gray-500">Total earnings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}