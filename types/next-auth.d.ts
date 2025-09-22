import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      isApproved: boolean
      patient?: {
        id: string
        phone?: string
        address?: string
        dateOfBirth?: Date
        emergencyContact?: string
      }
      pharmacy?: {
        id: string
        name: string
        address: string
        phone: string
        license: string
        latitude?: number
        longitude?: number
        isApproved: boolean
      }
      deliveryPartner?: {
        id: string
        vehicleType: string
        licenseNumber: string
        phone: string
        address: string
        latitude?: number
        longitude?: number
        isAvailable: boolean
        isApproved: boolean
      }
      laboratory?: {
        id: string
        name: string
        address: string
        phone: string
        license: string
        latitude?: number
        longitude?: number
        isApproved: boolean
      }
      doctor?: {
        id: string
        specialization: string
        qualifications: string
        experience: number
        consultationFee: number
        phone: string
        address?: string
        license: string
        isApproved: boolean
      }
      admin?: {
        id: string
        role: string
      }
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    isApproved: boolean
    patient?: any
    pharmacy?: any
    deliveryPartner?: any
    laboratory?: any
    doctor?: any
    admin?: any
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    isApproved: boolean
    patient?: any
    pharmacy?: any
    deliveryPartner?: any
    laboratory?: any
    doctor?: any
    admin?: any
  }
}