import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PUT /api/deliveries/[id] - Update delivery status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'DELIVERY_PARTNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 })
    }

    // Verify the delivery belongs to this partner
    const delivery = await prisma.delivery.findFirst({
      where: {
        id: params.id,
        deliveryPartnerId: session.user.deliveryPartner.id
      }
    })

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }

    const now = new Date()
    const updateData: any = { status }

    // Set timestamps based on status
    if (status === 'PICKED_UP') {
      updateData.actualPickupTime = now
    } else if (status === 'DELIVERED') {
      updateData.actualDeliveryTime = now
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id: params.id },
      data: updateData,
      include: {
        order: true
      }
    })

    // Update order status when delivered
    if (status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: 'DELIVERED' }
      })
    }

    return NextResponse.json(updatedDelivery)
  } catch (error) {
    console.error('Error updating delivery:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}