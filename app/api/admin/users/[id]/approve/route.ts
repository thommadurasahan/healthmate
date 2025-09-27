import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        pharmacy: true,
        laboratory: true,
        doctor: true,
        deliveryPartner: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user approval status
    await prisma.user.update({
      where: { id },
      data: { isApproved: true }
    })

    // Update role-specific approval status
    if (user.pharmacy) {
      await prisma.pharmacy.update({
        where: { id: user.pharmacy.id },
        data: { isApproved: true }
      })
    } else if (user.laboratory) {
      await prisma.laboratory.update({
        where: { id: user.laboratory.id },
        data: { isApproved: true }
      })
    } else if (user.doctor) {
      await prisma.doctor.update({
        where: { id: user.doctor.id },
        data: { isApproved: true }
      })
    } else if (user.deliveryPartner) {
      await prisma.deliveryPartner.update({
        where: { id: user.deliveryPartner.id },
        data: { isApproved: true }
      })
    }

    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM_ALERT',
        title: 'Account Approved',
        message: `Your ${user.role.toLowerCase()} account has been approved and is now active.`
      }
    })

    return NextResponse.json({ message: 'User approved successfully' })
  } catch (error) {
    console.error('Error approving user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}