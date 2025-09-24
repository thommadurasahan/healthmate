'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Stethoscope, 
  Calendar, 
  Video, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Star,
  DollarSign,
  User
} from 'lucide-react'

interface Doctor {
  id: string
  specialization: string
  qualifications: string
  experience: number
  consultationFee: number
  user: {
    name: string
  }
  availabilities: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
  }>
}

interface Appointment {
  id: string
  scheduledAt: string
  duration: number
  status: string
  consultationFee: number
  meetingLink?: string
  notes?: string
  doctor: Doctor
  createdAt: string
}

export default function PatientConsultationsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'book' | 'appointments'>('book')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDateTime, setSelectedDateTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [doctorsLoading, setDoctorsLoading] = useState(true)
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)

  useEffect(() => {
    fetchDoctors()
    fetchAppointments()
  }, [])

  const fetchDoctors = async () => {
    setDoctorsLoading(true)
    try {
      const response = await fetch('/api/doctors')
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setDoctorsLoading(false)
    }
  }

  const fetchAppointments = async () => {
    setAppointmentsLoading(true)  
    try {
      const response = await fetch('/api/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setAppointmentsLoading(false)
    }
  }

  const bookAppointment = async () => {
    if (!selectedDoctor || !selectedDateTime) return

    setLoading(true)
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          scheduledAt: new Date(selectedDateTime).toISOString(),
          duration: 30
        })
      })

      if (response.ok) {
        alert('Appointment booked successfully!')
        setSelectedDoctor(null)
        setSelectedDateTime('')
        fetchAppointments()
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredDoctors = doctors.filter(doctor =>
    doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayOfWeek]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Doctor Consultations</h1>
        <p className="text-red-100">
          Book appointments with qualified doctors and get expert medical advice
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('book')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'book'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Book Appointment
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'appointments'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Appointments
        </button>
      </div>

      {activeTab === 'book' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search doctors by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Doctor List */}
          <div className="grid gap-6">
            {doctorsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              filteredDoctors.map((doctor) => (
              <Card 
                key={doctor.id}
                className={`cursor-pointer transition-colors ${
                  selectedDoctor?.id === doctor.id ? 'ring-2 ring-red-500' : ''
                }`}
                onClick={() => setSelectedDoctor(doctor)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Dr. {doctor.user.name}</CardTitle>
                        <CardDescription className="text-base">
                          {doctor.specialization}
                        </CardDescription>
                        <p className="text-sm text-gray-600 mt-1">
                          {doctor.experience} years experience
                        </p>
                        <p className="text-sm text-gray-600">
                          {doctor.qualifications}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        ${doctor.consultationFee}
                      </p>
                      <p className="text-sm text-gray-600">consultation</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div>
                    <h4 className="font-medium mb-2">Available Times</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {doctor.availabilities.map((availability, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-2 rounded text-sm"
                        >
                          <span className="font-medium">
                            {getDayName(availability.dayOfWeek)}
                          </span>
                          <br />
                          <span className="text-gray-600">
                            {availability.startTime} - {availability.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )))}
          </div>

          {/* Booking Form */}
          {selectedDoctor && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
                <CardDescription>
                  with Dr. {selectedDoctor.user.name} - {selectedDoctor.specialization}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preferred Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={selectedDateTime}
                    onChange={(e) => setSelectedDateTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Please choose a time within the doctor's available hours
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Consultation Fee:</span>
                    <span>${selectedDoctor.consultationFee}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Platform Fee (5%):</span>
                    <span>${(selectedDoctor.consultationFee * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-medium border-t pt-2">
                    <span>Total Amount:</span>
                    <span>${(selectedDoctor.consultationFee * 1.05).toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Video Consultation
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    You'll receive a meeting link once the appointment is confirmed by the doctor.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={bookAppointment}
                    disabled={!selectedDateTime || loading}
                    className="flex-1"
                  >
                    {loading ? 'Booking...' : 'Book & Pay Now'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDoctor(null)
                      setSelectedDateTime('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {appointmentsLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-48"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : appointments.length > 0 ? (
            appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Dr. {appointment.doctor.user.name}
                      </CardTitle>
                      <CardDescription>
                        {appointment.doctor.specialization}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Scheduled:</p>
                      <p className="font-medium">
                        {new Date(appointment.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration:</p>
                      <p className="font-medium">{appointment.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fee Paid:</p>
                      <p className="font-medium">${appointment.consultationFee}</p>
                    </div>
                  </div>

                  {appointment.status === 'CONFIRMED' && appointment.meetingLink && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-green-800 font-medium">
                            Ready for consultation
                          </span>
                        </div>
                        <Button size="sm" className="gap-2">
                          <Video className="h-4 w-4" />
                          Join Meeting
                        </Button>
                      </div>
                    </div>
                  )}

                  {appointment.notes && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Doctor's Notes:</h4>
                      <p className="text-sm text-gray-700">{appointment.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No appointments yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Book your first consultation to get started
                </p>
                <Button onClick={() => setActiveTab('book')}>
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}