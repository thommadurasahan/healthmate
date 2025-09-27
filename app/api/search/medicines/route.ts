import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Removed distance calculation - pharmacies sorted by availability only

// GET /api/search/medicines - Search medicines across pharmacies
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const medicines = searchParams.get('medicines')?.split(',') || []

    if (!query && medicines.length === 0) {
      return NextResponse.json({ error: 'Search query or medicine list required' }, { status: 400 })
    }

    let medicineWhere: any = { 
      isActive: true,
      stock: { gt: 0 } // Only show medicines in stock
    }

    if (query) {
      medicineWhere.name = {
        contains: query,
        mode: 'insensitive'
      }
    }

    if (medicines.length > 0) {
      medicineWhere.name = {
        in: medicines,
        mode: 'insensitive'
      }
    }

    // Find all medicines matching the criteria
    const foundMedicines = await prisma.medicine.findMany({
      where: medicineWhere,
      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            isApproved: true
          }
        }
      }
    })

    // Filter only approved pharmacies
    const approvedMedicines = foundMedicines.filter(med => med.pharmacy.isApproved)

    // Group medicines by pharmacy (no distance calculation)
    const pharmacyGroups = new Map()

    approvedMedicines.forEach(medicine => {
      const pharmacyId = medicine.pharmacy.id
      
      if (!pharmacyGroups.has(pharmacyId)) {
        pharmacyGroups.set(pharmacyId, {
          pharmacy: medicine.pharmacy,
          medicines: [],
          totalMedicines: 0,
          totalValue: 0
        })
      }

      const group = pharmacyGroups.get(pharmacyId)
      group.medicines.push({
        id: medicine.id,
        name: medicine.name,
        description: medicine.description,
        price: medicine.price,
        unit: medicine.unit,
        stock: medicine.stock
      })
      group.totalMedicines += 1
      group.totalValue += medicine.price
    })

    // Convert to array (no distance sorting - system default order)
    const results = Array.from(pharmacyGroups.values())

    return NextResponse.json({
      query,
      totalPharmacies: results.length,
      totalMedicines: approvedMedicines.length,
      results
    })
  } catch (error) {
    console.error('Error searching medicines:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/search/medicines - Search medicines by prescription data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { medicineNames } = body

    if (!medicineNames || !Array.isArray(medicineNames) || medicineNames.length === 0) {
      return NextResponse.json({ error: 'Medicine names array required' }, { status: 400 })
    }

    // Create a more flexible search for medicine names
    const medicineQueries = medicineNames.map(name => ({
      name: {
        contains: name.trim(),
        mode: 'insensitive'
      }
    }))

    const foundMedicines = await prisma.medicine.findMany({
      where: {
        AND: [
          { isActive: true },
          { stock: { gt: 0 } },
          { OR: medicineQueries }
        ]
      },
      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            isApproved: true
          }
        }
      }
    })

    // Filter only approved pharmacies
    const approvedMedicines = foundMedicines.filter(med => med.pharmacy.isApproved)

    // Group by pharmacy (no distance calculation)
    const pharmacyGroups = new Map()

    approvedMedicines.forEach(medicine => {
      const pharmacyId = medicine.pharmacy.id
      
      if (!pharmacyGroups.has(pharmacyId)) {
        pharmacyGroups.set(pharmacyId, {
          pharmacy: medicine.pharmacy,
          availableMedicines: [],
          matchedCount: 0,
          totalValue: 0,
          coveragePercentage: 0
        })
      }

      const group = pharmacyGroups.get(pharmacyId)
      group.availableMedicines.push({
        id: medicine.id,
        name: medicine.name,
        description: medicine.description,
        price: medicine.price,
        unit: medicine.unit,
        stock: medicine.stock,
        prescriptionMatch: medicineNames.find(name => 
          medicine.name.toLowerCase().includes(name.toLowerCase()) || 
          name.toLowerCase().includes(medicine.name.toLowerCase())
        )
      })
      group.matchedCount += 1
      group.totalValue += medicine.price
    })

    // Calculate coverage percentage (no distance sorting)
    const results = Array.from(pharmacyGroups.values()).map(group => ({
      ...group,
      coveragePercentage: Math.round((group.matchedCount / medicineNames.length) * 100)
    })).sort((a, b) => {
      // Sort by coverage percentage only
      return b.coveragePercentage - a.coveragePercentage
    })

    return NextResponse.json({
      requestedMedicines: medicineNames,
      totalPharmacies: results.length,
      totalMedicinesFound: approvedMedicines.length,
      results
    })
  } catch (error) {
    console.error('Error searching medicines by prescription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
