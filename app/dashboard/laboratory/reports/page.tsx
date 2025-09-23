'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Search,
  Filter,
  Calendar,
  User,
  TestTube,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send
} from 'lucide-react'

interface LabReport {
  id: string
  bookingId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  testName: string
  testCategory: string
  reportDate: string
  completedDate: string
  status: 'PENDING' | 'COMPLETED' | 'DELIVERED' | 'REVIEWED'
  reportUrl?: string
  findings: string
  recommendations: string
  normalValues: string
  testValues: string
  interpretation: 'NORMAL' | 'ABNORMAL' | 'BORDERLINE'
  criticalValues: boolean
  technician: string
  pathologist: string
  reportTemplate: string
}

export default function LabReportsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<LabReport[]>([])
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [interpretationFilter, setInterpretationFilter] = useState('all')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadingReport, setUploadingReport] = useState<string | null>(null)

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setReports([
      {
        id: 'RPT001',
        bookingId: 'BK001',
        patientName: 'John Doe',
        patientEmail: 'john.doe@email.com',
        patientPhone: '+1234567890',
        testName: 'Complete Blood Count (CBC)',
        testCategory: 'Blood Tests',
        reportDate: '2024-01-20',
        completedDate: '2024-01-20T14:30:00Z',
        status: 'COMPLETED',
        findings: 'All parameters within normal limits. Hemoglobin levels are optimal.',
        recommendations: 'Continue with regular health monitoring. No immediate action required.',
        normalValues: 'RBC: 4.5-5.5, WBC: 4.0-11.0, Platelets: 150-450',
        testValues: 'RBC: 4.8, WBC: 7.2, Platelets: 280',
        interpretation: 'NORMAL',
        criticalValues: false,
        technician: 'Tech. Sarah Wilson',
        pathologist: 'Dr. Michael Chen',
        reportTemplate: 'Standard CBC Template'
      },
      {
        id: 'RPT002',
        bookingId: 'BK002',
        patientName: 'Jane Smith',
        patientEmail: 'jane.smith@email.com',
        patientPhone: '+1234567891',
        testName: 'Lipid Profile',
        testCategory: 'Blood Tests',
        reportDate: '2024-01-19',
        completedDate: '2024-01-19T16:45:00Z',
        status: 'DELIVERED',
        findings: 'Elevated cholesterol levels detected. LDL cholesterol above recommended range.',
        recommendations: 'Dietary modification recommended. Consider statin therapy consultation.',
        normalValues: 'Total Cholesterol: <200, LDL: <100, HDL: >40',
        testValues: 'Total Cholesterol: 245, LDL: 145, HDL: 35',
        interpretation: 'ABNORMAL',
        criticalValues: false,
        technician: 'Tech. Emily Davis',
        pathologist: 'Dr. Robert Johnson',
        reportTemplate: 'Lipid Profile Template'
      },
      {
        id: 'RPT003',
        bookingId: 'BK003',
        patientName: 'Mike Johnson',
        patientEmail: 'mike.johnson@email.com',
        patientPhone: '+1234567892',
        testName: 'Thyroid Function Test',
        testCategory: 'Blood Tests',
        reportDate: '2024-01-18',
        completedDate: '2024-01-18T11:20:00Z',
        status: 'PENDING',
        findings: 'TSH levels slightly elevated. T3 and T4 within normal range.',
        recommendations: 'Repeat test in 6 weeks. Monitor symptoms. Endocrinology consultation if levels persist.',
        normalValues: 'TSH: 0.4-4.0, T3: 2.3-4.2, T4: 5.1-14.1',
        testValues: 'TSH: 4.8, T3: 3.1, T4: 8.5',
        interpretation: 'BORDERLINE',
        criticalValues: false,
        technician: 'Tech. Lisa Brown',
        pathologist: 'Dr. Amanda White',
        reportTemplate: 'Thyroid Function Template'
      },
      {
        id: 'RPT004',
        bookingId: 'BK004',
        patientName: 'Sarah Wilson',
        patientEmail: 'sarah.wilson@email.com',
        patientPhone: '+1234567893',
        testName: 'Cardiac Enzymes',
        testCategory: 'Cardiology',
        reportDate: '2024-01-17',
        completedDate: '2024-01-17T09:15:00Z',
        status: 'REVIEWED',
        findings: 'Significantly elevated Troponin I levels indicating myocardial injury.',
        recommendations: 'URGENT: Immediate cardiology consultation required. Patient should seek emergency care.',
        normalValues: 'Troponin I: <0.04, CK-MB: <6.3',
        testValues: 'Troponin I: 2.5, CK-MB: 15.2',
        interpretation: 'ABNORMAL',
        criticalValues: true,
        technician: 'Tech. David Lee',
        pathologist: 'Dr. Jennifer Martinez',
        reportTemplate: 'Cardiac Enzymes Template'
      }
    ])
    setLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REVIEWED':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getInterpretationColor = (interpretation: string) => {
    switch (interpretation) {
      case 'NORMAL':
        return 'bg-green-100 text-green-800'
      case 'ABNORMAL':
        return 'bg-red-100 text-red-800'
      case 'BORDERLINE':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'DELIVERED':
        return <Send className="h-4 w-4" />
      case 'REVIEWED':
        return <Eye className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.testName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesInterpretation = interpretationFilter === 'all' || report.interpretation === interpretationFilter
    
    return matchesSearch && matchesStatus && matchesInterpretation
  })

  const handleDeliverReport = (reportId: string) => {
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, status: 'DELIVERED' as const } : report
    ))
  }

  const handleMarkReviewed = (reportId: string) => {
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, status: 'REVIEWED' as const } : report
    ))
  }

  const pendingReports = reports.filter(r => r.status === 'PENDING').length
  const criticalReports = reports.filter(r => r.criticalValues).length
  const completedToday = reports.filter(r => 
    r.status === 'COMPLETED' && 
    new Date(r.completedDate).toDateString() === new Date().toDateString()
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
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Report Management</h1>
        <p className="text-indigo-100">
          Generate, manage, and deliver lab reports to patients
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingReports}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Values</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalReports}</div>
            <p className="text-xs text-muted-foreground">Require urgent attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedToday}</div>
            <p className="text-xs text-muted-foreground">Reports finished today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
            <p className="text-xs text-muted-foreground">All time reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Reports Alert */}
      {criticalReports > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Reports Alert
            </CardTitle>
            <CardDescription className="text-red-700">
              The following reports contain critical values requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reports.filter(r => r.criticalValues).map(report => (
                <div key={report.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-900">{report.patientName} - {report.testName}</p>
                    <p className="text-sm text-red-700">
                      Report ID: {report.id} • {report.recommendations}
                    </p>
                  </div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    <Send className="h-4 w-4 mr-2" />
                    Notify Immediately
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search reports, patients, tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <label htmlFor="status-filter" className="sr-only">Filter reports by status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 py-2 border border-input bg-transparent rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="DELIVERED">Delivered</option>
              <option value="REVIEWED">Reviewed</option>
            </select>
            <label htmlFor="interpretation-filter" className="sr-only">Filter reports by interpretation</label>
            <select
              id="interpretation-filter"
              value={interpretationFilter}
              onChange={(e) => setInterpretationFilter(e.target.value)}
              className="h-10 px-3 py-2 border border-input bg-transparent rounded-md text-sm"
            >
              <option value="all">All Results</option>
              <option value="NORMAL">Normal</option>
              <option value="ABNORMAL">Abnormal</option>
              <option value="BORDERLINE">Borderline</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Report
          </Button>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{report.testName}</h3>
                    <p className="text-sm text-gray-600">Report ID: {report.id}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {report.patientName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(report.reportDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <TestTube className="h-4 w-4" />
                        {report.testCategory}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  {report.criticalValues && (
                    <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Critical
                    </Badge>
                  )}
                  <Badge className={getInterpretationColor(report.interpretation)}>
                    {report.interpretation}
                  </Badge>
                  <Badge className={`${getStatusColor(report.status)} flex items-center gap-1`}>
                    {getStatusIcon(report.status)}
                    {report.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Test Values</h4>
                  <p className="text-sm bg-gray-50 p-2 rounded">{report.testValues}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Normal Range</h4>
                  <p className="text-sm bg-gray-50 p-2 rounded">{report.normalValues}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-sm">Findings</h4>
                <p className="text-sm text-gray-700">{report.findings}</p>
              </div>

              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-sm">Recommendations</h4>
                <p className="text-sm text-gray-700">{report.recommendations}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-gray-500">
                  <p>Technician: {report.technician}</p>
                  <p>Pathologist: {report.pathologist}</p>
                  <p>Completed: {new Date(report.completedDate).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReport(report)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {report.status === 'COMPLETED' && (
                    <Button
                      size="sm"
                      onClick={() => handleDeliverReport(report.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Deliver Report
                    </Button>
                  )}
                  {report.status === 'DELIVERED' && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkReviewed(report.id)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Reviewed
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || interpretationFilter !== 'all' ? 'No reports found' : 'No reports yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || interpretationFilter !== 'all'
                ? 'Try adjusting your search terms or filters'
                : 'Reports will appear here when lab tests are completed'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Detailed Report - {selectedReport.id}</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Patient Information</h3>
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {selectedReport.patientName}</p>
                      <p><strong>Email:</strong> {selectedReport.patientEmail}</p>
                      <p><strong>Phone:</strong> {selectedReport.patientPhone}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Test Information</h3>
                    <div className="space-y-2">
                      <p><strong>Test:</strong> {selectedReport.testName}</p>
                      <p><strong>Category:</strong> {selectedReport.testCategory}</p>
                      <p><strong>Report Date:</strong> {new Date(selectedReport.reportDate).toLocaleDateString()}</p>
                      <p><strong>Status:</strong> 
                        <Badge className={`ml-2 ${getStatusColor(selectedReport.status)}`}>
                          {selectedReport.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Laboratory Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Test Values</h4>
                      <p className="text-sm bg-white p-3 rounded border">{selectedReport.testValues}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Normal Range</h4>
                      <p className="text-sm bg-white p-3 rounded border">{selectedReport.normalValues}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Interpretation</h4>
                    <Badge className={`${getInterpretationColor(selectedReport.interpretation)} text-base px-3 py-1`}>
                      {selectedReport.interpretation}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Clinical Findings</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded border">{selectedReport.findings}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded border">{selectedReport.recommendations}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Report Authorization</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <p><strong>Technician:</strong> {selectedReport.technician}</p>
                    <p><strong>Pathologist:</strong> {selectedReport.pathologist}</p>
                    <p><strong>Template Used:</strong> {selectedReport.reportTemplate}</p>
                    <p><strong>Completed:</strong> {new Date(selectedReport.completedDate).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}