import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      email, 
      password, 
      role, 
      // Pharmacy fields
      pharmacyName, 
      address, 
      phone, 
      license,
      // Delivery Partner fields
      vehicleType,
      licenseNumber,
      // Laboratory fields
      laboratoryName,
      labLicense,
      // Doctor fields
      specialization,
      qualifications,
      experience,
      consultationFee,
      doctorLicense
    } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with role-specific data
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      role,
      isApproved: role === 'PATIENT' // Patients are auto-approved
    }

    if (role === 'PATIENT') {
      userData.patient = {
        create: {}
      }
    } else if (role === 'PHARMACY') {
      if (!pharmacyName || !address || !phone || !license) {
        return NextResponse.json(
          { error: 'Missing pharmacy information' },
          { status: 400 }
        )
      }
      
      userData.pharmacy = {
        create: {
          name: pharmacyName,
          address,
          phone,
          license,
          isApproved: false // Requires admin approval
        }
      }
    } else if (role === 'DELIVERY_PARTNER') {
      if (!vehicleType || !licenseNumber || !phone || !address) {
        return NextResponse.json(
          { error: 'Missing delivery partner information' },
          { status: 400 }
        )
      }
      
      userData.deliveryPartner = {
        create: {
          vehicleType,
          licenseNumber,
          phone,
          address,
          isApproved: false
        }
      }
    } else if (role === 'LABORATORY') {
      if (!laboratoryName || !address || !phone || !labLicense) {
        return NextResponse.json(
          { error: 'Missing laboratory information' },
          { status: 400 }
        )
      }
      
      userData.laboratory = {
        create: {
          name: laboratoryName,
          address,
          phone,
          license: labLicense,
          isApproved: false
        }
      }
    } else if (role === 'DOCTOR') {
      if (!specialization || !qualifications || !experience || !consultationFee || !doctorLicense || !phone) {
        return NextResponse.json(
          { error: 'Missing doctor information' },
          { status: 400 }
        )
      }
      
      userData.doctor = {
        create: {
          specialization,
          qualifications,
          experience: parseInt(experience),
          consultationFee: parseFloat(consultationFee),
          phone,
          license: doctorLicense,
          isApproved: false
        }
      }
    } else if (role === 'ADMIN') {
      userData.admin = {
        create: {
          role: 'SUPER_ADMIN'
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        patient: true,
        pharmacy: true,
        deliveryPartner: true,
        laboratory: true,
        doctor: true,
        admin: true
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}