'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck,
  Eye,
  Star,
  RefreshCw
} from 'lucide-react'

interface Order {
  id: string
  prescriptionId: string
  pharmacy: {
    name: string
    address: string
    phone: string
  }
  items: {
    name: string
    quantity: number
    price: number
  }[]
  totalAmount: number
  commissionAmount: number
  netAmount: number
  status: string
  createdAt: string
  updatedAt: string
  deliveredAt?: string
}

export default function PatientOrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchOrders()
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        console.error('Failed to fetch orders')
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800'
      case 'READY_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED':
        return Clock
      case 'PROCESSING':
        return Package
      case 'READY_FOR_DELIVERY':
        return Truck
      case 'DELIVERED':
        return CheckCircle
      default:
        return Clock
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-gray-600">
            Track your medicine orders and delivery status
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'DELIVERED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => ['PROCESSING', 'READY_FOR_DELIVERY'].includes(o.status)).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const StatusIcon = getStatusIcon(order.status)
          
          return (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <CardDescription>
                        Placed on {order.createdAt}
                        {order.deliveredAt && ` • Delivered on ${order.deliveredAt}`}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Pharmacy Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{order.pharmacy.name}</p>
                        <p className="text-sm text-gray-600">{order.pharmacy.address}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600">
                            {order.pharmacy.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">Items ({order.items.length})</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.netAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Platform fee (5%):</span>
                      <span>{formatCurrency(order.commissionAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {order.status === 'DELIVERED' && (
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  )}
                  {['PENDING', 'CONFIRMED'].includes(order.status) && (
                    <Button variant="destructive" size="sm">
                      Cancel Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {orders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-4">
              Upload a prescription to start ordering medicines
            </p>
            <Button onClick={() => window.location.href = '/dashboard/patient/prescriptions'}>
              Upload Prescription
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}