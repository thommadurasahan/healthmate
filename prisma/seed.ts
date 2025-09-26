import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@healthmate.com' },
    update: {},
    create: {
      email: 'admin@healthmate.com',
      password: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      isApproved: true,
      admin: {
        create: {
          role: 'SUPER_ADMIN'
        }
      }
    }
  })

  // Create Sample Patients
  const patientPassword = await bcrypt.hash('patient123', 10)
  const patients = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@email.com' },
      update: {},
      create: {
        email: 'john.doe@email.com',
        password: patientPassword,
        name: 'John Doe',
        role: 'PATIENT',
        isApproved: true,
        patient: {
          create: {
            phone: '+1234567890',
            address: '123 Main St, City, State 12345',
            dateOfBirth: new Date('1985-06-15'),
            emergencyContact: '+1234567891'
          }
        }
      }
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@email.com' },
      update: {},
      create: {
        email: 'jane.smith@email.com',
        password: patientPassword,
        name: 'Jane Smith',
        role: 'PATIENT',
        isApproved: true,
        patient: {
          create: {
            phone: '+1234567892',
            address: '456 Oak Ave, City, State 12345',
            dateOfBirth: new Date('1990-03-22'),
            emergencyContact: '+1234567893'
          }
        }
      }
    })
  ])

  // Create Sample Pharmacies
  const pharmacyPassword = await bcrypt.hash('pharmacy123', 10)
  const pharmacies = await Promise.all([
    prisma.user.upsert({
      where: { email: 'citycare@pharmacy.com' },
      update: {},
      create: {
        email: 'citycare@pharmacy.com',
        password: pharmacyPassword,
        name: 'CityCare Pharmacy Manager',
        role: 'PHARMACY',
        isApproved: true,
        pharmacy: {
          create: {
            name: 'CityCare Pharmacy',
            address: '789 Health Blvd, City, State 12345',
            phone: '+1234567894',
            license: 'PH001',
            latitude: 40.7128,
            longitude: -74.0060
          }
        }
      }
    }),
    prisma.user.upsert({
      where: { email: 'wellness@pharmacy.com' },
      update: {},
      create: {
        email: 'wellness@pharmacy.com',
        password: pharmacyPassword,
        name: 'Wellness Pharmacy Manager',
        role: 'PHARMACY',
        isApproved: true,
        pharmacy: {
          create: {
            name: 'Wellness Pharmacy',
            address: '321 Care Street, City, State 12345',
            phone: '+1234567895',
            license: 'PH002',
            latitude: 40.7589,
            longitude: -73.9851
          }
        }
      }
    })
  ])

  // Create Sample Doctors
  const doctorPassword = await bcrypt.hash('doctor123', 10)
  const doctors = await Promise.all([
    prisma.user.upsert({
      where: { email: 'dr.smith@healthmate.com' },
      update: {},
      create: {
        email: 'dr.smith@healthmate.com',
        password: doctorPassword,
        name: 'Dr. Sarah Smith',
        role: 'DOCTOR',
        isApproved: true,
        doctor: {
          create: {
            specialization: 'General Medicine',
            qualifications: 'MBBS, MD',
            experience: 10,
            consultationFee: 75.00,
            phone: '+1234567896',
            address: '555 Medical Center Dr, City, State 12345',
            license: 'MD001'
          }
        }
      }
    }),
    prisma.user.upsert({
      where: { email: 'dr.johnson@healthmate.com' },
      update: {},
      create: {
        email: 'dr.johnson@healthmate.com',
        password: doctorPassword,
        name: 'Dr. Michael Johnson',
        role: 'DOCTOR',
        isApproved: true,
        doctor: {
          create: {
            specialization: 'Cardiology',
            qualifications: 'MBBS, MD, DM Cardiology',
            experience: 15,
            consultationFee: 125.00,
            phone: '+1234567897',
            address: '777 Heart Center Ave, City, State 12345',
            license: 'MD002'
          }
        }
      }
    })
  ])

  // Create Sample Laboratories
  const labPassword = await bcrypt.hash('lab123', 10)
  const laboratories = await Promise.all([
    prisma.user.upsert({
      where: { email: 'central@lab.com' },
      update: {},
      create: {
        email: 'central@lab.com',
        password: labPassword,
        name: 'Central Lab Manager',
        role: 'LABORATORY',
        isApproved: true,
        laboratory: {
          create: {
            name: 'Central Diagnostics Lab',
            address: '999 Lab Street, City, State 12345',
            phone: '+1234567898',
            license: 'LAB001',
            latitude: 40.7505,
            longitude: -73.9934
          }
        }
      }
    }),
    prisma.user.upsert({
      where: { email: 'quicklab@lab.com' },
      update: {},
      create: {
        email: 'quicklab@lab.com',
        password: labPassword,
        name: 'QuickLab Manager',
        role: 'LABORATORY',
        isApproved: true,
        laboratory: {
          create: {
            name: 'QuickLab Services',
            address: '456 Diagnostic Ave, Health Plaza',
            phone: '+1234567899',
            license: 'LAB002',
            latitude: 40.7489,
            longitude: -73.9680
          }
        }
      }
    })
  ])

  // Create Sample Delivery Partners
  const deliveryPassword = await bcrypt.hash('delivery123', 10)
  const deliveryPartners = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alex.driver@delivery.com' },
      update: {},
      create: {
        email: 'alex.driver@delivery.com',
        password: deliveryPassword,
        name: 'Alex Driver',
        role: 'DELIVERY_PARTNER',
        isApproved: true,
        deliveryPartner: {
          create: {
            vehicleType: 'Motorcycle',
            licenseNumber: 'DL001',
            phone: '+1234567899',
            address: '111 Delivery Ave, City, State 12345',
            latitude: 40.7282,
            longitude: -74.0776,
            isAvailable: true
          }
        }
      }
    }),
    prisma.user.upsert({
      where: { email: 'sam.courier@delivery.com' },
      update: {},
      create: {
        email: 'sam.courier@delivery.com',
        password: deliveryPassword,
        name: 'Sam Courier',
        role: 'DELIVERY_PARTNER',
        isApproved: true,
        deliveryPartner: {
          create: {
            vehicleType: 'Bicycle',
            licenseNumber: 'DL002',
            phone: '+1234567800',
            address: '222 Fast Lane, City, State 12345',
            latitude: 40.7614,
            longitude: -73.9776,
            isAvailable: true
          }
        }
      }
    })
  ])

  // Create Sample Medicines for Pharmacies
  const cityCarePharmacy = await prisma.pharmacy.findFirst({
    where: { name: 'CityCare Pharmacy' }
  })

  const wellnessPharmacy = await prisma.pharmacy.findFirst({
    where: { name: 'Wellness Pharmacy' }
  })

  if (cityCarePharmacy) {
    await Promise.all([
      prisma.medicine.upsert({
        where: { id: 'med-001' },
        update: {},
        create: {
          id: 'med-001',
          pharmacyId: cityCarePharmacy.id,
          name: 'Paracetamol',
          description: 'Pain reliever and fever reducer',
          price: 5.99,
          unit: 'tablet',
          stock: 500
        }
      }),
      prisma.medicine.upsert({
        where: { id: 'med-002' },
        update: {},
        create: {
          id: 'med-002',
          pharmacyId: cityCarePharmacy.id,
          name: 'Ibuprofen',
          description: 'Anti-inflammatory pain reliever',
          price: 8.99,
          unit: 'tablet',
          stock: 300
        }
      }),
      prisma.medicine.upsert({
        where: { id: 'med-003' },
        update: {},
        create: {
          id: 'med-003',
          pharmacyId: cityCarePharmacy.id,
          name: 'Amoxicillin',
          description: 'Antibiotic for bacterial infections',
          price: 15.99,
          unit: 'capsule',
          stock: 200
        }
      })
    ])
  }

  if (wellnessPharmacy) {
    await Promise.all([
      prisma.medicine.upsert({
        where: { id: 'med-004' },
        update: {},
        create: {
          id: 'med-004',
          pharmacyId: wellnessPharmacy.id,
          name: 'Aspirin',
          description: 'Blood thinner and pain reliever',
          price: 6.99,
          unit: 'tablet',
          stock: 400
        }
      }),
      prisma.medicine.upsert({
        where: { id: 'med-005' },
        update: {},
        create: {
          id: 'med-005',
          pharmacyId: wellnessPharmacy.id,
          name: 'Cetirizine',
          description: 'Antihistamine for allergies',
          price: 12.99,
          unit: 'tablet',
          stock: 250
        }
      })
    ])
  }

  // Create Sample Lab Tests
  const centralLab = await prisma.laboratory.findFirst({
    where: { name: 'Central Diagnostics Lab' }
  })

  const quickLab = await prisma.laboratory.findFirst({
    where: { name: 'QuickLab Services' }
  })

  if (centralLab) {
    await Promise.all([
      prisma.labTest.upsert({
        where: { id: 'test-001' },
        update: {},
        create: {
          id: 'test-001',
          laboratoryId: centralLab.id,
          name: 'Complete Blood Count (CBC)',
          description: 'Comprehensive blood analysis',
          price: 45.00,
          duration: '24 hours',
          requirements: 'Fasting not required'
        }
      }),
      prisma.labTest.upsert({
        where: { id: 'test-002' },
        update: {},
        create: {
          id: 'test-002',
          laboratoryId: centralLab.id,
          name: 'Lipid Profile',
          description: 'Cholesterol and triglyceride levels',
          price: 35.00,
          duration: '12 hours',
          requirements: '12 hours fasting required'
        }
      }),
      prisma.labTest.upsert({
        where: { id: 'test-003' },
        update: {},
        create: {
          id: 'test-003',
          laboratoryId: centralLab.id,
          name: 'Blood Sugar (Random)',
          description: 'Random blood glucose test',
          price: 15.00,
          duration: '2 hours',
          requirements: 'No fasting required'
        }
      })
    ])
  }

  if (quickLab) {
    await Promise.all([
      prisma.labTest.upsert({
        where: { id: 'test-004' },
        update: {},
        create: {
          id: 'test-004',
          laboratoryId: quickLab.id,
          name: 'Thyroid Function Test',
          description: 'TSH, T3, and T4 levels',
          price: 55.00,
          duration: '24 hours',
          requirements: 'Morning sample preferred'
        }
      }),
      prisma.labTest.upsert({
        where: { id: 'test-005' },
        update: {},
        create: {
          id: 'test-005',
          laboratoryId: quickLab.id,
          name: 'Liver Function Test',
          description: 'Complete liver enzyme analysis',
          price: 40.00,
          duration: '12 hours',
          requirements: '8 hours fasting required'
        }
      })
    ])
  }

  // Create Doctor Availability
  const drSmith = await prisma.doctor.findFirst({
    where: { user: { email: 'dr.smith@healthmate.com' } }
  })

  const drJohnson = await prisma.doctor.findFirst({
    where: { user: { email: 'dr.johnson@healthmate.com' } }
  })

  if (drSmith) {
    // Monday to Friday, 9 AM to 5 PM
    for (let day = 1; day <= 5; day++) {
      await prisma.doctorAvailability.upsert({
        where: { id: `avail-smith-${day}` },
        update: {},
        create: {
          id: `avail-smith-${day}`,
          doctorId: drSmith.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00'
        }
      })
    }
  }

  if (drJohnson) {
    // Monday to Friday, 10 AM to 6 PM
    for (let day = 1; day <= 5; day++) {
      await prisma.doctorAvailability.upsert({
        where: { id: `avail-johnson-${day}` },
        update: {},
        create: {
          id: `avail-johnson-${day}`,
          doctorId: drJohnson.id,
          dayOfWeek: day,
          startTime: '10:00',
          endTime: '18:00'
        }
      })
    }
  }

  console.log('✅ Database seeding completed!')
  console.log('\n📋 Sample Users Created:')
  console.log('Admin: admin@healthmate.com / admin123')
  console.log('Patient: john.doe@email.com / patient123')
  console.log('Patient: jane.smith@email.com / patient123')
  console.log('Pharmacy: citycare@pharmacy.com / pharmacy123')
  console.log('Pharmacy: wellness@pharmacy.com / pharmacy123')
  console.log('Doctor: dr.smith@healthmate.com / doctor123')
  console.log('Doctor: dr.johnson@healthmate.com / doctor123')
  console.log('Lab: quicklab@lab.com / lab123')
  console.log('Delivery: alex.driver@delivery.com / delivery123')
  console.log('Delivery: sam.courier@delivery.com / delivery123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })