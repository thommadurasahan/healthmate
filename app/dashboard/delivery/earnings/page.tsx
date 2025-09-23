'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Award,
  Target,
  Filter,
  Download,
  Star,
  Route
} from 'lucide-react'

interface DeliveryEarning {
  id: string
  orderId: string
  deliveryDate: string
  pickupAddress: string
  deliveryAddress: string
  distance: number
  duration: number // in minutes
  deliveryFee: number
  bonus: number
  tips: number
  totalEarning: number
  status: 'COMPLETED' | 'PENDING_PAYMENT' | 'PAID'
  customerRating?: number
  customerFeedback?: string
  orderValue: number
  weatherBonus?: number
  peakHourBonus?: number
}

interface DeliveryStats {
  totalDeliveries: number
  totalEarnings: number
  averageRating: number
  totalDistance: number
  totalTime: number
  successRate: number
  currentStreak: number
  longestStreak: number
}

export default function DeliveryEarningsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState<DeliveryEarning[]>([])
  const [stats, setStats] = useState<DeliveryStats | null>(null)
  const [filter, setFilter] = useState('all')
  const [dateRange, setDateRange] = useState('week')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockEarnings: DeliveryEarning[] = [
      {
        id: 'DEL001',
        orderId: 'ORD001',
        deliveryDate: '2024-01-20T10:30:00Z',
        pickupAddress: 'Central Pharmacy, Main St',
        deliveryAddress: '123 Oak Avenue',
        distance: 2.5,
        duration: 18,
        deliveryFee: 8.00,
        bonus: 2.00,
        tips: 3.00,
        totalEarning: 13.00,
        status: 'PAID',
        customerRating: 5,
        customerFeedback: 'Very fast delivery, excellent service!',
        orderValue: 45.99,
        weatherBonus: 1.00,
        peakHourBonus: 1.00
      },
      {
        id: 'DEL002',
        orderId: 'ORD002',
        deliveryDate: '2024-01-20T14:15:00Z',
        pickupAddress: 'HealthPlus Pharmacy, Center Mall',
        deliveryAddress: '456 Pine Street',
        distance: 3.2,
        duration: 25,
        deliveryFee: 10.00,
        bonus: 0,
        tips: 2.50,
        totalEarning: 12.50,
        status: 'PAID',
        customerRating: 4,
        customerFeedback: 'Good service, on time delivery',
        orderValue: 28.50
      },
      {
        id: 'DEL003',
        orderId: 'ORD003',
        deliveryDate: '2024-01-20T16:45:00Z',
        pickupAddress: 'MediCare Pharmacy, North Plaza',
        deliveryAddress: '789 Elm Drive',
        distance: 1.8,
        duration: 15,
        deliveryFee: 6.00,
        bonus: 1.50,
        tips: 5.00,
        totalEarning: 12.50,
        status: 'COMPLETED',
        customerRating: 5,
        customerFeedback: 'Amazing delivery partner! Very professional.',
        orderValue: 67.25,
        peakHourBonus: 1.50
      },
      {
        id: 'DEL004',
        orderId: 'ORD004',
        deliveryDate: '2024-01-19T09:20:00Z',
        pickupAddress: 'QuickMeds Pharmacy, Downtown',
        deliveryAddress: '321 Maple Lane',
        distance: 4.1,
        duration: 32,
        deliveryFee: 12.00,
        bonus: 3.00,
        tips: 1.00,
        totalEarning: 16.00,
        status: 'PAID',
        customerRating: 4,
        orderValue: 89.99,
        weatherBonus: 2.00,
        peakHourBonus: 1.00
      },
      {
        id: 'DEL005',
        orderId: 'ORD005',
        deliveryDate: '2024-01-19T19:30:00Z',
        pickupAddress: 'PharmaCare, Shopping District',
        deliveryAddress: '654 Cedar Court',
        distance: 2.1,
        duration: 20,
        deliveryFee: 7.00,
        bonus: 2.50,
        tips: 4.50,
        totalEarning: 14.00,
        status: 'PENDING_PAYMENT',
        customerRating: 5,
        customerFeedback: 'Perfect delivery experience!',
        orderValue: 34.75,
        peakHourBonus: 2.50
      }
    ]

    const mockStats: DeliveryStats = {
      totalDeliveries: 127,
      totalEarnings: 1567.50,
      averageRating: 4.7,
      totalDistance: 298.4,
      totalTime: 2840, // in minutes
      successRate: 98.4,
      currentStreak: 15,
      longestStreak: 28
    }

    setEarnings(mockEarnings)
    setStats(mockStats)
    setLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const filteredEarnings = earnings.filter(earning => {
    const matchesSearch = earning.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         earning.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         earning.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filter === 'all' || earning.status === filter
    
    return matchesSearch && matchesStatus
  })

  const totalEarnings = filteredEarnings.reduce((sum, earning) => sum + earning.totalEarning, 0)
  const averageEarning = totalEarnings / (filteredEarnings.length || 1)
  const totalDistance = filteredEarnings.reduce((sum, earning) => sum + earning.distance, 0)
  const averageRating = filteredEarnings.reduce((sum, earning) => sum + (earning.customerRating || 0), 0) / (filteredEarnings.length || 1)

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Delivery Earnings & Performance</h1>
        <p className="text-emerald-100">
          Track your earnings, performance metrics, and delivery history
        </p>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
            <div className="flex items-center mt-1">
              {getRatingStars(Math.floor(stats.averageRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">Completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">Consecutive deliveries</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Distance & Time Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Distance</span>
              <span className="font-medium">{stats.totalDistance.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Time</span>
              <span className="font-medium">{Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg per Delivery</span>
              <span className="font-medium">{(stats.totalTime / stats.totalDeliveries).toFixed(0)} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Longest Streak</span>
              <span className="font-medium">{stats.longestStreak} deliveries</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              This Week Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Week Earnings</span>
              <span className="font-medium text-green-600">${totalEarnings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Deliveries</span>
              <span className="font-medium">{filteredEarnings.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg per Delivery</span>
              <span className="font-medium">${averageEarning.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Distance</span>
              <span className="font-medium">{totalDistance.toFixed(1)} km</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search by order ID or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <label htmlFor="status-filter" className="sr-only">Filter deliveries by status</label>
            <select
              id="status-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 px-3 py-2 border border-input bg-transparent rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="PAID">Paid</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
            </select>
            <label htmlFor="date-range" className="sr-only">Select date range</label>
            <select
              id="date-range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-10 px-3 py-2 border border-input bg-transparent rounded-md text-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Statement
          </Button>
        </div>
      </div>

      {/* Earnings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery History</CardTitle>
          <CardDescription>
            Detailed breakdown of your delivery earnings and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEarnings.map((earning) => (
              <div key={earning.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Order #{earning.orderId}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(earning.deliveryDate).toLocaleDateString()} at{' '}
                        {new Date(earning.deliveryDate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">
                      ${earning.totalEarning.toFixed(2)}
                    </p>
                    <Badge className={getStatusColor(earning.status)}>
                      {earning.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Route
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>From:</strong> {earning.pickupAddress}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>To:</strong> {earning.deliveryAddress}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Performance
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      Distance: {earning.distance} km • Duration: {earning.duration} min
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <div className="flex items-center gap-1">
                        {earning.customerRating && getRatingStars(earning.customerRating)}
                        <span className="text-sm ml-1">({earning.customerRating})</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="block text-gray-600">Base Fee</span>
                    <span className="font-medium">${earning.deliveryFee.toFixed(2)}</span>
                  </div>
                  {earning.bonus > 0 && (
                    <div className="bg-blue-50 p-2 rounded">
                      <span className="block text-blue-600">Bonus</span>
                      <span className="font-medium text-blue-700">+${earning.bonus.toFixed(2)}</span>
                    </div>
                  )}
                  {earning.tips > 0 && (
                    <div className="bg-green-50 p-2 rounded">
                      <span className="block text-green-600">Tips</span>
                      <span className="font-medium text-green-700">+${earning.tips.toFixed(2)}</span>
                    </div>
                  )}
                  {earning.weatherBonus && (
                    <div className="bg-orange-50 p-2 rounded">
                      <span className="block text-orange-600">Weather</span>
                      <span className="font-medium text-orange-700">+${earning.weatherBonus.toFixed(2)}</span>
                    </div>
                  )}
                  {earning.peakHourBonus && (
                    <div className="bg-purple-50 p-2 rounded">
                      <span className="block text-purple-600">Peak Hour</span>
                      <span className="font-medium text-purple-700">+${earning.peakHourBonus.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {earning.customerFeedback && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Customer Feedback:</h5>
                    <p className="text-sm text-gray-700 italic">"{earning.customerFeedback}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredEarnings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filter !== 'all' ? 'No deliveries found' : 'No deliveries yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search terms or filters'
                  : 'Start accepting deliveries to see your earnings here'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}