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
  description: string
  price: number
  duration: string
  requirements?: string
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
  laboratory: Laboratory
  labTest: LabTest
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

  useEffect(() => {
    fetchLaboratories()
    fetchLabBookings()
  }, [])

  const fetchLaboratories = async () => {
    try {
      // Mock data - replace with actual API call
      setLaboratories([
        {
          id: 'lab1',
          name: 'DiagnosticCenter Plus',
          address: '123 Health St, Medical District',
          phone: '+1-555-0123',
          rating: 4.8,
          labTests: [
            {
              id: 'test1',
              name: 'Complete Blood Count (CBC)',
              description: 'Comprehensive blood analysis',
              price: 25.00,
              duration: '4-6 hours',
              requirements: 'No fasting required'
            },
            {
              id: 'test2',
              name: 'Lipid Profile',
              description: 'Cholesterol and triglyceride levels',
              price: 35.00,
              duration: '6-8 hours',
              requirements: '12-hour fasting required'
            }
          ]
        },
        {
          id: 'lab2',
          name: 'QuickLab Services',
          address: '456 Diagnostic Ave, Health Plaza',
          phone: '+1-555-0124',
          rating: 4.6,
          labTests: [
            {
              id: 'test3',
              name: 'Thyroid Function Test',
              description: 'TSH, T3, and T4 levels',
              price: 45.00,
              duration: '24 hours',
              requirements: 'Morning sample preferred'
            }
          ]
        }
      ])
    } catch (error) {
      console.error('Error fetching laboratories:', error)
    }
  }

  const fetchLabBookings = async () => {
    try {
      // Mock data - replace with actual API call
      setLabBookings([
        {
          id: 'booking1',
          status: 'REPORT_READY',
          scheduledDate: '2024-01-15',
          laboratory: laboratories[0] || {} as Laboratory,
          labTest: {
            id: 'test1',
            name: 'Complete Blood Count (CBC)',
            description: 'Comprehensive blood analysis',
            price: 25.00,
            duration: '4-6 hours'
          },
          totalAmount: 26.25,
          reportFilePath: '/reports/booking1.pdf',
          createdAt: '2024-01-14'
        }
      ])
    } catch (error) {
      console.error('Error fetching lab bookings:', error)
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
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Book Test
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'bookings'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Bookings
        </button>
      </div>

      {activeTab === 'book' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search laboratories or tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Laboratory List */}
          <div className="grid gap-6">
            {filteredLabs.map((lab) => (
              <Card key={lab.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {lab.name}
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">{lab.rating}</span>
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
                              <h5 className="font-medium">{test.name}</h5>
                              <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
            ))}
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
          {labBookings.length > 0 ? (
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
                      <p className="text-gray-600">Scheduled Date:</p>
                      <p className="font-medium">
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount Paid:</p>
                      <p className="font-medium">${booking.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Booking ID:</p>
                      <p className="font-medium">#{booking.id.slice(-8)}</p>
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
                <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No lab bookings yet
                </h3>
                <p className="text-gray-600 mb-4">
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