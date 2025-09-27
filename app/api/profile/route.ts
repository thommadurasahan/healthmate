import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        patient: true,
        pharmacy: true,
        deliveryPartner: true,
        laboratory: true,
        doctor: {
          include: {
            availabilities: true
          }
        },
        admin: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove password from response
    const { password, ...safeUser } = user

    return NextResponse.json(safeUser)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/profile - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, ...roleSpecificData } = body

    // Update main user data
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email
      }
    })

    // Update role-specific data
    if (session.user.role === 'PATIENT' && roleSpecificData.patient) {
      await prisma.patient.update({
        where: { userId: session.user.id },
        data: roleSpecificData.patient
      })
    } else if (session.user.role === 'PHARMACY' && roleSpecificData.pharmacy) {
      await prisma.pharmacy.update({
        where: { userId: session.user.id },
        data: roleSpecificData.pharmacy
      })
    } else if (session.user.role === 'DELIVERY_PARTNER' && roleSpecificData.deliveryPartner) {
      await prisma.deliveryPartner.update({
        where: { userId: session.user.id },
        data: roleSpecificData.deliveryPartner
      })
    } else if (session.user.role === 'LABORATORY' && roleSpecificData.laboratory) {
      await prisma.laboratory.update({
        where: { userId: session.user.id },
        data: roleSpecificData.laboratory
      })
    } else if (session.user.role === 'DOCTOR' && roleSpecificData.doctor) {
      await prisma.doctor.update({
        where: { userId: session.user.id },
        data: roleSpecificData.doctor
      })
    }

    return NextResponse.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
