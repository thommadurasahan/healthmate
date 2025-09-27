import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper function to generate random dates
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper function to generate random future dates
function randomFutureDate(daysAhead: number = 30): Date {
  const today = new Date()
  const futureDate = new Date(today.getTime() + Math.random() * daysAhead * 24 * 60 * 60 * 1000)
  return futureDate
}

async function main() {
  console.log('🌱 Starting comprehensive database seeding...')

  // Create Admin Users
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admins = await Promise.all([
    prisma.user.upsert({
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
    }),
    prisma.user.upsert({
      where: { email: 'moderator@healthmate.com' },
      update: {},
      create: {
        email: 'moderator@healthmate.com',
        password: adminPassword,
        name: 'Content Moderator',
        role: 'ADMIN',
        isApproved: true,
        admin: {
          create: {
            role: 'SUPER_ADMIN'
          }
        }
      }
    })
  ])

  // Create Sample Patients (15 patients)
  const patientPassword = await bcrypt.hash('patient123', 10)
  const patientData = [
    { email: 'john.doe@email.com', name: 'John Doe', phone: '+1234567890', address: '123 Main St, New York, NY 10001', dob: '1985-06-15', emergency: '+1234567891' },
    { email: 'jane.smith@email.com', name: 'Jane Smith', phone: '+1234567892', address: '456 Oak Ave, Brooklyn, NY 11201', dob: '1990-03-22', emergency: '+1234567893' },
    { email: 'michael.johnson@email.com', name: 'Michael Johnson', phone: '+1234567894', address: '789 Pine St, Queens, NY 11101', dob: '1982-11-08', emergency: '+1234567895' },
    { email: 'sarah.wilson@email.com', name: 'Sarah Wilson', phone: '+1234567896', address: '321 Elm Dr, Manhattan, NY 10016', dob: '1995-09-12', emergency: '+1234567897' },
    { email: 'david.brown@email.com', name: 'David Brown', phone: '+1234567898', address: '654 Maple Ave, Bronx, NY 10451', dob: '1988-04-03', emergency: '+1234567899' },
    { email: 'emma.davis@email.com', name: 'Emma Davis', phone: '+1234567800', address: '987 Cedar Ln, Staten Island, NY 10301', dob: '1992-07-19', emergency: '+1234567801' },
    { email: 'james.miller@email.com', name: 'James Miller', phone: '+1234567802', address: '147 Birch St, Long Island, NY 11001', dob: '1980-12-25', emergency: '+1234567803' },
    { email: 'olivia.garcia@email.com', name: 'Olivia Garcia', phone: '+1234567804', address: '258 Spruce Ave, Yonkers, NY 10701', dob: '1997-02-14', emergency: '+1234567805' },
    { email: 'william.martinez@email.com', name: 'William Martinez', phone: '+1234567806', address: '369 Willow Dr, White Plains, NY 10601', dob: '1975-08-30', emergency: '+1234567807' },
    { email: 'sophia.rodriguez@email.com', name: 'Sophia Rodriguez', phone: '+1234567808', address: '741 Ash St, New Rochelle, NY 10801', dob: '1993-05-18', emergency: '+1234567809' },
    { email: 'benjamin.lopez@email.com', name: 'Benjamin Lopez', phone: '+1234567810', address: '852 Poplar Ave, Mount Vernon, NY 10550', dob: '1987-10-07', emergency: '+1234567811' },
    { email: 'ava.gonzalez@email.com', name: 'Ava Gonzalez', phone: '+1234567812', address: '963 Cherry Ln, Scarsdale, NY 10583', dob: '1991-01-23', emergency: '+1234567813' },
    { email: 'alexander.lee@email.com', name: 'Alexander Lee', phone: '+1234567814', address: '159 Walnut St, Rye, NY 10580', dob: '1984-06-11', emergency: '+1234567815' },
    { email: 'charlotte.taylor@email.com', name: 'Charlotte Taylor', phone: '+1234567816', address: '357 Hickory Dr, Mamaroneck, NY 10543', dob: '1996-03-09', emergency: '+1234567817' },
    { email: 'daniel.anderson@email.com', name: 'Daniel Anderson', phone: '+1234567818', address: '468 Sycamore Ave, Harrison, NY 10528', dob: '1989-12-02', emergency: '+1234567819' }
  ]

  const patients = await Promise.all(
    patientData.map(patient => 
      prisma.user.upsert({
        where: { email: patient.email },
        update: {},
        create: {
          email: patient.email,
          password: patientPassword,
          name: patient.name,
          role: 'PATIENT',
          isApproved: true,
          patient: {
            create: {
              phone: patient.phone,
              address: patient.address,
              dateOfBirth: new Date(patient.dob),
              emergencyContact: patient.emergency
            }
          }
        }
      })
    )
  )

  // Create Sample Pharmacies (8 pharmacies)
  const pharmacyPassword = await bcrypt.hash('pharmacy123', 10)
  const pharmacyData = [
    { email: 'citycare@pharmacy.com', manager: 'CityCare Pharmacy Manager', name: 'CityCare Pharmacy', address: '789 Health Blvd, Manhattan, NY 10001', phone: '+1234567894', license: 'PH001', lat: 40.7128, lng: -74.0060 },
    { email: 'wellness@pharmacy.com', manager: 'Wellness Pharmacy Manager', name: 'Wellness Pharmacy', address: '321 Care Street, Brooklyn, NY 11201', phone: '+1234567895', license: 'PH002', lat: 40.7589, lng: -73.9851 },
    { email: 'healthplus@pharmacy.com', manager: 'HealthPlus Manager', name: 'HealthPlus Pharmacy', address: '555 Medical Ave, Queens, NY 11101', phone: '+1234567820', license: 'PH003', lat: 40.7505, lng: -73.9934 },
    { email: 'quickcare@pharmacy.com', manager: 'QuickCare Manager', name: 'QuickCare Pharmacy', address: '777 Rapid St, Bronx, NY 10451', phone: '+1234567821', license: 'PH004', lat: 40.8448, lng: -73.8648 },
    { email: 'medcenter@pharmacy.com', manager: 'MedCenter Manager', name: 'MedCenter Pharmacy', address: '999 Hospital Dr, Staten Island, NY 10301', phone: '+1234567822', license: 'PH005', lat: 40.5795, lng: -74.1502 },
    { email: 'familycare@pharmacy.com', manager: 'FamilyCare Manager', name: 'FamilyCare Pharmacy', address: '444 Community Blvd, Yonkers, NY 10701', phone: '+1234567823', license: 'PH006', lat: 40.9312, lng: -73.8988 },
    { email: '247pharma@pharmacy.com', manager: '24/7 Pharma Manager', name: '24/7 Pharmacy', address: '123 Always Open St, White Plains, NY 10601', phone: '+1234567824', license: 'PH007', lat: 41.0340, lng: -73.7629 },
    { email: 'cornerstore@pharmacy.com', manager: 'Corner Store Manager', name: 'Corner Store Pharmacy', address: '678 Neighborhood Ave, New Rochelle, NY 10801', phone: '+1234567825', license: 'PH008', lat: 40.9115, lng: -73.7823 }
  ]

  const pharmacies = await Promise.all(
    pharmacyData.map(pharmacy => 
      prisma.user.upsert({
        where: { email: pharmacy.email },
        update: {},
        create: {
          email: pharmacy.email,
          password: pharmacyPassword,
          name: pharmacy.manager,
          role: 'PHARMACY',
          isApproved: true,
          pharmacy: {
            create: {
              name: pharmacy.name,
              address: pharmacy.address,
              phone: pharmacy.phone,
              license: pharmacy.license,
              latitude: pharmacy.lat,
              longitude: pharmacy.lng
            }
          }
        }
      })
    )
  )

  // Create Sample Doctors (10 doctors)
  const doctorPassword = await bcrypt.hash('doctor123', 10)
  const doctorData = [
    { email: 'dr.smith@healthmate.com', name: 'Dr. Sarah Smith', specialization: 'General Medicine', qualifications: 'MBBS, MD', experience: 10, fee: 75.00, phone: '+1234567896', address: '555 Medical Center Dr, Manhattan, NY 10016', license: 'MD001' },
    { email: 'dr.johnson@healthmate.com', name: 'Dr. Michael Johnson', specialization: 'Cardiology', qualifications: 'MBBS, MD, DM Cardiology', experience: 15, fee: 125.00, phone: '+1234567897', address: '777 Heart Center Ave, Brooklyn, NY 11201', license: 'MD002' },
    { email: 'dr.williams@healthmate.com', name: 'Dr. Emily Williams', specialization: 'Pediatrics', qualifications: 'MBBS, MD Pediatrics', experience: 8, fee: 90.00, phone: '+1234567826', address: '123 Children Hospital Rd, Queens, NY 11101', license: 'MD003' },
    { email: 'dr.brown@healthmate.com', name: 'Dr. Robert Brown', specialization: 'Orthopedics', qualifications: 'MBBS, MS Orthopedics', experience: 12, fee: 110.00, phone: '+1234567827', address: '456 Bone Care Blvd, Bronx, NY 10451', license: 'MD004' },
    { email: 'dr.davis@healthmate.com', name: 'Dr. Jennifer Davis', specialization: 'Dermatology', qualifications: 'MBBS, MD Dermatology', experience: 7, fee: 100.00, phone: '+1234567828', address: '789 Skin Clinic Ave, Staten Island, NY 10301', license: 'MD005' },
    { email: 'dr.wilson@healthmate.com', name: 'Dr. Christopher Wilson', specialization: 'Neurology', qualifications: 'MBBS, MD, DM Neurology', experience: 18, fee: 150.00, phone: '+1234567829', address: '321 Brain Center St, Yonkers, NY 10701', license: 'MD006' },
    { email: 'dr.garcia@healthmate.com', name: 'Dr. Maria Garcia', specialization: 'Gynecology', qualifications: 'MBBS, MD Gynecology', experience: 11, fee: 95.00, phone: '+1234567830', address: '654 Women Health Dr, White Plains, NY 10601', license: 'MD007' },
    { email: 'dr.martinez@healthmate.com', name: 'Dr. Carlos Martinez', specialization: 'Psychiatry', qualifications: 'MBBS, MD Psychiatry', experience: 9, fee: 120.00, phone: '+1234567831', address: '987 Mental Health Ave, New Rochelle, NY 10801', license: 'MD008' },
    { email: 'dr.anderson@healthmate.com', name: 'Dr. Lisa Anderson', specialization: 'Ophthalmology', qualifications: 'MBBS, MS Ophthalmology', experience: 13, fee: 105.00, phone: '+1234567832', address: '147 Eye Care Ln, Mount Vernon, NY 10550', license: 'MD009' },
    { email: 'dr.taylor@healthmate.com', name: 'Dr. James Taylor', specialization: 'Endocrinology', qualifications: 'MBBS, MD, DM Endocrinology', experience: 14, fee: 130.00, phone: '+1234567833', address: '258 Hormone Health St, Scarsdale, NY 10583', license: 'MD010' }
  ]

  const doctors = await Promise.all(
    doctorData.map(doctor => 
      prisma.user.upsert({
        where: { email: doctor.email },
        update: {},
        create: {
          email: doctor.email,
          password: doctorPassword,
          name: doctor.name,
          role: 'DOCTOR',
          isApproved: true,
          doctor: {
            create: {
              specialization: doctor.specialization,
              qualifications: doctor.qualifications,
              experience: doctor.experience,
              consultationFee: doctor.fee,
              phone: doctor.phone,
              address: doctor.address,
              license: doctor.license
            }
          }
        }
      })
    )
  )

  // Create Sample Laboratories (6 laboratories)
  const labPassword = await bcrypt.hash('lab123', 10)
  const labData = [
    { email: 'central@lab.com', manager: 'Central Lab Manager', name: 'Central Diagnostics Lab', address: '999 Lab Street, Manhattan, NY 10001', phone: '+1234567898', license: 'LAB001', lat: 40.7505, lng: -73.9934 },
    { email: 'quicklab@lab.com', manager: 'QuickLab Manager', name: 'QuickLab Services', address: '456 Diagnostic Ave, Brooklyn, NY 11201', phone: '+1234567899', license: 'LAB002', lat: 40.7489, lng: -73.9680 },
    { email: 'precision@lab.com', manager: 'Precision Lab Manager', name: 'Precision Laboratory', address: '123 Accurate St, Queens, NY 11101', phone: '+1234567834', license: 'LAB003', lat: 40.7505, lng: -73.9934 },
    { email: 'citywide@lab.com', manager: 'CityWide Manager', name: 'CityWide Diagnostics', address: '789 Test Ave, Bronx, NY 10451', phone: '+1234567835', license: 'LAB004', lat: 40.8448, lng: -73.8648 },
    { email: 'advancedlab@lab.com', manager: 'Advanced Lab Manager', name: 'Advanced Medical Lab', address: '321 Science Dr, Staten Island, NY 10301', phone: '+1234567836', license: 'LAB005', lat: 40.5795, lng: -74.1502 },
    { email: 'express@lab.com', manager: 'Express Lab Manager', name: 'Express Laboratory', address: '654 Fast Results Blvd, Yonkers, NY 10701', phone: '+1234567837', license: 'LAB006', lat: 40.9312, lng: -73.8988 }
  ]

  const laboratories = await Promise.all(
    labData.map(lab => 
      prisma.user.upsert({
        where: { email: lab.email },
        update: {},
        create: {
          email: lab.email,
          password: labPassword,
          name: lab.manager,
          role: 'LABORATORY',
          isApproved: true,
          laboratory: {
            create: {
              name: lab.name,
              address: lab.address,
              phone: lab.phone,
              license: lab.license,
              latitude: lab.lat,
              longitude: lab.lng
            }
          }
        }
      })
    )
  )

  // Create Sample Delivery Partners (8 delivery partners)
  const deliveryPassword = await bcrypt.hash('delivery123', 10)
  const deliveryData = [
    { email: 'alex.driver@delivery.com', name: 'Alex Driver', vehicle: 'Motorcycle', license: 'DL001', phone: '+1234567899', address: '111 Delivery Ave, Manhattan, NY 10001', lat: 40.7282, lng: -74.0776, available: true },
    { email: 'sam.courier@delivery.com', name: 'Sam Courier', vehicle: 'Bicycle', license: 'DL002', phone: '+1234567800', address: '222 Fast Lane, Brooklyn, NY 11201', lat: 40.7614, lng: -73.9776, available: true },
    { email: 'maria.rider@delivery.com', name: 'Maria Rider', vehicle: 'Scooter', license: 'DL003', phone: '+1234567838', address: '333 Quick St, Queens, NY 11101', lat: 40.7505, lng: -73.9934, available: true },
    { email: 'john.speed@delivery.com', name: 'John Speed', vehicle: 'Car', license: 'DL004', phone: '+1234567839', address: '444 Rush Ave, Bronx, NY 10451', lat: 40.8448, lng: -73.8648, available: false },
    { email: 'lisa.express@delivery.com', name: 'Lisa Express', vehicle: 'Motorcycle', license: 'DL005', phone: '+1234567840', address: '555 Swift Blvd, Staten Island, NY 10301', lat: 40.5795, lng: -74.1502, available: true },
    { email: 'mike.flash@delivery.com', name: 'Mike Flash', vehicle: 'Bicycle', license: 'DL006', phone: '+1234567841', address: '666 Rapid Dr, Yonkers, NY 10701', lat: 40.9312, lng: -73.8988, available: true },
    { email: 'anna.zoom@delivery.com', name: 'Anna Zoom', vehicle: 'Scooter', license: 'DL007', phone: '+1234567842', address: '777 Lightning Ln, White Plains, NY 10601', lat: 41.0340, lng: -73.7629, available: false },
    { email: 'carlos.rocket@delivery.com', name: 'Carlos Rocket', vehicle: 'Car', license: 'DL008', phone: '+1234567843', address: '888 Turbo St, New Rochelle, NY 10801', lat: 40.9115, lng: -73.7823, available: true }
  ]

  const deliveryPartners = await Promise.all(
    deliveryData.map(delivery => 
      prisma.user.upsert({
        where: { email: delivery.email },
        update: {},
        create: {
          email: delivery.email,
          password: deliveryPassword,
          name: delivery.name,
          role: 'DELIVERY_PARTNER',
          isApproved: true,
          deliveryPartner: {
            create: {
              vehicleType: delivery.vehicle,
              licenseNumber: delivery.license,
              phone: delivery.phone,
              address: delivery.address,
              latitude: delivery.lat,
              longitude: delivery.lng,
              isAvailable: delivery.available
            }
          }
        }
      })
    )
  )

  // Create Comprehensive Medicine Data for All Pharmacies
  const allPharmacies = await prisma.pharmacy.findMany()
  
  // Common medicines with different availability across pharmacies
  const medicineTemplates = [
    { name: 'Paracetamol', description: 'Pain reliever and fever reducer', basePrice: 5.99, unit: 'tablet' },
    { name: 'Ibuprofen', description: 'Anti-inflammatory pain reliever', basePrice: 8.99, unit: 'tablet' },
    { name: 'Aspirin', description: 'Blood thinner and pain reliever', basePrice: 6.99, unit: 'tablet' },
    { name: 'Amoxicillin', description: 'Antibiotic for bacterial infections', basePrice: 15.99, unit: 'capsule' },
    { name: 'Cetirizine', description: 'Antihistamine for allergies', basePrice: 12.99, unit: 'tablet' },
    { name: 'Omeprazole', description: 'Proton pump inhibitor for acid reflux', basePrice: 18.99, unit: 'capsule' },
    { name: 'Lisinopril', description: 'ACE inhibitor for blood pressure', basePrice: 22.99, unit: 'tablet' },
    { name: 'Metformin', description: 'Diabetes medication', basePrice: 14.99, unit: 'tablet' },
    { name: 'Atorvastatin', description: 'Cholesterol-lowering medication', basePrice: 25.99, unit: 'tablet' },
    { name: 'Levothyroxine', description: 'Thyroid hormone replacement', basePrice: 19.99, unit: 'tablet' },
    { name: 'Amlodipine', description: 'Calcium channel blocker for hypertension', basePrice: 16.99, unit: 'tablet' },
    { name: 'Metoprolol', description: 'Beta blocker for heart conditions', basePrice: 20.99, unit: 'tablet' },
    { name: 'Prednisone', description: 'Corticosteroid for inflammation', basePrice: 13.99, unit: 'tablet' },
    { name: 'Azithromycin', description: 'Macrolide antibiotic', basePrice: 28.99, unit: 'tablet' },
    { name: 'Ciprofloxacin', description: 'Fluoroquinolone antibiotic', basePrice: 24.99, unit: 'tablet' },
    { name: 'Hydrochlorothiazide', description: 'Diuretic for blood pressure', basePrice: 11.99, unit: 'tablet' },
    { name: 'Sertraline', description: 'SSRI antidepressant', basePrice: 32.99, unit: 'tablet' },
    { name: 'Gabapentin', description: 'Anticonvulsant for nerve pain', basePrice: 21.99, unit: 'capsule' },
    { name: 'Tramadol', description: 'Opioid pain medication', basePrice: 35.99, unit: 'tablet' },
    { name: 'Losartan', description: 'ARB for blood pressure', basePrice: 17.99, unit: 'tablet' },
    { name: 'Furosemide', description: 'Loop diuretic', basePrice: 9.99, unit: 'tablet' },
    { name: 'Warfarin', description: 'Blood anticoagulant', basePrice: 12.99, unit: 'tablet' },
    { name: 'Insulin Glargine', description: 'Long-acting insulin', basePrice: 89.99, unit: 'pen' },
    { name: 'Albuterol', description: 'Bronchodilator inhaler', basePrice: 45.99, unit: 'inhaler' },
    { name: 'Montelukast', description: 'Leukotriene receptor antagonist', basePrice: 27.99, unit: 'tablet' }
  ]

  let medicineCounter = 1
  for (const pharmacy of allPharmacies) {
    // Each pharmacy gets 15-20 random medicines
    const numMedicines = Math.floor(Math.random() * 6) + 15
    const selectedMedicines = medicineTemplates.sort(() => 0.5 - Math.random()).slice(0, numMedicines)
    
    for (const medTemplate of selectedMedicines) {
      // Add some price variation (±20%)
      const priceVariation = (Math.random() - 0.5) * 0.4
      const price = Number((medTemplate.basePrice * (1 + priceVariation)).toFixed(2))
      
      // Random stock between 50-500
      const stock = Math.floor(Math.random() * 451) + 50
      
      await prisma.medicine.upsert({
        where: { id: `med-${medicineCounter}` },
        update: {},
        create: {
          id: `med-${medicineCounter}`,
          pharmacyId: pharmacy.id,
          name: medTemplate.name,
          description: medTemplate.description,
          price: price,
          unit: medTemplate.unit,
          stock: stock
        }
      })
      medicineCounter++
    }
  }

  // Create Comprehensive Lab Tests for All Laboratories
  const allLaboratories = await prisma.laboratory.findMany()
  
  const labTestTemplates = [
    { name: 'Complete Blood Count (CBC)', description: 'Comprehensive blood analysis', basePrice: 45.00, duration: '24 hours', requirements: 'Fasting not required' },
    { name: 'Lipid Profile', description: 'Cholesterol and triglyceride levels', basePrice: 35.00, duration: '12 hours', requirements: '12 hours fasting required' },
    { name: 'Blood Sugar (Random)', description: 'Random blood glucose test', basePrice: 15.00, duration: '2 hours', requirements: 'No fasting required' },
    { name: 'Thyroid Function Test', description: 'TSH, T3, and T4 levels', basePrice: 55.00, duration: '24 hours', requirements: 'Morning sample preferred' },
    { name: 'Liver Function Test', description: 'Complete liver enzyme analysis', basePrice: 40.00, duration: '12 hours', requirements: '8 hours fasting required' },
    { name: 'Kidney Function Test', description: 'Creatinine, BUN, and electrolytes', basePrice: 38.00, duration: '12 hours', requirements: 'No special preparation' },
    { name: 'HbA1c', description: 'Average blood sugar over 3 months', basePrice: 42.00, duration: '24 hours', requirements: 'No fasting required' },
    { name: 'Vitamin D', description: '25-hydroxyvitamin D levels', basePrice: 65.00, duration: '48 hours', requirements: 'No special preparation' },
    { name: 'Vitamin B12', description: 'B12 deficiency screening', basePrice: 48.00, duration: '24 hours', requirements: 'No fasting required' },
    { name: 'Iron Studies', description: 'Iron, TIBC, and ferritin levels', basePrice: 52.00, duration: '24 hours', requirements: 'Morning sample preferred' },
    { name: 'ESR', description: 'Erythrocyte sedimentation rate', basePrice: 20.00, duration: '4 hours', requirements: 'No special preparation' },
    { name: 'CRP', description: 'C-reactive protein inflammation marker', basePrice: 28.00, duration: '6 hours', requirements: 'No fasting required' },
    { name: 'PSA', description: 'Prostate specific antigen (men)', basePrice: 58.00, duration: '24 hours', requirements: 'No ejaculation 48hrs before' },
    { name: 'CA 125', description: 'Ovarian cancer marker (women)', basePrice: 72.00, duration: '48 hours', requirements: 'Avoid during menstruation' },
    { name: 'Hepatitis B Panel', description: 'HBsAg, Anti-HBs, Anti-HBc', basePrice: 85.00, duration: '48 hours', requirements: 'No special preparation' },
    { name: 'Hepatitis C', description: 'Anti-HCV antibodies', basePrice: 75.00, duration: '48 hours', requirements: 'No special preparation' },
    { name: 'HIV Test', description: 'Confidential HIV screening', basePrice: 95.00, duration: '48 hours', requirements: 'Pre-test counseling available' },
    { name: 'Urine Analysis', description: 'Complete urine examination', basePrice: 25.00, duration: '4 hours', requirements: 'Morning first urine sample' },
    { name: 'Stool Analysis', description: 'Parasites, blood, and bacteria', basePrice: 30.00, duration: '24 hours', requirements: 'Fresh sample required' },
    { name: 'Cardiac Enzymes', description: 'Troponin, CK-MB for heart health', basePrice: 95.00, duration: '6 hours', requirements: 'Urgent test available' }
  ]

  let testCounter = 1
  for (const laboratory of allLaboratories) {
    // Each lab gets 12-18 random tests
    const numTests = Math.floor(Math.random() * 7) + 12
    const selectedTests = labTestTemplates.sort(() => 0.5 - Math.random()).slice(0, numTests)
    
    for (const testTemplate of selectedTests) {
      // Add some price variation (±15%)
      const priceVariation = (Math.random() - 0.5) * 0.3
      const price = Number((testTemplate.basePrice * (1 + priceVariation)).toFixed(2))
      
      await prisma.labTest.upsert({
        where: { id: `test-${testCounter}` },
        update: {},
        create: {
          id: `test-${testCounter}`,
          laboratoryId: laboratory.id,
          name: testTemplate.name,
          description: testTemplate.description,
          price: price,
          duration: testTemplate.duration,
          requirements: testTemplate.requirements
        }
      })
      testCounter++
    }
  }

  // Create Doctor Availability for All Doctors
  const allDoctors = await prisma.doctor.findMany()
  
  const availabilityPatterns = [
    { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' }, // Mon-Fri 9-5
    { days: [1, 2, 3, 4, 5], start: '10:00', end: '18:00' }, // Mon-Fri 10-6
    { days: [1, 2, 3, 4, 5], start: '08:00', end: '16:00' }, // Mon-Fri 8-4
    { days: [1, 2, 3, 4, 5, 6], start: '09:00', end: '15:00' }, // Mon-Sat 9-3
    { days: [2, 3, 4, 5, 6], start: '10:00', end: '18:00' }, // Tue-Sat 10-6
  ]

  let availCounter = 1
  for (const doctor of allDoctors) {
    const pattern = availabilityPatterns[Math.floor(Math.random() * availabilityPatterns.length)]
    
    for (const day of pattern.days) {
      await prisma.doctorAvailability.upsert({
        where: { id: `avail-${availCounter}` },
        update: {},
        create: {
          id: `avail-${availCounter}`,
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: pattern.start,
          endTime: pattern.end
        }
      })
      availCounter++
    }
  }

  // Create Sample Prescriptions, Orders, Appointments, Lab Bookings
  const allPatients = await prisma.patient.findMany()
  const allMedicines = await prisma.medicine.findMany()
  const allTests = await prisma.labTest.findMany()
  
  // Create 25 sample orders
  const orderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const
  const orderTypes = ['PRESCRIPTION_BASED', 'DIRECT'] as const
  
  for (let i = 1; i <= 25; i++) {
    const patient = allPatients[Math.floor(Math.random() * allPatients.length)]
    const pharmacy = allPharmacies[Math.floor(Math.random() * allPharmacies.length)]
    const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)]
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
    
    // Random order from last 30 days
    const orderDate = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
    
    const totalAmount = Math.floor(Math.random() * 200) + 20
    const commissionAmount = Math.floor(totalAmount * 0.05)
    const netAmount = totalAmount - commissionAmount
    
    const order = await prisma.order.create({
      data: {
        userId: patient.userId,
        patientId: patient.id,
        pharmacyId: pharmacy.id,
        status: status,
        totalAmount: totalAmount,
        commissionAmount: commissionAmount,
        netAmount: netAmount,
        deliveryAddress: patient.address || '123 Default St, NY 10001',
        createdAt: orderDate
      }
    })

    // Add 1-4 order items for each order
    const numItems = Math.floor(Math.random() * 4) + 1
    const pharmacyMedicines = allMedicines.filter(med => med.pharmacyId === pharmacy.id)
    
    if (pharmacyMedicines.length > 0) {
      for (let j = 0; j < numItems; j++) {
        const medicine = pharmacyMedicines[Math.floor(Math.random() * pharmacyMedicines.length)]
        const quantity = Math.floor(Math.random() * 5) + 1
        const unitPrice = medicine.price
        const totalPrice = unitPrice * quantity
        
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            medicineId: medicine.id,
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice
          }
        })
      }
    }
  }

  // Create 20 sample appointments
  const appointmentStatuses = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const
  
  for (let i = 1; i <= 20; i++) {
    const patient = allPatients[Math.floor(Math.random() * allPatients.length)]
    const doctor = allDoctors[Math.floor(Math.random() * allDoctors.length)]
    
    // Mix of past and future appointments
    const appointmentDate = i <= 10 
      ? randomDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), new Date())
      : randomFutureDate(30)
    
    const status = appointmentStatuses[Math.floor(Math.random() * appointmentStatuses.length)] as 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    
    const consultationFee = doctor.consultationFee
    const commissionAmount = consultationFee * 0.05
    
    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: appointmentDate,
        duration: [30, 45, 60][Math.floor(Math.random() * 3)],
        status: status,
        consultationFee: consultationFee,
        commissionAmount: commissionAmount,
        netAmount: consultationFee - commissionAmount
      }
    })
  }

  // Create 15 sample lab bookings
  const labBookingStatuses = ['BOOKED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'REPORT_READY'] as const
  
  for (let i = 1; i <= 15; i++) {
    const patient = allPatients[Math.floor(Math.random() * allPatients.length)]
    const test = allTests[Math.floor(Math.random() * allTests.length)]
    const status = labBookingStatuses[Math.floor(Math.random() * labBookingStatuses.length)]
    
    // Mix of past and future bookings
    const bookingDate = i <= 8
      ? randomDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), new Date())
      : randomFutureDate(20)
    
    const commissionAmount = Math.floor(test.price * 0.05)
    
    await prisma.labBooking.create({
      data: {
        patientId: patient.id,
        laboratoryId: test.laboratoryId,
        labTestId: test.id,
        scheduledDate: bookingDate,
        status: status,
        totalAmount: test.price,
        commissionAmount: commissionAmount,
        netAmount: test.price - commissionAmount
      }
    })
  }

  // Create sample notifications for all users
  const notificationTypes = ['ORDER_UPDATE', 'APPOINTMENT_REMINDER', 'LAB_REPORT_READY', 'DELIVERY_UPDATE', 'PAYMENT_CONFIRMATION'] as const
  const allUsers = await prisma.user.findMany()
  
  for (let i = 1; i <= 50; i++) {
    const user = allUsers[Math.floor(Math.random() * allUsers.length)]
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
    const isRead = Math.random() > 0.4 // 60% read, 40% unread
    
    const notificationDate = randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date())
    
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: type,
        title: `${type.replace('_', ' ')} Notification`,
        message: `This is a sample ${type.toLowerCase().replace('_', ' ')} notification for testing purposes.`,
        isRead: isRead,
        createdAt: notificationDate
      }
    })
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