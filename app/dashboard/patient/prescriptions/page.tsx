'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { Upload, FileText, Eye, Download, ShoppingBag } from 'lucide-react'

interface Prescription {
  id: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  status: string
  ocrData?: string
  createdAt: string
}

export default function PrescriptionsPage() {
  const { data: session } = useSession()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch('/api/prescriptions/upload')
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data)
      }
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('prescription', file)

    try {
      const response = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        fetchPrescriptions()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to upload prescription')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload prescription')
    } finally {
      setUploading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPLOADED':
        return 'bg-blue-100 text-blue-800'
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Prescriptions</h1>
          <p className="text-gray-600">Upload and manage your medical prescriptions</p>
        </div>
        <div className="relative">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <Button disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Prescription'}
          </Button>
        </div>
      </div>

      {/* Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Accepted formats: JPEG, PNG, PDF</li>
            <li>• Maximum file size: 10MB</li>
            <li>• Ensure the prescription is clear and readable</li>
            <li>• Include doctor's signature and clinic stamp</li>
            <li>• One prescription per file</li>
          </ul>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Prescriptions</CardTitle>
          <CardDescription>Your uploaded prescription history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {prescription.fileName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(prescription.fileSize)} • {prescription.mimeType}
                    </p>
                    <p className="text-xs text-gray-400">
                      Uploaded: {new Date(prescription.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(prescription.status)}>
                    {prescription.status}
                  </Badge>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(prescription.filePath, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    {prescription.status === 'PROCESSED' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          // Navigate to pharmacy selection with prescription
                          window.location.href = `/dashboard/patient/orders/new?prescriptionId=${prescription.id}`
                        }}
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Order Medicines
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {prescriptions.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No prescriptions uploaded yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Upload your first prescription to start ordering medicines
                </p>
                <div className="relative inline-block">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <Button disabled={uploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Your First Prescription'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}