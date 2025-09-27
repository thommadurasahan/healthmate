import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/medicines - Get medicines for a pharmacy or search
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pharmacyId = searchParams.get('pharmacyId')
    const search = searchParams.get('search')

    let where: any = { isActive: true }

    if (pharmacyId) {
      where.pharmacyId = pharmacyId
    }

    if (search) {
      where.name = {
        contains: search
      }
    }

    const medicines = await prisma.medicine.findMany({
      where,
      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(medicines)
  } catch (error) {
    console.error('Error fetching medicines:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/medicines - Add new medicine (pharmacy only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PHARMACY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, unit, stock } = body

    if (!name || !price || !unit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const medicine = await prisma.medicine.create({
      data: {
        pharmacyId: session.user.pharmacy.id,
        name,
        description,
        price: parseFloat(price),
        unit,
        stock: parseInt(stock) || 0
      }
    })

    return NextResponse.json(medicine)
  } catch (error) {
    console.error('Error creating medicine:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
