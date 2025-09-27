import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/deliveries - Get deliveries for delivery partners
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let where: any = {}

    // Filter based on user role
    if (session.user.role === 'DELIVERY_PARTNER') {
      if (status === 'available') {
        // Show unassigned deliveries
        where.deliveryPartnerId = null
        where.status = 'PENDING'
      } else {
        // Show assigned deliveries
        where.deliveryPartnerId = session.user.deliveryPartner?.id
      }
    } else if (session.user.role === 'PHARMACY') {
      where.order = {
        pharmacyId: session.user.pharmacy?.id
      }
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (status && status !== 'available') {
      where.status = status.toUpperCase()
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            patient: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            },
            pharmacy: {
              select: { name: true, address: true }
            },
            orderItems: {
              include: {
                medicine: {
                  select: { name: true }
                }
              }
            }
          }
        },
        deliveryPartner: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(deliveries)
  } catch (error) {
    console.error('Error fetching deliveries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/deliveries/[id]/accept - Accept delivery (delivery partner only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'DELIVERY_PARTNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { deliveryId } = body

    if (!deliveryId) {
      return NextResponse.json({ error: 'Missing delivery ID' }, { status: 400 })
    }

    // Check if delivery is still available
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId }
    })

    if (!delivery || delivery.deliveryPartnerId || delivery.status !== 'PENDING') {
      return NextResponse.json({ error: 'Delivery not available' }, { status: 400 })
    }

    // Assign delivery to the partner
    const updatedDelivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        deliveryPartnerId: session.user.deliveryPartner?.id,
        status: 'ASSIGNED'
      },
      include: {
        order: {
          include: {
            patient: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            },
            pharmacy: {
              select: { name: true, address: true }
            }
          }
        }
      }
    })

    // Update order status
    await prisma.order.update({
      where: { id: delivery.orderId },
      data: { status: 'OUT_FOR_DELIVERY' }
    })

    return NextResponse.json(updatedDelivery)
  } catch (error) {
    console.error('Error accepting delivery:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
