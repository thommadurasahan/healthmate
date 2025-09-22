import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculateCommission } from '@/lib/mock-payment'

// GET /api/lab-bookings - Get lab bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let where: any = {}

    // Filter based on user role
    if (session.user.role === 'PATIENT') {
      where.patientId = session.user.patient.id
    } else if (session.user.role === 'LABORATORY') {
      where.laboratoryId = session.user.laboratory.id
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const labBookings = await prisma.labBooking.findMany({
      where,
      include: {
        patient: {
          include: {
            user: {
              select: { name: true, email: true, phone: true }
            }
          }
        },
        laboratory: {
          select: { name: true, address: true, phone: true }
        },
        labTest: {
          select: { name: true, duration: true, requirements: true }
        },
        transactions: true
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    })

    return NextResponse.json(labBookings)
  } catch (error) {
    console.error('Error fetching lab bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lab-bookings - Create new lab booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { laboratoryId, labTestId, scheduledDate } = body

    if (!laboratoryId || !labTestId || !scheduledDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get lab test details
    const labTest = await prisma.labTest.findUnique({
      where: { id: labTestId }
    })

    if (!labTest) {
      return NextResponse.json({ error: 'Lab test not found' }, { status: 404 })
    }

    // Calculate commission
    const { commission, netAmount } = calculateCommission(labTest.price)

    // Create lab booking
    const labBooking = await prisma.labBooking.create({
      data: {
        patientId: session.user.patient.id,
        laboratoryId,
        labTestId,
        scheduledDate: new Date(scheduledDate),
        totalAmount: labTest.price,
        commissionAmount: commission,
        netAmount
      },
      include: {
        labTest: true,
        laboratory: true
      }
    })

    return NextResponse.json(labBooking)
  } catch (error) {
    console.error('Error creating lab booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}