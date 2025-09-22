import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/orders/[id] - Get specific order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          include: {
            user: {
              select: { name: true, email: true, phone: true }
            }
          }
        },
        pharmacy: {
          select: { name: true, address: true, phone: true }
        },
        orderItems: {
          include: {
            medicine: true
          }
        },
        prescription: true,
        delivery: {
          include: {
            deliveryPartner: {
              include: {
                user: {
                  select: { name: true, phone: true }
                }
              }
            }
          }
        },
        transactions: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check authorization
    if (session.user.role === 'PATIENT' && order.patientId !== session.user.patient.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role === 'PHARMACY' && order.pharmacyId !== session.user.pharmacy.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/orders/[id] - Update order status
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
    const { status } = body

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { pharmacy: true, patient: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check authorization based on role and status transition
    if (session.user.role === 'PHARMACY' && order.pharmacyId !== session.user.pharmacy.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        orderItems: {
          include: {
            medicine: true
          }
        },
        patient: {
          include: {
            user: true
          }
        },
        pharmacy: true
      }
    })

    // Create delivery record when order is ready for delivery
    if (status === 'READY_FOR_DELIVERY') {
      await prisma.delivery.create({
        data: {
          orderId: order.id,
          pickupAddress: order.pharmacy.address,
          deliveryAddress: order.deliveryAddress
        }
      })
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}