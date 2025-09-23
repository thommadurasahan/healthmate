// Test for Authentication API routes
describe('Authentication API Routes', () => {
  describe('POST /api/auth/register', () => {
    beforeEach(() => {
      global.fetch = jest.fn()
    })

    it('creates a patient user successfully', async () => {
      const mockResponse = {
        message: 'User created successfully',
        user: {
          id: 'test-id',
          name: 'Test Patient',
          email: 'patient@test.com',
          role: 'PATIENT',
          isApproved: true,
          patient: { id: 'patient-id', userId: 'test-id' }
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Patient',
          email: 'patient@test.com',
          password: 'password123',
          role: 'PATIENT'
        })
      })

      const data = await response.json()
      expect(data.user.role).toBe('PATIENT')
      expect(data.user.isApproved).toBe(true)
      expect(data.user.patient).toBeDefined()
    })

    it('creates a pharmacy user requiring approval', async () => {
      const mockResponse = {
        message: 'User created successfully',
        user: {
          id: 'test-id',
          name: 'Test Pharmacy',
          email: 'pharmacy@test.com',
          role: 'PHARMACY',
          isApproved: false,
          pharmacy: {
            id: 'pharmacy-id',
            name: 'Test Pharmacy',
            address: '123 Test St',
            phone: '1234567890',
            license: 'PH123',
            isApproved: false
          }
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Pharmacy',
          email: 'pharmacy@test.com',
          password: 'password123',
          role: 'PHARMACY',
          pharmacyName: 'Test Pharmacy',
          address: '123 Test St',
          phone: '1234567890',
          license: 'PH123'
        })
      })

      const data = await response.json()
      expect(data.user.role).toBe('PHARMACY')
      expect(data.user.isApproved).toBe(false)
      expect(data.user.pharmacy.isApproved).toBe(false)
    })

    it('creates a doctor user with consultation fee', async () => {
      const mockResponse = {
        message: 'User created successfully',
        user: {
          id: 'test-id',
          name: 'Dr. Test',
          email: 'doctor@test.com',
          role: 'DOCTOR',
          isApproved: false,
          doctor: {
            id: 'doctor-id',
            specialization: 'Cardiology',
            qualifications: 'MBBS, MD',
            experience: 5,
            consultationFee: 500.00,
            phone: '1234567890',
            license: 'DOC123',
            isApproved: false
          }
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Dr. Test',
          email: 'doctor@test.com',
          password: 'password123',
          role: 'DOCTOR',
          specialization: 'Cardiology',
          qualifications: 'MBBS, MD',
          experience: '5',
          consultationFee: '500.00',
          phone: '1234567890',
          doctorLicense: 'DOC123'
        })
      })

      const data = await response.json()
      expect(data.user.role).toBe('DOCTOR')
      expect(data.user.doctor.consultationFee).toBe(500.00)
      expect(data.user.doctor.experience).toBe(5)
    })

    it('creates a delivery partner user', async () => {
      const mockResponse = {
        message: 'User created successfully',
        user: {
          id: 'test-id',
          name: 'Test Delivery',
          email: 'delivery@test.com',
          role: 'DELIVERY_PARTNER',
          isApproved: false,
          deliveryPartner: {
            id: 'delivery-id',
            vehicleType: 'Motorcycle',
            licenseNumber: 'DL123',
            phone: '1234567890',
            address: '123 Test St',
            isApproved: false
          }
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Delivery',
          email: 'delivery@test.com',
          password: 'password123',
          role: 'DELIVERY_PARTNER',
          vehicleType: 'Motorcycle',
          licenseNumber: 'DL123',
          phone: '1234567890',
          address: '123 Test St'
        })
      })

      const data = await response.json()
      expect(data.user.role).toBe('DELIVERY_PARTNER')
      expect(data.user.deliveryPartner.vehicleType).toBe('Motorcycle')
    })

    it('creates a laboratory user', async () => {
      const mockResponse = {
        message: 'User created successfully',
        user: {
          id: 'test-id',
          name: 'Test Lab',
          email: 'lab@test.com',
          role: 'LABORATORY',
          isApproved: false,
          laboratory: {
            id: 'lab-id',
            name: 'Test Laboratory',
            address: '123 Test St',
            phone: '1234567890',
            license: 'LAB123',
            isApproved: false
          }
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Lab',
          email: 'lab@test.com',
          password: 'password123',
          role: 'LABORATORY',
          laboratoryName: 'Test Laboratory',
          address: '123 Test St',
          phone: '1234567890',
          labLicense: 'LAB123'
        })
      })

      const data = await response.json()
      expect(data.user.role).toBe('LABORATORY')
      expect(data.user.laboratory.name).toBe('Test Laboratory')
    })

    it('validates required fields for registration', async () => {
      const mockErrorResponse = {
        error: 'Missing required fields'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '',
          email: 'test@test.com',
          password: '',
          role: 'PATIENT'
        })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Missing required fields')
    })

    it('prevents duplicate user registration', async () => {
      const mockErrorResponse = {
        error: 'User already exists'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'existing@test.com',
          password: 'password123',
          role: 'PATIENT'
        })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('User already exists')
    })

    it('validates role-specific required fields for pharmacy', async () => {
      const mockErrorResponse = {
        error: 'Missing pharmacy information'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Pharmacy',
          email: 'pharmacy@test.com',
          password: 'password123',
          role: 'PHARMACY'
          // Missing pharmacy-specific fields
        })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Missing pharmacy information')
    })
  })
})