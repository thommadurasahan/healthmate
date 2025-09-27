import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/lab-tests - Get lab tests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const laboratoryId = searchParams.get('laboratoryId')
    const search = searchParams.get('search')

    let where: any = { isActive: true }

    if (laboratoryId) {
      where.laboratoryId = laboratoryId
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const labTests = await prisma.labTest.findMany({
      where,
      include: {
        laboratory: {
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

    return NextResponse.json(labTests)
  } catch (error) {
    console.error('Error fetching lab tests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lab-tests - Add new lab test (laboratory only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'LABORATORY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, duration, requirements } = body

    if (!name || !price || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const labTest = await prisma.labTest.create({
      data: {
        laboratoryId: session.user.laboratory.id,
        name,
        description,
        price: parseFloat(price),
        duration,
        requirements
      }
    })

    return NextResponse.json(labTest)
  } catch (error) {
    console.error('Error creating lab test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
