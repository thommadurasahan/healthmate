import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get approved pharmacies with their medicines
    const pharmacies = await prisma.pharmacy.findMany({
      where: {
        isApproved: true
      },
      include: {
        medicines: {
          where: {
            isActive: true,
            stock: {
              gt: 0
            }
          },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            unit: true,
            stock: true,
            isActive: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(pharmacies)

  } catch (error) {
    console.error('Error fetching pharmacies:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
