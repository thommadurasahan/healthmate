// Simple test to check if medicines exist in database
import { prisma } from './lib/db.js'

async function testMedicineData() {
  try {
    console.log('🔍 Testing medicine database...')
    
    // Check total medicines
    const totalMedicines = await prisma.medicine.count()
    console.log(`📊 Total medicines in database: ${totalMedicines}`)
    
    // Check active medicines
    const activeMedicines = await prisma.medicine.count({
      where: { isActive: true }
    })
    console.log(`✅ Active medicines: ${activeMedicines}`)
    
    // Check medicines with stock
    const inStockMedicines = await prisma.medicine.count({
      where: { 
        isActive: true,
        stock: { gt: 0 }
      }
    })
    console.log(`📦 Medicines with stock: ${inStockMedicines}`)
    
    // Check approved pharmacies
    const approvedPharmacies = await prisma.pharmacy.count({
      where: { isApproved: true }
    })
    console.log(`🏥 Approved pharmacies: ${approvedPharmacies}`)
    
    // Check medicines from approved pharmacies
    const medicinesFromApprovedPharmacies = await prisma.medicine.count({
      where: {
        isActive: true,
        stock: { gt: 0 },
        pharmacy: { isApproved: true }
      }
    })
    console.log(`✅ Medicines from approved pharmacies with stock: ${medicinesFromApprovedPharmacies}`)
    
    // Sample some medicines
    const sampleMedicines = await prisma.medicine.findMany({
      take: 5,
      where: {
        isActive: true,
        stock: { gt: 0 },
        pharmacy: { isApproved: true }
      },
      include: {
        pharmacy: {
          select: { name: true, isApproved: true }
        }
      }
    })
    
    console.log('\n📋 Sample medicines:')
    sampleMedicines.forEach(med => {
      console.log(`  - ${med.name} at ${med.pharmacy.name} (stock: ${med.stock}, price: $${med.price})`)
    })
    
    // Test specific search
    console.log('\n🔎 Testing search for "Paracetamol":')
    const paracetamolResults = await prisma.medicine.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
        name: {
          contains: 'Paracetamol'
        },
        pharmacy: { isApproved: true }
      },
      include: {
        pharmacy: {
          select: { name: true, isApproved: true }
        }
      }
    })
    
    console.log(`Found ${paracetamolResults.length} Paracetamol results:`)
    paracetamolResults.forEach(med => {
      console.log(`  - ${med.name} at ${med.pharmacy.name} (stock: ${med.stock})`)
    })
    
  } catch (error) {
    console.error('❌ Error testing medicine data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testMedicineData()