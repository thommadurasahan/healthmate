import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/transactions - Get user transactions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    let where: any = { userId: session.user.id }

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            pharmacy: {
              select: { name: true }
            }
          }
        },
        labBooking: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            laboratory: {
              select: { name: true }
            },
            labTest: {
              select: { name: true }
            }
          }
        },
        appointment: {
          select: {
            id: true,
            status: true,
            consultationFee: true,
            doctor: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/transactions - Create new transaction (for mock payments)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      orderId, 
      labBookingId, 
      appointmentId, 
      type, 
      amount, 
      paymentMethod = 'MOCK_STRIPE',
      description 
    } = body

    if (!type || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate mock payment ID
    const paymentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        orderId,
        labBookingId,
        appointmentId,
        type,
        amount,
        status: 'COMPLETED', // Mock payments are instantly completed
        paymentMethod,
        paymentId,
        description
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}