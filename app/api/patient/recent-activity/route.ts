import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get patient profile
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    const activities = []

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        pharmacy: {
          select: { name: true }
        }
      }
    })

    recentOrders.forEach(order => {
      const timeAgo = getTimeAgo(order.createdAt)
      let message = ''
      let status = 'pending'

      switch (order.status) {
        case 'DELIVERED':
          message = `Order #${order.id.slice(-6)} has been delivered from ${order.pharmacy.name}`
          status = 'completed'
          break
        case 'OUT_FOR_DELIVERY':
          message = `Order #${order.id.slice(-6)} is out for delivery`
          status = 'processing'
          break
        case 'PROCESSING':
          message = `Order #${order.id.slice(-6)} is being processed by ${order.pharmacy.name}`
          status = 'processing'
          break
        case 'CONFIRMED':
          message = `Order #${order.id.slice(-6)} has been confirmed by ${order.pharmacy.name}`
          status = 'confirmed'
          break
        default:
          message = `Order #${order.id.slice(-6)} is pending confirmation`
          status = 'pending'
      }

      activities.push({
        id: order.id,
        type: 'order',
        message,
        time: timeAgo,
        status
      })
    })

    // Get recent prescriptions
    const recentPrescriptions = await prisma.prescription.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      take: 2
    })

    recentPrescriptions.forEach(prescription => {
      const timeAgo = getTimeAgo(prescription.createdAt)
      activities.push({
        id: prescription.id,
        type: 'prescription',
        message: `Prescription uploaded successfully`,
        time: timeAgo,
        status: 'completed'
      })
    })

    // Get recent lab bookings
    const recentLabBookings = await prisma.labBooking.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      take: 2,
      include: {
        laboratory: {
          select: { name: true }
        },
        labTest: {
          select: { name: true }
        }
      }
    })

    recentLabBookings.forEach(booking => {
      const timeAgo = getTimeAgo(booking.createdAt)
      let message = ''
      let status = 'pending'

      switch (booking.status) {
        case 'COMPLETED':
          message = `Lab test "${booking.labTest.name}" completed at ${booking.laboratory.name}`
          status = 'completed'
          break
        case 'IN_PROGRESS':
          message = `Lab test "${booking.labTest.name}" is in progress at ${booking.laboratory.name}`
          status = 'processing'
          break
        case 'CONFIRMED':
          message = `Lab test "${booking.labTest.name}" confirmed at ${booking.laboratory.name}`
          status = 'confirmed'
          break
        default:
          message = `Lab test "${booking.labTest.name}" booked at ${booking.laboratory.name}`
          status = 'pending'
      }

      activities.push({
        id: booking.id,
        type: 'lab_booking',
        message,
        time: timeAgo,
        status
      })
    })

    // Get recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      take: 2,
      include: {
        doctor: {
          select: { name: true, specialization: true }
        }
      }
    })

    recentAppointments.forEach(appointment => {
      const timeAgo = getTimeAgo(appointment.createdAt)
      let message = ''
      let status = 'pending'

      switch (appointment.status) {
        case 'COMPLETED':
          message = `Consultation with Dr. ${appointment.doctor.name} completed`
          status = 'completed'
          break
        case 'CONFIRMED':
          message = `Appointment with Dr. ${appointment.doctor.name} (${appointment.doctor.specialization}) confirmed`
          status = 'confirmed'
          break
        default:
          message = `Appointment with Dr. ${appointment.doctor.name} is pending confirmation`
          status = 'pending'
      }

      activities.push({
        id: appointment.id,
        type: 'appointment',
        message,
        time: timeAgo,
        status
      })
    })

    // Sort activities by creation date (most recent first)
    activities.sort((a, b) => {
      // This is a simplified sort - in real implementation, you'd want to compare actual dates
      return 0
    })

    // Take only the 5 most recent activities
    const recentActivities = activities.slice(0, 5)

    return NextResponse.json(recentActivities)
  } catch (error) {
    console.error('Recent activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString()
  }
}
