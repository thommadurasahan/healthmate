import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: prescriptionId } = await params

    // Find the prescription and verify it belongs to an order from this pharmacy
    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        order: {
          pharmacyId: pharmacy.id
        }
      },
      include: {
        patient: {
          include: {
            user: {
              select: { name: true, phone: true }
            }
          }
        },
        doctor: {
          include: {
            user: {
              select: { name: true, phone: true }
            }
          }
        },
        medicines: {
          include: {
            medicine: {
              select: { name: true, dosage: true, frequency: true, duration: true }
            }
          }
        },
        order: {
          select: { id: true, status: true, totalAmount: true }
        }
      }
    })

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    // Transform prescription data for frontend
    const transformedPrescription = {
      id: prescription.id,
      patient: {
        name: prescription.patient.user.name,
        phone: prescription.patient.user.phone || '',
        address: prescription.patient.address || ''
      },
      doctor: {
        name: prescription.doctor.user.name,
        phone: prescription.doctor.user.phone || ''
      },
      medicines: prescription.medicines.map(pm => ({
        name: pm.medicine.name,
        dosage: pm.dosage,
        frequency: pm.frequency,
        duration: pm.duration
      })),
      diagnosis: prescription.diagnosis,
      notes: prescription.notes,
      createdAt: prescription.createdAt.toLocaleString(),
      orderId: prescription.order.id,
      orderStatus: prescription.order.status,
      orderTotal: prescription.order.totalAmount
    }

    return NextResponse.json({ prescription: transformedPrescription })
  } catch (error) {
    console.error('Error fetching prescription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
