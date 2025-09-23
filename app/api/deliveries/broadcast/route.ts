import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { broadcastDeliveryRequest } from '@/lib/socket'

// POST /api/deliveries/broadcast - Broadcast delivery request to all available delivery partners
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PHARMACY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        patient: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        pharmacy: {
          select: { name: true, address: true, phone: true }
        },
        orderItems: {
          include: {
            medicine: {
              select: { name: true }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Create delivery record
    const delivery = await prisma.delivery.create({
      data: {
        orderId: order.id,
        pickupAddress: order.pharmacy?.address || '',
        deliveryAddress: order.deliveryAddress,
        deliveryFee: calculateDeliveryFee(order.totalAmount),
        status: 'PENDING'
      }
    })

    // Prepare delivery request for broadcasting
    const deliveryRequest = {
      id: delivery.id,
      orderId: order.id,
      pharmacyId: order.pharmacyId,
      pickupAddress: order.pharmacy?.address || '',
      deliveryAddress: order.deliveryAddress,
      estimatedTime: calculateEstimatedDeliveryTime(),
      deliveryFee: delivery.deliveryFee,
      orderItems: order.orderItems?.map((item: any) => ({
        medicine: { name: item.medicine.name },
        quantity: item.quantity
      })) || [],
      orderValue: order.totalAmount
    }

    // Broadcast to all available delivery partners
    broadcastDeliveryRequest(deliveryRequest)

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'READY_FOR_DELIVERY' }
    })

    return NextResponse.json({ 
      message: 'Delivery request broadcasted successfully',
      deliveryId: delivery.id 
    })

  } catch (error) {
    console.error('Error broadcasting delivery request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Calculate delivery fee based on order value
function calculateDeliveryFee(orderValue: number): number {
  if (orderValue >= 50) {
    return 0 // Free delivery for orders over $50
  } else if (orderValue >= 25) {
    return 2.99 // Reduced fee for orders over $25
  } else {
    return 4.99 // Standard delivery fee
  }
}

// Calculate estimated delivery time (in hours)
function calculateEstimatedDeliveryTime(): string {
  const now = new Date()
  const deliveryTime = new Date(now.getTime() + (1.5 * 60 * 60 * 1000)) // 1.5 hours from now
  return deliveryTime.toISOString()
}