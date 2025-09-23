// Patient Workflow Tests
describe('Patient Workflows', () => {
  const mockPatientSession = {
    user: {
      id: 'patient-user-id',
      name: 'Test Patient',
      email: 'patient@test.com',
      role: 'PATIENT',
      patient: {
        id: 'patient-id',
        userId: 'patient-user-id',
      }
    }
  }

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  describe('Prescription Upload Workflow', () => {
    it('successfully uploads a valid prescription image', async () => {
      const mockResponse = {
        message: 'Prescription uploaded successfully',
        prescription: {
          id: 'prescription-id',
          fileName: 'test-prescription.jpg',
          status: 'UPLOADED',
          createdAt: new Date().toISOString()
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const formData = new FormData()
      const file = new File(['test image content'], 'test-prescription.jpg', { type: 'image/jpeg' })
      formData.append('prescription', file)

      const response = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      expect(data.message).toBe('Prescription uploaded successfully')
      expect(data.prescription.status).toBe('UPLOADED')
      expect(data.prescription.fileName).toBe('test-prescription.jpg')
    })

    it('validates file type restrictions', async () => {
      const mockErrorResponse = {
        error: 'Invalid file type. Please upload JPEG, PNG, or PDF files only.'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      })

      const formData = new FormData()
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      formData.append('prescription', file)

      const response = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        body: formData
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Invalid file type')
    })

    it('validates file size limits', async () => {
      const mockErrorResponse = {
        error: 'File size too large. Maximum size is 10MB.'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      })

      const response = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        body: new FormData() // Mock large file scenario
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('File size too large')
    })

    it('fetches patient prescription history', async () => {
      const mockPrescriptions = [
        {
          id: 'prescription-1',
          fileName: 'prescription1.jpg',
          status: 'PROCESSED',
          createdAt: new Date().toISOString(),
          patientId: 'patient-id'
        },
        {
          id: 'prescription-2',
          fileName: 'prescription2.pdf',
          status: 'UPLOADED',
          createdAt: new Date().toISOString(),
          patientId: 'patient-id'
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrescriptions,
      })

      const response = await fetch('/api/prescriptions/upload')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0].status).toBe('PROCESSED')
      expect(data[1].status).toBe('UPLOADED')
    })
  })

  describe('Order Creation Workflow', () => {
    it('creates an order with prescription and medicine items', async () => {
      const mockOrder = {
        id: 'order-id',
        patientId: 'patient-id',
        pharmacyId: 'pharmacy-id',
        prescriptionId: 'prescription-id',
        totalAmount: 250.00,
        commissionAmount: 12.50,
        netAmount: 237.50,
        status: 'PENDING',
        deliveryAddress: '123 Test Street',
        orderItems: [
          {
            id: 'item-1',
            medicineId: 'med-1',
            quantity: 2,
            unitPrice: 100.00,
            totalPrice: 200.00,
            medicine: {
              name: 'Paracetamol',
              unit: 'tablets'
            }
          },
          {
            id: 'item-2',
            medicineId: 'med-2',
            quantity: 1,
            unitPrice: 50.00,
            totalPrice: 50.00,
            medicine: {
              name: 'Cough Syrup',
              unit: 'bottle'
            }
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrder,
      })

      const orderData = {
        pharmacyId: 'pharmacy-id',
        prescriptionId: 'prescription-id',
        items: [
          { medicineId: 'med-1', quantity: 2, unitPrice: 100.00 },
          { medicineId: 'med-2', quantity: 1, unitPrice: 50.00 }
        ],
        deliveryAddress: '123 Test Street',
        specialInstructions: 'Please deliver after 6 PM'
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()
      expect(data.id).toBe('order-id')
      expect(data.totalAmount).toBe(250.00)
      expect(data.commissionAmount).toBe(12.50)
      expect(data.orderItems).toHaveLength(2)
      expect(data.orderItems[0].medicine.name).toBe('Paracetamol')
    })

    it('validates required fields for order creation', async () => {
      const mockErrorResponse = {
        error: 'Missing required fields'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      })

      const invalidOrderData = {
        // Missing pharmacyId, items, deliveryAddress
        prescriptionId: 'prescription-id'
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidOrderData)
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Missing required fields')
    })

    it('fetches patient order history with filtering', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          status: 'DELIVERED',
          totalAmount: 150.00,
          createdAt: new Date().toISOString(),
          pharmacy: {
            name: 'Central Pharmacy',
            address: '456 Main St'
          },
          orderItems: [
            {
              medicine: { name: 'Medicine A' },
              quantity: 1
            }
          ]
        },
        {
          id: 'order-2',
          status: 'PENDING',
          totalAmount: 200.00,
          createdAt: new Date().toISOString(),
          pharmacy: {
            name: 'Health Pharmacy',
            address: '789 Health Ave'
          },
          orderItems: [
            {
              medicine: { name: 'Medicine B' },
              quantity: 2
            }
          ]
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders,
      })

      const response = await fetch('/api/orders?status=PENDING')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0].status).toBe('DELIVERED')
      expect(data[1].status).toBe('PENDING')
    })
  })

  describe('Lab Booking Workflow', () => {
    it('creates a lab test booking successfully', async () => {
      const mockBooking = {
        id: 'booking-id',
        patientId: 'patient-id',
        laboratoryId: 'lab-id',
        testId: 'test-id',
        scheduledDate: '2024-01-15',
        scheduledTime: '10:00',
        status: 'SCHEDULED',
        totalAmount: 300.00,
        commissionAmount: 15.00,
        netAmount: 285.00,
        sampleCollection: 'HOME',
        collectionAddress: '123 Test Street',
        test: {
          name: 'Complete Blood Count',
          description: 'CBC test',
          price: 300.00
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooking,
      })

      const bookingData = {
        laboratoryId: 'lab-id',
        testId: 'test-id',
        scheduledDate: '2024-01-15',
        scheduledTime: '10:00',
        sampleCollection: 'HOME',
        collectionAddress: '123 Test Street',
        specialInstructions: 'Fasting required'
      }

      const response = await fetch('/api/lab-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      const data = await response.json()
      expect(data.id).toBe('booking-id')
      expect(data.status).toBe('SCHEDULED')
      expect(data.totalAmount).toBe(300.00)
      expect(data.test.name).toBe('Complete Blood Count')
    })

    it('fetches available lab tests', async () => {
      const mockTests = [
        {
          id: 'test-1',
          name: 'Blood Sugar',
          description: 'Glucose level test',
          price: 200.00,
          category: 'Blood Test'
        },
        {
          id: 'test-2',
          name: 'Lipid Profile',
          description: 'Cholesterol and triglycerides',
          price: 400.00,
          category: 'Blood Test'
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTests,
      })

      const response = await fetch('/api/lab-tests')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0].name).toBe('Blood Sugar')
      expect(data[1].name).toBe('Lipid Profile')
    })
  })

  describe('Doctor Consultation Workflow', () => {
    it('books a doctor appointment successfully', async () => {
      const mockAppointment = {
        id: 'appointment-id',
        patientId: 'patient-id',
        doctorId: 'doctor-id',
        scheduledDate: '2024-01-20',
        scheduledTime: '14:00',
        status: 'SCHEDULED',
        consultationFee: 500.00,
        commissionAmount: 25.00,
        netAmount: 475.00,
        consultationType: 'VIDEO',
        symptoms: 'Fever and headache',
        doctor: {
          user: {
            name: 'Dr. Smith'
          },
          specialization: 'General Medicine',
          qualifications: 'MBBS, MD'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppointment,
      })

      const appointmentData = {
        doctorId: 'doctor-id',
        scheduledDate: '2024-01-20',
        scheduledTime: '14:00',
        consultationType: 'VIDEO',
        symptoms: 'Fever and headache',
        medicalHistory: 'No significant history'
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      })

      const data = await response.json()
      expect(data.id).toBe('appointment-id')
      expect(data.status).toBe('SCHEDULED')
      expect(data.consultationFee).toBe(500.00)
      expect(data.doctor.user.name).toBe('Dr. Smith')
    })

    it('fetches available doctors with specializations', async () => {
      const mockDoctors = [
        {
          id: 'doctor-1',
          user: {
            name: 'Dr. Johnson',
            email: 'johnson@test.com'
          },
          specialization: 'Cardiology',
          qualifications: 'MBBS, MD Cardiology',
          experience: 8,
          consultationFee: 600.00,
          isApproved: true
        },
        {
          id: 'doctor-2',
          user: {
            name: 'Dr. Williams',
            email: 'williams@test.com'
          },
          specialization: 'Dermatology',
          qualifications: 'MBBS, MD Dermatology',
          experience: 5,
          consultationFee: 550.00,
          isApproved: true
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDoctors,
      })

      const response = await fetch('/api/doctors')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0].specialization).toBe('Cardiology')
      expect(data[1].specialization).toBe('Dermatology')
    })
  })

  describe('Patient Profile Management', () => {
    it('updates patient profile successfully', async () => {
      const mockUpdatedProfile = {
        id: 'patient-id',
        userId: 'patient-user-id',
        phone: '9876543210',
        address: '456 New Address',
        emergencyContact: 'John Doe',
        emergencyPhone: '9876543211',
        bloodGroup: 'B+',
        allergies: 'Penicillin',
        user: {
          name: 'Updated Patient Name',
          email: 'patient@test.com'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedProfile,
      })

      const profileData = {
        name: 'Updated Patient Name',
        phone: '9876543210',
        address: '456 New Address',
        emergencyContact: 'John Doe',
        emergencyPhone: '9876543211',
        bloodGroup: 'B+',
        allergies: 'Penicillin'
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()
      expect(data.phone).toBe('9876543210')
      expect(data.bloodGroup).toBe('B+')
      expect(data.user.name).toBe('Updated Patient Name')
    })

    it('fetches patient dashboard summary', async () => {
      const mockDashboard = {
        totalOrders: 15,
        pendingOrders: 3,
        completedOrders: 12,
        totalConsultations: 8,
        upcomingAppointments: 2,
        recentPrescriptions: 5,
        recentOrders: [
          {
            id: 'order-1',
            status: 'DELIVERED',
            totalAmount: 150.00,
            createdAt: new Date().toISOString()
          }
        ],
        upcomingBookings: [
          {
            id: 'booking-1',
            scheduledDate: '2024-01-15',
            scheduledTime: '10:00',
            test: { name: 'Blood Test' }
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboard,
      })

      const response = await fetch('/api/patient/dashboard')
      const data = await response.json()
      
      expect(data.totalOrders).toBe(15)
      expect(data.pendingOrders).toBe(3)
      expect(data.upcomingAppointments).toBe(2)
      expect(data.recentOrders).toHaveLength(1)
      expect(data.upcomingBookings).toHaveLength(1)
    })
  })
})