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
        return 'bg-blue-100 text-blue-800'
      case 'SAMPLE_COLLECTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800'
      case 'COMPLETED':
        return 'bg-orange-100 text-orange-800'
      case 'REPORT_READY':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
          Welcome, {session?.user?.laboratory?.name || session?.user?.name}!
        </h1>
        <p className="text-primary-foreground/80">
          Manage your laboratory tests, process samples, and generate reports for patients.
        </p>
        {session?.user?.laboratory?.isApproved === false && (
          <div className="mt-4 bg-yellow-500/20 border border-yellow-300 text-yellow-900 p-3 rounded-md">
            <AlertTriangle className="h-5 w-5 inline mr-2" />
            Your laboratory is pending admin approval. You'll be able to receive bookings once approved.
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/laboratory/tests">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-blue-500 hover:bg-blue-600">
                  <TestTube className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Manage Tests</CardTitle>
                <CardDescription className="text-sm">
                  Add, edit, or remove lab tests from your catalog
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/laboratory/bookings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-green-500 hover:bg-green-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">View Bookings</CardTitle>
                <CardDescription className="text-sm">
                  Process patient bookings and manage schedules
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/laboratory/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-purple-500 hover:bg-purple-600">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Upload Reports</CardTitle>
                <CardDescription className="text-sm">
                  Upload and manage patient lab reports
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
            <CardTitle className="text-sm font-medium">Today's Tests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayBookings.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${bookings.reduce((sum, booking) => sum + booking.totalAmount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'REPORT_READY').length}
            </div>
            <p className="text-xs text-muted-foreground">Reports completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest test bookings from patients</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/laboratory/bookings">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.map((booking) => {
              const StatusIcon = getStatusIcon(booking.status)
              return (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <StatusIcon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.labTest.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.patient.user.name} • {booking.patient.user.phone}
                      </p>
                      <p className="text-xs text-gray-400">
                        Scheduled: {new Date(booking.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">${booking.totalAmount}</p>
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
            <div className="text-center py-8 text-gray-500">
              <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bookings yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}