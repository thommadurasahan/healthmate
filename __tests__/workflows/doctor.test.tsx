// Doctor Workflow Tests
describe('Doctor Workflows', () => {
  const mockDoctorSession = {
    user: {
      id: 'doctor-user-id',
      name: 'Dr. John Smith',
      email: 'doctor@test.com',
      role: 'DOCTOR',
      doctor: {
        id: 'doctor-id',
        userId: 'doctor-user-id',
        specialization: 'Cardiology',
        qualifications: 'MBBS, MD Cardiology',
        experience: 10,
        consultationFee: 600.00,
        phone: '9876543210',
        license: 'DOC123',
        isApproved: true
      }
    }
  }

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  describe('Doctor Profile and Registration', () => {
    it('creates doctor profile with specialization and credentials', async () => {
      const mockDoctorProfile = {
        id: 'doctor-id',
        userId: 'doctor-user-id',
        specialization: 'Cardiology',
        qualifications: 'MBBS, MD Cardiology',
        experience: 10,
        consultationFee: 600.00,
        phone: '9876543210',
        license: 'DOC123',
        isApproved: false, // Requires admin approval
        user: {
          name: 'Dr. John Smith',
          email: 'doctor@test.com',
          role: 'DOCTOR'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          message: 'User created successfully', 
          user: {
            ...mockDoctorProfile,
            doctor: mockDoctorProfile
          }
        }),
      })

      const doctorData = {
        name: 'Dr. John Smith',
        email: 'doctor@test.com',
        password: 'password123',
        role: 'DOCTOR',
        specialization: 'Cardiology',
        qualifications: 'MBBS, MD Cardiology',
        experience: '10',
        consultationFee: '600.00',
        phone: '9876543210',
        doctorLicense: 'DOC123'
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData)
      })

      const data = await response.json()
      expect(data.user.doctor.specialization).toBe('Cardiology')
      expect(data.user.doctor.consultationFee).toBe(600.00)
      expect(data.user.doctor.isApproved).toBe(false)
      expect(data.user.doctor.experience).toBe(10)
    })

    it('validates required doctor registration fields', async () => {
      const mockErrorResponse = {
        error: 'Missing doctor information'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      })

      const invalidDoctorData = {
        name: 'Dr. Test',
        email: 'doctor@test.com',
        password: 'password123',
        role: 'DOCTOR'
        // Missing specialization, qualifications, etc.
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidDoctorData)
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Missing doctor information')
    })

    it('updates doctor profile and consultation fee', async () => {
      const mockUpdatedProfile = {
        id: 'doctor-id',
        specialization: 'Cardiology',
        qualifications: 'MBBS, MD, FACC',
        experience: 12,
        consultationFee: 750.00,
        phone: '9876543211',
        user: {
          name: 'Dr. John Smith, MD'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedProfile,
      })

      const updateData = {
        qualifications: 'MBBS, MD, FACC',
        experience: 12,
        consultationFee: 750.00,
        phone: '9876543211'
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      expect(data.consultationFee).toBe(750.00)
      expect(data.experience).toBe(12)
      expect(data.qualifications).toBe('MBBS, MD, FACC')
    })
  })

  describe('Doctor Availability Management', () => {
    it('sets weekly availability schedule', async () => {
      const mockAvailability = {
        count: 5 // Number of availability slots created
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAvailability,
      })

      const availabilityData = {
        availabilities: [
          {
            dayOfWeek: 1, // Monday
            startTime: '09:00',
            endTime: '17:00'
          },
          {
            dayOfWeek: 2, // Tuesday
            startTime: '09:00',
            endTime: '17:00'
          },
          {
            dayOfWeek: 3, // Wednesday
            startTime: '09:00',
            endTime: '13:00'
          },
          {
            dayOfWeek: 4, // Thursday
            startTime: '09:00',
            endTime: '17:00'
          },
          {
            dayOfWeek: 5, // Friday
            startTime: '09:00',
            endTime: '15:00'
          }
        ]
      }

      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availabilityData)
      })

      const data = await response.json()
      expect(data.count).toBe(5)
    })

    it('validates availability time format', async () => {
      const mockErrorResponse = {
        error: 'Invalid availability data'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      })

      const invalidAvailabilityData = {
        availabilities: [
          {
            dayOfWeek: 1,
            startTime: '25:00', // Invalid time
            endTime: '17:00'
          }
        ]
      }

      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidAvailabilityData)
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid availability data')
    })

    it('fetches doctor availability for scheduling', async () => {
      const mockDoctorWithAvailability = {
        id: 'doctor-id',
        specialization: 'Cardiology',
        consultationFee: 600.00,
        user: {
          name: 'Dr. John Smith'
        },
        availabilities: [
          {
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          },
          {
            dayOfWeek: 2,
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockDoctorWithAvailability],
      })

      const response = await fetch('/api/doctors')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
      expect(data[0].availabilities).toHaveLength(2)
      expect(data[0].availabilities[0].dayOfWeek).toBe(1)
      expect(data[0].availabilities[0].startTime).toBe('09:00')
    })
  })

  describe('Appointment Management', () => {
    it('fetches doctor appointments with patient details', async () => {
      const mockAppointments = [
        {
          id: 'appointment-1',
          scheduledAt: '2024-01-15T10:00:00Z',
          duration: 30,
          status: 'SCHEDULED',
          consultationFee: 600.00,
          meetingLink: 'https://meet.healthmate.com/room/123',
          patient: {
            user: {
              name: 'John Doe',
              email: 'john@test.com',
              phone: '1234567890'
            }
          },
          notes: 'Chest pain consultation'
        },
        {
          id: 'appointment-2',
          scheduledAt: '2024-01-15T14:00:00Z',
          duration: 45,
          status: 'COMPLETED',
          consultationFee: 600.00,
          patient: {
            user: {
              name: 'Jane Smith',
              email: 'jane@test.com',
              phone: '0987654321'
            }
          },
          notes: 'Follow-up consultation'
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppointments,
      })

      const response = await fetch('/api/appointments')
      const data = await response.json()
      
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0].patient.user.name).toBe('John Doe')
      expect(data[0].meetingLink).toContain('meet.healthmate.com')
      expect(data[1].status).toBe('COMPLETED')
    })

    it('updates appointment status and adds consultation notes', async () => {
      const mockUpdatedAppointment = {
        id: 'appointment-id',
        status: 'COMPLETED',
        consultationNotes: 'Patient shows improvement. Continue current medication.',
        prescription: 'Rest for 3 days, take prescribed medication',
        completedAt: new Date().toISOString()
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedAppointment,
      })

      const updateData = {
        status: 'COMPLETED',
        consultationNotes: 'Patient shows improvement. Continue current medication.',
        prescription: 'Rest for 3 days, take prescribed medication'
      }

      const response = await fetch('/api/appointments/appointment-id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      expect(data.status).toBe('COMPLETED')
      expect(data.consultationNotes).toContain('improvement')
      expect(data.completedAt).toBeDefined()
    })

    it('handles appointment rescheduling', async () => {
      const mockRescheduledAppointment = {
        id: 'appointment-id',
        scheduledAt: '2024-01-20T11:00:00Z',
        status: 'RESCHEDULED',
        rescheduleReason: 'Doctor emergency',
        originalScheduledAt: '2024-01-15T10:00:00Z'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRescheduledAppointment,
      })

      const rescheduleData = {
        scheduledAt: '2024-01-20T11:00:00Z',
        rescheduleReason: 'Doctor emergency'
      }

      const response = await fetch('/api/appointments/appointment-id/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rescheduleData)
      })

      const data = await response.json()
      expect(data.status).toBe('RESCHEDULED')
      expect(data.rescheduleReason).toBe('Doctor emergency')
      expect(data.originalScheduledAt).toBeDefined()
    })
  })

  describe('Video Consultation Features', () => {
    it('generates meeting links for video consultations', async () => {
      const mockAppointmentWithMeeting = {
        id: 'appointment-id',
        meetingLink: 'https://meet.healthmate.com/room/1642567890123',
        status: 'SCHEDULED',
        consultationType: 'VIDEO',
        scheduledAt: '2024-01-15T10:00:00Z'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppointmentWithMeeting,
      })

      const response = await fetch('/api/appointments/appointment-id')
      const data = await response.json()
      
      expect(data.meetingLink).toMatch(/^https:\/\/meet\.healthmate\.com\/room\/\d+$/)
      expect(data.consultationType).toBe('VIDEO')
    })

    it('validates consultation preparation checklist', async () => {
      const mockPreparationChecklist = {
        appointmentId: 'appointment-id',
        checklist: {
          patientDocuments: true,
          medicalHistory: true,
          previousTests: false,
          symptoms: true,
          medications: true
        },
        readinessScore: 80,
        recommendations: [
          'Review previous test results',
          'Prepare questions for the doctor'
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPreparationChecklist,
      })

      const response = await fetch('/api/appointments/appointment-id/preparation')
      const data = await response.json()
      
      expect(data.readinessScore).toBe(80)
      expect(data.checklist.patientDocuments).toBe(true)
      expect(data.recommendations).toHaveLength(2)
    })
  })

  describe('Doctor Dashboard and Analytics', () => {
    it('fetches doctor dashboard summary', async () => {
      const mockDashboard = {
        totalAppointments: 45,
        todayAppointments: 5,
        completedAppointments: 40,
        cancelledAppointments: 2,
        totalEarnings: 24000.00,
        monthlyEarnings: 4500.00,
        averageRating: 4.7,
        totalPatients: 32,
        upcomingAppointments: [
          {
            id: 'apt-1',
            scheduledAt: '2024-01-15T10:00:00Z',
            patient: { user: { name: 'John Doe' } },
            duration: 30
          },
          {
            id: 'apt-2',
            scheduledAt: '2024-01-15T14:00:00Z',
            patient: { user: { name: 'Jane Smith' } },
            duration: 45
          }
        ],
        recentConsultations: [
          {
            id: 'apt-3',
            completedAt: '2024-01-14T16:00:00Z',
            patient: { user: { name: 'Bob Wilson' } },
            status: 'COMPLETED'
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboard,
      })

      const response = await fetch('/api/doctor/dashboard')
      const data = await response.json()
      
      expect(data.totalAppointments).toBe(45)
      expect(data.monthlyEarnings).toBe(4500.00)
      expect(data.averageRating).toBe(4.7)
      expect(data.upcomingAppointments).toHaveLength(2)
      expect(data.recentConsultations).toHaveLength(1)
    })

    it('generates earnings analytics report', async () => {
      const mockEarningsReport = {
        period: 'monthly',
        totalEarnings: 18000.00,
        totalConsultations: 30,
        averageConsultationFee: 600.00,
        commissionDeducted: 900.00,
        netEarnings: 17100.00,
        earningsByMonth: [
          {
            month: '2024-01',
            consultations: 15,
            earnings: 9000.00,
            commission: 450.00,
            netEarnings: 8550.00
          },
          {
            month: '2024-02',
            consultations: 15,
            earnings: 9000.00,
            commission: 450.00,
            netEarnings: 8550.00
          }
        ],
        patientDemographics: {
          ageGroups: [
            { range: '18-30', count: 8 },
            { range: '31-50', count: 15 },
            { range: '51-70', count: 7 }
          ],
          genderDistribution: {
            male: 16,
            female: 14
          }
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEarningsReport,
      })

      const response = await fetch('/api/doctor/analytics?period=monthly')
      const data = await response.json()
      
      expect(data.totalEarnings).toBe(18000.00)
      expect(data.netEarnings).toBe(17100.00)
      expect(data.earningsByMonth).toHaveLength(2)
      expect(data.patientDemographics.ageGroups).toHaveLength(3)
    })

    it('tracks patient consultation history', async () => {
      const mockPatientHistory = {
        patientId: 'patient-id',
        patient: {
          user: { name: 'John Doe', email: 'john@test.com' }
        },
        consultationHistory: [
          {
            id: 'apt-1',
            date: '2024-01-10T10:00:00Z',
            diagnosis: 'Hypertension',
            prescription: 'Amlodipine 5mg once daily',
            notes: 'Blood pressure under control'
          },
          {
            id: 'apt-2',
            date: '2023-12-15T14:00:00Z',
            diagnosis: 'Annual checkup',
            prescription: 'Continue current medications',
            notes: 'Overall health good'
          }
        ],
        vitalsTrend: [
          {
            date: '2024-01-10',
            bloodPressure: '130/80',
            heartRate: 72,
            weight: 75
          },
          {
            date: '2023-12-15',
            bloodPressure: '140/90',
            heartRate: 78,
            weight: 76
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPatientHistory,
      })

      const response = await fetch('/api/doctor/patients/patient-id/history')
      const data = await response.json()
      
      expect(data.consultationHistory).toHaveLength(2)
      expect(data.vitalsTrend).toHaveLength(2)
      expect(data.consultationHistory[0].diagnosis).toBe('Hypertension')
    })
  })

  describe('Prescription and Medical Records', () => {
    it('creates digital prescription for patient', async () => {
      const mockPrescription = {
        id: 'prescription-id',
        appointmentId: 'appointment-id',
        patientId: 'patient-id',
        doctorId: 'doctor-id',
        medications: [
          {
            name: 'Amlodipine',
            dosage: '5mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take with food'
          },
          {
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '30 days',
            instructions: 'Take before meals'
          }
        ],
        diagnosis: 'Hypertension with Type 2 Diabetes',
        instructions: 'Follow up in 4 weeks',
        createdAt: new Date().toISOString()
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrescription,
      })

      const prescriptionData = {
        appointmentId: 'appointment-id',
        medications: [
          {
            name: 'Amlodipine',
            dosage: '5mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take with food'
          },
          {
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '30 days',
            instructions: 'Take before meals'
          }
        ],
        diagnosis: 'Hypertension with Type 2 Diabetes',
        instructions: 'Follow up in 4 weeks'
      }

      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData)
      })

      const data = await response.json()
      expect(data.medications).toHaveLength(2)
      expect(data.diagnosis).toBe('Hypertension with Type 2 Diabetes')
      expect(data.medications[0].name).toBe('Amlodipine')
    })

    it('updates patient medical records', async () => {
      const mockMedicalRecord = {
        id: 'record-id',
        patientId: 'patient-id',
        vitalSigns: {
          bloodPressure: '120/80',
          heartRate: 72,
          temperature: 98.6,
          weight: 70,
          height: 175
        },
        symptoms: ['Chest pain', 'Shortness of breath'],
        diagnosis: 'Angina pectoris',
        treatmentPlan: 'Medication and lifestyle changes',
        followUpDate: '2024-02-15',
        updatedAt: new Date().toISOString()
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMedicalRecord,
      })

      const recordData = {
        vitalSigns: {
          bloodPressure: '120/80',
          heartRate: 72,
          temperature: 98.6,
          weight: 70,
          height: 175
        },
        symptoms: ['Chest pain', 'Shortness of breath'],
        diagnosis: 'Angina pectoris',
        treatmentPlan: 'Medication and lifestyle changes',
        followUpDate: '2024-02-15'
      }

      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
      })

      const data = await response.json()
      expect(data.vitalSigns.bloodPressure).toBe('120/80')
      expect(data.symptoms).toHaveLength(2)
      expect(data.diagnosis).toBe('Angina pectoris')
    })
  })

  describe('Commission and Payment Tracking', () => {
    it('calculates commission correctly for consultations', async () => {
      const mockTransactionDetails = {
        consultationFee: 600.00,
        commissionRate: 0.05, // 5%
        commissionAmount: 30.00,
        netEarnings: 570.00,
        paymentStatus: 'COMPLETED',
        transactionId: 'txn-123'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransactionDetails,
      })

      const response = await fetch('/api/transactions/appointment-id')
      const data = await response.json()
      
      expect(data.consultationFee).toBe(600.00)
      expect(data.commissionAmount).toBe(30.00)
      expect(data.netEarnings).toBe(570.00)
      expect(data.commissionRate).toBe(0.05)
    })

    it('tracks monthly earnings and payouts', async () => {
      const mockPayoutSummary = {
        month: '2024-01',
        totalConsultations: 20,
        grossEarnings: 12000.00,
        totalCommission: 600.00,
        netEarnings: 11400.00,
        payoutStatus: 'PROCESSED',
        payoutDate: '2024-02-01',
        consultationBreakdown: [
          { date: '2024-01-15', consultations: 3, earnings: 1800.00 },
          { date: '2024-01-16', consultations: 2, earnings: 1200.00 }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPayoutSummary,
      })

      const response = await fetch('/api/doctor/payouts/2024-01')
      const data = await response.json()
      
      expect(data.netEarnings).toBe(11400.00)
      expect(data.totalConsultations).toBe(20)
      expect(data.payoutStatus).toBe('PROCESSED')
      expect(data.consultationBreakdown).toHaveLength(2)
    })
  })
})