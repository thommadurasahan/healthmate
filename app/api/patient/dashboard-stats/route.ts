import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get patient profile
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    // Get current month and previous month dates
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)

    // Get total counts
    const [totalOrders, totalLabTests, totalAppointments] = await Promise.all([
      prisma.order.count({
        where: { patientId: patient.id }
      }),
      prisma.labBooking.count({
        where: { patientId: patient.id }
      }),
      prisma.appointment.count({
        where: { patientId: patient.id }
      })
    ])

    // Get current month counts
    const [currentMonthOrders, currentMonthLabTests, currentMonthAppointments] = await Promise.all([
      prisma.order.count({
        where: { 
          patientId: patient.id,
          createdAt: { gte: currentMonth }
        }
      }),
      prisma.labBooking.count({
        where: { 
          patientId: patient.id,
          createdAt: { gte: currentMonth }
        }
      }),
      prisma.appointment.count({
        where: { 
          patientId: patient.id,
          createdAt: { gte: currentMonth }
        }
      })
    ])

    // Get previous month counts
    const [previousMonthOrders, previousMonthLabTests, previousMonthAppointments] = await Promise.all([
      prisma.order.count({
        where: { 
          patientId: patient.id,
          createdAt: { 
            gte: previousMonth,
            lt: currentMonth
          }
        }
      }),
      prisma.labBooking.count({
        where: { 
          patientId: patient.id,
          createdAt: { 
            gte: previousMonth,
            lt: currentMonth
          }
        }
      }),
      prisma.appointment.count({
        where: { 
          patientId: patient.id,
          createdAt: { 
            gte: previousMonth,
            lt: currentMonth
          }
        }
      })
    ])

    // Calculate growth
    const monthlyOrderGrowth = currentMonthOrders - previousMonthOrders
    const monthlyLabGrowth = currentMonthLabTests - previousMonthLabTests
    const monthlyAppointmentGrowth = currentMonthAppointments - previousMonthAppointments

    const stats = {
      totalOrders,
      totalLabTests,
      totalAppointments,
      monthlyOrderGrowth,
      monthlyLabGrowth,
      monthlyAppointmentGrowth
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}