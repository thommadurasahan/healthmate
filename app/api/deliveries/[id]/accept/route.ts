import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateDeliveryStatus } from '@/lib/socket'
import { notifyDeliveryUpdate } from '@/lib/notifications'

// PUT /api/deliveries/[id]/accept - Accept delivery request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'DELIVERY_PARTNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deliveryId = params.id

    // Get delivery partner details
    const deliveryPartner = await prisma.deliveryPartner.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    if (!deliveryPartner) {
      return NextResponse.json({ error: 'Delivery partner profile not found' }, { status: 404 })
    }

    // Check if delivery is still available
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: {
          include: {
            patient: {
              include: {
                user: {
                  select: { email: true }
                }
              }
            },
            pharmacy: {
              include: {
                user: {
                  select: { email: true }
                }
              }
            }
          }
        }
      }
    })

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }

    if (delivery.status !== 'PENDING') {
      return NextResponse.json({ error: 'Delivery already assigned' }, { status: 400 })
    }

    // Assign delivery to the partner
    const updatedDelivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        deliveryPartnerId: deliveryPartner.id,
        status: 'ASSIGNED'
      }
    })

    // Update order status
    await prisma.order.update({
      where: { id: delivery.orderId },
      data: { status: 'OUT_FOR_DELIVERY' }
    })

    // Emit real-time updates
    updateDeliveryStatus(deliveryId, 'ASSIGNED', {
      deliveryPartner: {
        id: deliveryPartner.id,
        name: deliveryPartner.user.name
      }
    })

    // Send notifications
    await Promise.all([
      notifyDeliveryUpdate(
        delivery.orderId,
        'Out for Delivery',
        delivery.order.patient.user.email,
        deliveryPartner.user.name
      ),
      // Notify pharmacy about assignment
      notifyDeliveryUpdate(
        delivery.orderId,
        'Driver Assigned',
        delivery.order.pharmacy?.user.email || '',
        deliveryPartner.user.name
      )
    ])

    return NextResponse.json({
      message: 'Delivery accepted successfully',
      delivery: updatedDelivery
    })

  } catch (error) {
    console.error('Error accepting delivery:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}