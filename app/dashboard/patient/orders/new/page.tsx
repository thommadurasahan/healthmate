'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  MapPin, 
  Star, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Clock,
  CheckCircle,
  DollarSign,
  Package 
} from 'lucide-react'

interface Medicine {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

interface PharmacyMedicine {
  id: string
  name: string
  description?: string
  price: number
  unit: string
  stock: number
  isActive: boolean
}

interface Pharmacy {
  id: string
  name: string
  address: string
  phone: string
  latitude?: number
  longitude?: number
  isApproved: boolean
  medicines: PharmacyMedicine[]
}

interface CartItem {
  medicineId: string
  medicine: PharmacyMedicine
  quantity: number
  prescribedMedicine: Medicine
}

export default function NewOrderPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const prescriptionId = searchParams.get('prescriptionId')
  
  const [prescription, setPrescription] = useState<any>(null)
  const [prescribedMedicines, setPrescribedMedicines] = useState<Medicine[]>([])
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    if (prescriptionId) {
      fetchPrescriptionDetails()
      fetchPharmacies()
    }
  }, [prescriptionId])

  const fetchPrescriptionDetails = async () => {
    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}`)
      if (response.ok) {
        const data = await response.json()
        setPrescription(data)
        
        if (data.ocrData) {
          const ocrData = JSON.parse(data.ocrData)
          setPrescribedMedicines(ocrData.medicines || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch prescription:', error)
    }
  }

  const fetchPharmacies = async () => {
    try {
      const response = await fetch('/api/pharmacies')
      if (response.ok) {
        const data = await response.json()
        setPharmacies(data)
      } else {
        console.error('Failed to fetch pharmacies')
      }
    } catch (error) {
      console.error('Failed to fetch pharmacies:', error)
    } finally {
      setLoading(false)
    }
  }

  const findMatchingMedicines = (pharmacy: Pharmacy, prescribedMedicine: Medicine) => {
    return pharmacy.medicines.filter(med => 
      med.name.toLowerCase().includes(prescribedMedicine.name.toLowerCase()) &&
      med.isActive &&
      med.stock > 0
    )
  }

  const addToCart = (medicine: PharmacyMedicine, prescribedMedicine: Medicine, quantity: number = 1) => {
    const existingItem = cart.find(item => item.medicineId === medicine.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.medicineId === medicine.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setCart([...cart, {
        medicineId: medicine.id,
        medicine,
        quantity,
        prescribedMedicine
      }])
    }
  }

  const updateCartQuantity = (medicineId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.medicineId !== medicineId))
    } else {
      setCart(cart.map(item =>
        item.medicineId === medicineId
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0)
    const commission = subtotal * 0.05 // 5% commission
    const total = subtotal + commission
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      commission: Math.round(commission * 100) / 100,
      total: Math.round(total * 100) / 100
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedPharmacy || cart.length === 0) return

    setPlacing(true)
    
    try {
      const orderData = {
        pharmacyId: selectedPharmacy.id,
        prescriptionId,
        items: cart.map(item => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          unitPrice: item.medicine.price
        })),
        deliveryAddress: '123 Patient Address, City', // This should come from patient profile
        specialInstructions: 'Handle with care'
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const order = await response.json()
        alert('Order placed successfully!')
        router.push(`/dashboard/patient/orders/${order.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Order placement error:', error)
      alert('Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Prescription not found</h2>
        <p className="text-gray-600">Please go back and select a valid prescription.</p>
        <Button 
          className="mt-4"
          onClick={() => router.push('/dashboard/patient/prescriptions')}
        >
          Back to Prescriptions
        </Button>
      </div>
    )
  }

  const pricing = calculateTotal()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Order Medicines</h1>
        <p className="text-gray-600">Select a pharmacy and add medicines to your cart</p>
      </div>

      {/* Prescription Info */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Details</CardTitle>
          <CardDescription>Medicines prescribed by your doctor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prescribedMedicines.map((medicine, index) => (
              <div key={index} className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-medium text-blue-900">{medicine.name}</h4>
                <p className="text-sm text-blue-700">Dosage: {medicine.dosage}</p>
                <p className="text-sm text-blue-700">Frequency: {medicine.frequency}</p>
                <p className="text-sm text-blue-700">Duration: {medicine.duration}</p>
                {medicine.instructions && (
                  <p className="text-xs text-blue-600 mt-1">{medicine.instructions}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pharmacy Selection */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Available Pharmacies</h2>
          
          {pharmacies.map((pharmacy) => (
            <Card 
              key={pharmacy.id}
              className={`cursor-pointer transition-colors ${
                selectedPharmacy?.id === pharmacy.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPharmacy(pharmacy)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {pharmacy.name}
                      {pharmacy.isApproved && (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {pharmacy.address}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">4.5</span>
                    </div>
                    <p className="text-xs text-gray-500">{pharmacy.phone}</p>
                  </div>
                </div>
              </CardHeader>
              
              {selectedPharmacy?.id === pharmacy.id && (
                <CardContent>
                  <h4 className="font-medium mb-3">Available Medicines</h4>
                  <div className="space-y-3">
                    {prescribedMedicines.map((prescribed, index) => {
                      const matchingMeds = findMatchingMedicines(pharmacy, prescribed)
                      
                      return (
                        <div key={index} className="border rounded-lg p-3">
                          <h5 className="font-medium text-gray-900 mb-2">
                            Looking for: {prescribed.name} ({prescribed.dosage})
                          </h5>
                          
                          {matchingMeds.length > 0 ? (
                            <div className="space-y-2">
                              {matchingMeds.map((medicine) => (
                                <div 
                                  key={medicine.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                >
                                  <div>
                                    <p className="font-medium">{medicine.name}</p>
                                    <p className="text-sm text-gray-600">
                                      ${medicine.price} per {medicine.unit} • Stock: {medicine.stock}
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => addToCart(medicine, prescribed)}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-red-600">Not available at this pharmacy</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Cart */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Your Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length > 0 ? (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.medicineId} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{item.medicine.name}</p>
                        <p className="text-sm text-gray-600">
                          ${item.medicine.price} per {item.medicine.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartQuantity(item.medicineId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartQuantity(item.medicineId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${pricing.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Platform fee (5%):</span>
                      <span>${pricing.commission}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${pricing.total}</span>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={handlePlaceOrder}
                    disabled={!selectedPharmacy || placing}
                  >
                    {placing ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Your cart is empty</p>
                  <p className="text-sm">Select a pharmacy and add medicines</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}