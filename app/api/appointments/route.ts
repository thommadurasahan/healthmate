import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculateCommission } from '@/lib/mock-payment'

// GET /api/appointments - Get appointments
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
    } else if (session.user.role === 'DOCTOR') {
      where.doctorId = session.user.doctor.id
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          include: {
            user: {
              select: { name: true, email: true, phone: true }
            }
          }
        },
        doctor: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        transactions: true
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { doctorId, scheduledAt, duration, notes } = body

    if (!doctorId || !scheduledAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get doctor details
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Calculate commission
    const { commission, netAmount } = calculateCommission(doctor.consultationFee)

    // Generate meeting link for video consultation
    const meetingLink = `https://meet.healthmate.com/room/${Date.now()}`

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: session.user.patient.id,
        doctorId,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 30,
        consultationFee: doctor.consultationFee,
        commissionAmount: commission,
        netAmount,
        meetingLink,
        notes
      },
      include: {
        doctor: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}