import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PUT /api/medicines/[id] - Update medicine
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PHARMACY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, unit, stock, isActive } = body

    const { id } = await params

    // Verify the medicine belongs to this pharmacy
    const existingMedicine = await prisma.medicine.findFirst({
      where: {
        id,
        pharmacyId: session.user.pharmacy.id
      }
    })

    if (!existingMedicine) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })
    }

    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(unit && { unit }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(medicine)
  } catch (error) {
    console.error('Error updating medicine:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/medicines/[id] - Delete medicine
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PHARMACY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify the medicine belongs to this pharmacy
    const existingMedicine = await prisma.medicine.findFirst({
      where: {
        id,
        pharmacyId: session.user.pharmacy.id
      }
    })

    if (!existingMedicine) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    await prisma.medicine.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Medicine deleted successfully' })
  } catch (error) {
    console.error('Error deleting medicine:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}