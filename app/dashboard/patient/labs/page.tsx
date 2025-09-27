'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  TestTube, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Download,
  Star,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

interface LabTest {
  id: string
  name: string
  description?: string
  price: number
  duration: string
  requirements?: string
  isActive: boolean
}

interface Laboratory {
  id: string
  name: string
  address: string
  phone: string
  rating: number
  labTests: LabTest[]
}

interface LabBooking {
  id: string
  status: string
  scheduledDate: string
  laboratory: {
    name: string
    address: string
    phone: string
  }
  labTest: {
    name: string
    description?: string
    duration: string
    requirements?: string
  }
  totalAmount: number
  reportFilePath?: string
  createdAt: string
}

export default function PatientLabsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'book' | 'bookings'>('book')
  const [laboratories, setLaboratories] = useState<Laboratory[]>([])
  const [labBookings, setLabBookings] = useState<LabBooking[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null)
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null)
  const [scheduledDate, setScheduledDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [laboratoriesLoading, setLaboratoriesLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(true)

  useEffect(() => {
    fetchLaboratories()
    fetchLabBookings()
  }, [])

  const fetchLaboratories = async () => {
    setLaboratoriesLoading(true)
    try {
      const response = await fetch('/api/laboratories')
      if (response.ok) {
        const data = await response.json()
        setLaboratories(data)
      } else {
        console.error('Failed to fetch laboratories')
      }
    } catch (error) {
      console.error('Error fetching laboratories:', error)
    } finally {
      setLaboratoriesLoading(false)
    }
  }

  const fetchLabBookings = async () => {
    setBookingsLoading(true)
    try {
      const response = await fetch('/api/lab-bookings')
      if (response.ok) {
        const data = await response.json()
        setLabBookings(data)
      } else {
        console.error('Failed to fetch lab bookings')
      }
    } catch (error) {
      console.error('Error fetching lab bookings:', error)
    } finally {
      setBookingsLoading(false)
    }
  }

  const bookLabTest = async () => {
    if (!selectedLab || !selectedTest || !scheduledDate) return

    setLoading(true)
    try {
      const response = await fetch('/api/lab-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          laboratoryId: selectedLab.id,
          labTestId: selectedTest.id,
          scheduledDate: new Date(scheduledDate).toISOString()
        })
      })

      if (response.ok) {
        alert('Lab test booked successfully!')
        setSelectedLab(null)
        setSelectedTest(null)
        setScheduledDate('')
        fetchLabBookings()
      }
    } catch (error) {
      console.error('Error booking lab test:', error)
    } finally {
      setLoading(false)
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
      case 'REPORT_READY':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredLabs = laboratories.filter(lab =>
    lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.labTests.some(test => test.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Laboratory Tests</h1>
        <p className="text-purple-100">
          Book lab tests and view your reports in one place
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('book')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'book'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Book Test
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'bookings'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          My Bookings
        </button>
      </div>

      {activeTab === 'book' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search laboratories or tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Laboratory List */}
          <div className="grid gap-6">
            {laboratoriesLoading ? (
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="animate-pulse overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-5 bg-gray-200 rounded w-48"></div>
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-64"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="space-y-3">
                          {[...Array(2)].map((_, j) => (
                            <div key={j} className="p-4 border rounded-lg space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              filteredLabs.map((lab) => (
              <Card key={lab.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {lab.name}
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">{lab.rating}</span>
                        </div>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {lab.address}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-medium">Available Tests</h4>
                    <div className="grid gap-3">
                      {lab.labTests.map((test) => (
                        <div
                          key={test.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedTest?.id === test.id && selectedLab?.id === lab.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setSelectedLab(lab)
                            setSelectedTest(test)
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium text-foreground">{test.name}</h5>
                              <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {test.duration}
                                </span>
                                {test.requirements && (
                                  <span className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {test.requirements}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold">${test.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )))}
          </div>

          {/* Booking Form */}
          {selectedTest && selectedLab && (
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle>Book Lab Test</CardTitle>
                <CardDescription>
                  Selected: {selectedTest.name} at {selectedLab.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preferred Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Test Price:</span>
                    <span>${selectedTest.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Commission (5%):</span>
                    <span>${(selectedTest.price * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-medium border-t pt-2">
                    <span>Total Amount:</span>
                    <span>${(selectedTest.price * 1.05).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={bookLabTest}
                    disabled={!scheduledDate || loading}
                    className="flex-1"
                  >
                    {loading ? 'Booking...' : 'Book & Pay Now'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedLab(null)
                      setSelectedTest(null)
                      setScheduledDate('')
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

      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookingsLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-56"></div>
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : labBookings.length > 0 ? (
            labBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{booking.labTest.name}</CardTitle>
                      <CardDescription>{booking.laboratory.name}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Scheduled Date:</p>
                      <p className="font-medium text-foreground">
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount Paid:</p>
                      <p className="font-medium text-foreground">${booking.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Booking ID:</p>
                      <p className="font-medium text-foreground">#{booking.id.slice(-8)}</p>
                    </div>
                  </div>

                  {booking.status === 'REPORT_READY' && booking.reportFilePath && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-green-800 font-medium">
                            Report Ready
                          </span>
                        </div>
                        <Button size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download Report
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No lab bookings yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Book your first lab test to get started
                </p>
                <Button onClick={() => setActiveTab('book')}>
                  Book Lab Test
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}