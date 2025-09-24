import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DeliveryStatus, NotificationType, UserRole } from '@prisma/client';

interface DeliveryRequestBody {
  pickupAddress: string;
  deliveryNotes: string;
  urgencyLevel: 'normal' | 'urgent' | 'emergency';
  expectedPickupTime: string;
}

interface SessionUser {
  id: string;
  role: 'PHARMACY';
  name?: string;
  email?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as SessionUser).role !== 'PHARMACY') {
      return NextResponse.json(
        { error: 'Unauthorized - Only pharmacies can create delivery requests' },
        { status: 401 }
      );
    }

    const { pickupAddress, deliveryNotes, urgencyLevel, expectedPickupTime }: DeliveryRequestBody = await req.json();

    // Get the pharmacy profile for the current user
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { userId: session.user.id },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: 'Pharmacy profile not found' },
        { status: 404 }
      );
    }

    // Create the delivery
    const delivery = await prisma.delivery.create({
      data: {
        pickupAddress,
        deliveryAddress: '', // This will be updated when an order is created
        status: DeliveryStatus.PENDING,
        estimatedTime: new Date(expectedPickupTime),
        order: {
          create: {
            userId: session.user.id,
            patientId: '', // Will be set when order is processed
            pharmacyId: pharmacy.id,
            status: 'PENDING',
            totalAmount: 0, // Will be calculated when medicines are added
            commissionRate: 0.05,
            commissionAmount: 0, // Will be calculated
            netAmount: 0, // Will be calculated
            deliveryAddress: '', // Will be set when order is processed
            specialInstructions: deliveryNotes,
          }
        }
      },
    });

    // Create a notification for available delivery partners
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: NotificationType.DELIVERY_UPDATE,
        title: 'New Delivery Request',
        message: `New delivery request from ${pharmacy.name}`,
      },
    });

    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    console.error('Error creating delivery request:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery request' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as SessionUser).role !== 'PHARMACY') {
      return NextResponse.json(
        { error: 'Unauthorized - Only pharmacies can view their delivery requests' },
        { status: 401 }
      );
    }

    const pharmacy = await prisma.pharmacy.findUnique({
      where: { userId: session.user.id },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: 'Pharmacy profile not found' },
        { status: 404 }
      );
    }

    // Find all deliveries associated with orders from this pharmacy
    const deliveries = await prisma.delivery.findMany({
      where: {
        order: {
          pharmacyId: pharmacy.id
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        deliveryPartner: true,
        order: true
      },
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('Error fetching delivery requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery requests' },
      { status: 500 }
    );
  }
}