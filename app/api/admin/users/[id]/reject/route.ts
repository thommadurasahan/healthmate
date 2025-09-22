import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create notification for the user before deletion
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM_ALERT',
        title: 'Account Rejected',
        message: `Your ${user.role.toLowerCase()} account application has been rejected. Please contact support for more information.`
      }
    })

    // For now, we'll just mark as not approved rather than deleting
    // In a production system, you might want to soft delete or move to a rejected state
    await prisma.user.update({
      where: { id: params.id },
      data: { isApproved: false }
    })

    return NextResponse.json({ message: 'User rejected successfully' })
  } catch (error) {
    console.error('Error rejecting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}