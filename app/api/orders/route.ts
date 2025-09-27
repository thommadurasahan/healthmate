import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculateCommission } from '@/lib/mock-payment'

// GET /api/orders - Get orders based on user role
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let where: any = {}

    // Filter orders based on user role
    if (session.user.role === 'PATIENT') {
      console.log('🔍 Looking for patient with userId:', session.user.id)
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id }
      })
      console.log('👤 Patient found:', patient)
      if (!patient) {
        console.error('❌ Patient profile not found for userId:', session.user.id)
        return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
      }
      where.patientId = patient.id
      console.log('🎯 Filtering orders by patientId:', patient.id)
    } else if (session.user.role === 'PHARMACY') {
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { userId: session.user.id }
      })
      if (!pharmacy) {
        return NextResponse.json({ error: 'Pharmacy profile not found' }, { status: 404 })
      }
      where.pharmacyId = pharmacy.id
    } else if (session.user.role === 'ADMIN') {
      // Admins can see all orders
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        orderType: true,
        status: true,
        totalAmount: true,
        commissionAmount: true,
        netAmount: true,
        deliveryAddress: true,
        specialInstructions: true,
        createdAt: true,
        updatedAt: true,
        patient: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        pharmacy: {
          select: { name: true, address: true, phone: true }
        },
        orderItems: {
          include: {
            medicine: {
              select: { name: true, unit: true, price: true }
            }
          }
        },
        prescription: {
          select: { fileName: true, status: true }
        },
        delivery: true,
        transactions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('📊 Orders found:', orders.length)
    if (orders.length > 0) {
      console.log('🔍 Sample order:', JSON.stringify(orders[0], null, 2))
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get patient profile
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { pharmacyId, prescriptionId, items, deliveryAddress, specialInstructions, orderType } = body

    if (!pharmacyId || !items || items.length === 0 || !deliveryAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate order type
    const validOrderType = orderType || (prescriptionId ? 'PRESCRIPTION_BASED' : 'DIRECT')
    if (!['PRESCRIPTION_BASED', 'DIRECT'].includes(validOrderType)) {
      return NextResponse.json({ error: 'Invalid order type' }, { status: 400 })
    }

    // If prescription-based order, validate prescription exists and belongs to patient
    if (validOrderType === 'PRESCRIPTION_BASED' && prescriptionId) {
      const prescription = await prisma.prescription.findFirst({
        where: {
          id: prescriptionId,
          patientId: patient.id,
          status: 'PROCESSED'
        }
      })
      
      if (!prescription) {
        return NextResponse.json({ 
          error: 'Prescription not found or not processed' 
        }, { status: 400 })
      }
    }

    // Calculate total amount
    let totalAmount = 0
    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId }
      })
      if (!medicine) {
        return NextResponse.json({ error: `Medicine ${item.medicineId} not found` }, { status: 400 })
      }
      totalAmount += medicine.price * item.quantity
    }

    // Calculate commission
    const { commission, netAmount } = calculateCommission(totalAmount)

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        patientId: patient.id,
        pharmacyId,
        prescriptionId: validOrderType === 'PRESCRIPTION_BASED' ? prescriptionId : null,
        orderType: validOrderType,
        totalAmount,
        commissionAmount: commission,
        netAmount,
        deliveryAddress,
        specialInstructions,
        orderItems: {
          create: items.map((item: any) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            medicine: true
          }
        },
        prescription: validOrderType === 'PRESCRIPTION_BASED' ? {
          select: { fileName: true, status: true }
        } : undefined
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
