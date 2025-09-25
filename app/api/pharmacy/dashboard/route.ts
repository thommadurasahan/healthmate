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

    // Get current month and previous month dates
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Get total counts
    const [totalOrders, totalRevenue, totalMedicines] = await Promise.all([
      prisma.order.count({
        where: { pharmacyId: pharmacy.id }
      }),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          pharmacyId: pharmacy.id,
          status: 'DELIVERED'
        }
      }),
      prisma.medicine.count({
        where: { pharmacyId: pharmacy.id }
      })
    ])

    // Get current month counts
    const [currentMonthOrders, currentMonthRevenue] = await Promise.all([
      prisma.order.count({
        where: {
          pharmacyId: pharmacy.id,
          createdAt: { gte: currentMonth }
        }
      }),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          pharmacyId: pharmacy.id,
          status: 'DELIVERED',
          createdAt: { gte: currentMonth }
        }
      })
    ])

    // Calculate growth percentages
    const previousMonthOrders = await prisma.order.count({
      where: {
        pharmacyId: pharmacy.id,
        createdAt: { gte: previousMonth, lt: currentMonth }
      }
    })

    const previousMonthRevenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        pharmacyId: pharmacy.id,
        status: 'DELIVERED',
        createdAt: { gte: previousMonth, lt: currentMonth }
      }
    })

    const orderGrowth = previousMonthOrders > 0
      ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100
      : currentMonthOrders > 0 ? 100 : 0

    const revenueGrowth = previousMonthRevenue._sum.totalAmount > 0
      ? (((currentMonthRevenue._sum.totalAmount || 0) - previousMonthRevenue._sum.totalAmount) / previousMonthRevenue._sum.totalAmount) * 100
      : (currentMonthRevenue._sum.totalAmount || 0) > 0 ? 100 : 0

    // Get low stock medicines
    const lowStockMedicines = await prisma.medicine.count({
      where: {
        pharmacyId: pharmacy.id,
        stockQuantity: { lte: 10 }
      }
    })

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { pharmacyId: pharmacy.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        patient: {
          select: {
            user: {
              select: { name: true }
            }
          }
        },
        medicines: {
          include: {
            medicine: {
              select: { name: true }
            }
          }
        }
      }
    })

    const formattedOrders = recentOrders.map(order => ({
      id: order.id,
      patient: order.patient.user.name,
      medicines: order.medicines.length,
      amount: order.totalAmount,
      status: order.status,
      time: getTimeAgo(order.createdAt),
      medicinesList: order.medicines.map(m => m.medicine.name)
    }))

    // Get top selling medicines
    const topMedicines = await prisma.orderMedicine.findMany({
      where: {
        order: {
          pharmacyId: pharmacy.id,
          status: 'DELIVERED'
        }
      },
      include: {
        medicine: {
          select: { name: true, image: true, price: true }
        },
        order: {
          select: { createdAt: true }
        }
      },
      orderBy: { quantity: 'desc' },
      take: 5
    })

    const formattedTopMedicines = topMedicines.map(item => ({
      id: item.medicineId,
      name: item.medicine.name,
      image: item.medicine.image,
      totalSold: item.quantity,
      revenue: item.quantity * item.medicine.price,
      lastSold: item.order.createdAt
    }))

    // Get pending orders count
    const pendingOrders = await prisma.order.count({
      where: {
        pharmacyId: pharmacy.id,
        status: { in: ['PENDING', 'PROCESSING'] }
      }
    })

    const dashboardData = {
      stats: {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalMedicines,
        orderGrowth: Math.round(orderGrowth * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        lowStockMedicines,
        pendingOrders
      },
      recentOrders: formattedOrders,
      topMedicines: formattedTopMedicines,
      pharmacyInfo: {
        name: pharmacy.name,
        isApproved: pharmacy.isApproved,
        address: pharmacy.address,
        phone: pharmacy.phone
      }
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching pharmacy dashboard data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hours ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} days ago`

  return date.toLocaleDateString()
}
