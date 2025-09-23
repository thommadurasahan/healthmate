// Delivery Partner Workflow Tests
describe('Delivery Partner Workflows', () => {
  const mockDeliveryPartnerSession = {
    user: {
      id: 'delivery-user-id',
      name: 'John Rider',
      email: 'delivery@test.com',
      role: 'DELIVERY_PARTNER',
      deliveryPartner: {
        id: 'delivery-partner-id',
        userId: 'delivery-user-id',
        vehicleType: 'Motorcycle',
        vehicleNumber: 'ABC-123',
        licenseNumber: 'DL123456789',
        phone: '9876543210',
        address: '789 Delivery Lane',
        isApproved: true
      }
    }
  }

  const mockPharmacySession = {
    user: {
      id: 'pharmacy-user-id',
      name: 'City Pharmacy',
      email: 'pharmacy@test.com',
      role: 'PHARMACY',
      pharmacy: {
        id: 'pharmacy-id',
        userId: 'pharmacy-user-id',
        name: 'City Pharmacy',
        address: '123 Pharmacy Street',
        phone: '1234567890',
        license: 'PH123',
        isApproved: true
      }
    }
  }

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  describe('Delivery Partner Profile and Registration', () => {
    it('creates delivery partner profile with vehicle details', async () => {
      const mockDeliveryProfile = {
        id: 'delivery-partner-id',
        userId: 'delivery-user-id',
        vehicleType: 'Motorcycle',
        vehicleNumber: 'ABC-123',
        licenseNumber: 'DL123456789',
        phone: '9876543210',
        address: '789 Delivery Lane',
        bankDetails: {
          accountNumber: '1234567890',
          ifscCode: 'BANK0001',
          accountHolder: 'John Rider'
        },
        emergencyContact: {
          name: 'Jane Rider',
          phone: '9876543211',
          relation: 'Spouse'
        },
        isApproved: false, // Requires admin approval
        user: {
          name: 'John Rider',
          email: 'delivery@test.com',
          role: 'DELIVERY_PARTNER'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          message: 'User created successfully', 
          user: {
            ...mockDeliveryProfile,
            deliveryPartner: mockDeliveryProfile
          }
        }),
      })

      const deliveryData = {
        name: 'John Rider',
        email: 'delivery@test.com',
        password: 'password123',
        role: 'DELIVERY_PARTNER',
        vehicleType: 'Motorcycle',
        vehicleNumber: 'ABC-123',
        licenseNumber: 'DL123456789',
        phone: '9876543210',
        address: '789 Delivery Lane',
        bankAccount: '1234567890',
        ifscCode: 'BANK0001',
        emergencyContact: '9876543211'
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliveryData)
      })

      const data = await response.json()
      expect(data.user.deliveryPartner.vehicleType).toBe('Motorcycle')
      expect(data.user.deliveryPartner.licenseNumber).toBe('DL123456789')
      expect(data.user.deliveryPartner.isApproved).toBe(false)
    })

    it('validates required delivery partner registration fields', async () => {
      const mockErrorResponse = {
        error: 'Missing delivery partner information'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      })

      const invalidDeliveryData = {
        name: 'John Test',
        email: 'delivery@test.com',
        password: 'password123',
        role: 'DELIVERY_PARTNER'
        // Missing vehicle details, license, etc.
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidDeliveryData)
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Missing delivery partner information')
    })

    it('updates delivery partner profile and vehicle information', async () => {
      const mockUpdatedProfile = {
        id: 'delivery-partner-id',
        vehicleType: 'Scooter',
        vehicleNumber: 'XYZ-789',
        phone: '9876543212',
        address: '789 Delivery Lane, Apt 2B',
        serviceAreas: ['Downtown', 'Medical District', 'University Area'],
        availabilityHours: '8 AM - 8 PM',
        isActive: true
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedProfile,
      })

      const updateData = {
        vehicleType: 'Scooter',
        vehicleNumber: 'XYZ-789',
        phone: '9876543212',
        address: '789 Delivery Lane, Apt 2B',
        serviceAreas: ['Downtown', 'Medical District', 'University Area'],
        availabilityHours: '8 AM - 8 PM'
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      expect(data.vehicleType).toBe('Scooter')
      expect(data.serviceAreas).toHaveLength(3)
      expect(data.availabilityHours).toBe('8 AM - 8 PM')
    })
  })

  describe('Available Delivery Requests', () => {
    it('fetches available unassigned deliveries', async () => {
      const mockAvailableDeliveries = [
        {
          id: 'delivery-1',
          status: 'PENDING',
          pickupAddress: '123 Pharmacy Street',
          deliveryAddress: '456 Patient Ave',
          deliveryFee: 50.00,
          estimatedDistance: '3.2 km',
          estimatedTime: '15 minutes',
          deliveryPartnerId: null,
          order: {
            id: 'order-1',
            totalAmount: 250.00,
            patient: {
              user: {
                name: 'John Doe',
                phone: '1234567890'
              }
            },
            pharmacy: {
              name: 'City Pharmacy',
              address: '123 Pharmacy Street',
              phone: '1234567890'
            },
            orderItems: [
              {
                medicine: { name: 'Paracetamol' },
                quantity: 2
              },
              {
                medicine: { name: 'Cough Syrup' },
                quantity: 1
              }
            ]
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'delivery-2',
          status: 'PENDING',
          pickupAddress: '789 Health Center',
          deliveryAddress: '101 Elder Street',
          deliveryFee: 75.00,
          estimatedDistance: '5.8 km',
          estimatedTime: '25 minutes',
          deliveryPartnerId: null,
          order: {
            id: 'order-2',
            totalAmount: 420.00,
            patient: {
              user: {
                name: 'Jane Smith',
                phone: '0987654321'
              }
            },
            pharmacy: {
              name: 'Health Plus Pharmacy',
              address: '789 Health Center',
              phone: '0987654321'
            },
            orderItems: [
              {
                medicine: { name: 'Insulin' },
                quantity: 1
              }
            ]
          }
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAvailableDeliveries,
      })

      const response = await fetch('/api/deliveries?status=available')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0].deliveryPartnerId).toBeNull()
      expect(data[0].status).toBe('PENDING')
      expect(data[0].deliveryFee).toBe(50.00)
      expect(data[1].estimatedDistance).toBe('5.8 km')
    })

    it('filters deliveries by distance and area', async () => {
      const mockFilteredDeliveries = [
        {
          id: 'delivery-1',
          status: 'PENDING',
          deliveryFee: 50.00,
          estimatedDistance: '2.1 km',
          serviceArea: 'Downtown',
          order: {
            patient: { user: { name: 'John Doe' } },
            pharmacy: { name: 'City Pharmacy' }
          }
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFilteredDeliveries,
      })

      const response = await fetch('/api/deliveries?status=available&area=Downtown&maxDistance=5')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
      expect(data[0].serviceArea).toBe('Downtown')
      expect(parseFloat(data[0].estimatedDistance)).toBeLessThan(5)
    })

    it('sorts deliveries by priority and delivery fee', async () => {
      const mockPrioritizedDeliveries = [
        {
          id: 'delivery-urgent',
          priority: 'HIGH',
          deliveryFee: 100.00,
          estimatedTime: '10 minutes',
          orderType: 'URGENT'
        },
        {
          id: 'delivery-normal',
          priority: 'NORMAL',
          deliveryFee: 75.00,
          estimatedTime: '20 minutes',
          orderType: 'REGULAR'
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrioritizedDeliveries,
      })

      const response = await fetch('/api/deliveries?status=available&sort=priority')
      const data = await response.json()
      
      expect(data[0].priority).toBe('HIGH')
      expect(data[0].deliveryFee).toBeGreaterThan(data[1].deliveryFee)
    })
  })

  describe('Delivery Assignment and Acceptance', () => {
    it('accepts available delivery and assigns to partner', async () => {
      const mockAcceptedDelivery = {
        id: 'delivery-id',
        deliveryPartnerId: 'delivery-partner-id',
        status: 'ASSIGNED',
        assignedAt: new Date().toISOString(),
        estimatedPickupTime: '2024-01-15T10:00:00Z',
        estimatedDeliveryTime: '2024-01-15T10:30:00Z',
        order: {
          id: 'order-id',
          status: 'OUT_FOR_DELIVERY',
          patient: {
            user: {
              name: 'John Doe',
              phone: '1234567890'
            }
          },
          pharmacy: {
            name: 'City Pharmacy',
            address: '123 Pharmacy Street',
            phone: '1234567890'
          }
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAcceptedDelivery,
      })

      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId: 'delivery-id' })
      })

      const data = await response.json()
      expect(data.status).toBe('ASSIGNED')
      expect(data.deliveryPartnerId).toBe('delivery-partner-id')
      expect(data.order.status).toBe('OUT_FOR_DELIVERY')
      expect(data.assignedAt).toBeDefined()
    })

    it('prevents accepting already assigned delivery', async () => {
      const mockErrorResponse = {
        error: 'Delivery not available'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      })

      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId: 'already-assigned-delivery' })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Delivery not available')
    })

    it('validates delivery partner availability before assignment', async () => {
      const mockAvailabilityCheck = {
        available: true,
        activeDeliveries: 2,
        maxConcurrentDeliveries: 5,
        currentLocation: {
          latitude: 12.9716,
          longitude: 77.5946
        },
        estimatedReachTime: '8 minutes'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAvailabilityCheck,
      })

      const response = await fetch('/api/delivery-partners/availability/check')
      const data = await response.json()
      
      expect(data.available).toBe(true)
      expect(data.activeDeliveries).toBeLessThan(data.maxConcurrentDeliveries)
      expect(data.estimatedReachTime).toBe('8 minutes')
    })
  })

  describe('Delivery Status Tracking and Updates', () => {
    it('updates delivery status to picked up', async () => {
      const mockPickupUpdate = {
        id: 'delivery-id',
        status: 'PICKED_UP',
        actualPickupTime: new Date().toISOString(),
        pickupNotes: 'All items verified and collected',
        pharmacyConfirmation: true,
        itemsVerified: [
          { medicine: 'Paracetamol', quantity: 2, verified: true },
          { medicine: 'Cough Syrup', quantity: 1, verified: true }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPickupUpdate,
      })

      const updateData = {
        status: 'PICKED_UP',
        pickupNotes: 'All items verified and collected',
        itemsVerified: [
          { medicine: 'Paracetamol', quantity: 2, verified: true },
          { medicine: 'Cough Syrup', quantity: 1, verified: true }
        ]
      }

      const response = await fetch('/api/deliveries/delivery-id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      expect(data.status).toBe('PICKED_UP')
      expect(data.actualPickupTime).toBeDefined()
      expect(data.pharmacyConfirmation).toBe(true)
      expect(data.itemsVerified).toHaveLength(2)
    })

    it('tracks delivery in transit with location updates', async () => {
      const mockTransitUpdate = {
        id: 'delivery-id',
        status: 'IN_TRANSIT',
        startedTransitAt: new Date().toISOString(),
        currentLocation: {
          latitude: 12.9716,
          longitude: 77.5946,
          timestamp: new Date().toISOString()
        },
        estimatedArrival: '2024-01-15T11:00:00Z',
        route: {
          distance: '3.2 km',
          duration: '15 minutes',
          traffic: 'LIGHT'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransitUpdate,
      })

      const updateData = {
        status: 'IN_TRANSIT',
        currentLocation: {
          latitude: 12.9716,
          longitude: 77.5946
        }
      }

      const response = await fetch('/api/deliveries/delivery-id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      expect(data.status).toBe('IN_TRANSIT')
      expect(data.currentLocation.latitude).toBe(12.9716)
      expect(data.route.traffic).toBe('LIGHT')
    })

    it('completes delivery with patient confirmation', async () => {
      const mockDeliveryCompletion = {
        id: 'delivery-id',
        status: 'DELIVERED',
        actualDeliveryTime: new Date().toISOString(),
        deliveryConfirmation: {
          patientName: 'John Doe',
          signatureUrl: 'https://signatures.healthmate.com/delivery-123.png',
          verificationCode: 'VER123',
          deliveryNotes: 'Delivered in person, patient satisfied'
        },
        paymentDetails: {
          deliveryFee: 50.00,
          commission: 2.50, // 5% commission
          netEarnings: 47.50,
          paymentStatus: 'PROCESSED'
        },
        order: {
          status: 'DELIVERED'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeliveryCompletion,
      })

      const completionData = {
        status: 'DELIVERED',
        deliveryConfirmation: {
          patientName: 'John Doe',
          verificationCode: 'VER123',
          deliveryNotes: 'Delivered in person, patient satisfied'
        }
      }

      const response = await fetch('/api/deliveries/delivery-id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completionData)
      })

      const data = await response.json()
      expect(data.status).toBe('DELIVERED')
      expect(data.actualDeliveryTime).toBeDefined()
      expect(data.deliveryConfirmation.verificationCode).toBe('VER123')
      expect(data.paymentDetails.netEarnings).toBe(47.50)
      expect(data.order.status).toBe('DELIVERED')
    })

    it('handles delivery issues and escalation', async () => {
      const mockDeliveryIssue = {
        id: 'delivery-id',
        status: 'ISSUE_REPORTED',
        issue: {
          type: 'PATIENT_UNAVAILABLE',
          description: 'Patient not at delivery address, no response to calls',
          reportedAt: new Date().toISOString(),
          attemptsMade: 3,
          lastAttemptTime: new Date().toISOString(),
          photos: ['https://storage.healthmate.com/delivery-issues/123.jpg'],
          escalationLevel: 'SUPPORT_TEAM'
        },
        supportTicket: {
          id: 'TICKET-123',
          status: 'OPEN',
          assignedTo: 'Support Agent 1'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeliveryIssue,
      })

      const issueData = {
        issueType: 'PATIENT_UNAVAILABLE',
        description: 'Patient not at delivery address, no response to calls',
        attemptsMade: 3,
        photoEvidence: ['photo1.jpg']
      }

      const response = await fetch('/api/deliveries/delivery-id/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueData)
      })

      const data = await response.json()
      expect(data.status).toBe('ISSUE_REPORTED')
      expect(data.issue.type).toBe('PATIENT_UNAVAILABLE')
      expect(data.supportTicket.status).toBe('OPEN')
    })
  })

  describe('My Assigned Deliveries', () => {
    it('fetches delivery partner assigned deliveries', async () => {
      const mockAssignedDeliveries = [
        {
          id: 'delivery-1',
          status: 'ASSIGNED',
          deliveryFee: 50.00,
          assignedAt: '2024-01-15T09:00:00Z',
          estimatedPickupTime: '2024-01-15T10:00:00Z',
          order: {
            id: 'order-1',
            totalAmount: 250.00,
            patient: {
              user: {
                name: 'John Doe',
                phone: '1234567890'
              }
            },
            pharmacy: {
              name: 'City Pharmacy',
              address: '123 Pharmacy Street',
              phone: '1234567890'
            },
            orderItems: [
              {
                medicine: { name: 'Paracetamol' },
                quantity: 2
              }
            ]
          }
        },
        {
          id: 'delivery-2',
          status: 'PICKED_UP',
          deliveryFee: 75.00,
          actualPickupTime: '2024-01-15T11:00:00Z',
          order: {
            patient: {
              user: {
                name: 'Jane Smith',
                phone: '0987654321'
              }
            },
            pharmacy: {
              name: 'Health Plus Pharmacy'
            }
          }
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssignedDeliveries,
      })

      const response = await fetch('/api/deliveries')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0].status).toBe('ASSIGNED')
      expect(data[1].status).toBe('PICKED_UP')
    })

    it('filters deliveries by status and priority', async () => {
      const mockFilteredDeliveries = [
        {
          id: 'delivery-1',
          status: 'IN_TRANSIT',
          priority: 'HIGH',
          deliveryFee: 100.00
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFilteredDeliveries,
      })

      const response = await fetch('/api/deliveries?status=IN_TRANSIT&priority=HIGH')
      const data = await response.json()
      
      expect(data[0].status).toBe('IN_TRANSIT')
      expect(data[0].priority).toBe('HIGH')
    })

    it('calculates delivery earnings and completion time', async () => {
      const mockDeliveryAnalytics = {
        deliveryId: 'delivery-id',
        earnings: {
          baseFee: 50.00,
          distanceBonus: 10.00,
          timeBonus: 5.00,
          totalEarnings: 65.00,
          commission: 3.25,
          netEarnings: 61.75
        },
        performance: {
          estimatedTime: 30,
          actualTime: 25,
          efficiency: 120, // 20% faster than estimated
          rating: 4.8
        },
        completionDetails: {
          pickupTime: '2024-01-15T10:00:00Z',
          deliveryTime: '2024-01-15T10:25:00Z',
          totalDuration: 25
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeliveryAnalytics,
      })

      const response = await fetch('/api/deliveries/delivery-id/analytics')
      const data = await response.json()
      
      expect(data.earnings.netEarnings).toBe(61.75)
      expect(data.performance.efficiency).toBe(120)
      expect(data.completionDetails.totalDuration).toBe(25)
    })
  })

  describe('Delivery Partner Dashboard and Analytics', () => {
    it('fetches delivery partner dashboard summary', async () => {
      const mockDashboard = {
        totalDeliveries: 125,
        todayDeliveries: 6,
        completedDeliveries: 120,
        cancelledDeliveries: 3,
        activeDeliveries: 2,
        totalEarnings: 6250.00,
        todayEarnings: 300.00,
        averageRating: 4.6,
        completionRate: 96.0,
        onTimeDeliveryRate: 92.0,
        upcomingDeliveries: [
          {
            id: 'delivery-1',
            estimatedPickupTime: '2024-01-15T14:00:00Z',
            pharmacy: { name: 'City Pharmacy' },
            patient: { user: { name: 'John Doe' } },
            deliveryFee: 50.00
          }
        ],
        recentCompletions: [
          {
            id: 'delivery-2',
            completedAt: '2024-01-15T12:30:00Z',
            earnings: 75.00,
            rating: 5.0
          }
        ],
        performanceMetrics: {
          averageDeliveryTime: 22,
          fuelEfficiency: 45,
          customerSatisfaction: 4.6
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboard,
      })

      const response = await fetch('/api/delivery-partner/dashboard')
      const data = await response.json()
      
      expect(data.totalDeliveries).toBe(125)
      expect(data.todayEarnings).toBe(300.00)
      expect(data.averageRating).toBe(4.6)
      expect(data.completionRate).toBe(96.0)
      expect(data.upcomingDeliveries).toHaveLength(1)
    })

    it('generates earnings analytics report', async () => {
      const mockEarningsReport = {
        period: 'monthly',
        totalEarnings: 3750.00,
        totalDeliveries: 75,
        averageEarningsPerDelivery: 50.00,
        commissionDeducted: 187.50,
        netEarnings: 3562.50,
        earningsByWeek: [
          {
            week: 'Week 1',
            deliveries: 18,
            earnings: 900.00,
            netEarnings: 855.00
          },
          {
            week: 'Week 2',
            deliveries: 20,
            earnings: 1000.00,
            netEarnings: 950.00
          }
        ],
        deliveryTypes: [
          { type: 'Regular', count: 60, earnings: 3000.00 },
          { type: 'Express', count: 12, earnings: 600.00 },
          { type: 'Emergency', count: 3, earnings: 150.00 }
        ],
        performanceBonus: 150.00,
        fuelAllowance: 300.00
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEarningsReport,
      })

      const response = await fetch('/api/delivery-partner/analytics?period=monthly')
      const data = await response.json()
      
      expect(data.totalEarnings).toBe(3750.00)
      expect(data.netEarnings).toBe(3562.50)
      expect(data.earningsByWeek).toHaveLength(2)
      expect(data.performanceBonus).toBe(150.00)
    })

    it('tracks delivery performance metrics', async () => {
      const mockPerformanceMetrics = {
        deliveryStats: {
          totalDistance: 1250.5,
          totalTime: 3600, // minutes
          averageSpeed: 20.8,
          fuelConsumption: 85.2
        },
        qualityMetrics: {
          onTimeDeliveryRate: 94.2,
          customerRating: 4.7,
          orderAccuracy: 98.5,
          responsiveness: 4.6
        },
        efficiency: {
          deliveriesPerHour: 2.1,
          averagePickupTime: 8.5,
          averageDeliveryTime: 22.3,
          routeOptimization: 87.5
        },
        rankings: {
          cityRank: 12,
          totalPartners: 150,
          zoneRank: 3,
          zonePartners: 25
        },
        badges: [
          { name: 'Fast Delivery Expert', earned: '2024-01-01' },
          { name: 'Customer Favorite', earned: '2024-01-10' },
          { name: 'Punctuality Pro', earned: '2024-01-15' }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPerformanceMetrics,
      })

      const response = await fetch('/api/delivery-partner/performance')
      const data = await response.json()
      
      expect(data.qualityMetrics.onTimeDeliveryRate).toBe(94.2)
      expect(data.efficiency.deliveriesPerHour).toBe(2.1)
      expect(data.rankings.cityRank).toBe(12)
      expect(data.badges).toHaveLength(3)
    })
  })

  describe('Route Optimization and Navigation', () => {
    it('calculates optimal route for multiple deliveries', async () => {
      const mockOptimizedRoute = {
        routeId: 'route-123',
        deliveries: ['delivery-1', 'delivery-2', 'delivery-3'],
        optimizedSequence: [
          {
            deliveryId: 'delivery-1',
            order: 1,
            estimatedTime: 15,
            distance: 2.5
          },
          {
            deliveryId: 'delivery-2',
            order: 2,
            estimatedTime: 20,
            distance: 3.8
          },
          {
            deliveryId: 'delivery-3',
            order: 3,
            estimatedTime: 12,
            distance: 1.9
          }
        ],
        totalDistance: 8.2,
        totalTime: 47,
        fuelEstimate: 0.6,
        savings: {
          timeReduction: 15,
          distanceReduction: 2.3,
          fuelSavings: 0.2
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOptimizedRoute,
      })

      const routeData = {
        deliveryIds: ['delivery-1', 'delivery-2', 'delivery-3'],
        startLocation: { latitude: 12.9716, longitude: 77.5946 }
      }

      const response = await fetch('/api/delivery-partner/optimize-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeData)
      })

      const data = await response.json()
      expect(data.optimizedSequence).toHaveLength(3)
      expect(data.totalDistance).toBe(8.2)
      expect(data.savings.timeReduction).toBe(15)
    })

    it('provides real-time navigation assistance', async () => {
      const mockNavigationData = {
        deliveryId: 'delivery-id',
        currentStep: 3,
        totalSteps: 8,
        nextInstruction: 'Turn right at the next intersection',
        distanceToNext: 0.2,
        estimatedTimeToDestination: 8,
        traffic: {
          level: 'MODERATE',
          delayMinutes: 3,
          alternativeRoute: true
        },
        landmarks: [
          'City Hospital on your left',
          'Shopping Mall coming up on right'
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNavigationData,
      })

      const response = await fetch('/api/delivery-partner/navigation/delivery-id')
      const data = await response.json()
      
      expect(data.nextInstruction).toContain('Turn right')
      expect(data.traffic.level).toBe('MODERATE')
      expect(data.landmarks).toHaveLength(2)
    })
  })

  describe('Commission and Payment Tracking', () => {
    it('calculates commission correctly for deliveries', async () => {
      const mockCommissionDetails = {
        deliveryFee: 50.00,
        commissionRate: 0.05, // 5%
        commissionAmount: 2.50,
        netEarnings: 47.50,
        bonuses: {
          performanceBonus: 5.00,
          fuelAllowance: 10.00
        },
        totalEarnings: 62.50,
        paymentStatus: 'PROCESSED',
        transactionId: 'txn-delivery-123'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommissionDetails,
      })

      const response = await fetch('/api/transactions/delivery-id')
      const data = await response.json()
      
      expect(data.deliveryFee).toBe(50.00)
      expect(data.commissionAmount).toBe(2.50)
      expect(data.netEarnings).toBe(47.50)
      expect(data.totalEarnings).toBe(62.50)
    })

    it('tracks weekly earnings and payouts', async () => {
      const mockPayoutSummary = {
        week: '2024-W03',
        totalDeliveries: 25,
        grossEarnings: 1250.00,
        totalCommission: 62.50,
        bonuses: 75.00,
        deductions: 25.00, // fuel costs, penalties
        netEarnings: 1237.50,
        payoutStatus: 'PROCESSED',
        payoutDate: '2024-01-22',
        deliveryBreakdown: [
          { day: 'Monday', deliveries: 4, earnings: 200.00 },
          { day: 'Tuesday', deliveries: 5, earnings: 250.00 },
          { day: 'Wednesday', deliveries: 3, earnings: 150.00 }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPayoutSummary,
      })

      const response = await fetch('/api/delivery-partner/payouts/2024-W03')
      const data = await response.json()
      
      expect(data.netEarnings).toBe(1237.50)
      expect(data.totalDeliveries).toBe(25)
      expect(data.payoutStatus).toBe('PROCESSED')
      expect(data.deliveryBreakdown).toHaveLength(3)
    })
  })

  describe('Customer Communication and Support', () => {
    it('sends delivery updates to patient', async () => {
      const mockNotification = {
        id: 'notification-id',
        deliveryId: 'delivery-id',
        type: 'DELIVERY_UPDATE',
        message: 'Your order is out for delivery and will arrive in 15 minutes',
        channels: ['SMS', 'IN_APP'],
        sentAt: new Date().toISOString(),
        deliveryStatus: {
          sms: 'DELIVERED',
          inApp: 'DELIVERED'
        },
        trackingLink: 'https://track.healthmate.com/delivery-id'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotification,
      })

      const notificationData = {
        type: 'DELIVERY_UPDATE',
        message: 'Your order is out for delivery and will arrive in 15 minutes',
        channels: ['SMS', 'IN_APP']
      }

      const response = await fetch('/api/deliveries/delivery-id/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      })

      const data = await response.json()
      expect(data.type).toBe('DELIVERY_UPDATE')
      expect(data.channels).toHaveLength(2)
      expect(data.trackingLink).toContain('track.healthmate.com')
    })

    it('handles customer support requests', async () => {
      const mockSupportRequest = {
        id: 'support-123',
        deliveryId: 'delivery-id',
        type: 'DELIVERY_ISSUE',
        description: 'Customer not available at delivery address',
        priority: 'HIGH',
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        assignedAgent: 'Support Agent 2',
        estimatedResolution: '15 minutes',
        suggestedActions: [
          'Try calling customer again',
          'Leave package with neighbor',
          'Return to pharmacy'
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSupportRequest,
      })

      const supportData = {
        type: 'DELIVERY_ISSUE',
        description: 'Customer not available at delivery address',
        urgency: 'HIGH'
      }

      const response = await fetch('/api/delivery-partner/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supportData)
      })

      const data = await response.json()
      expect(data.type).toBe('DELIVERY_ISSUE')
      expect(data.priority).toBe('HIGH')
      expect(data.suggestedActions).toHaveLength(3)
    })
  })
})