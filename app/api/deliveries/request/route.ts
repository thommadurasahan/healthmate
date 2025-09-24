import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface DeliveryRequestBody {
  pickupAddress: string;
  deliveryNotes: string;
  urgencyLevel: 'normal' | 'urgent' | 'emergency';
  expectedPickupTime: string;
}

interface NotificationData {
  type: 'DELIVERY_REQUEST';
  title: string;
  message: string;
  role: 'DELIVERY_PARTNER';
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

    // Create the delivery request
    const deliveryRequest = await prisma.deliveryRequest.create({
      data: {
        pharmacyId: pharmacy.id,
        status: 'PENDING',
        pickupAddress,
        deliveryNotes,
        urgencyLevel: urgencyLevel as 'normal' | 'urgent' | 'emergency',
        expectedPickupTime: new Date(expectedPickupTime),
      },
    });

    // Create a notification for available delivery partners
    const notificationData: NotificationData = {
      type: 'DELIVERY_REQUEST',
      title: 'New Delivery Request',
      message: `New ${urgencyLevel} delivery request from ${pharmacy.name}`,
      role: 'DELIVERY_PARTNER',
    };

    await prisma.notification.create({
      data: notificationData,
    });

    return NextResponse.json(deliveryRequest, { status: 201 });
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

    const deliveryRequests = await prisma.deliveryRequest.findMany({
      where: {
        pharmacyId: pharmacy.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        deliveryPartner: true,
      },
    });

    return NextResponse.json(deliveryRequests);
  } catch (error) {
    console.error('Error fetching delivery requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery requests' },
      { status: 500 }
    );
  }
}