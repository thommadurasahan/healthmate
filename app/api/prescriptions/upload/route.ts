import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('prescription') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, or PDF files only.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Get patient ID
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads', 'prescriptions')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${uuidv4()}.${fileExtension}`
    const filePath = join(uploadDir, uniqueFilename)
    const relativePath = `uploads/prescriptions/${uniqueFilename}`

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save to database
    const prescription = await prisma.prescription.create({
      data: {
        patientId: patient.id,
        fileName: file.name,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.type,
        status: 'UPLOADED'
      }
    })

    return NextResponse.json({
      message: 'Prescription uploaded successfully',
      prescription: {
        id: prescription.id,
        fileName: prescription.fileName,
        status: prescription.status,
        createdAt: prescription.createdAt
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prescriptions = await prisma.prescription.findMany({
      where: {
        patientId: session.user.patient.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}