import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface SearchResult {
  id: string
  type: string
  title: string
  description: string
  metadata: Record<string, any>
  createdAt: Date
  href: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const type = searchParams.get('type') // 'all', 'orders', 'prescriptions', 'labs', 'appointments'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 })
    }

    let results: SearchResult[] = []

    // Get user profile based on role
    let userProfile = null
    switch (session.user.role) {
      case 'PATIENT':
        userProfile = await prisma.patient.findUnique({
          where: { userId: session.user.id }
        })
        break
      case 'PHARMACY':
        userProfile = await prisma.pharmacy.findUnique({
          where: { userId: session.user.id }
        })
        break
      case 'DOCTOR':
        userProfile = await prisma.doctor.findUnique({
          where: { userId: session.user.id }
        })
        break
      case 'LABORATORY':
        userProfile = await prisma.laboratory.findUnique({
          where: { userId: session.user.id }
        })
        break
      case 'ADMIN':
        // Admins can search everything
        break
    }

    if (!userProfile && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Search based on type filter
    if (type === 'orders' || type === 'all') {
      const orderResults = await searchOrders(query, userProfile, session.user.role, limit)
      results = [...results, ...orderResults]
    }

    if (type === 'prescriptions' || type === 'all') {
      const prescriptionResults = await searchPrescriptions(query, userProfile, session.user.role, limit)
      results = [...results, ...prescriptionResults]
    }

    if (type === 'labs' || type === 'all') {
      const labResults = await searchLabTests(query, userProfile, session.user.role, limit)
      results = [...results, ...labResults]
    }

    if (type === 'appointments' || type === 'all') {
      const appointmentResults = await searchAppointments(query, userProfile, session.user.role, limit)
      results = [...results, ...appointmentResults]
    }

    // Sort by relevance and date
    results.sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.title.toLowerCase().includes(query) || a.description.toLowerCase().includes(query)
      const bExact = b.title.toLowerCase().includes(query) || b.description.toLowerCase().includes(query)

      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1

      // Then by date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Limit results
    results = results.slice(0, limit)

    return NextResponse.json({
      query,
      totalResults: results.length,
      results
    })
  } catch (error) {
    console.error('Error performing search:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function searchOrders(query: string, userProfile: any, role: string, limit: number): Promise<SearchResult[]> {
  const where: any = {
    OR: [
      { id: { contains: query } },
      { status: { contains: query } },
      { notes: { contains: query } },
      {
        pharmacy: {
          name: { contains: query }
        }
      },
      {
        patient: {
          user: {
            name: { contains: query }
          }
        }
      }
    ]
  }

  // Role-based filtering
  if (role === 'PATIENT' && userProfile) {
    where.patientId = userProfile.id
  } else if (role === 'PHARMACY' && userProfile) {
    where.pharmacyId = userProfile.id
  } else if (role === 'ADMIN') {
    // Admins can see all orders
  } else {
    return [] // Other roles can't see orders
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      pharmacy: {
        select: { name: true }
      },
      patient: {
        select: {
          user: {
            select: { name: true }
          }
        }
      }
    },
    take: limit
  })

  return orders.map(order => ({
    id: order.id,
    type: 'order',
    title: `Order #${order.id.slice(-8)}`,
    description: `Order from ${order.pharmacy.name} - Status: ${order.status}`,
    metadata: {
      status: order.status,
      totalAmount: order.totalAmount,
      pharmacy: order.pharmacy.name,
      patient: order.patient.user.name
    },
    createdAt: order.createdAt,
    href: `/dashboard/${role.toLowerCase()}/orders?highlight=${order.id}`
  }))
}

async function searchPrescriptions(query: string, userProfile: any, role: string, limit: number): Promise<SearchResult[]> {
  if (role !== 'PATIENT' && role !== 'ADMIN') {
    return [] // Only patients and admins can search prescriptions
  }

  const where: any = {
    OR: [
      { id: { contains: query } },
      { status: { contains: query } },
      { notes: { contains: query } },
      {
        doctor: {
          user: {
            name: { contains: query }
          }
        }
      },
      {
        medicines: {
          some: {
            medicine: {
              name: { contains: query }
            }
          }
        }
      }
    ]
  }

  if (role === 'PATIENT' && userProfile) {
    where.patientId = userProfile.id
  }

  const prescriptions = await prisma.prescription.findMany({
    where,
    include: {
      doctor: {
        select: {
          user: {
            select: { name: true }
          }
        }
      },
      medicines: {
        include: {
          medicine: {
            select: { name: true }
          }
        }
      }
    },
    take: limit
  })

  return prescriptions.map(prescription => ({
    id: prescription.id,
    type: 'prescription',
    title: `Prescription #${prescription.id.slice(-8)}`,
    description: `Prescribed by Dr. ${prescription.doctor.user.name} - Status: ${prescription.status}`,
    metadata: {
      status: prescription.status,
      doctor: prescription.doctor.user.name,
      medicines: prescription.medicines.map(m => m.medicine.name)
    },
    createdAt: prescription.createdAt,
    href: `/dashboard/${role.toLowerCase()}/prescriptions?highlight=${prescription.id}`
  }))
}

async function searchLabTests(query: string, userProfile: any, role: string, limit: number): Promise<SearchResult[]> {
  const where: any = {
    OR: [
      { id: { contains: query } },
      { name: { contains: query } },
      { description: { contains: query } },
      { status: { contains: query } },
      {
        laboratory: {
          name: { contains: query }
        }
      }
    ]
  }

  // Role-based filtering
  if (role === 'PATIENT' && userProfile) {
    where.patientId = userProfile.id
  } else if (role === 'LABORATORY' && userProfile) {
    where.laboratoryId = userProfile.id
  } else if (role === 'ADMIN') {
    // Admins can see all lab tests
  } else {
    return [] // Other roles can't see lab tests
  }

  const labTests = await prisma.labBooking.findMany({
    where,
    include: {
      laboratory: {
        select: { name: true }
      },
      patient: {
        select: {
          user: {
            select: { name: true }
          }
        }
      }
    },
    take: limit
  })

  return labTests.map(labTest => ({
    id: labTest.id,
    type: 'lab_test',
    title: `Lab Test #${labTest.id.slice(-8)}`,
    description: `Test at ${labTest.laboratory.name} - Status: ${labTest.status}`,
    metadata: {
      status: labTest.status,
      laboratory: labTest.laboratory.name,
      patient: labTest.patient.user.name,
      testDate: labTest.testDate
    },
    createdAt: labTest.createdAt,
    href: `/dashboard/${role.toLowerCase()}/labs?highlight=${labTest.id}`
  }))
}

async function searchAppointments(query: string, userProfile: any, role: string, limit: number): Promise<SearchResult[]> {
  const where: any = {
    OR: [
      { id: { contains: query } },
      { status: { contains: query } },
      { notes: { contains: query } },
      {
        doctor: {
          user: {
            name: { contains: query }
          }
        }
      }
    ]
  }

  // Role-based filtering
  if (role === 'PATIENT' && userProfile) {
    where.patientId = userProfile.id
  } else if (role === 'DOCTOR' && userProfile) {
    where.doctorId = userProfile.id
  } else if (role === 'ADMIN') {
    // Admins can see all appointments
  } else {
    return [] // Other roles can't see appointments
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      doctor: {
        select: {
          user: {
            select: { name: true }
          }
        }
      },
      patient: {
        select: {
          user: {
            select: { name: true }
          }
        }
      }
    },
    take: limit
  })

  return appointments.map(appointment => ({
    id: appointment.id,
    type: 'appointment',
    title: `Appointment #${appointment.id.slice(-8)}`,
    description: `With Dr. ${appointment.doctor.user.name} - Status: ${appointment.status}`,
    metadata: {
      status: appointment.status,
      doctor: appointment.doctor.user.name,
      patient: appointment.patient.user.name,
      appointmentDate: appointment.appointmentDate
    },
    createdAt: appointment.createdAt,
    href: `/dashboard/${role.toLowerCase()}/consultations?highlight=${appointment.id}`
  }))
}
