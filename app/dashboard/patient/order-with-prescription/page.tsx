'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MapPin,
  ShoppingBag,
  Pill,
  ArrowLeft,
  ArrowRight,
  Eye,
  Star
} from 'lucide-react'

interface PharmacyMatch {
  pharmacy: {
    id: string
    name: string
    address: string
    phone: string
  }
  availableMedicines: {
    id: string
    name: string
    price: number
    unit: string
    stock: number
    prescriptionMatch: string
  }[]
  matchedCount: number
  totalValue: number
  coveragePercentage: number
}

interface PrescriptionData {
  id: string
  fileName: string
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'REJECTED'
  medicines?: string[]
  matchingPharmacies?: PharmacyMatch[]
}

export default function OrderWithPrescriptionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [step, setStep] = useState(1) // 1: Upload, 2: Processing, 3: Select Pharmacy, 4: Review Order
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null)
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyMatch | null>(null)
  const [selectedMedicines, setSelectedMedicines] = useState<{[key: string]: number}>({})
  const [deliveryAddress, setDeliveryAddress] = useState('')

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const uploadData = await uploadResponse.json()
      setPrescription({
        id: uploadData.prescription.id,
        fileName: uploadData.prescription.fileName,
        status: 'UPLOADED'
      })
      
      setStep(2)
      await processPrescription(uploadData.prescription.id)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload prescription. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const processPrescription = async (prescriptionId: string) => {
    setProcessing(true)
    try {
      const processResponse = await fetch('/api/prescriptions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId })
      })

      if (!processResponse.ok) {
        throw new Error('Processing failed')
      }

      const processData = await processResponse.json()
      setPrescription(prev => ({
        ...prev!,
        status: 'PROCESSED',
        medicines: processData.medicines?.map((med: any) => med.name || med.medicine_name) || [],
        matchingPharmacies: processData.matchingPharmacies || []
      }))
      
      setStep(3)
    } catch (error) {
      console.error('Processing error:', error)
      setPrescription(prev => ({ ...prev!, status: 'REJECTED' }))
      alert('Failed to process prescription. Please try again with a clearer image.')
    } finally {
      setProcessing(false)
    }
  }

  const selectPharmacy = (pharmacy: PharmacyMatch) => {
    setSelectedPharmacy(pharmacy)
    // Pre-select all available medicines with quantity 1
    const initialSelection: {[key: string]: number} = {}
    pharmacy.availableMedicines.forEach(med => {
      initialSelection[med.id] = 1
    })
    setSelectedMedicines(initialSelection)
    setStep(4)
  }

  const updateMedicineQuantity = (medicineId: string, quantity: number) => {
    setSelectedMedicines(prev => ({
      ...prev,
      [medicineId]: Math.max(0, quantity)
    }))
  }

  const calculateTotal = () => {
    if (!selectedPharmacy) return 0
    return selectedPharmacy.availableMedicines.reduce((total, med) => {
      const quantity = selectedMedicines[med.id] || 0
      return total + (med.price * quantity)
    }, 0)
  }

  const placeOrder = async () => {
    if (!selectedPharmacy || !deliveryAddress) {
      alert('Please fill all required fields')
      return
    }

    try {
      const orderItems = selectedPharmacy.availableMedicines
        .filter(med => selectedMedicines[med.id] > 0)
        .map(med => ({
          medicineId: med.id,
          quantity: selectedMedicines[med.id],
          unitPrice: med.price
        }))

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacyId: selectedPharmacy.pharmacy.id,
          prescriptionId: prescription?.id,
          orderType: 'PRESCRIPTION_BASED',
          items: orderItems,
          deliveryAddress
        })
      })

      if (!orderResponse.ok) {
        throw new Error('Order creation failed')
      }

      router.push('/dashboard/patient/orders?success=true')
    } catch (error) {
      console.error('Order error:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  const renderStep1 = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Upload Your Prescription</CardTitle>
        <CardDescription>
          Upload a clear photo or PDF of your prescription to find matching pharmacies
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Drop your prescription here</p>
          <p className="text-gray-500 mb-4">or click to browse files</p>
          <Button variant="outline">Choose File</Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
          aria-label="Upload prescription file"
        />
        
        <div className="mt-8 text-left">
          <h4 className="font-medium mb-2">Tips for best results:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Ensure good lighting and clear image quality</li>
            <li>• Include the complete prescription with medicine names</li>
            <li>• Supported formats: JPG, PNG, PDF</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep2 = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Processing Your Prescription</CardTitle>
        <CardDescription>
          Our AI is analyzing your prescription to identify medicines
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Uploaded: {prescription?.fileName}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span>Extracting medicine information...</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400">Finding pharmacies with medicines...</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Pharmacies with Your Medicines</h1>
        <p className="text-gray-600">
          {prescription?.matchingPharmacies?.length || 0} pharmacies have your medicines available
        </p>
      </div>

      <div className="grid gap-4">
        {prescription?.matchingPharmacies?.map((pharmacy) => (
          <Card key={pharmacy.pharmacy.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{pharmacy.pharmacy.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {pharmacy.pharmacy.address}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge variant={pharmacy.coveragePercentage === 100 ? "default" : "secondary"}>
                    {pharmacy.coveragePercentage}% match
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">
                    {pharmacy.matchedCount} of {prescription?.medicines?.length} medicines
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium">Available Medicines:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {pharmacy.availableMedicines.map((med) => (
                    <div key={med.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{med.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({med.unit})</span>
                      </div>
                      <span className="font-bold">${med.price}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-lg font-bold">Estimated Total: ${pharmacy.totalValue.toFixed(2)}</span>
                  <Button onClick={() => selectPharmacy(pharmacy)}>
                    Select Pharmacy
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Review Your Order</h1>
          <p className="text-gray-600">Pharmacy: {selectedPharmacy?.pharmacy.name}</p>
        </div>
        <Button variant="outline" onClick={() => setStep(3)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pharmacies
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedPharmacy?.availableMedicines.map((med) => (
                <div key={med.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">{med.name}</h4>
                    <p className="text-sm text-gray-500">{med.unit} • ${med.price} each</p>
                    <p className="text-sm text-green-600">Stock: {med.stock}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMedicineQuantity(med.id, (selectedMedicines[med.id] || 1) - 1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{selectedMedicines[med.id] || 1}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMedicineQuantity(med.id, (selectedMedicines[med.id] || 1) + 1)}
                      disabled={selectedMedicines[med.id] >= med.stock}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Delivery Address *</label>
              <Input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your complete delivery address"
                className="w-full"
              />
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>$5.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${(calculateTotal() + 5).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={placeOrder}
              disabled={!deliveryAddress || Object.values(selectedMedicines).every(q => q === 0)}
            >
              Place Order
              <ShoppingBag className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Step {step} of 4</span>
          <span className="text-sm text-gray-500">
            {step === 1 && 'Upload Prescription'}
            {step === 2 && 'Processing'}
            {step === 3 && 'Select Pharmacy'}
            {step === 4 && 'Review Order'}
          </span>
        </div>
        <Progress value={(step / 4) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  )
}