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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {
      pharmacyId: pharmacy.id,
    }

    // Add status filter
    if (status && status !== 'ALL') {
      where.status = status
    }

    // Add priority filter
    if (priority && priority !== 'ALL') {
      where.priority = priority
    }

    // Add search filter
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        {
          patient: {
            user: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ]
    }

    // Fetch orders with related data
    const orders = await prisma.order.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform orders for frontend
    const transformedOrders = orders.map(order => ({
      id: order.id,
      patient: {
        name: order.patient.user.name,
        phone: order.patient.user.phone || '',
        address: order.patient.address || ''
      },
      prescriptionId: order.prescription?.id || '',
      items: order.medicines.map(om => ({
        name: om.medicine.name,
        quantity: om.quantity,
        unitPrice: om.medicine.price,
        totalPrice: om.quantity * om.medicine.price
      })),
      totalAmount: order.totalAmount,
      commissionAmount: order.commissionAmount,
      pharmacyAmount: order.pharmacyAmount,
      status: order.status,
      createdAt: order.createdAt.toLocaleString(),
      paymentStatus: order.paymentStatus,
      priority: order.priority,
      notes: order.notes || ''
    }))

    return NextResponse.json({ orders: transformedOrders })
  } catch (error) {
    console.error('Error fetching pharmacy orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
