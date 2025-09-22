import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/doctors - Get available doctors
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const specialization = searchParams.get('specialization')
    const search = searchParams.get('search')

    let where: any = { 
      isApproved: true,
      user: {
        isApproved: true
      }
    }

    if (specialization) {
      where.specialization = {
        contains: specialization,
        mode: 'insensitive'
      }
    }

    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          specialization: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        availabilities: {
          where: {
            isActive: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    })

    return NextResponse.json(doctors)
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/doctors/availability - Set doctor availability (doctors only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { availabilities } = body

    if (!availabilities || !Array.isArray(availabilities)) {
      return NextResponse.json({ error: 'Invalid availability data' }, { status: 400 })
    }

    // Delete existing availabilities
    await prisma.doctorAvailability.deleteMany({
      where: {
        doctorId: session.user.doctor.id
      }
    })

    // Create new availabilities
    const createdAvailabilities = await prisma.doctorAvailability.createMany({
      data: availabilities.map((avail: any) => ({
        doctorId: session.user.doctor.id,
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
        isActive: true
      }))
    })

    return NextResponse.json(createdAvailabilities)
  } catch (error) {
    console.error('Error setting doctor availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}