import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'PHARMACY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get pharmacy profile
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { userId: session.user.id }
    })

    if (!pharmacy) {
      return NextResponse.json({ error: 'Pharmacy profile not found' }, { status: 404 })
    }

    // Get current date for filtering
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get comprehensive statistics
    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      pendingOrders,
      processingOrders,
      readyForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      onHoldOrders,
      urgentOrders,
      highPriorityOrders,
      normalPriorityOrders,
      lowPriorityOrders
    ] = await Promise.all([
      // Total orders count
      prisma.order.count({
        where: { pharmacyId: pharmacy.id }
      }),

      // Today's orders
      prisma.order.count({
        where: {
          pharmacyId: pharmacy.id,
          createdAt: { gte: today, lt: tomorrow }
        }
      }),

      // Total revenue (delivered orders)
      prisma.order.aggregate({
        _sum: { pharmacyAmount: true },
        where: {
          pharmacyId: pharmacy.id,
          status: 'DELIVERED'
        }
      }),

      // Today's revenue
      prisma.order.aggregate({
        _sum: { pharmacyAmount: true },
        where: {
          pharmacyId: pharmacy.id,
          status: 'DELIVERED',
          createdAt: { gte: today, lt: tomorrow }
        }
      }),

      // Status counts
      prisma.order.count({
        where: { pharmacyId: pharmacy.id, status: 'PENDING' }
      }),

      prisma.order.count({
        where: { pharmacyId: pharmacy.id, status: 'PROCESSING' }
      }),

      prisma.order.count({
        where: { pharmacyId: pharmacy.id, status: 'READY_FOR_DELIVERY' }
      }),

      prisma.order.count({
        where: { pharmacyId: pharmacy.id, status: 'DELIVERED' }
      }),

      prisma.order.count({
        where: { pharmacyId: pharmacy.id, status: 'CANCELLED' }
      }),

      prisma.order.count({
        where: { pharmacyId: pharmacy.id, status: 'ON_HOLD' }
      }),

      // Priority counts
      prisma.order.count({
        where: { pharmacyId: pharmacy.id, priority: 'urgent' }
      }),

      prisma.order.count({
        where: { pharmacyId: pharmacy.id, priority: 'high' }
      }),

      prisma.order.count({
        where: { pharmacyId: pharmacy.id, priority: 'normal' }
      }),

      prisma.order.count({
        where: { pharmacyId: pharmacy.id, priority: 'low' }
      })
    ])

    const stats = {
      totalOrders,
      todayOrders,
      totalRevenue: totalRevenue._sum.pharmacyAmount || 0,
      todayRevenue: todayRevenue._sum.pharmacyAmount || 0,
      pendingOrders,
      processingOrders,
      readyForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      onHoldOrders,
      urgentOrders,
      highPriorityOrders,
      normalPriorityOrders,
      lowPriorityOrders,
      // Additional calculated metrics
      activeOrders: pendingOrders + processingOrders + readyForDeliveryOrders,
      completionRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching pharmacy order statistics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
