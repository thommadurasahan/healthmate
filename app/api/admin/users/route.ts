import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/admin/users - Get all users for admin management
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status') // 'pending', 'approved', 'all'
    const search = searchParams.get('search')

    let where: any = {}

    if (role && role !== 'all') {
      where.role = role
    }

    if (status === 'pending') {
      where.isApproved = false
      where.role = { not: 'PATIENT' } // Patients are auto-approved
    } else if (status === 'approved') {
      where.isApproved = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        patient: true,
        pharmacy: true,
        deliveryPartner: true,
        laboratory: true,
        doctor: true,
        admin: true,
        _count: {
          select: {
            orders: true,
            transactions: true,
            notifications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Remove password from response
    const sanitizedUsers = users.map(({ password, ...user }) => user)

    return NextResponse.json(sanitizedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/users - Bulk user operations
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userIds, action } = body // action: 'approve', 'reject', 'delete'

    if (!userIds || !Array.isArray(userIds) || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'approve') {
      await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { isApproved: true }
      })

      // Also update role-specific approval status
      await Promise.all([
        prisma.pharmacy.updateMany({
          where: { userId: { in: userIds } },
          data: { isApproved: true }
        }),
        prisma.laboratory.updateMany({
          where: { userId: { in: userIds } },
          data: { isApproved: true }
        }),
        prisma.doctor.updateMany({
          where: { userId: { in: userIds } },
          data: { isApproved: true }
        }),
        prisma.deliveryPartner.updateMany({
          where: { userId: { in: userIds } },
          data: { isApproved: true }
        })
      ])

      // Create notifications for approved users
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, role: true }
      })

      await Promise.all(
        users.map(user =>
          prisma.notification.create({
            data: {
              userId: user.id,
              type: 'SYSTEM_ALERT',
              title: 'Account Approved',
              message: `Your ${user.role.toLowerCase()} account has been approved and is now active.`
            }
          })
        )
      )

    } else if (action === 'reject') {
      await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { isApproved: false }
      })

      // Create notifications for rejected users
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, role: true }
      })

      await Promise.all(
        users.map(user =>
          prisma.notification.create({
            data: {
              userId: user.id,
              type: 'SYSTEM_ALERT',
              title: 'Account Rejected',
              message: `Your ${user.role.toLowerCase()} account application has been rejected. Please contact support for more information.`
            }
          })
        )
      )
    }

    return NextResponse.json({ message: `Users ${action}ed successfully` })
  } catch (error) {
    console.error(`Error performing bulk user operation:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
