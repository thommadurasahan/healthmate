import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { join } from 'path'
import { readFile } from 'fs/promises'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { join } from 'path'
import { spawn } from 'child_process'

// Real OCR implementation using Emergent LLM
async function extractMedicinesFromPrescription(filePath: string, mimeType: string) {
  return new Promise((resolve) => {
    try {
      const pythonPath = 'python3' // Use system python since we installed globally
      const scriptPath = '/app/ocr_processor.py'
      
      const pythonProcess = spawn(pythonPath, [scriptPath, filePath, mimeType])
      
      let outputData = ''
      let errorData = ''
      
      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString()
      })
      
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString()
      })
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(outputData)
            resolve(result)
          } catch (parseError) {
            resolve({
              success: false,
              error: `Failed to parse OCR result: ${parseError.message}`
            })
          }
        } else {
          resolve({
            success: false,
            error: `OCR process failed with code ${code}: ${errorData}`
          })
        }
      })
      
      pythonProcess.on('error', (error) => {
        resolve({
          success: false,
          error: `Failed to start OCR process: ${error.message}`
        })
      })
      
    } catch (error) {
      resolve({
        success: false,
        error: `OCR processing error: ${error.message}`
      })
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { prescriptionId } = await request.json()

    if (!prescriptionId) {
      return NextResponse.json(
        { error: 'Prescription ID is required' },
        { status: 400 }
      )
    }

    // Get patient
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      )
    }

    // Get prescription
    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        patientId: patient.id
      }
    })

    if (!prescription) {
      return NextResponse.json(
        { error: 'Prescription not found' },
        { status: 404 }
      )
    }

    if (prescription.status !== 'UPLOADED') {
      return NextResponse.json(
        { error: 'Prescription has already been processed or is not ready for processing' },
        { status: 400 }
      )
    }

    // Update status to processing
    await prisma.prescription.update({
      where: { id: prescriptionId },
      data: { status: 'PROCESSING' }
    })

    // Process the prescription with OCR
    const filePath = join(process.cwd(), prescription.filePath)
    const ocrResult = await extractMedicinesFromPrescription(filePath, prescription.mimeType)

    if (!ocrResult.success) {
      // Update status to rejected
      await prisma.prescription.update({
        where: { id: prescriptionId },
        data: { status: 'REJECTED' }
      })

      return NextResponse.json(
        { error: ocrResult.error || 'Failed to process prescription' },
        { status: 500 }
      )
    }

    // Update prescription with OCR data
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: 'PROCESSED',
        ocrData: JSON.stringify({
          medicines: ocrResult.medicines,
          extractedText: ocrResult.extractedText,
          processedAt: new Date().toISOString()
        })
      }
    })

    return NextResponse.json({
      message: 'Prescription processed successfully',
      prescription: updatedPrescription,
      medicines: ocrResult.medicines
    })

  } catch (error) {
    console.error('Prescription processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}