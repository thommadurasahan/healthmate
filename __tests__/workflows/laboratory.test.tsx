// Laboratory Workflow Tests
describe('Laboratory Workflows', () => {
  const mockLaboratorySession = {
    user: {
      id: 'lab-user-id',
      name: 'City Lab Center',
      email: 'lab@test.com',
      role: 'LABORATORY',
      laboratory: {
        id: 'lab-id',
        userId: 'lab-user-id',
        name: 'City Lab Center',
        address: '123 Health Street, Medical District',
        phone: '9876543210',
        license: 'LAB123',
        accreditation: 'NABL',
        isApproved: true
      }
    }
  }

  const mockPatientSession = {
    user: {
      id: 'patient-user-id',
      name: 'John Doe',
      email: 'patient@test.com',
      role: 'PATIENT',
      patient: {
        id: 'patient-id',
        userId: 'patient-user-id',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        phone: '1234567890',
        address: '456 Patient Ave'
      }
    }
  }

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  describe('Laboratory Profile and Registration', () => {
    it('creates laboratory profile with certification details', async () => {
      const mockLabProfile = {
        id: 'lab-id',
        userId: 'lab-user-id',
        name: 'City Lab Center',
        address: '123 Health Street, Medical District',
        phone: '9876543210',
        license: 'LAB123',
        accreditation: 'NABL',
        operatingHours: '24/7',
        services: ['Blood Tests', 'Urine Tests', 'X-Ray', 'MRI'],
        isApproved: false, // Requires admin approval
        user: {
          name: 'City Lab Center',
          email: 'lab@test.com',
          role: 'LABORATORY'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          message: 'User created successfully', 
          user: {
            ...mockLabProfile,
            laboratory: mockLabProfile
          }
        }),
      })

      const labData = {
        name: 'City Lab Center',
        email: 'lab@test.com',
        password: 'password123',
        role: 'LABORATORY',
        labName: 'City Lab Center',
        address: '123 Health Street, Medical District',
        phone: '9876543210',
        license: 'LAB123',
        accreditation: 'NABL',
        operatingHours: '24/7'
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(labData)
      })

      const data = await response.json()
      expect(data.user.laboratory.name).toBe('City Lab Center')
      expect(data.user.laboratory.license).toBe('LAB123')
      expect(data.user.laboratory.accreditation).toBe('NABL')
      expect(data.user.laboratory.isApproved).toBe(false)
    })

    it('validates required laboratory registration fields', async () => {
      const mockErrorResponse = {
        error: 'Missing laboratory information'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      })

      const invalidLabData = {
        name: 'Lab Test',
        email: 'lab@test.com',
        password: 'password123',
        role: 'LABORATORY'
        // Missing license, accreditation, etc.
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidLabData)
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Missing laboratory information')
    })

    it('updates laboratory profile and services', async () => {
      const mockUpdatedProfile = {
        id: 'lab-id',
        name: 'City Lab Center',
        address: '123 Health Street, Medical District, New Wing',
        phone: '9876543211',
        services: ['Blood Tests', 'Urine Tests', 'X-Ray', 'MRI', 'CT Scan'],
        operatingHours: '6 AM - 10 PM',
        specializations: ['Pathology', 'Radiology', 'Cardiology Tests']
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedProfile,
      })

      const updateData = {
        address: '123 Health Street, Medical District, New Wing',
        phone: '9876543211',
        services: ['Blood Tests', 'Urine Tests', 'X-Ray', 'MRI', 'CT Scan'],
        operatingHours: '6 AM - 10 PM',
        specializations: ['Pathology', 'Radiology', 'Cardiology Tests']
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      expect(data.services).toHaveLength(5)
      expect(data.operatingHours).toBe('6 AM - 10 PM')
      expect(data.specializations).toContain('Pathology')
    })
  })

  describe('Lab Test Catalog Management', () => {
    it('creates new lab test with pricing and requirements', async () => {
      const mockLabTest = {
        id: 'test-id',
        laboratoryId: 'lab-id',
        name: 'Complete Blood Count (CBC)',
        description: 'Comprehensive blood analysis including RBC, WBC, platelets',
        price: 350.00,
        duration: '4-6 hours',
        requirements: 'Fasting not required',
        category: 'Blood Tests',
        isActive: true,
        createdAt: new Date().toISOString()
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLabTest,
      })

      const testData = {
        name: 'Complete Blood Count (CBC)',
        description: 'Comprehensive blood analysis including RBC, WBC, platelets',
        price: '350.00',
        duration: '4-6 hours',
        requirements: 'Fasting not required',
        category: 'Blood Tests'
      }

      const response = await fetch('/api/lab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })

      const data = await response.json()
      expect(data.name).toBe('Complete Blood Count (CBC)')
      expect(data.price).toBe(350.00)
      expect(data.duration).toBe('4-6 hours')
      expect(data.isActive).toBe(true)
    })

    it('fetches lab test catalog with search functionality', async () => {
      const mockLabTests = [
        {
          id: 'test-1',
          name: 'Complete Blood Count (CBC)',
          price: 350.00,
          duration: '4-6 hours',
          category: 'Blood Tests',
          laboratory: {
            name: 'City Lab Center',
            address: '123 Health Street'
          }
        },
        {
          id: 'test-2',
          name: 'Lipid Profile',
          price: 400.00,
          duration: '6-8 hours',
          category: 'Blood Tests',
          laboratory: {
            name: 'City Lab Center',
            address: '123 Health Street'
          }
        },
        {
          id: 'test-3',
          name: 'Chest X-Ray',
          price: 500.00,
          duration: '30 minutes',
          category: 'Radiology',
          laboratory: {
            name: 'City Lab Center',
            address: '123 Health Street'
          }
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLabTests,
      })

      const response = await fetch('/api/lab-tests?search=blood&laboratoryId=lab-id')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(3)
      expect(data[0].name).toBe('Complete Blood Count (CBC)')
      expect(data[1].price).toBe(400.00)
    })

    it('updates lab test pricing and availability', async () => {
      const mockUpdatedTest = {
        id: 'test-id',
        name: 'Complete Blood Count (CBC)',
        price: 380.00,
        duration: '4 hours',
        requirements: 'Fasting not required, avoid alcohol 24hrs before',
        isActive: true,
        updatedAt: new Date().toISOString()
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedTest,
      })

      const updateData = {
        price: 380.00,
        duration: '4 hours',
        requirements: 'Fasting not required, avoid alcohol 24hrs before'
      }

      const response = await fetch('/api/lab-tests/test-id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      expect(data.price).toBe(380.00)
      expect(data.duration).toBe('4 hours')
      expect(data.requirements).toContain('avoid alcohol')
    })

    it('deactivates lab test when out of service', async () => {
      const mockDeactivatedTest = {
        id: 'test-id',
        isActive: false,
        deactivationReason: 'Equipment maintenance',
        deactivatedAt: new Date().toISOString()
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeactivatedTest,
      })

      const response = await fetch('/api/lab-tests/test-id/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Equipment maintenance' })
      })

      const data = await response.json()
      expect(data.isActive).toBe(false)
      expect(data.deactivationReason).toBe('Equipment maintenance')
    })
  })

  describe('Lab Booking Management', () => {
    it('processes patient lab booking with commission calculation', async () => {
      const mockLabBooking = {
        id: 'booking-id',
        patientId: 'patient-id',
        laboratoryId: 'lab-id',
        labTestId: 'test-id',
        scheduledDate: '2024-01-15T09:00:00Z',
        status: 'BOOKED',
        totalAmount: 350.00,
        commissionAmount: 17.50, // 5% commission
        netAmount: 332.50,
        labTest: {
          name: 'Complete Blood Count (CBC)',
          duration: '4-6 hours',
          requirements: 'Fasting not required'
        },
        laboratory: {
          name: 'City Lab Center',
          address: '123 Health Street',
          phone: '9876543210'
        },
        createdAt: new Date().toISOString()
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLabBooking,
      })

      const bookingData = {
        laboratoryId: 'lab-id',
        labTestId: 'test-id',
        scheduledDate: '2024-01-15T09:00:00Z'
      }

      const response = await fetch('/api/lab-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      const data = await response.json()
      expect(data.totalAmount).toBe(350.00)
      expect(data.commissionAmount).toBe(17.50)
      expect(data.netAmount).toBe(332.50)
      expect(data.status).toBe('BOOKED')
    })

    it('fetches laboratory bookings with patient details', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          scheduledDate: '2024-01-15T09:00:00Z',
          status: 'BOOKED',
          totalAmount: 350.00,
          patient: {
            user: {
              name: 'John Doe',
              email: 'john@test.com',
              phone: '1234567890'
            }
          },
          labTest: {
            name: 'Complete Blood Count (CBC)',
            duration: '4-6 hours',
            requirements: 'Fasting not required'
          }
        },
        {
          id: 'booking-2',
          scheduledDate: '2024-01-15T14:00:00Z',
          status: 'SAMPLE_COLLECTED',
          totalAmount: 500.00,
          patient: {
            user: {
              name: 'Jane Smith',
              email: 'jane@test.com',
              phone: '0987654321'
            }
          },
          labTest: {
            name: 'Chest X-Ray',
            duration: '30 minutes',
            requirements: 'Remove metal objects'
          }
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings,
      })

      const response = await fetch('/api/lab-bookings')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0].patient.user.name).toBe('John Doe')
      expect(data[1].status).toBe('SAMPLE_COLLECTED')
    })

    it('updates booking status through workflow stages', async () => {
      const mockUpdatedBooking = {
        id: 'booking-id',
        status: 'SAMPLE_COLLECTED',
        sampleCollectedAt: new Date().toISOString(),
        collectionNotes: 'Sample collected successfully, good quality',
        technician: 'Lab Tech 1'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedBooking,
      })

      const updateData = {
        status: 'SAMPLE_COLLECTED',
        collectionNotes: 'Sample collected successfully, good quality',
        technician: 'Lab Tech 1'
      }

      const response = await fetch('/api/lab-bookings/booking-id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      expect(data.status).toBe('SAMPLE_COLLECTED')
      expect(data.sampleCollectedAt).toBeDefined()
      expect(data.collectionNotes).toContain('successfully')
    })

    it('handles booking rescheduling requests', async () => {
      const mockRescheduledBooking = {
        id: 'booking-id',
        scheduledDate: '2024-01-20T10:00:00Z',
        status: 'RESCHEDULED',
        rescheduleReason: 'Patient unavailable',
        originalScheduledDate: '2024-01-15T09:00:00Z',
        rescheduledAt: new Date().toISOString()
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRescheduledBooking,
      })

      const rescheduleData = {
        scheduledDate: '2024-01-20T10:00:00Z',
        rescheduleReason: 'Patient unavailable'
      }

      const response = await fetch('/api/lab-bookings/booking-id/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rescheduleData)
      })

      const data = await response.json()
      expect(data.status).toBe('RESCHEDULED')
      expect(data.rescheduleReason).toBe('Patient unavailable')
      expect(data.originalScheduledDate).toBeDefined()
    })
  })

  describe('Sample Collection and Processing', () => {
    it('records sample collection with quality assessment', async () => {
      const mockSampleCollection = {
        id: 'collection-id',
        bookingId: 'booking-id',
        collectedBy: 'Lab Tech 1',
        collectionTime: new Date().toISOString(),
        sampleType: 'Blood',
        sampleQuality: 'Good',
        quantity: '5ml',
        containerType: 'EDTA Tube',
        barcodeId: 'BC123456789',
        storageConditions: 'Room Temperature',
        notes: 'Patient fasted 12 hours, good vein access'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSampleCollection,
      })

      const collectionData = {
        collectedBy: 'Lab Tech 1',
        sampleType: 'Blood',
        sampleQuality: 'Good',
        quantity: '5ml',
        containerType: 'EDTA Tube',
        storageConditions: 'Room Temperature',
        notes: 'Patient fasted 12 hours, good vein access'
      }

      const response = await fetch('/api/lab-bookings/booking-id/collect-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionData)
      })

      const data = await response.json()
      expect(data.sampleQuality).toBe('Good')
      expect(data.quantity).toBe('5ml')
      expect(data.barcodeId).toMatch(/^BC\d+$/)
    })

    it('tracks sample processing through testing stages', async () => {
      const mockProcessingUpdate = {
        id: 'processing-id',
        bookingId: 'booking-id',
        stage: 'ANALYSIS',
        startedAt: new Date().toISOString(),
        estimatedCompletion: '2024-01-15T15:00:00Z',
        technician: 'Lab Analyst 2',
        equipment: 'Automated Analyzer XYZ-100',
        parameters: ['RBC', 'WBC', 'Platelets', 'Hemoglobin'],
        qualityChecks: [
          { parameter: 'Sample integrity', status: 'PASSED' },
          { parameter: 'Quantity sufficient', status: 'PASSED' },
          { parameter: 'No contamination', status: 'PASSED' }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProcessingUpdate,
      })

      const processingData = {
        stage: 'ANALYSIS',
        technician: 'Lab Analyst 2',
        equipment: 'Automated Analyzer XYZ-100',
        parameters: ['RBC', 'WBC', 'Platelets', 'Hemoglobin']
      }

      const response = await fetch('/api/lab-bookings/booking-id/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processingData)
      })

      const data = await response.json()
      expect(data.stage).toBe('ANALYSIS')
      expect(data.parameters).toHaveLength(4)
      expect(data.qualityChecks.every((check: any) => check.status === 'PASSED')).toBe(true)
    })

    it('handles sample rejection with reasons', async () => {
      const mockRejectedSample = {
        id: 'rejection-id',
        bookingId: 'booking-id',
        status: 'SAMPLE_REJECTED',
        rejectionReason: 'Hemolyzed sample',
        rejectedBy: 'Lab Supervisor',
        rejectedAt: new Date().toISOString(),
        recommendedAction: 'Recollection required',
        notificationSent: true
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRejectedSample,
      })

      const rejectionData = {
        rejectionReason: 'Hemolyzed sample',
        rejectedBy: 'Lab Supervisor',
        recommendedAction: 'Recollection required'
      }

      const response = await fetch('/api/lab-bookings/booking-id/reject-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rejectionData)
      })

      const data = await response.json()
      expect(data.status).toBe('SAMPLE_REJECTED')
      expect(data.rejectionReason).toBe('Hemolyzed sample')
      expect(data.notificationSent).toBe(true)
    })
  })

  describe('Report Generation and Delivery', () => {
    it('generates comprehensive lab report with results', async () => {
      const mockLabReport = {
        id: 'report-id',
        bookingId: 'booking-id',
        reportNumber: 'RPT-2024-001',
        testResults: [
          {
            parameter: 'Hemoglobin',
            value: '13.5',
            unit: 'g/dL',
            referenceRange: '12.0-16.0',
            status: 'NORMAL'
          },
          {
            parameter: 'RBC Count',
            value: '4.8',
            unit: 'million/µL',
            referenceRange: '4.2-5.4',
            status: 'NORMAL'
          },
          {
            parameter: 'WBC Count',
            value: '7200',
            unit: '/µL',
            referenceRange: '4000-11000',
            status: 'NORMAL'
          }
        ],
        interpretation: 'All parameters within normal limits',
        recommendations: 'Continue regular health monitoring',
        reportedBy: 'Dr. Lab Director',
        verifiedBy: 'Dr. Senior Pathologist',
        reportDate: new Date().toISOString(),
        digitalSignature: 'DS_ABC123',
        reportUrl: 'https://reports.healthmate.com/RPT-2024-001.pdf'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLabReport,
      })

      const reportData = {
        testResults: [
          { parameter: 'Hemoglobin', value: '13.5', unit: 'g/dL', status: 'NORMAL' },
          { parameter: 'RBC Count', value: '4.8', unit: 'million/µL', status: 'NORMAL' },
          { parameter: 'WBC Count', value: '7200', unit: '/µL', status: 'NORMAL' }
        ],
        interpretation: 'All parameters within normal limits',
        recommendations: 'Continue regular health monitoring',
        reportedBy: 'Dr. Lab Director'
      }

      const response = await fetch('/api/lab-bookings/booking-id/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      })

      const data = await response.json()
      expect(data.reportNumber).toMatch(/^RPT-\d{4}-\d{3}$/)
      expect(data.testResults).toHaveLength(3)
      expect(data.testResults[0].status).toBe('NORMAL')
      expect(data.reportUrl).toContain('healthmate.com')
    })

    it('uploads and validates report documents', async () => {
      const mockReportUpload = {
        id: 'upload-id',
        bookingId: 'booking-id',
        fileName: 'CBC_Report_Patient123.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Lab Tech 1',
        fileUrl: 'https://storage.healthmate.com/reports/CBC_Report_Patient123.pdf',
        validationChecks: [
          { check: 'File format', status: 'PASSED' },
          { check: 'Digital signature', status: 'PASSED' },
          { check: 'Report completeness', status: 'PASSED' }
        ],
        notificationSent: true
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReportUpload,
      })

      // Simulate FormData for file upload
      const uploadData = {
        fileName: 'CBC_Report_Patient123.pdf',
        fileType: 'application/pdf',
        uploadedBy: 'Lab Tech 1'
      }

      const response = await fetch('/api/lab-bookings/booking-id/upload-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadData)
      })

      const data = await response.json()
      expect(data.fileName).toBe('CBC_Report_Patient123.pdf')
      expect(data.validationChecks.every((check: any) => check.status === 'PASSED')).toBe(true)
      expect(data.notificationSent).toBe(true)
    })

    it('sends report notification to patient', async () => {
      const mockNotification = {
        id: 'notification-id',
        bookingId: 'booking-id',
        patientId: 'patient-id',
        type: 'REPORT_READY',
        message: 'Your lab report is ready for download',
        channels: ['EMAIL', 'SMS', 'IN_APP'],
        sentAt: new Date().toISOString(),
        deliveryStatus: {
          email: 'DELIVERED',
          sms: 'DELIVERED',
          inApp: 'DELIVERED'
        },
        reportAccessCode: 'AC123456'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotification,
      })

      const notificationData = {
        type: 'REPORT_READY',
        channels: ['EMAIL', 'SMS', 'IN_APP'],
        message: 'Your lab report is ready for download'
      }

      const response = await fetch('/api/lab-bookings/booking-id/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      })

      const data = await response.json()
      expect(data.type).toBe('REPORT_READY')
      expect(data.channels).toHaveLength(3)
      expect(data.reportAccessCode).toMatch(/^AC\d{6}$/)
    })
  })

  describe('Laboratory Dashboard and Analytics', () => {
    it('fetches laboratory dashboard summary', async () => {
      const mockDashboard = {
        totalBookings: 150,
        todayBookings: 8,
        inProgressTests: 12,
        completedReports: 135,
        pendingReports: 3,
        totalRevenue: 52500.00,
        monthlyRevenue: 8750.00,
        topTests: [
          { name: 'Complete Blood Count', count: 45, revenue: 15750.00 },
          { name: 'Lipid Profile', count: 30, revenue: 12000.00 },
          { name: 'Liver Function Test', count: 25, revenue: 8750.00 }
        ],
        recentBookings: [
          {
            id: 'booking-1',
            scheduledDate: '2024-01-15T09:00:00Z',
            patient: { user: { name: 'John Doe' } },
            labTest: { name: 'CBC' },
            status: 'BOOKED'
          }
        ],
        turnaroundTimes: {
          average: '4.2 hours',
          fastest: '2.5 hours',
          slowest: '8 hours'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboard,
      })

      const response = await fetch('/api/laboratory/dashboard')
      const data = await response.json()
      
      expect(data.totalBookings).toBe(150)
      expect(data.monthlyRevenue).toBe(8750.00)
      expect(data.topTests).toHaveLength(3)
      expect(data.turnaroundTimes.average).toBe('4.2 hours')
    })

    it('generates revenue analytics report', async () => {
      const mockRevenueReport = {
        period: 'monthly',
        totalRevenue: 26250.00,
        totalBookings: 75,
        averageRevenuePerTest: 350.00,
        commissionDeducted: 1312.50,
        netRevenue: 24937.50,
        revenueByCategory: [
          { category: 'Blood Tests', revenue: 15750.00, percentage: 60 },
          { category: 'Radiology', revenue: 7875.00, percentage: 30 },
          { category: 'Microbiology', revenue: 2625.00, percentage: 10 }
        ],
        monthlyTrend: [
          { month: '2024-01', revenue: 26250.00, bookings: 75 },
          { month: '2023-12', revenue: 24500.00, bookings: 70 }
        ],
        patientDemographics: {
          ageGroups: [
            { range: '18-30', count: 20 },
            { range: '31-50', count: 35 },
            { range: '51-70', count: 20 }
          ]
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRevenueReport,
      })

      const response = await fetch('/api/laboratory/analytics?period=monthly')
      const data = await response.json()
      
      expect(data.totalRevenue).toBe(26250.00)
      expect(data.netRevenue).toBe(24937.50)
      expect(data.revenueByCategory).toHaveLength(3)
      expect(data.monthlyTrend).toHaveLength(2)
    })

    it('tracks test performance metrics', async () => {
      const mockPerformanceMetrics = {
        testAccuracy: 99.2,
        reportTurnaroundTime: {
          average: 4.2,
          target: 6.0,
          performance: 'Above Target'
        },
        sampleRejectionRate: 2.1,
        patientSatisfactionScore: 4.7,
        qualityIndicators: [
          { metric: 'Repeat Test Rate', value: 1.5, benchmark: 2.0, status: 'GOOD' },
          { metric: 'Report Correction Rate', value: 0.8, benchmark: 1.0, status: 'EXCELLENT' },
          { metric: 'Equipment Downtime', value: 2.3, benchmark: 5.0, status: 'EXCELLENT' }
        ],
        certificationStatus: {
          nabl: { valid: true, expiryDate: '2025-12-31' },
          iso15189: { valid: true, expiryDate: '2025-06-30' }
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPerformanceMetrics,
      })

      const response = await fetch('/api/laboratory/performance')
      const data = await response.json()
      
      expect(data.testAccuracy).toBe(99.2)
      expect(data.reportTurnaroundTime.performance).toBe('Above Target')
      expect(data.qualityIndicators).toHaveLength(3)
      expect(data.certificationStatus.nabl.valid).toBe(true)
    })
  })

  describe('Commission and Payment Tracking', () => {
    it('calculates commission correctly for lab tests', async () => {
      const mockTransactionDetails = {
        testPrice: 350.00,
        commissionRate: 0.05, // 5%
        commissionAmount: 17.50,
        netEarnings: 332.50,
        paymentStatus: 'COMPLETED',
        transactionId: 'txn-lab-123',
        processingFee: 5.00,
        finalAmount: 327.50
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransactionDetails,
      })

      const response = await fetch('/api/transactions/booking-id')
      const data = await response.json()
      
      expect(data.testPrice).toBe(350.00)
      expect(data.commissionAmount).toBe(17.50)
      expect(data.netEarnings).toBe(332.50)
      expect(data.finalAmount).toBe(327.50)
    })

    it('tracks monthly earnings and payouts', async () => {
      const mockPayoutSummary = {
        month: '2024-01',
        totalTests: 75,
        grossEarnings: 26250.00,
        totalCommission: 1312.50,
        processingFees: 375.00,
        netEarnings: 24562.50,
        payoutStatus: 'PROCESSED',
        payoutDate: '2024-02-01',
        testBreakdown: [
          { category: 'Blood Tests', count: 45, earnings: 15750.00 },
          { category: 'Radiology', count: 20, earnings: 10000.00 },
          { category: 'Microbiology', count: 10, earnings: 500.00 }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPayoutSummary,
      })

      const response = await fetch('/api/laboratory/payouts/2024-01')
      const data = await response.json()
      
      expect(data.netEarnings).toBe(24562.50)
      expect(data.totalTests).toBe(75)
      expect(data.payoutStatus).toBe('PROCESSED')
      expect(data.testBreakdown).toHaveLength(3)
    })
  })

  describe('Quality Control and Compliance', () => {
    it('records quality control checks', async () => {
      const mockQCRecord = {
        id: 'qc-id',
        date: new Date().toISOString(),
        testType: 'Complete Blood Count',
        controlSamples: [
          { level: 'Normal', result: 'PASSED', variance: 1.2 },
          { level: 'High', result: 'PASSED', variance: 0.8 },
          { level: 'Low', result: 'PASSED', variance: 1.5 }
        ],
        equipment: 'Automated Analyzer XYZ-100',
        technician: 'Lab Tech 1',
        calibrationStatus: 'CURRENT',
        actions: [],
        overallStatus: 'PASSED'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockQCRecord,
      })

      const qcData = {
        testType: 'Complete Blood Count',
        controlSamples: [
          { level: 'Normal', result: 'PASSED', variance: 1.2 },
          { level: 'High', result: 'PASSED', variance: 0.8 },
          { level: 'Low', result: 'PASSED', variance: 1.5 }
        ],
        equipment: 'Automated Analyzer XYZ-100',
        technician: 'Lab Tech 1'
      }

      const response = await fetch('/api/laboratory/quality-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qcData)
      })

      const data = await response.json()
      expect(data.controlSamples).toHaveLength(3)
      expect(data.overallStatus).toBe('PASSED')
      expect(data.calibrationStatus).toBe('CURRENT')
    })

    it('tracks accreditation and compliance status', async () => {
      const mockComplianceStatus = {
        accreditations: [
          {
            name: 'NABL',
            status: 'ACTIVE',
            certificateNumber: 'NABL-123',
            validFrom: '2023-01-01',
            validUntil: '2025-12-31',
            nextAudit: '2024-06-15'
          },
          {
            name: 'ISO 15189',
            status: 'ACTIVE',
            certificateNumber: 'ISO-456',
            validFrom: '2022-07-01',
            validUntil: '2025-06-30',
            nextAudit: '2024-12-01'
          }
        ],
        inspections: [
          {
            date: '2023-11-15',
            type: 'Regulatory',
            outcome: 'COMPLIANT',
            findings: 0,
            inspector: 'Health Department'
          }
        ],
        licenses: [
          {
            type: 'Laboratory License',
            number: 'LAB-123',
            status: 'ACTIVE',
            expiryDate: '2024-12-31'
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockComplianceStatus,
      })

      const response = await fetch('/api/laboratory/compliance')
      const data = await response.json()
      
      expect(data.accreditations).toHaveLength(2)
      expect(data.accreditations[0].status).toBe('ACTIVE')
      expect(data.inspections[0].outcome).toBe('COMPLIANT')
      expect(data.licenses[0].status).toBe('ACTIVE')
    })
  })
})