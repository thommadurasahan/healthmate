'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  Stethoscope, 
  Calendar, 
  Video, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users
} from 'lucide-react'

interface Appointment {
  id: string
  scheduledAt: string
  duration: number
  status: string
  consultationFee: number
  meetingLink?: string
  notes?: string
  patient: {
    user: {
      name: string
      email: string
      phone: string
    }
  }
}

export default function DoctorDashboard() {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchAppointments()
      }
    } catch (error) {
      console.error('Failed to update appointment status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'NO_SHOW':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return Calendar
      case 'CONFIRMED':
        return CheckCircle
      case 'IN_PROGRESS':
        return Video
      case 'COMPLETED':
        return CheckCircle
      default:
        return Clock
    }
  }

  const todayAppointments = appointments.filter(
    appointment => new Date(appointment.scheduledAt).toDateString() === new Date().toDateString()
  )

  const upcomingAppointments = appointments
    .filter(appointment => new Date(appointment.scheduledAt) > new Date())
    .slice(0, 10)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-2">
            Welcome, Dr. {session?.user?.name}!
          </h1>
          <p className="text-red-100">
            Manage your appointments, conduct video consultations, and provide quality healthcare services.
          </p>
          <div className="mt-2 text-sm text-red-100">
            Specialization: {session?.user?.doctor?.specialization}
          </div>
          {session?.user?.doctor?.isApproved === false && (
            <div className="mt-4 bg-yellow-500/20 border border-yellow-300 text-yellow-900 dark:text-yellow-200 p-3 rounded-md">
              <AlertTriangle className="h-5 w-5 inline mr-2" />
              Your profile is pending admin approval. You'll be able to receive appointments once approved.
            </div>
          )}
        </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/doctor/availability">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-blue-500 hover:bg-blue-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Set Availability</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Manage your schedule and available time slots
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/doctor/appointments">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-green-500 hover:bg-green-600">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">View Appointments</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                  See all your scheduled appointments
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/doctor/consultations">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full text-white mb-2 bg-purple-500 hover:bg-purple-600">
                  <Video className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Video Consultations</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Conduct online video consultations
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
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{todayAppointments.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{appointments.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">All time consultations</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${appointments.reduce((sum, appointment) => sum + appointment.consultationFee, 0).toFixed(2)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Consultation Fee</CardTitle>
            <Stethoscope className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${session?.user?.doctor?.consultationFee}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Per consultation</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Today's Appointments</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Your scheduled consultations for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAppointments.map((appointment) => {
              const StatusIcon = getStatusIcon(appointment.status)
              return (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <StatusIcon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.patient.user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.patient.user.phone} • {appointment.patient.user.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(appointment.scheduledAt).toLocaleTimeString()} • {appointment.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">${appointment.consultationFee}</p>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-x-2">
                      {appointment.status === 'SCHEDULED' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                        >
                          Confirm
                        </Button>
                      )}
                      {appointment.status === 'CONFIRMED' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'IN_PROGRESS')}
                        >
                          Start Consultation
                        </Button>
                      )}
                      {appointment.status === 'IN_PROGRESS' && (
                        <div className="space-x-1">
                          {appointment.meetingLink && (
                            <Button 
                              size="sm"
                              onClick={() => window.open(appointment.meetingLink, '_blank')}
                            >
                              Join Video Call
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, 'COMPLETED')}
                          >
                            Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {todayAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No appointments scheduled for today</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-gray-900 dark:text-white">Upcoming Appointments</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Your scheduled consultations</CardDescription>
          </div>
          <Link href="/dashboard/doctor/appointments">
            <Button className="bg-red-600 hover:bg-red-700 text-white">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => {
              const StatusIcon = getStatusIcon(appointment.status)
              return (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <StatusIcon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.patient.user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.patient.user.phone}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(appointment.scheduledAt).toLocaleDateString()} at {new Date(appointment.scheduledAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">${appointment.consultationFee}</p>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {upcomingAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming appointments</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}