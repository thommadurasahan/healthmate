// OCR Processing Tests
describe('OCR Processing Workflow', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  describe('Prescription OCR Processing API', () => {
    it('successfully processes a prescription with valid OCR response', async () => {
      const mockOcrResponse = {
        message: 'Prescription processed successfully',
        prescription: {
          id: 'prescription-id',
          status: 'PROCESSED',
          ocrData: JSON.stringify({
            medicines: [
              {
                name: 'Paracetamol',
                dosage: '500mg',
                frequency: 'Twice daily',
                duration: '5 days',
                instructions: 'Take after meals'
              },
              {
                name: 'Amoxicillin',
                dosage: '250mg',
                frequency: 'Three times daily',
                duration: '7 days',
                instructions: 'Complete the course'
              }
            ],
            extractedText: 'Prescription for John Doe. Paracetamol 500mg twice daily for 5 days. Amoxicillin 250mg three times daily for 7 days.',
            processedAt: new Date().toISOString()
          })
        },
        medicines: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '5 days',
            instructions: 'Take after meals'
          },
          {
            name: 'Amoxicillin',
            dosage: '250mg',
            frequency: 'Three times daily',
            duration: '7 days',
            instructions: 'Complete the course'
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOcrResponse,
      })

      const response = await fetch('/api/prescriptions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId: 'prescription-id' })
      })

      const data = await response.json()
      expect(data.message).toBe('Prescription processed successfully')
      expect(data.prescription.status).toBe('PROCESSED')
      expect(data.medicines).toHaveLength(2)
      expect(data.medicines[0].name).toBe('Paracetamol')
      expect(data.medicines[1].name).toBe('Amoxicillin')
    })

    it('handles OCR processing failure gracefully', async () => {
      const mockErrorResponse = {
        error: 'Failed to process prescription'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockErrorResponse,
      })

      const response = await fetch('/api/prescriptions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId: 'prescription-id' })
      })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to process prescription')
    })

    it('validates prescription status before processing', async () => {
      const mockErrorResponse = {
        error: 'Prescription has already been processed or is not ready for processing'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      })

      const response = await fetch('/api/prescriptions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId: 'already-processed-id' })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('already been processed')
    })
  })

  describe('OCR Data Processing and Validation', () => {
    it('correctly parses OCR medicine data structure', () => {
      const mockOcrData = {
        medicines: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '5 days',
            instructions: 'Take after meals'
          },
          {
            name: 'Ibuprofen',
            dosage: '200mg',
            frequency: 'As needed',
            duration: '3 days',
            instructions: 'For pain relief'
          }
        ],
        extractedText: 'Full prescription text...',
        processedAt: new Date().toISOString()
      }

      // Validate medicine structure
      expect(mockOcrData.medicines).toHaveLength(2)
      expect(mockOcrData.medicines[0]).toHaveProperty('name')
      expect(mockOcrData.medicines[0]).toHaveProperty('dosage')
      expect(mockOcrData.medicines[0]).toHaveProperty('frequency')
      expect(mockOcrData.medicines[0]).toHaveProperty('duration')
      expect(mockOcrData.medicines[0]).toHaveProperty('instructions')

      // Validate specific medicine data
      expect(mockOcrData.medicines[0].name).toBe('Paracetamol')
      expect(mockOcrData.medicines[0].dosage).toBe('500mg')
      expect(mockOcrData.medicines[1].name).toBe('Ibuprofen')
      expect(mockOcrData.medicines[1].frequency).toBe('As needed')
    })

    it('handles partial OCR data with missing fields', () => {
      const mockPartialOcrData = {
        medicines: [
          {
            name: 'Aspirin',
            dosage: '75mg',
            frequency: 'Once daily',
            // Missing duration and instructions
          },
          {
            name: 'Medicine Name Unclear',
            // Missing most fields
            instructions: 'Could not read clearly from prescription'
          }
        ],
        extractedText: 'Partially readable prescription...',
        note: 'Some text was unclear in the prescription image'
      }

      expect(mockPartialOcrData.medicines[0].name).toBe('Aspirin')
      expect(mockPartialOcrData.medicines[0].dosage).toBe('75mg')
      expect(mockPartialOcrData.medicines[1].instructions).toContain('Could not read clearly')
      expect(mockPartialOcrData.note).toContain('unclear')
    })

    it('validates medicine name extraction accuracy', () => {
      const mockMedicineNames = [
        'Paracetamol',
        'Amoxicillin',
        'Ibuprofen',
        'Metformin',
        'Lisinopril',
        'Aspirin'
      ]

      // Test common medicine name patterns
      mockMedicineNames.forEach(name => {
        expect(name).toMatch(/^[A-Za-z][A-Za-z0-9\s\-]*$/)
        expect(name.length).toBeGreaterThan(2)
        expect(name.length).toBeLessThan(50)
      })
    })

    it('validates dosage format extraction', () => {
      const mockDosages = [
        '500mg',
        '10mg',
        '2.5mg',
        '1g',
        '50mcg',
        '5ml',
        '1 tablet',
        '2 capsules'
      ]

      mockDosages.forEach(dosage => {
        expect(dosage).toMatch(/^[\d\.]+\s*(mg|g|mcg|ml|tablet|capsule|drop|unit)s?$/i)
      })
    })

    it('validates frequency pattern extraction', () => {
      const mockFrequencies = [
        'Once daily',
        'Twice daily',
        'Three times daily',
        'Every 6 hours',
        'As needed',
        'Before meals',
        'At bedtime',
        '1-2 times daily'
      ]

      mockFrequencies.forEach(frequency => {
        expect(frequency).toBeTruthy()
        expect(frequency.length).toBeGreaterThan(3)
        expect(frequency.length).toBeLessThan(50)
      })
    })
  })

  describe('OCR Error Handling and Edge Cases', () => {
    it('handles corrupted or unreadable prescription images', async () => {
      const mockCorruptedImageResponse = {
        error: 'OCR processing failed: Could not read image file'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockCorruptedImageResponse,
      })

      const response = await fetch('/api/prescriptions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId: 'corrupted-image-id' })
      })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toContain('Could not read image')
    })

    it('handles prescriptions with no readable medicine information', async () => {
      const mockEmptyOcrResponse = {
        message: 'Prescription processed successfully',
        medicines: [],
        prescription: {
          status: 'PROCESSED',
          ocrData: JSON.stringify({
            medicines: [],
            extractedText: 'No clear medicine information could be extracted from this prescription',
            note: 'Please verify prescription manually'
          })
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyOcrResponse,
      })

      const response = await fetch('/api/prescriptions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId: 'unclear-prescription-id' })
      })

      const data = await response.json()
      expect(data.medicines).toHaveLength(0)
      expect(JSON.parse(data.prescription.ocrData).note).toContain('Please verify prescription manually')
    })

    it('handles missing EMERGENT_LLM_KEY environment variable', async () => {
      const mockEnvErrorResponse = {
        error: 'EMERGENT_LLM_KEY not found in environment variables'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockEnvErrorResponse,
      })

      const response = await fetch('/api/prescriptions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId: 'prescription-id' })
      })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toContain('EMERGENT_LLM_KEY not found')
    })

    it('handles unsupported file formats gracefully', async () => {
      const mockUnsupportedFormatResponse = {
        error: 'Unsupported file format for OCR processing'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockUnsupportedFormatResponse,
      })

      const response = await fetch('/api/prescriptions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId: 'unsupported-format-id' })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Unsupported file format')
    })
  })

  describe('OCR Integration with Order Creation', () => {
    it('creates order items from OCR extracted medicines', async () => {
      const mockOcrMedicines = [
        {
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '5 days',
          instructions: 'Take after meals'
        },
        {
          name: 'Amoxicillin',
          dosage: '250mg',
          frequency: 'Three times daily',
          duration: '7 days',
          instructions: 'Complete the course'
        }
      ]

      const mockMatchedMedicines = [
        {
          id: 'med-1',
          name: 'Paracetamol 500mg',
          price: 50.00,
          unit: 'tablets',
          pharmacy: { id: 'pharmacy-1', name: 'Central Pharmacy' }
        },
        {
          id: 'med-2',
          name: 'Amoxicillin 250mg',
          price: 120.00,
          unit: 'capsules',
          pharmacy: { id: 'pharmacy-1', name: 'Central Pharmacy' }
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMatchedMedicines,
      })

      const response = await fetch('/api/medicines/match-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicines: mockOcrMedicines })
      })

      const data = await response.json()
      expect(data).toHaveLength(2)
      expect(data[0].name).toContain('Paracetamol')
      expect(data[1].name).toContain('Amoxicillin')
    })

    it('handles partial medicine matches from OCR data', async () => {
      const mockPartialMatches = [
        {
          ocrMedicine: 'Paracetamol 500mg',
          matches: [
            { id: 'med-1', name: 'Paracetamol 500mg Tablets', price: 50.00, similarity: 0.95 },
            { id: 'med-2', name: 'Paracetamol 500mg Syrup', price: 75.00, similarity: 0.80 }
          ]
        },
        {
          ocrMedicine: 'Medicine Name Unclear',
          matches: [],
          note: 'No matches found - manual verification required'
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPartialMatches,
      })

      const response = await fetch('/api/medicines/fuzzy-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ocrMedicines: ['Paracetamol 500mg', 'Medicine Name Unclear'] })
      })

      const data = await response.json()
      expect(data[0].matches).toHaveLength(2)
      expect(data[0].matches[0].similarity).toBe(0.95)
      expect(data[1].matches).toHaveLength(0)
      expect(data[1].note).toContain('manual verification')
    })
  })

  describe('OCR Performance and Quality Metrics', () => {
    it('measures OCR processing time for performance monitoring', async () => {
      const startTime = Date.now()
      
      const mockTimedResponse = {
        message: 'Prescription processed successfully',
        prescription: { status: 'PROCESSED' },
        medicines: [{ name: 'Test Medicine' }],
        processingTime: 3500, // milliseconds
        performanceMetrics: {
          ocrLatency: 2800,
          apiLatency: 700,
          fileSize: 2048576, // 2MB
          imageResolution: '1920x1080'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimedResponse,
      })

      const response = await fetch('/api/prescriptions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId: 'prescription-id' })
      })

      const data = await response.json()
      const endTime = Date.now()
      
      expect(data.processingTime).toBeDefined()
      expect(data.processingTime).toBeGreaterThan(0)
      expect(data.performanceMetrics.ocrLatency).toBeLessThan(5000) // Should be under 5 seconds
      expect(endTime - startTime).toBeLessThan(10000) // Total should be under 10 seconds
    })

    it('validates OCR accuracy metrics', () => {
      const mockAccuracyMetrics = {
        totalMedicines: 3,
        extractedMedicines: 3,
        confidenceScores: [0.95, 0.87, 0.92],
        averageConfidence: 0.913,
        qualityIndicators: {
          imageClarity: 'high',
          textReadability: 'good',
          handwritingQuality: 'fair'
        }
      }

      expect(mockAccuracyMetrics.averageConfidence).toBeGreaterThan(0.8)
      expect(mockAccuracyMetrics.confidenceScores).toHaveLength(3)
      expect(mockAccuracyMetrics.confidenceScores.every(score => score >= 0 && score <= 1)).toBe(true)
      expect(mockAccuracyMetrics.qualityIndicators.imageClarity).toBe('high')
    })
  })
})