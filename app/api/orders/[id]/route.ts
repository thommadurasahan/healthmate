import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/orders/[id] - Get specific order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
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
    if (session.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id }
      })
      if (!patient || order.patientId !== patient.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else if (session.user.role === 'PHARMACY') {
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { userId: session.user.id }
      })
      if (!pharmacy || order.pharmacyId !== pharmacy.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else if (session.user.role !== 'ADMIN') {
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body
    console.log('🔄 Updating order status to:', status)

    const { id } = await params
    console.log('📦 Order ID:', id)

    const order = await prisma.order.findUnique({
      where: { id },
      include: { pharmacy: true, patient: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check authorization based on role and status transition
    if (session.user.role === 'PHARMACY') {
      // Get pharmacy profile
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { userId: session.user.id }
      })
      if (!pharmacy || order.pharmacyId !== pharmacy.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else if (session.user.role === 'PATIENT') {
      // Get patient profile
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id }
      })
      if (!patient || order.patientId !== patient.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      // Patients can only cancel orders in PENDING or CONFIRMED status
      if (status === 'CANCELLED' && !['PENDING', 'CONFIRMED'].includes(order.status)) {
        return NextResponse.json({ 
          error: 'Order cannot be cancelled at this stage' 
        }, { status: 400 })
      }
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
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

    console.log('✅ Order status updated successfully:', updatedOrder.status)

    // Create delivery record when order is ready for delivery
    if (status === 'READY_FOR_DELIVERY') {
      await prisma.delivery.create({
        data: {
          orderId: order.id,
          pickupAddress: order.pharmacy.address,
          deliveryAddress: order.deliveryAddress
        }
      })
      console.log('🚚 Delivery record created')
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}