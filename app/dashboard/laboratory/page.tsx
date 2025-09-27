'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  TestTube, 
  Calendar, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload
} from 'lucide-react'

interface LabBooking {
  id: string
  status: string
  scheduledDate: string
  sampleCollectedAt?: string
  reportGeneratedAt?: string
  totalAmount: number
  patient: {
    user: {
      name: string
      email: string
      phone: string
    }
  }
  labTest: {
    name: string
    duration: string
    requirements?: string
  }
}

export default function LaboratoryDashboard() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<LabBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/lab-bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/lab-bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error('Failed to update booking status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BOOKED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'SAMPLE_COLLECTED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'COMPLETED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'REPORT_READY':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'BOOKED':
        return Calendar
      case 'SAMPLE_COLLECTED':
      case 'IN_PROGRESS':
        return Clock
      case 'COMPLETED':
      case 'REPORT_READY':
        return CheckCircle
      default:
        return TestTube
    }
  }

  const todayBookings = bookings.filter(
    booking => new Date(booking.scheduledDate).toDateString() === new Date().toDateString()
  )

  const recentBookings = bookings.slice(0, 10)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 dark:border-teal-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {session?.user?.laboratory?.name || session?.user?.name}!
        </h1>
        <p className="text-white/90">
          Manage your laboratory tests, process samples, and generate reports for patients.
        </p>
        {session?.user?.laboratory?.isApproved === false && (
          <div className="mt-4 bg-yellow-500/20 border border-yellow-300 text-yellow-100 p-3 rounded-md">
            <AlertTriangle className="h-5 w-5 inline mr-2" />
            Your laboratory is pending admin approval. You'll be able to receive bookings once approved.
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/laboratory/tests">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700">
                  <TestTube className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Manage Tests</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Add, edit, or remove lab tests from your catalog
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/laboratory/bookings">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700">
                  <Calendar className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">View Bookings</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Process patient bookings and manage schedules
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/laboratory/reports">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Upload Reports</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Upload and manage patient lab reports
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
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Today's Tests</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{todayBookings.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Total Bookings</CardTitle>
            <TestTube className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{bookings.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">All time bookings</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${bookings.reduce((sum, booking) => sum + booking.totalAmount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {bookings.filter(b => b.status === 'REPORT_READY').length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Reports completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-gray-900 dark:text-white">Recent Bookings</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Latest test bookings from patients</CardDescription>
          </div>
          <Link href="/dashboard/laboratory/bookings">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-800">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.map((booking) => {
              const StatusIcon = getStatusIcon(booking.status)
              return (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <StatusIcon className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.labTest.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.patient.user.name} • {booking.patient.user.phone}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Scheduled: {new Date(booking.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">${booking.totalAmount}</p>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-x-2">
                      {booking.status === 'BOOKED' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'SAMPLE_COLLECTED')}
                        >
                          Collect Sample
                        </Button>
                      )}
                      {booking.status === 'SAMPLE_COLLECTED' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'IN_PROGRESS')}
                        >
                          Start Test
                        </Button>
                      )}
                      {booking.status === 'IN_PROGRESS' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                        >
                          Complete Test
                        </Button>
                      )}
                      {booking.status === 'COMPLETED' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'REPORT_READY')}
                        >
                          Upload Report
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {recentBookings.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bookings yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}