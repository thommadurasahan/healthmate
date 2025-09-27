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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let whereCondition: any = {
      isApproved: true
    }

    if (search) {
      whereCondition.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // Get approved laboratories with their tests
    const laboratories = await prisma.laboratory.findMany({
      where: whereCondition,
      include: {
        labTests: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            requirements: true,
            isActive: true
          },
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Add rating for each laboratory (mock rating for now)
    const laboratoriesWithRating = laboratories.map(lab => ({
      ...lab,
      rating: 4.5 + Math.random() * 0.5 // Mock rating between 4.5-5.0
    }))

    return NextResponse.json(laboratoriesWithRating)

  } catch (error) {
    console.error('Error fetching laboratories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}