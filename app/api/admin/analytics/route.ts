import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/admin/analytics - Get platform analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // User registration analytics
    const userRegistrations = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    // Revenue analytics
    const orderRevenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
        commissionAmount: true
      },
      _count: {
        id: true
      },
      where: {
        status: 'DELIVERED',
        createdAt: {
          gte: startDate
        }
      }
    })

    const labRevenue = await prisma.labBooking.aggregate({
      _sum: {
        totalAmount: true,
        commissionAmount: true
      },
      _count: {
        id: true
      },
      where: {
        status: 'REPORT_READY',
        createdAt: {
          gte: startDate
        }
      }
    })

    const appointmentRevenue = await prisma.appointment.aggregate({
      _sum: {
        consultationFee: true,
        commissionAmount: true
      },
      _count: {
        id: true
      },
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate
        }
      }
    })

    // Daily revenue trend
    const dailyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        SUM(totalAmount) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE status = 'DELIVERED' 
        AND createdAt >= ${startDate}
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
      LIMIT 30
    `

    // Top performing pharmacies
    const topPharmacies = await prisma.pharmacy.findMany({
      include: {
        user: {
          select: { name: true }
        },
        orders: {
          where: {
            status: 'DELIVERED',
            createdAt: {
              gte: startDate
            }
          },
          select: {
            totalAmount: true,
            commissionAmount: true
          }
        },
        _count: {
          select: {
            orders: {
              where: {
                status: 'DELIVERED',
                createdAt: {
                  gte: startDate
                }
              }
            }
          }
        }
      },
      take: 10
    })

    // Calculate pharmacy revenue
    const pharmacyAnalytics = topPharmacies.map(pharmacy => ({
      id: pharmacy.id,
      name: pharmacy.name,
      totalOrders: pharmacy._count.orders,
      totalRevenue: pharmacy.orders.reduce((sum, order) => sum + order.totalAmount, 0),
      totalCommission: pharmacy.orders.reduce((sum, order) => sum + order.commissionAmount, 0)
    })).sort((a, b) => b.totalRevenue - a.totalRevenue)

    const analytics = {
      period: `${period} days`,
      userRegistrations,
      revenue: {
        orders: {
          total: orderRevenue._sum.totalAmount || 0,
          commission: orderRevenue._sum.commissionAmount || 0,
          count: orderRevenue._count || 0
        },
        labBookings: {
          total: labRevenue._sum.totalAmount || 0,
          commission: labRevenue._sum.commissionAmount || 0,
          count: labRevenue._count || 0
        },
        appointments: {
          total: appointmentRevenue._sum.consultationFee || 0,
          commission: appointmentRevenue._sum.commissionAmount || 0,
          count: appointmentRevenue._count || 0
        }
      },
      dailyRevenue,
      topPharmacies: pharmacyAnalytics
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}