'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  MapPin,
  ShoppingBag,
  Pill,
  Plus,
  Minus,
  ShoppingCart,
  Star,
  Clock,
  Phone
} from 'lucide-react'

interface Medicine {
  id: string
  name: string
  description?: string
  price: number
  unit: string
  stock: number
}

interface Pharmacy {
  id: string
  name: string
  address: string
  phone: string
}

interface PharmacyResult {
  pharmacy: Pharmacy
  medicines: Medicine[]
  totalMedicines: number
  totalValue: number
}

interface CartItem {
  medicine: Medicine
  pharmacy: Pharmacy
  quantity: number
}

export default function OrderDirectPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PharmacyResult[]>([])
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')

  const searchMedicines = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/search/medicines?q=${encodeURIComponent(searchQuery)}`
      )

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
      } else {
        console.error('Search failed')
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (medicine: Medicine, pharmacy: Pharmacy) => {
    setCart(prev => {
      const existingItem = prev.find(
        item => item.medicine.id === medicine.id && item.pharmacy.id === pharmacy.id
      )

      if (existingItem) {
        return prev.map(item =>
          item.medicine.id === medicine.id && item.pharmacy.id === pharmacy.id
            ? { ...item, quantity: Math.min(item.quantity + 1, medicine.stock) }
            : item
        )
      } else {
        return [...prev, { medicine, pharmacy, quantity: 1 }]
      }
    })
  }

  const updateCartQuantity = (medicineId: string, pharmacyId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId, pharmacyId)
      return
    }

    setCart(prev => prev.map(item =>
      item.medicine.id === medicineId && item.pharmacy.id === pharmacyId
        ? { ...item, quantity: Math.min(newQuantity, item.medicine.stock) }
        : item
    ))
  }

  const removeFromCart = (medicineId: string, pharmacyId: string) => {
    setCart(prev => prev.filter(
      item => !(item.medicine.id === medicineId && item.pharmacy.id === pharmacyId)
    ))
  }

  const getCartItemQuantity = (medicineId: string, pharmacyId: string) => {
    const item = cart.find(
      item => item.medicine.id === medicineId && item.pharmacy.id === pharmacyId
    )
    return item?.quantity || 0
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.medicine.price * item.quantity), 0)
  }

  const groupCartByPharmacy = () => {
    const grouped: { [pharmacyId: string]: { pharmacy: Pharmacy; items: CartItem[] } } = {}
    
    cart.forEach(item => {
      if (!grouped[item.pharmacy.id]) {
        grouped[item.pharmacy.id] = {
          pharmacy: item.pharmacy,
          items: []
        }
      }
      grouped[item.pharmacy.id].items.push(item)
    })
    
    return Object.values(grouped)
  }

  const placeOrders = async () => {
    if (!deliveryAddress.trim()) {
      alert('Please enter a delivery address')
      return
    }

    const pharmacyGroups = groupCartByPharmacy()
    
    try {
      // Create separate orders for each pharmacy
      for (const group of pharmacyGroups) {
        const orderItems = group.items.map(item => ({
          medicineId: item.medicine.id,
          quantity: item.quantity,
          unitPrice: item.medicine.price
        }))

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pharmacyId: group.pharmacy.id,
            orderType: 'DIRECT',
            items: orderItems,
            deliveryAddress
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to create order for ${group.pharmacy.name}`)
        }
      }

      // Clear cart and redirect
      setCart([])
      router.push('/dashboard/patient/orders?success=true')
    } catch (error) {
      console.error('Order error:', error)
      alert('Failed to place orders. Please try again.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchMedicines()
    }
  }

  useEffect(() => {
    // Auto-search when query changes (with debounce)
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchMedicines()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order Medicines Directly</h1>
          <p className="text-gray-600">Search and order medicines from available pharmacies</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowCart(!showCart)}
          className="relative"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Cart ({cart.length})
          {cart.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {cart.length}
            </Badge>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search and Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Bar */}
          <Card>
            <CardHeader>
              <CardTitle>Search Medicines</CardTitle>
              <CardDescription>Find medicines available at pharmacies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Search for medicines (e.g., Paracetamol, Aspirin...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={searchMedicines} disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {loading && (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Searching pharmacies...</p>
              </CardContent>
            </Card>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Found {searchResults.length} pharmacies with "{searchQuery}"
              </h2>
              
              {searchResults.map(result => (
                <Card key={result.pharmacy.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{result.pharmacy.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4" />
                          {result.pharmacy.address}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {result.pharmacy.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Pill className="h-4 w-4" />
                            {result.totalMedicines} medicines available
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Available
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.medicines.map(medicine => {
                        const cartQuantity = getCartItemQuantity(medicine.id, result.pharmacy.id)
                        return (
                          <div key={medicine.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium">{medicine.name}</h4>
                                {medicine.description && (
                                  <p className="text-sm text-gray-500">{medicine.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-lg font-bold text-primary">
                                    ${medicine.price}
                                  </span>
                                  <span className="text-sm text-gray-500">per {medicine.unit}</span>
                                </div>
                                <p className="text-sm text-green-600">
                                  {medicine.stock} in stock
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              {cartQuantity > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateCartQuantity(medicine.id, result.pharmacy.id, cartQuantity - 1)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">{cartQuantity}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateCartQuantity(medicine.id, result.pharmacy.id, cartQuantity + 1)}
                                    disabled={cartQuantity >= medicine.stock}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => addToCart(medicine, result.pharmacy)}
                                  disabled={medicine.stock === 0}
                                  size="sm"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add to Cart
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {searchQuery && !loading && searchResults.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No medicines found</h3>
                <p className="text-gray-600">
                  Try searching with different keywords or check the spelling
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="space-y-6">
          <Card className={showCart ? '' : 'lg:sticky lg:top-4'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Cart
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Your cart is empty</p>
                  <p className="text-sm text-gray-500 mt-1">Search and add medicines to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupCartByPharmacy().map(group => (
                    <div key={group.pharmacy.id} className="border rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">{group.pharmacy.name}</h4>
                      <div className="space-y-2">
                        {group.items.map(item => (
                          <div key={`${item.medicine.id}-${item.pharmacy.id}`} className="flex justify-between items-center text-sm">
                            <div className="flex-1">
                              <span className="font-medium">{item.medicine.name}</span>
                              <div className="text-gray-500">
                                ${item.medicine.price} x {item.quantity}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateCartQuantity(item.medicine.id, item.pharmacy.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-xs">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateCartQuantity(item.medicine.id, item.pharmacy.id, item.quantity + 1)}
                                disabled={item.quantity >= item.medicine.stock}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${getCartTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee:</span>
                        <span>${(groupCartByPharmacy().length * 5).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${(getCartTotal() + groupCartByPharmacy().length * 5).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Input
                        placeholder="Delivery address *"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                      <Button 
                        className="w-full" 
                        onClick={placeOrders}
                        disabled={!deliveryAddress.trim()}
                      >
                        Place Orders ({groupCartByPharmacy().length})
                        <ShoppingBag className="h-4 w-4 ml-2" />
                      </Button>
                    </div>

                    {groupCartByPharmacy().length > 1 && (
                      <p className="text-xs text-gray-500 mt-2">
                        * Separate orders will be created for each pharmacy
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}