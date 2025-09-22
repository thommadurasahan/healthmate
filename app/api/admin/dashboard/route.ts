import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total users
    const totalUsers = await prisma.user.count()

    // Get pending approvals
    const pendingApprovals = await prisma.user.count({
      where: {
        isApproved: false,
        role: {
          not: 'PATIENT' // Patients are auto-approved
        }
      }
    })

    // Get pending users details
    const pendingUsers = await prisma.user.findMany({
      where: {
        isApproved: false,
        role: {
          not: 'PATIENT'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get total orders
    const totalOrders = await prisma.order.count()

    // Calculate total revenue
    const orders = await prisma.order.findMany({
      select: {
        totalAmount: true,
        status: true
      }
    })
    
    const totalRevenue = orders
      .filter(order => order.status === 'DELIVERED')
      .reduce((sum, order) => sum + order.totalAmount, 0)

    // Calculate total commissions
    const totalCommissions = orders
      .filter(order => order.status === 'DELIVERED')
      .reduce((sum, order) => sum + (order.totalAmount * 0.05), 0) // Assuming 5% commission

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    // Also include lab bookings and appointments in revenue calculation
    const labBookings = await prisma.labBooking.findMany({
      where: {
        status: 'REPORT_READY'
      },
      select: {
        totalAmount: true,
        commissionAmount: true
      }
    })

    const appointments = await prisma.appointment.findMany({
      where: {
        status: 'COMPLETED'
      },
      select: {
        consultationFee: true,
        commissionAmount: true
      }
    })

    const labRevenue = labBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
    const appointmentRevenue = appointments.reduce((sum, appointment) => sum + appointment.consultationFee, 0)
    
    const labCommissions = labBookings.reduce((sum, booking) => sum + booking.commissionAmount, 0)
    const appointmentCommissions = appointments.reduce((sum, appointment) => sum + appointment.commissionAmount, 0)

    const dashboardStats = {
      totalUsers,
      pendingApprovals,
      totalOrders,
      totalRevenue: totalRevenue + labRevenue + appointmentRevenue,
      totalCommissions: totalCommissions + labCommissions + appointmentCommissions,
      recentTransactions,
      pendingUsers
    }

    return NextResponse.json(dashboardStats)
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}