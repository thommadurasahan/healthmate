import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const orderId = params.id
    const { status } = await request.json()

    // Verify order belongs to pharmacy
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        pharmacyId: pharmacy.id
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        patient: {
          include: {
            user: {
              select: { name: true, phone: true }
            }
          }
        },
        medicines: {
          include: {
            medicine: {
              select: { name: true, price: true }
            }
          }
        },
        prescription: {
          select: { id: true }
        }
      }
    })

    // Transform for frontend
    const transformedOrder = {
      id: updatedOrder.id,
      patient: {
        name: updatedOrder.patient.user.name,
        phone: updatedOrder.patient.user.phone || '',
        address: updatedOrder.patient.address || ''
      },
      prescriptionId: updatedOrder.prescription?.id || '',
      items: updatedOrder.medicines.map(om => ({
        name: om.medicine.name,
        quantity: om.quantity,
        unitPrice: om.medicine.price,
        totalPrice: om.quantity * om.medicine.price
      })),
      totalAmount: updatedOrder.totalAmount,
      commissionAmount: updatedOrder.commissionAmount,
      pharmacyAmount: updatedOrder.pharmacyAmount,
      status: updatedOrder.status,
      createdAt: updatedOrder.createdAt.toLocaleString(),
      paymentStatus: updatedOrder.paymentStatus,
      priority: updatedOrder.priority,
      notes: updatedOrder.notes || ''
    }

    return NextResponse.json({ order: transformedOrder })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
