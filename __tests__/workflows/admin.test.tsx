// Admin Workflow Tests
describe('Admin Workflows', () => {
  const mockAdminSession = {
    user: {
      id: 'admin-user-id',
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'ADMIN',
      admin: {
        id: 'admin-id',
        userId: 'admin-user-id',
        permissions: ['USER_MANAGEMENT', 'ANALYTICS', 'SYSTEM_CONFIG', 'FINANCIAL_OVERSIGHT'],
        accessLevel: 'SUPER_ADMIN'
      }
    }
  }

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  describe('User Management and Approval', () => {
    it('fetches all users with role filtering', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'Dr. John Smith',
          email: 'doctor@test.com',
          role: 'DOCTOR',
          isApproved: false,
          createdAt: '2024-01-15T10:00:00Z',
          doctor: {
            id: 'doctor-id',
            specialization: 'Cardiology',
            license: 'DOC123'
          },
          _count: {
            orders: 0,
            transactions: 0,
            notifications: 2
          }
        },
        {
          id: 'user-2',
          name: 'City Pharmacy',
          email: 'pharmacy@test.com',
          role: 'PHARMACY',
          isApproved: true,
          createdAt: '2024-01-10T09:00:00Z',
          pharmacy: {
            id: 'pharmacy-id',
            name: 'City Pharmacy',
            license: 'PH123'
          },
          _count: {
            orders: 25,
            transactions: 30,
            notifications: 5
          }
        },
        {
          id: 'user-3',
          name: 'John Rider',
          email: 'delivery@test.com',
          role: 'DELIVERY_PARTNER',
          isApproved: false,
          createdAt: '2024-01-12T14:00:00Z',
          deliveryPartner: {
            id: 'delivery-id',
            vehicleType: 'Motorcycle',
            licenseNumber: 'DL123'
          },
          _count: {
            orders: 0,
            transactions: 0,
            notifications: 1
          }
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      })

      const response = await fetch('/api/admin/users?role=DOCTOR&status=pending')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(3)
      expect(data[0].role).toBe('DOCTOR')
      expect(data[0].isApproved).toBe(false)
      expect(data[1].pharmacy.name).toBe('City Pharmacy')
    })

    it('approves pending user registrations', async () => {
      const mockApprovalResponse = {
        message: 'Users approved successfully',
        approvedUsers: [
          {
            id: 'user-1',
            name: 'Dr. John Smith',
            role: 'DOCTOR',
            isApproved: true,
            approvedAt: new Date().toISOString()
          },
          {
            id: 'user-3',
            name: 'John Rider',
            role: 'DELIVERY_PARTNER',
            isApproved: true,
            approvedAt: new Date().toISOString()
          }
        ],
        notificationsSent: 2
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApprovalResponse,
      })

      const approvalData = {
        userIds: ['user-1', 'user-3'],
        action: 'approve'
      }

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalData)
      })

      const data = await response.json()
      expect(data.message).toContain('approved successfully')
      expect(data.approvedUsers).toHaveLength(2)
      expect(data.notificationsSent).toBe(2)
    })

    it('rejects user applications with notifications', async () => {
      const mockRejectionResponse = {
        message: 'Users rejected successfully',
        rejectedUsers: [
          {
            id: 'user-1',
            name: 'Invalid Doctor',
            role: 'DOCTOR',
            isApproved: false,
            rejectedAt: new Date().toISOString(),
            rejectionReason: 'Invalid medical license'
          }
        ],
        notificationsSent: 1
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRejectionResponse,
      })

      const rejectionData = {
        userIds: ['user-1'],
        action: 'reject',
        reason: 'Invalid medical license'
      }

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rejectionData)
      })

      const data = await response.json()
      expect(data.message).toContain('rejected successfully')
      expect(data.rejectedUsers[0].rejectionReason).toBe('Invalid medical license')
    })

    it('searches users by name and email', async () => {
      const mockSearchResults = [
        {
          id: 'user-1',
          name: 'John Smith',
          email: 'john.smith@test.com',
          role: 'DOCTOR'
        },
        {
          id: 'user-2',
          name: 'John Rider',
          email: 'john.rider@test.com',
          role: 'DELIVERY_PARTNER'
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      })

      const response = await fetch('/api/admin/users?search=john')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0].name).toContain('John')
      expect(data[1].name).toContain('John')
    })

    it('handles bulk user operations', async () => {
      const mockBulkResponse = {
        success: true,
        processedUsers: 5,
        operations: [
          { userId: 'user-1', action: 'approve', status: 'completed' },
          { userId: 'user-2', action: 'approve', status: 'completed' },
          { userId: 'user-3', action: 'reject', status: 'completed' }
        ],
        notificationsSent: 3,
        errors: []
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBulkResponse,
      })

      const bulkData = {
        operations: [
          { userId: 'user-1', action: 'approve' },
          { userId: 'user-2', action: 'approve' },
          { userId: 'user-3', action: 'reject' }
        ]
      }

      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData)
      })

      const data = await response.json()
      expect(data.processedUsers).toBe(5)
      expect(data.operations).toHaveLength(3)
      expect(data.errors).toHaveLength(0)
    })
  })

  describe('Platform Analytics and Reporting', () => {
    it('fetches comprehensive platform analytics', async () => {
      const mockAnalytics = {
        period: '30 days',
        userRegistrations: [
          { role: 'PATIENT', _count: { id: 150 } },
          { role: 'PHARMACY', _count: { id: 12 } },
          { role: 'DOCTOR', _count: { id: 8 } },
          { role: 'LABORATORY', _count: { id: 5 } },
          { role: 'DELIVERY_PARTNER', _count: { id: 15 } }
        ],
        revenue: {
          orders: {
            total: 125000.00,
            commission: 6250.00,
            count: 250
          },
          labBookings: {
            total: 45000.00,
            commission: 2250.00,
            count: 90
          },
          appointments: {
            total: 36000.00,
            commission: 1800.00,
            count: 60
          }
        },
        dailyRevenue: [
          { date: '2024-01-15', revenue: 5000.00, orders: 10 },
          { date: '2024-01-14', revenue: 4500.00, orders: 9 },
          { date: '2024-01-13', revenue: 6200.00, orders: 12 }
        ],
        topPharmacies: [
          {
            id: 'pharmacy-1',
            name: 'City Pharmacy',
            totalOrders: 45,
            totalRevenue: 22500.00,
            totalCommission: 1125.00
          },
          {
            id: 'pharmacy-2',
            name: 'Health Plus',
            totalOrders: 38,
            totalRevenue: 19000.00,
            totalCommission: 950.00
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
      })

      const response = await fetch('/api/admin/analytics?period=30')
      const data = await response.json()
      
      expect(data.period).toBe('30 days')
      expect(data.userRegistrations).toHaveLength(5)
      expect(data.revenue.orders.total).toBe(125000.00)
      expect(data.topPharmacies).toHaveLength(2)
      expect(data.dailyRevenue).toHaveLength(3)
    })

    it('generates revenue breakdown by service type', async () => {
      const mockRevenueBreakdown = {
        totalRevenue: 206000.00,
        totalCommission: 10300.00,
        serviceBreakdown: [
          {
            service: 'Medicine Orders',
            revenue: 125000.00,
            commission: 6250.00,
            percentage: 60.7,
            count: 250
          },
          {
            service: 'Lab Tests',
            revenue: 45000.00,
            commission: 2250.00,
            percentage: 21.8,
            count: 90
          },
          {
            service: 'Doctor Consultations',
            revenue: 36000.00,
            commission: 1800.00,
            percentage: 17.5,
            count: 60
          }
        ],
        monthlyTrend: [
          { month: '2024-01', revenue: 206000.00, growth: 15.2 },
          { month: '2023-12', revenue: 179000.00, growth: 8.7 }
        ],
        commissionDistribution: {
          platform: 10300.00,
          payouts: 195700.00
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRevenueBreakdown,
      })

      const response = await fetch('/api/admin/analytics/revenue')
      const data = await response.json()
      
      expect(data.totalRevenue).toBe(206000.00)
      expect(data.serviceBreakdown).toHaveLength(3)
      expect(data.serviceBreakdown[0].percentage).toBe(60.7)
      expect(data.commissionDistribution.platform).toBe(10300.00)
    })

    it('tracks user engagement metrics', async () => {
      const mockEngagementMetrics = {
        activeUsers: {
          daily: 145,
          weekly: 320,
          monthly: 580
        },
        userActivity: [
          { role: 'PATIENT', activeUsers: 450, orders: 250, avgSessionTime: 12.5 },
          { role: 'PHARMACY', activeUsers: 35, orders: 250, avgResponseTime: 8.2 },
          { role: 'DOCTOR', activeUsers: 22, appointments: 60, avgConsultationTime: 25.3 },
          { role: 'DELIVERY_PARTNER', activeUsers: 18, deliveries: 180, avgDeliveryTime: 22.1 }
        ],
        platformMetrics: {
          orderCompletionRate: 94.2,
          averageOrderValue: 500.00,
          customerSatisfactionScore: 4.6,
          systemUptime: 99.8
        },
        geographicDistribution: [
          { region: 'Downtown', users: 180, orders: 120 },
          { region: 'Medical District', users: 95, orders: 85 },
          { region: 'University Area', users: 125, orders: 45 }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEngagementMetrics,
      })

      const response = await fetch('/api/admin/analytics/engagement')
      const data = await response.json()
      
      expect(data.activeUsers.monthly).toBe(580)
      expect(data.userActivity).toHaveLength(4)
      expect(data.platformMetrics.orderCompletionRate).toBe(94.2)
      expect(data.geographicDistribution).toHaveLength(3)
    })
  })

  describe('Admin Dashboard Overview', () => {
    it('fetches admin dashboard summary', async () => {
      const mockDashboard = {
        totalUsers: 850,
        pendingApprovals: 8,
        totalOrders: 2450,
        totalRevenue: 1225000.00,
        totalCommissions: 61250.00,
        pendingUsers: [
          {
            id: 'user-1',
            name: 'Dr. New Doctor',
            email: 'newdoc@test.com',
            role: 'DOCTOR',
            createdAt: '2024-01-15T10:00:00Z'
          },
          {
            id: 'user-2',
            name: 'New Pharmacy',
            email: 'newpharm@test.com',
            role: 'PHARMACY',
            createdAt: '2024-01-15T09:00:00Z'
          }
        ],
        recentTransactions: [
          {
            id: 'txn-1',
            amount: 250.00,
            type: 'ORDER',
            status: 'COMPLETED',
            createdAt: '2024-01-15T12:00:00Z',
            user: { name: 'John Doe' }
          },
          {
            id: 'txn-2',
            amount: 600.00,
            type: 'CONSULTATION',
            status: 'COMPLETED',
            createdAt: '2024-01-15T11:30:00Z',
            user: { name: 'Jane Smith' }
          }
        ],
        systemHealth: {
          serverStatus: 'HEALTHY',
          databaseStatus: 'HEALTHY',
          apiResponseTime: 125,
          errorRate: 0.02
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboard,
      })

      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()
      
      expect(data.totalUsers).toBe(850)
      expect(data.pendingApprovals).toBe(8)
      expect(data.totalRevenue).toBe(1225000.00)
      expect(data.pendingUsers).toHaveLength(2)
      expect(data.recentTransactions).toHaveLength(2)
      expect(data.systemHealth.serverStatus).toBe('HEALTHY')
    })

    it('monitors system performance metrics', async () => {
      const mockSystemMetrics = {
        performance: {
          averageResponseTime: 142,
          peakResponseTime: 890,
          requestsPerMinute: 45,
          errorRate: 0.018,
          uptime: 99.94
        },
        database: {
          connectionCount: 12,
          queryPerformance: 85,
          storageUsed: 2.4, // GB
          backupStatus: 'COMPLETED',
          lastBackup: '2024-01-15T02:00:00Z'
        },
        traffic: {
          totalRequests: 125000,
          uniqueVisitors: 2300,
          pageViews: 18500,
          bounceRate: 12.5
        },
        errors: [
          {
            timestamp: '2024-01-15T10:30:00Z',
            level: 'WARNING',
            message: 'High response time detected',
            count: 3
          },
          {
            timestamp: '2024-01-15T09:15:00Z',
            level: 'ERROR',
            message: 'Payment gateway timeout',
            count: 1
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSystemMetrics,
      })

      const response = await fetch('/api/admin/system/metrics')
      const data = await response.json()
      
      expect(data.performance.uptime).toBe(99.94)
      expect(data.database.connectionCount).toBe(12)
      expect(data.traffic.uniqueVisitors).toBe(2300)
      expect(data.errors).toHaveLength(2)
    })
  })

  describe('Financial Oversight and Commission Management', () => {
    it('manages commission rates and policies', async () => {
      const mockCommissionConfig = {
        defaultCommissionRate: 0.05, // 5%
        serviceCommissions: [
          { service: 'MEDICINE_ORDER', rate: 0.05, minimumAmount: 10.00 },
          { service: 'LAB_BOOKING', rate: 0.05, minimumAmount: 15.00 },
          { service: 'CONSULTATION', rate: 0.05, minimumAmount: 25.00 },
          { service: 'DELIVERY', rate: 0.05, minimumAmount: 5.00 }
        ],
        tierBasedCommissions: [
          { tier: 'BRONZE', monthlyVolume: 0, rate: 0.05 },
          { tier: 'SILVER', monthlyVolume: 50000, rate: 0.045 },
          { tier: 'GOLD', monthlyVolume: 100000, rate: 0.04 },
          { tier: 'PLATINUM', monthlyVolume: 200000, rate: 0.035 }
        ],
        payoutSchedule: {
          frequency: 'WEEKLY',
          cutoffDay: 'SUNDAY',
          payoutDay: 'WEDNESDAY',
          minimumPayout: 100.00
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommissionConfig,
      })

      const response = await fetch('/api/admin/commission/config')
      const data = await response.json()
      
      expect(data.defaultCommissionRate).toBe(0.05)
      expect(data.serviceCommissions).toHaveLength(4)
      expect(data.tierBasedCommissions).toHaveLength(4)
      expect(data.payoutSchedule.frequency).toBe('WEEKLY')
    })

    it('tracks financial transactions and settlements', async () => {
      const mockFinancialSummary = {
        totalTransactionVolume: 1500000.00,
        totalCommissionsEarned: 75000.00,
        totalPayoutsProcessed: 1425000.00,
        pendingPayouts: {
          amount: 45000.00,
          count: 125,
          nextPayoutDate: '2024-01-17T00:00:00Z'
        },
        transactionsByType: [
          { type: 'MEDICINE_ORDER', volume: 900000.00, commission: 45000.00 },
          { type: 'LAB_BOOKING', volume: 350000.00, commission: 17500.00 },
          { type: 'CONSULTATION', volume: 250000.00, commission: 12500.00 }
        ],
        payoutHistory: [
          {
            date: '2024-01-10',
            amount: 285000.00,
            recipientCount: 245,
            status: 'COMPLETED'
          },
          {
            date: '2024-01-03',
            amount: 267000.00,
            recipientCount: 238,
            status: 'COMPLETED'
          }
        ],
        disputesAndRefunds: {
          totalDisputes: 8,
          resolvedDisputes: 6,
          totalRefunds: 2450.00
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialSummary,
      })

      const response = await fetch('/api/admin/financial/summary')
      const data = await response.json()
      
      expect(data.totalCommissionsEarned).toBe(75000.00)
      expect(data.pendingPayouts.count).toBe(125)
      expect(data.transactionsByType).toHaveLength(3)
      expect(data.payoutHistory).toHaveLength(2)
    })

    it('generates financial reports and audits', async () => {
      const mockFinancialReport = {
        reportId: 'RPT-2024-001',
        period: 'Q1 2024',
        generatedAt: new Date().toISOString(),
        summary: {
          totalRevenue: 2250000.00,
          totalCommissions: 112500.00,
          netPayouts: 2137500.00,
          transactionCount: 4500,
          averageTransactionValue: 500.00
        },
        monthlyBreakdown: [
          { month: 'January', revenue: 800000.00, commission: 40000.00 },
          { month: 'February', revenue: 750000.00, commission: 37500.00 },
          { month: 'March', revenue: 700000.00, commission: 35000.00 }
        ],
        partnerPerformance: [
          {
            partnerId: 'pharmacy-1',
            partnerName: 'City Pharmacy',
            revenue: 125000.00,
            commission: 6250.00,
            transactionCount: 250
          }
        ],
        auditChecks: [
          { check: 'Commission calculations', status: 'PASSED', variance: 0.001 },
          { check: 'Payout reconciliation', status: 'PASSED', variance: 0.000 },
          { check: 'Transaction integrity', status: 'PASSED', discrepancies: 0 }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialReport,
      })

      const reportData = {
        period: 'Q1 2024',
        includePartnerBreakdown: true,
        includeAuditTrail: true
      }

      const response = await fetch('/api/admin/financial/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      })

      const data = await response.json()
      expect(data.reportId).toMatch(/^RPT-\d{4}-\d{3}$/)
      expect(data.summary.totalRevenue).toBe(2250000.00)
      expect(data.monthlyBreakdown).toHaveLength(3)
      expect(data.auditChecks.every((check: any) => check.status === 'PASSED')).toBe(true)
    })
  })

  describe('System Configuration and Settings', () => {
    it('manages platform configuration settings', async () => {
      const mockPlatformConfig = {
        general: {
          platformName: 'HealthMate',
          supportEmail: 'support@healthmate.com',
          maintenanceMode: false,
          registrationEnabled: true,
          apiRateLimit: 1000 // requests per hour
        },
        business: {
          defaultCommissionRate: 0.05,
          minimumOrderAmount: 50.00,
          maxDeliveryDistance: 25, // km
          operatingHours: {
            start: '06:00',
            end: '23:00'
          }
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true,
          defaultLanguage: 'en',
          notificationRetryAttempts: 3
        },
        security: {
          sessionTimeout: 3600, // seconds
          passwordMinLength: 8,
          twoFactorAuthEnabled: false,
          ipWhitelistEnabled: false
        },
        integrations: {
          paymentGateway: 'RAZORPAY',
          smsProvider: 'TWILIO',
          emailProvider: 'SENDGRID',
          mapProvider: 'GOOGLE_MAPS'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlatformConfig,
      })

      const response = await fetch('/api/admin/config')
      const data = await response.json()
      
      expect(data.general.platformName).toBe('HealthMate')
      expect(data.business.defaultCommissionRate).toBe(0.05)
      expect(data.security.passwordMinLength).toBe(8)
      expect(data.integrations.paymentGateway).toBe('RAZORPAY')
    })

    it('updates system configuration with validation', async () => {
      const mockUpdatedConfig = {
        success: true,
        message: 'Configuration updated successfully',
        updatedSettings: {
          'business.defaultCommissionRate': 0.045,
          'notifications.emailNotifications': false,
          'security.sessionTimeout': 7200
        },
        validationResults: [
          { setting: 'business.defaultCommissionRate', valid: true },
          { setting: 'notifications.emailNotifications', valid: true },
          { setting: 'security.sessionTimeout', valid: true }
        ],
        restartRequired: false
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedConfig,
      })

      const configUpdates = {
        'business.defaultCommissionRate': 0.045,
        'notifications.emailNotifications': false,
        'security.sessionTimeout': 7200
      }

      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configUpdates)
      })

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.validationResults.every((result: any) => result.valid)).toBe(true)
      expect(data.restartRequired).toBe(false)
    })

    it('manages feature flags and rollouts', async () => {
      const mockFeatureFlags = {
        flags: [
          {
            name: 'VIDEO_CONSULTATIONS',
            enabled: true,
            rolloutPercentage: 100,
            targetRoles: ['DOCTOR', 'PATIENT'],
            enabledSince: '2024-01-01T00:00:00Z'
          },
          {
            name: 'AI_PRESCRIPTION_REVIEW',
            enabled: false,
            rolloutPercentage: 0,
            targetRoles: ['PHARMACY'],
            description: 'AI-powered prescription validation'
          },
          {
            name: 'REAL_TIME_TRACKING',
            enabled: true,
            rolloutPercentage: 75,
            targetRoles: ['DELIVERY_PARTNER', 'PATIENT'],
            enabledSince: '2024-01-10T00:00:00Z'
          }
        ],
        activeExperiments: [
          {
            name: 'COMMISSION_RATE_TEST',
            variants: ['4%', '5%', '6%'],
            allocation: [33, 34, 33],
            status: 'RUNNING'
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFeatureFlags,
      })

      const response = await fetch('/api/admin/feature-flags')
      const data = await response.json()
      
      expect(data.flags).toHaveLength(3)
      expect(data.flags[0].enabled).toBe(true)
      expect(data.flags[2].rolloutPercentage).toBe(75)
      expect(data.activeExperiments).toHaveLength(1)
    })
  })

  describe('Content and Communication Management', () => {
    it('manages platform notifications and announcements', async () => {
      const mockNotificationManagement = {
        totalNotifications: 12500,
        pendingNotifications: 245,
        failedNotifications: 23,
        notificationTypes: [
          { type: 'ORDER_UPDATE', count: 4500, deliveryRate: 98.5 },
          { type: 'APPOINTMENT_REMINDER', count: 2800, deliveryRate: 97.2 },
          { type: 'SYSTEM_ALERT', count: 1200, deliveryRate: 99.8 },
          { type: 'PROMOTIONAL', count: 3000, deliveryRate: 89.5 }
        ],
        recentAnnouncements: [
          {
            id: 'ann-1',
            title: 'Platform Maintenance Scheduled',
            content: 'Brief maintenance window on Sunday 2 AM - 4 AM',
            targetRoles: ['ALL'],
            priority: 'HIGH',
            sentAt: '2024-01-15T10:00:00Z'
          }
        ],
        deliveryChannels: {
          email: { successRate: 96.8, avgDeliveryTime: '2.3 minutes' },
          sms: { successRate: 98.2, avgDeliveryTime: '45 seconds' },
          inApp: { successRate: 99.9, avgDeliveryTime: 'Instant' }
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationManagement,
      })

      const response = await fetch('/api/admin/notifications/overview')
      const data = await response.json()
      
      expect(data.totalNotifications).toBe(12500)
      expect(data.notificationTypes).toHaveLength(4)
      expect(data.deliveryChannels.email.successRate).toBe(96.8)
      expect(data.recentAnnouncements).toHaveLength(1)
    })

    it('creates and sends platform-wide announcements', async () => {
      const mockAnnouncementResponse = {
        id: 'ann-123',
        title: 'New Feature: Video Consultations',
        content: 'We are excited to introduce video consultations with doctors.',
        targetRoles: ['PATIENT', 'DOCTOR'],
        priority: 'MEDIUM',
        scheduledAt: '2024-01-16T09:00:00Z',
        estimatedReach: 1250,
        deliveryChannels: ['EMAIL', 'IN_APP'],
        status: 'SCHEDULED'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnnouncementResponse,
      })

      const announcementData = {
        title: 'New Feature: Video Consultations',
        content: 'We are excited to introduce video consultations with doctors.',
        targetRoles: ['PATIENT', 'DOCTOR'],
        priority: 'MEDIUM',
        scheduledAt: '2024-01-16T09:00:00Z',
        deliveryChannels: ['EMAIL', 'IN_APP']
      }

      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData)
      })

      const data = await response.json()
      expect(data.title).toBe('New Feature: Video Consultations')
      expect(data.estimatedReach).toBe(1250)
      expect(data.status).toBe('SCHEDULED')
    })

    it('manages content moderation and quality control', async () => {
      const mockContentModeration = {
        pendingReviews: [
          {
            id: 'review-1',
            type: 'DOCTOR_PROFILE',
            contentId: 'doctor-123',
            content: 'Dr. Smith - Cardiologist with 15 years experience',
            reportedBy: 'user-456',
            reason: 'Unverified credentials',
            priority: 'HIGH',
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: 'review-2',
            type: 'PHARMACY_DESCRIPTION',
            contentId: 'pharmacy-789',
            content: 'Best pharmacy in town with fastest delivery',
            reportedBy: 'system',
            reason: 'Superlative claims',
            priority: 'MEDIUM',
            createdAt: '2024-01-15T09:15:00Z'
          }
        ],
        automatedFlags: {
          spamDetection: 12,
          inappropriateContent: 3,
          falseInformation: 5
        },
        moderationActions: [
          { action: 'APPROVED', count: 156, thisWeek: 23 },
          { action: 'REJECTED', count: 12, thisWeek: 2 },
          { action: 'FLAGGED', count: 28, thisWeek: 7 }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContentModeration,
      })

      const response = await fetch('/api/admin/content/moderation')
      const data = await response.json()
      
      expect(data.pendingReviews).toHaveLength(2)
      expect(data.automatedFlags.spamDetection).toBe(12)
      expect(data.moderationActions).toHaveLength(3)
    })
  })

  describe('Security and Compliance Monitoring', () => {
    it('monitors security events and threats', async () => {
      const mockSecurityMonitoring = {
        securityEvents: {
          totalEvents: 1250,
          criticalEvents: 3,
          warningEvents: 45,
          infoEvents: 1202
        },
        recentThreats: [
          {
            id: 'threat-1',
            type: 'BRUTE_FORCE_ATTEMPT',
            sourceIP: '192.168.1.100',
            targetUser: 'admin@test.com',
            attempts: 15,
            blocked: true,
            detectedAt: '2024-01-15T08:30:00Z'
          },
          {
            id: 'threat-2',
            type: 'SUSPICIOUS_API_ACTIVITY',
            sourceIP: '10.0.0.50',
            apiEndpoint: '/api/admin/users',
            requestCount: 500,
            blocked: true,
            detectedAt: '2024-01-15T07:15:00Z'
          }
        ],
        accessLogs: [
          {
            userId: 'admin-1',
            action: 'USER_APPROVAL',
            resource: 'doctor-profile-123',
            timestamp: '2024-01-15T10:00:00Z',
            ipAddress: '192.168.1.10'
          }
        ],
        complianceStatus: {
          gdprCompliance: 98.5,
          hipaaCompliance: 99.2,
          dataRetentionPolicy: 'COMPLIANT',
          encryptionStatus: 'ACTIVE'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSecurityMonitoring,
      })

      const response = await fetch('/api/admin/security/monitoring')
      const data = await response.json()
      
      expect(data.securityEvents.criticalEvents).toBe(3)
      expect(data.recentThreats).toHaveLength(2)
      expect(data.complianceStatus.hipaaCompliance).toBe(99.2)
      expect(data.accessLogs).toHaveLength(1)
    })

    it('manages data backup and recovery procedures', async () => {
      const mockBackupStatus = {
        lastBackup: {
          timestamp: '2024-01-15T02:00:00Z',
          duration: '1h 45m',
          size: '2.4 GB',
          status: 'COMPLETED',
          type: 'FULL_BACKUP'
        },
        backupSchedule: {
          fullBackup: 'WEEKLY',
          incrementalBackup: 'DAILY',
          nextFullBackup: '2024-01-21T02:00:00Z',
          nextIncrementalBackup: '2024-01-16T02:00:00Z'
        },
        retentionPolicy: {
          fullBackups: '6 months',
          incrementalBackups: '30 days',
          totalStorageUsed: '48.5 GB',
          storageLimit: '500 GB'
        },
        recoveryTests: [
          {
            date: '2024-01-01',
            type: 'PARTIAL_RECOVERY',
            success: true,
            duration: '15 minutes'
          },
          {
            date: '2023-12-15',
            type: 'FULL_RECOVERY',
            success: true,
            duration: '2 hours 30 minutes'
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackupStatus,
      })

      const response = await fetch('/api/admin/backup/status')
      const data = await response.json()
      
      expect(data.lastBackup.status).toBe('COMPLETED')
      expect(data.backupSchedule.fullBackup).toBe('WEEKLY')
      expect(data.retentionPolicy.totalStorageUsed).toBe('48.5 GB')
      expect(data.recoveryTests).toHaveLength(2)
    })
  })
})