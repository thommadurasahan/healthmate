import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, pharmacyName, address, phone, license } = body

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
    } else if (role === 'ADMIN') {
      userData.admin = {
        create: {
          role: 'SUPER_ADMIN'
        }
      }
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        patient: true,
        pharmacy: true,
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