import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DeliveryStatus, NotificationType, UserRole } from '@prisma/client';

interface DeliveryRequestBody {
  orderId?: string;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryNotes: string;
  urgencyLevel: 'NORMAL' | 'URGENT' | 'EMERGENCY';
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

    const { orderId, pickupAddress, deliveryAddress, deliveryNotes, urgencyLevel, expectedPickupTime }: DeliveryRequestBody = await req.json();

    // Validate required fields
    if (!pickupAddress || !deliveryAddress || !expectedPickupTime) {
      return NextResponse.json(
        { error: 'Missing required fields: pickupAddress, deliveryAddress, expectedPickupTime' },
        { status: 400 }
      );
    }

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

    // If orderId is provided, connect to existing order, otherwise create a new placeholder order
    let orderData;
    if (orderId) {
      // Verify the order exists and belongs to this pharmacy
      const existingOrder = await prisma.order.findFirst({
        where: {
          id: orderId,
          pharmacyId: pharmacy.id
        }
      });
      
      if (!existingOrder) {
        return NextResponse.json(
          { error: 'Order not found or does not belong to this pharmacy' },
          { status: 404 }
        );
      }
      
      orderData = { orderId };
    } else {
      // Create a new order for this delivery request
      const newOrder = await prisma.order.create({
        data: {
          userId: session.user.id,
          patientId: session.user.id, // Temporary - will be updated when actual patient orders
          pharmacyId: pharmacy.id,
          orderType: 'DIRECT',
          status: 'PENDING',
          totalAmount: 0,
          commissionRate: 0.05,
          commissionAmount: 0,
          netAmount: 0,
          deliveryAddress,
          specialInstructions: deliveryNotes || ''
        }
      });
      
      orderData = { orderId: newOrder.id };
    }

    // Create the delivery request
    const delivery = await prisma.delivery.create({
      data: {
        ...orderData,
        pickupAddress,
        deliveryAddress,
        status: DeliveryStatus.PENDING,
        estimatedTime: new Date(expectedPickupTime),
        deliveryFee: 5.0 // Standard delivery fee
      },
      include: {
        order: {
          include: {
            pharmacy: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        },
        deliveryPartner: {
          select: {
            name: true,
            phone: true
          }
        }
      }
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
        deliveryPartner: {
          select: {
            name: true,
            phone: true
          }
        },
        order: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    name: true,
                    phone: true
                  }
                }
              }
            }
          }
        }
      },
    });

    // Transform the data to match frontend expectations
    const transformedDeliveries = deliveries.map(delivery => ({
      id: delivery.id,
      orderId: delivery.orderId,
      pickupAddress: delivery.pickupAddress,
      deliveryAddress: delivery.deliveryAddress,
      status: delivery.status,
      urgencyLevel: 'NORMAL', // Default since not in schema
      expectedPickupTime: delivery.estimatedTime?.toISOString() || '',
      deliveryNotes: delivery.order.specialInstructions || '',
      createdAt: delivery.createdAt.toISOString(),
      deliveryPartner: delivery.deliveryPartner,
      order: {
        orderType: delivery.order.orderType,
        totalAmount: delivery.order.totalAmount,
        patient: delivery.order.patient
      }
    }));

    return NextResponse.json(transformedDeliveries);
  } catch (error) {
    console.error('Error fetching delivery requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery requests' },
      { status: 500 }
    );
  }
}
