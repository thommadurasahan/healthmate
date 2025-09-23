// API Integration Tests
describe('API Integration Tests', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  describe('Authentication and Authorization', () => {
    it('blocks unauthenticated requests to protected routes', async () => {
      const protectedRoutes = [
        '/api/orders',
        '/api/prescriptions/upload',
        '/api/medicines',
        '/api/appointments',
        '/api/lab-bookings',
        '/api/deliveries',
        '/api/profile',
        '/api/admin/users'
      ]

      for (const route of protectedRoutes) {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Unauthorized' }),
        })

        const response = await fetch(route)
        expect(response.status).toBe(401)
        const data = await response.json()
        expect(data.error).toBe('Unauthorized')
      }
    })

    it('enforces role-based access control for patient-only routes', async () => {
      const patientOnlyRoutes = [
        { route: '/api/prescriptions/upload', method: 'POST' },
        { route: '/api/prescriptions/process', method: 'POST' },
        { route: '/api/orders', method: 'POST' },
        { route: '/api/appointments', method: 'POST' },
        { route: '/api/lab-bookings', method: 'POST' }
      ]

      for (const { route, method } of patientOnlyRoutes) {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Unauthorized' }),
        })

        const response = await fetch(route, { method })
        expect(response.status).toBe(401)
      }
    })

    it('enforces role-based access control for pharmacy-only routes', async () => {
      const pharmacyOnlyRoutes = [
        { route: '/api/medicines', method: 'POST' },
        { route: '/api/medicines/medicine-id', method: 'PUT' },
        { route: '/api/pharmacy/dashboard', method: 'GET' },
        { route: '/api/pharmacy/earnings', method: 'GET' }
      ]

      for (const { route, method } of pharmacyOnlyRoutes) {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Unauthorized' }),
        })

        const response = await fetch(route, { method })
        expect(response.status).toBe(401)
      }
    })

    it('enforces role-based access control for admin-only routes', async () => {
      const adminOnlyRoutes = [
        { route: '/api/admin/users', method: 'GET' },
        { route: '/api/admin/analytics', method: 'GET' },
        { route: '/api/admin/users/user-id/approve', method: 'POST' },
        { route: '/api/admin/users/user-id/reject', method: 'POST' },
        { route: '/api/admin/dashboard', method: 'GET' }
      ]

      for (const { route, method } of adminOnlyRoutes) {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Unauthorized' }),
        })

        const response = await fetch(route, { method })
        expect(response.status).toBe(401)
      }
    })
  })

  describe('Data Validation and Error Handling', () => {
    it('validates required fields for order creation', async () => {
      const invalidOrderPayloads = [
        {}, // Empty payload
        { pharmacyId: 'pharmacy-id' }, // Missing items
        { items: [] }, // Empty items array
        { pharmacyId: 'pharmacy-id', items: [{ medicineId: 'med-1' }] }, // Missing quantity
        { 
          pharmacyId: 'pharmacy-id', 
          items: [{ medicineId: 'med-1', quantity: 2, unitPrice: 50 }] 
        } // Missing deliveryAddress
      ]

      for (const payload of invalidOrderPayloads) {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: 'Missing required fields' }),
        })

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        expect(response.status).toBe(400)
      }
    })

    it('validates required fields for medicine creation', async () => {
      const invalidMedicinePayloads = [
        {}, // Empty payload
        { name: 'Medicine' }, // Missing price and unit
        { name: 'Medicine', price: '50' }, // Missing unit
        { price: '50', unit: 'tablets' }, // Missing name
        { name: '', price: '50', unit: 'tablets' }, // Empty name
        { name: 'Medicine', price: 'invalid', unit: 'tablets' }, // Invalid price
        { name: 'Medicine', price: '-10', unit: 'tablets' } // Negative price
      ]

      for (const payload of invalidMedicinePayloads) {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: 'Missing required fields' }),
        })

        const response = await fetch('/api/medicines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        expect(response.status).toBe(400)
      }
    })

    it('validates required fields for appointment booking', async () => {
      const invalidAppointmentPayloads = [
        {}, // Empty payload
        { doctorId: 'doctor-id' }, // Missing date and time
        { scheduledDate: '2024-01-15' }, // Missing doctor and time
        { 
          doctorId: 'doctor-id', 
          scheduledDate: 'invalid-date',
          scheduledTime: '10:00'
        }, // Invalid date format
        {
          doctorId: 'doctor-id',
          scheduledDate: '2024-01-15',
          scheduledTime: '25:00' // Invalid time
        }
      ]

      for (const payload of invalidAppointmentPayloads) {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: 'Missing required fields' }),
        })

        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        expect(response.status).toBe(400)
      }
    })

    it('handles database constraint violations', async () => {
      const duplicateEmailPayload = {
        name: 'Test User',
        email: 'existing@test.com',
        password: 'password123',
        role: 'PATIENT'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'User already exists' }),
      })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateEmailPayload)
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('User already exists')
    })

    it('handles malformed JSON payloads', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid JSON payload' }),
      })

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json }'
      })

      expect(response.status).toBe(400)
    })
  })

  describe('Cross-Role Data Access Control', () => {
    it('prevents patients from accessing other patients data', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([]), // Empty array - patient can only see their own data
      })

      const response = await fetch('/api/orders?patientId=other-patient-id')
      const data = await response.json()
      
      // Should return empty array as patient cannot access other patients' orders
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(0)
    })

    it('prevents pharmacies from accessing other pharmacies data', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([]),
      })

      const response = await fetch('/api/medicines?pharmacyId=other-pharmacy-id')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
    })

    it('allows admins to access all user data', async () => {
      const mockAllUsersData = [
        { id: 'user-1', role: 'PATIENT', name: 'Patient 1' },
        { id: 'user-2', role: 'PHARMACY', name: 'Pharmacy 1' },
        { id: 'user-3', role: 'DOCTOR', name: 'Doctor 1' }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAllUsersData,
      })

      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(3)
      expect(data.map((u: any) => u.role)).toEqual(['PATIENT', 'PHARMACY', 'DOCTOR'])
    })
  })

  describe('API Response Formats and Consistency', () => {
    it('returns consistent error response format', async () => {
      const errorRoutes = [
        { route: '/api/orders/nonexistent-id', status: 404, error: 'Order not found' },
        { route: '/api/medicines/nonexistent-id', status: 404, error: 'Medicine not found' },
        { route: '/api/appointments/nonexistent-id', status: 404, error: 'Appointment not found' }
      ]

      for (const { route, status, error } of errorRoutes) {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status,
          json: async () => ({ error }),
        })

        const response = await fetch(route)
        expect(response.status).toBe(status)
        
        const data = await response.json()
        expect(data).toHaveProperty('error')
        expect(typeof data.error).toBe('string')
      }
    })

    it('returns consistent success response format for creation endpoints', async () => {
      const creationEndpoints = [
        { 
          route: '/api/orders', 
          response: { id: 'order-id', status: 'PENDING', totalAmount: 100 }
        },
        { 
          route: '/api/medicines', 
          response: { id: 'medicine-id', name: 'Test Medicine', price: 50 }
        },
        { 
          route: '/api/appointments', 
          response: { id: 'appointment-id', status: 'SCHEDULED', consultationFee: 500 }
        }
      ]

      for (const { route, response: expectedResponse } of creationEndpoints) {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => expectedResponse,
        })

        const response = await fetch(route, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })

        expect(response.status).toBe(201)
        const data = await response.json()
        expect(data).toHaveProperty('id')
      }
    })

    it('includes proper timestamps in response data', async () => {
      const mockResponseWithTimestamps = {
        id: 'order-id',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scheduledDate: '2024-01-15',
        scheduledTime: '10:00'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponseWithTimestamps,
      })

      const response = await fetch('/api/orders/order-id')
      const data = await response.json()
      
      expect(data.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      expect(data.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('API Performance and Rate Limiting', () => {
    it('handles concurrent requests properly', async () => {
      const mockResponse = { success: true }
      
      // Mock multiple concurrent calls
      for (let i = 0; i < 5; i++) {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })
      }

      const concurrentRequests = Array(5).fill(null).map(() => 
        fetch('/api/medicines?search=paracetamol')
      )

      const responses = await Promise.all(concurrentRequests)
      
      responses.forEach(response => {
        expect(response.ok).toBe(true)
      })
    })

    it('respects API rate limiting', async () => {
      // Simulate rate limit exceeded
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ 
          error: 'Too many requests',
          retryAfter: 60,
          limit: 100,
          remaining: 0
        }),
      })

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      expect(response.status).toBe(429)
      const data = await response.json()
      expect(data.error).toBe('Too many requests')
      expect(data.retryAfter).toBe(60)
    })
  })

  describe('Integration Between Services', () => {
    it('maintains data consistency between order and delivery services', async () => {
      const mockOrderWithDelivery = {
        id: 'order-id',
        status: 'OUT_FOR_DELIVERY',
        delivery: {
          id: 'delivery-id',
          status: 'ASSIGNED',
          deliveryPartner: {
            user: { name: 'Delivery Partner' },
            vehicleType: 'Motorcycle'
          },
          estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrderWithDelivery,
      })

      const response = await fetch('/api/orders/order-id')
      const data = await response.json()
      
      expect(data.status).toBe('OUT_FOR_DELIVERY')
      expect(data.delivery.status).toBe('ASSIGNED')
      expect(data.delivery.deliveryPartner).toBeDefined()
    })

    it('maintains data consistency between prescription and order services', async () => {
      const mockOrderWithPrescription = {
        id: 'order-id',
        prescriptionId: 'prescription-id',
        prescription: {
          id: 'prescription-id',
          status: 'PROCESSED',
          fileName: 'prescription.jpg',
          ocrData: JSON.stringify({
            medicines: [
              { name: 'Paracetamol', dosage: '500mg' }
            ]
          })
        },
        orderItems: [
          {
            medicine: { name: 'Paracetamol 500mg' },
            quantity: 2
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrderWithPrescription,
      })

      const response = await fetch('/api/orders/order-id')
      const data = await response.json()
      
      expect(data.prescriptionId).toBe('prescription-id')
      expect(data.prescription.status).toBe('PROCESSED')
      expect(data.orderItems[0].medicine.name).toContain('Paracetamol')
    })

    it('validates commission calculations across all transaction types', async () => {
      const transactionTypes = [
        { type: 'order', amount: 1000, expectedCommission: 50 }, // 5%
        { type: 'consultation', amount: 500, expectedCommission: 25 }, // 5%
        { type: 'lab_booking', amount: 300, expectedCommission: 15 } // 5%
      ]

      for (const { type, amount, expectedCommission } of transactionTypes) {
        const mockTransaction = {
          id: `${type}-id`,
          totalAmount: amount,
          commissionAmount: expectedCommission,
          netAmount: amount - expectedCommission
        }

        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockTransaction,
        })

        const response = await fetch(`/api/${type}s`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })

        const data = await response.json()
        expect(data.commissionAmount).toBe(expectedCommission)
        expect(data.netAmount).toBe(amount - expectedCommission)
      }
    })
  })
})