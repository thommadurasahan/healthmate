'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  AlertTriangle,
  Search,
  Filter,
  Download,
  User,
  Calendar,
  Pill
} from 'lucide-react'

interface Prescription {
  id: string
  patientName: string
  patientPhone: string
  doctorName: string
  doctorSpecialization: string
  prescriptionDate: string
  medicines: {
    name: string
    dosage: string
    quantity: number
    instructions: string
    available: boolean
  }[]
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'PROCESSING'
  uploadedAt: string
  verifiedAt?: string
  verifiedBy?: string
  notes?: string
  urgency: 'LOW' | 'MEDIUM' | 'HIGH'
  totalAmount?: number
}

export default function PrescriptionVerificationPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setPrescriptions([
      {
        id: 'RX001',
        patientName: 'John Doe',
        patientPhone: '+1234567890',
        doctorName: 'Dr. Sarah Wilson',
        doctorSpecialization: 'General Medicine',
        prescriptionDate: '2024-01-20',
        medicines: [
          {
            name: 'Paracetamol 500mg',
            dosage: '1 tablet',
            quantity: 20,
            instructions: '3 times daily after meals',
            available: true
          },
          {
            name: 'Amoxicillin 250mg',
            dosage: '1 capsule',
            quantity: 14,
            instructions: '2 times daily before meals',
            available: true
          }
        ],
        status: 'PENDING',
        uploadedAt: '2024-01-20T10:30:00Z',
        urgency: 'MEDIUM'
      },
      {
        id: 'RX002',
        patientName: 'Jane Smith',
        patientPhone: '+1234567891',
        doctorName: 'Dr. Michael Chen',
        doctorSpecialization: 'Cardiology',
        prescriptionDate: '2024-01-19',
        medicines: [
          {
            name: 'Aspirin 75mg',
            dosage: '1 tablet',
            quantity: 30,
            instructions: 'Once daily with breakfast',
            available: true
          },
          {
            name: 'Atorvastatin 20mg',
            dosage: '1 tablet',
            quantity: 30,
            instructions: 'Once daily at bedtime',
            available: false
          }
        ],
        status: 'VERIFIED',
        uploadedAt: '2024-01-19T14:15:00Z',
        verifiedAt: '2024-01-19T15:30:00Z',
        verifiedBy: 'Pharmacist John',
        urgency: 'HIGH',
        totalAmount: 45.50
      },
      {
        id: 'RX003',
        patientName: 'Mike Johnson',
        patientPhone: '+1234567892',
        doctorName: 'Dr. Emily Davis',
        doctorSpecialization: 'Pediatrics',
        prescriptionDate: '2024-01-18',
        medicines: [
          {
            name: 'Children\'s Paracetamol Syrup',
            dosage: '5ml',
            quantity: 1,
            instructions: '3 times daily when needed for fever',
            available: true
          }
        ],
        status: 'PROCESSING',
        uploadedAt: '2024-01-18T09:00:00Z',
        verifiedAt: '2024-01-18T09:30:00Z',
        verifiedBy: 'Pharmacist Sarah',
        urgency: 'HIGH',
        totalAmount: 12.99
      }
    ])
    setLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'VERIFIED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'VERIFIED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      case 'PROCESSING':
        return <Pill className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    return matchesSearch && prescription.status === filter
  })

  const handleVerifyPrescription = (id: string, action: 'VERIFIED' | 'REJECTED', notes?: string) => {
    setPrescriptions(prev => prev.map(prescription => 
      prescription.id === id 
        ? { 
            ...prescription, 
            status: action,
            verifiedAt: new Date().toISOString(),
            verifiedBy: session?.user?.name || 'Current Pharmacist',
            notes,
            totalAmount: action === 'VERIFIED' ? calculateTotal(prescription) : undefined
          }
        : prescription
    ))
    setSelectedPrescription(null)
  }

  const calculateTotal = (prescription: Prescription) => {
    // Mock calculation - in real app, use actual medicine prices
    return prescription.medicines.reduce((total, medicine) => {
      const basePrice = 5 // Mock base price
      return total + (medicine.quantity * basePrice)
    }, 0)
  }

  const pendingCount = prescriptions.filter(p => p.status === 'PENDING').length
  const verifiedToday = prescriptions.filter(p => 
    p.status === 'VERIFIED' && 
    new Date(p.verifiedAt || '').toDateString() === new Date().toDateString()
  ).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Prescription Verification</h1>
        <p className="text-green-100">
          Review and verify prescriptions before processing orders
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedToday}</div>
            <p className="text-xs text-muted-foreground">Completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {prescriptions.filter(p => p.urgency === 'HIGH' && p.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent prescriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${prescriptions.filter(p => p.status === 'VERIFIED' && p.totalAmount).reduce((sum, p) => sum + (p.totalAmount || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From verified prescriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search prescriptions, patients, doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <label htmlFor="prescription-filter" className="sr-only">Filter prescriptions by status</label>
            <select
              id="prescription-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 px-3 py-2 border border-input bg-transparent rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
              <option value="PROCESSING">Processing</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPrescriptions.map((prescription) => (
          <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {prescription.id}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Uploaded {new Date(prescription.uploadedAt).toLocaleDateString()} at{' '}
                    {new Date(prescription.uploadedAt).toLocaleTimeString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getUrgencyColor(prescription.urgency)}>
                    {prescription.urgency}
                  </Badge>
                  <Badge className={`${getStatusColor(prescription.status)} flex items-center gap-1`}>
                    {getStatusIcon(prescription.status)}
                    {prescription.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Patient & Doctor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Patient
                  </h4>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{prescription.patientName}</p>
                    <p className="text-gray-600">{prescription.patientPhone}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Doctor
                  </h4>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{prescription.doctorName}</p>
                    <p className="text-gray-600">{prescription.doctorSpecialization}</p>
                  </div>
                </div>
              </div>

              {/* Prescription Date */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Prescribed on {new Date(prescription.prescriptionDate).toLocaleDateString()}
              </div>

              {/* Medicines */}
              <div className="space-y-2">
                <h4 className="font-medium">Medicines ({prescription.medicines.length})</h4>
                <div className="space-y-2">
                  {prescription.medicines.slice(0, 2).map((medicine, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{medicine.name}</p>
                        <p className="text-xs text-gray-600">
                          {medicine.dosage} • Qty: {medicine.quantity} • {medicine.instructions}
                        </p>
                      </div>
                      <Badge variant={medicine.available ? "default" : "destructive"} className="text-xs">
                        {medicine.available ? 'Available' : 'Out of Stock'}
                      </Badge>
                    </div>
                  ))}
                  {prescription.medicines.length > 2 && (
                    <p className="text-sm text-gray-500">
                      +{prescription.medicines.length - 2} more medicines
                    </p>
                  )}
                </div>
              </div>

              {/* Verification Info */}
              {prescription.status !== 'PENDING' && (
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p><strong>Verified by:</strong> {prescription.verifiedBy}</p>
                  <p><strong>Verified at:</strong> {new Date(prescription.verifiedAt!).toLocaleString()}</p>
                  {prescription.totalAmount && (
                    <p><strong>Total Amount:</strong> ${prescription.totalAmount.toFixed(2)}</p>
                  )}
                  {prescription.notes && (
                    <p><strong>Notes:</strong> {prescription.notes}</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPrescription(prescription)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                {prescription.status === 'PENDING' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleVerifyPrescription(prescription.id, 'VERIFIED')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleVerifyPrescription(prescription.id, 'REJECTED', 'Requires clarification')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrescriptions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filter !== 'all' ? 'No prescriptions found' : 'No prescriptions yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search terms or filters'
                : 'Prescriptions will appear here when patients upload them'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Prescription Detail Modal would go here */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Prescription Details - {selectedPrescription.id}</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPrescription(null)}
                >
                  Close
                </Button>
              </div>
              {/* Detailed prescription view would go here */}
              <div className="space-y-4">
                <p>Full prescription details would be displayed here with expanded medicine information, dosage instructions, and any uploaded prescription images.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}