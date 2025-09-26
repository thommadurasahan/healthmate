import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/lab-bookings/[id] - Get specific lab booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const labBooking = await prisma.labBooking.findUnique({
      where: { id: params.id },
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
          select: { name: true, description: true, duration: true, requirements: true }
        },
        transactions: true
      }
    })

    if (!labBooking) {
      return NextResponse.json({ error: 'Lab booking not found' }, { status: 404 })
    }

    // Check authorization
    if (session.user.role === 'PATIENT' && labBooking.patientId !== session.user.patient.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role === 'LABORATORY' && labBooking.laboratoryId !== session.user.laboratory.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'PATIENT' && session.user.role !== 'LABORATORY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(labBooking)
  } catch (error) {
    console.error('Error fetching lab booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/lab-bookings/[id] - Update lab booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, reportFilePath } = body

    const labBooking = await prisma.labBooking.findUnique({
      where: { id: params.id },
      include: { laboratory: true, patient: true }
    })

    if (!labBooking) {
      return NextResponse.json({ error: 'Lab booking not found' }, { status: 404 })
    }

    // Check authorization - only laboratory can update their bookings
    if (session.user.role === 'LABORATORY' && labBooking.laboratoryId !== session.user.laboratory.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'LABORATORY' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prepare update data
    let updateData: any = { status }
    
    // Add timestamps based on status
    if (status === 'SAMPLE_COLLECTED') {
      updateData.sampleCollectedAt = new Date()
    }
    if (status === 'REPORT_READY') {
      updateData.reportGeneratedAt = new Date()
      if (reportFilePath) {
        updateData.reportFilePath = reportFilePath
      }
    }

    const updatedLabBooking = await prisma.labBooking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        patient: {
          include: {
            user: true
          }
        },
        laboratory: {
          select: { name: true, address: true, phone: true }
        },
        labTest: {
          select: { name: true, duration: true, requirements: true }
        },
        transactions: true
      }
    })

    return NextResponse.json(updatedLabBooking)
  } catch (error) {
    console.error('Error updating lab booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}