import { Server as SocketIOServer, Socket } from 'socket.io'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as HTTPServer } from 'http'

export interface DeliveryRequest {
  id: string
  orderId: string
  pharmacyId: string
  pickupAddress: string
  deliveryAddress: string
  estimatedTime: string
  deliveryFee: number
  orderItems: Array<{
    medicine: { name: string }
    quantity: number
  }>
  orderValue: number
}

export interface DeliverySocket extends Socket {
  userId?: string
  userRole?: string
  deliveryPartnerId?: string
}

let io: SocketIOServer

export const initSocketIO = (server: HTTPServer) => {
  if (!io) {
    io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    io.on('connection', (socket: any) => {
      console.log('Client connected:', socket.id)

      // Handle delivery partner registration
      socket.on('register-delivery-partner', (data: { userId: string, deliveryPartnerId: string }) => {
        socket.userId = data.userId
        socket.userRole = 'DELIVERY_PARTNER'
        socket.deliveryPartnerId = data.deliveryPartnerId
        socket.join('delivery-partners')
        console.log(`Delivery partner ${data.deliveryPartnerId} registered`)
      })

      // Handle pharmacy registration
      socket.on('register-pharmacy', (data: { userId: string, pharmacyId: string }) => {
        socket.userId = data.userId
        socket.userRole = 'PHARMACY'
        socket.join(`pharmacy-${data.pharmacyId}`)
        console.log(`Pharmacy ${data.pharmacyId} registered`)
      })

      // Handle patient registration
      socket.on('register-patient', (data: { userId: string, patientId: string }) => {
        socket.userId = data.userId
        socket.userRole = 'PATIENT'
        socket.join(`patient-${data.patientId}`)
        console.log(`Patient ${data.patientId} registered`)
      })

      // Handle delivery request acceptance
      socket.on('accept-delivery', async (data: { deliveryId: string, deliveryPartnerId: string }) => {
        try {
          // Update delivery status in database
          const delivery = await updateDeliveryPartner(data.deliveryId, data.deliveryPartnerId)
          
          if (delivery) {
            // Notify pharmacy that delivery was accepted
            io.to(`pharmacy-${delivery.order.pharmacyId}`).emit('delivery-accepted', {
              deliveryId: data.deliveryId,
              deliveryPartner: {
                id: data.deliveryPartnerId,
                // Add delivery partner details here
              }
            })

            // Notify patient about delivery assignment
            io.to(`patient-${delivery.order.patientId}`).emit('delivery-assigned', {
              orderId: delivery.orderId,
              deliveryId: data.deliveryId,
              deliveryPartner: {
                id: data.deliveryPartnerId,
                // Add delivery partner details here
              }
            })

            // Remove the delivery request from broadcasts
            io.to('delivery-partners').emit('delivery-request-closed', { deliveryId: data.deliveryId })
          }
        } catch (error) {
          console.error('Error accepting delivery:', error)
          socket.emit('error', { message: 'Failed to accept delivery' })
        }
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }

  return io
}

// Function to broadcast delivery request to all available delivery partners
export const broadcastDeliveryRequest = (deliveryRequest: DeliveryRequest) => {
  if (io) {
    io.to('delivery-partners').emit('new-delivery-request', deliveryRequest)
  }
}

// Function to update delivery status
export const updateDeliveryStatus = (deliveryId: string, status: string, additionalData?: any) => {
  if (io) {
    io.emit('delivery-status-updated', { deliveryId, status, ...additionalData })
  }
}

// Mock function to update delivery partner (replace with actual database call)
async function updateDeliveryPartner(deliveryId: string, deliveryPartnerId: string) {
  // This would be replaced with actual Prisma call
  // const delivery = await prisma.delivery.update({
  //   where: { id: deliveryId },
  //   data: { deliveryPartnerId, status: 'ASSIGNED' },
  //   include: { order: true }
  // })
  // return delivery
  
  return {
    id: deliveryId,
    orderId: 'mock-order-id',
    order: {
      pharmacyId: 'mock-pharmacy-id',
      patientId: 'mock-patient-id'
    }
  }
}

export { io }