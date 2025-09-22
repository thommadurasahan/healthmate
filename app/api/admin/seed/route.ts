import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Create sample pharmacy users and profiles
    const pharmacyData = [
      {
        email: 'medplus@example.com',
        name: 'MedPlus Pharmacy',
        address: '123 Main St, City Center',
        phone: '+1-555-0123',
        license: 'PH001234',
        medicines: [
          { name: 'Paracetamol', description: 'Pain relief medication', price: 5.99, unit: 'tablet', stock: 100 },
          { name: 'Amoxicillin', description: 'Antibiotic medication', price: 12.99, unit: 'capsule', stock: 50 },
          { name: 'Ibuprofen', description: 'Anti-inflammatory', price: 7.99, unit: 'tablet', stock: 75 },
          { name: 'Omeprazole', description: 'Acid reducer', price: 15.99, unit: 'capsule', stock: 30 }
        ]
      },
      {
        email: 'healthfirst@example.com',
        name: 'HealthFirst Pharmacy',
        address: '456 Oak Ave, Downtown',
        phone: '+1-555-0456',
        license: 'PH005678',
        medicines: [
          { name: 'Paracetamol', description: 'Pain relief medication', price: 4.99, unit: 'tablet', stock: 80 },
          { name: 'Amoxicillin', description: 'Antibiotic medication', price: 11.99, unit: 'capsule', stock: 75 },
          { name: 'Aspirin', description: 'Pain reliever and anti-inflammatory', price: 6.49, unit: 'tablet', stock: 120 },
          { name: 'Metformin', description: 'Diabetes medication', price: 18.99, unit: 'tablet', stock: 45 }
        ]
      }
    ]

    const password = await bcrypt.hash('pharmacy123', 12)

    for (const pharmacy of pharmacyData) {
      // Create user
      const user = await prisma.user.create({
        data: {
          email: pharmacy.email,
          password,
          name: pharmacy.name,
          role: 'PHARMACY',
          isApproved: true
        }
      })

      // Create pharmacy profile
      const pharmacyProfile = await prisma.pharmacy.create({
        data: {
          userId: user.id,
          name: pharmacy.name,
          address: pharmacy.address,
          phone: pharmacy.phone,
          license: pharmacy.license,
          isApproved: true
        }
      })

      // Create medicines
      for (const medicine of pharmacy.medicines) {
        await prisma.medicine.create({
          data: {
            pharmacyId: pharmacyProfile.id,
            name: medicine.name,
            description: medicine.description,
            price: medicine.price,
            unit: medicine.unit,
            stock: medicine.stock
          }
        })
      }
    }

    // Create a sample patient for testing
    const patientUser = await prisma.user.create({
      data: {
        email: 'patient@example.com',
        password,
        name: 'John Doe',
        role: 'PATIENT',
        isApproved: true
      }
    })

    await prisma.patient.create({
      data: {
        userId: patientUser.id,
        phone: '+1-555-9999',
        address: '789 Patient Street, Residential Area',
        dateOfBirth: new Date('1990-01-01'),
        emergencyContact: '+1-555-8888'
      }
    })

    return NextResponse.json({
      message: 'Sample data created successfully',
      credentials: {
        pharmacy1: { email: 'medplus@example.com', password: 'pharmacy123' },
        pharmacy2: { email: 'healthfirst@example.com', password: 'pharmacy123' },
        patient: { email: 'patient@example.com', password: 'pharmacy123' }
      }
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    )
  }
}