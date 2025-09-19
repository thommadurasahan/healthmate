'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Upload, FileText, X, Eye } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function PrescriptionsPage() {
  const { data: session } = useSession()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Please select a valid file (JPEG, PNG, or PDF)')
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size should be less than 10MB')
        return
      }

      setSelectedFile(file)
      setUploadError('')
      setUploadSuccess(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('prescription', selectedFile)

      const response = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setUploadSuccess(true)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        const data = await response.json()
        setUploadError(data.error || 'Upload failed')
      }
    } catch (error) {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadError('')
    setUploadSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Mock prescription history
  const prescriptionHistory = [
    {
      id: '1',
      fileName: 'prescription_2024_01_15.pdf',
      uploadDate: '2024-01-15',
      status: 'PROCESSED',
      pharmaciesFound: 3
    },
    {
      id: '2',
      fileName: 'prescription_2024_01_10.jpg',
      uploadDate: '2024-01-10',
      status: 'PROCESSING',
      pharmaciesFound: 0
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Prescription</h1>
        <p className="text-gray-600">
          Upload your prescription to find medicines from nearby pharmacies
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>New Prescription</CardTitle>
          <CardDescription>
            Upload a clear image or PDF of your prescription. Supported formats: JPEG, PNG, PDF (Max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="prescription-upload"
            />
            <label
              htmlFor="prescription-upload"
              className="cursor-pointer block"
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Click to upload prescription
              </p>
              <p className="text-sm text-gray-500">
                or drag and drop your file here
              </p>
            </label>
          </div>

          {/* Selected File Display */}
          {selectedFile && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {uploadError}
            </div>
          )}

          {/* Success Message */}
          {uploadSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              Prescription uploaded successfully! We'll process it and show you available medicines from nearby pharmacies.
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full sm:w-auto"
            >
              {uploading ? 'Uploading...' : 'Upload Prescription'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prescription History */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription History</CardTitle>
          <CardDescription>Your previously uploaded prescriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prescriptionHistory.map((prescription) => (
              <div
                key={prescription.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {prescription.fileName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Uploaded on {prescription.uploadDate}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prescription.status === 'PROCESSED' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {prescription.status}
                      </span>
                      {prescription.pharmaciesFound > 0 && (
                        <span className="text-xs text-gray-500">
                          {prescription.pharmaciesFound} pharmacies found
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {prescription.status === 'PROCESSED' && prescription.pharmaciesFound > 0 && (
                    <Button size="sm">
                      View Pharmacies
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {prescriptionHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No prescriptions uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}