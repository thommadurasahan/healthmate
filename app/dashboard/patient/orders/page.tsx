'use client'

import { useState } from 'react'
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
  Star
} from 'lucide-react'

export default function PatientOrdersPage() {
  // Mock orders data
  const [orders] = useState([
    {
      id: 'ORD-001',
      prescriptionId: 'RX-001',
      pharmacy: {
        name: 'Green Cross Pharmacy',
        address: '123 Main St, Downtown',
        distance: 0.5,
        rating: 4.8
      },
      items: [
        { name: 'Paracetamol 500mg', quantity: 20, price: 5.99 },
        { name: 'Amoxicillin 250mg', quantity: 10, price: 12.50 }
      ],
      totalAmount: 132.48,
      commissionAmount: 6.62,
      netAmount: 125.86,
      status: 'DELIVERED',
      createdAt: '2024-01-15',
      deliveredAt: '2024-01-15'
    },
    {
      id: 'ORD-002', 
      prescriptionId: 'RX-002',
      pharmacy: {
        name: 'HealthPlus Pharmacy',
        address: '456 Oak Ave, Midtown',
        distance: 1.2,
        rating: 4.6
      },
      items: [
        { name: 'Cough Syrup', quantity: 1, price: 8.75 }
      ],
      totalAmount: 9.19,
      commissionAmount: 0.44,
      netAmount: 8.75,
      status: 'PROCESSING',
      createdAt: '2024-01-16'
    },
    {
      id: 'ORD-003',
      prescriptionId: 'RX-001',
      pharmacy: {
        name: 'MediCare Pharmacy',
        address: '789 Pine Rd, Uptown',
        distance: 2.1,
        rating: 4.7
      },
      items: [
        { name: 'Vitamin D3', quantity: 30, price: 15.99 },
        { name: 'Calcium Tablets', quantity: 60, price: 22.50 }
      ],
      totalAmount: 40.49,
      commissionAmount: 1.99,
      netAmount: 38.50,
      status: 'READY_FOR_DELIVERY',
      createdAt: '2024-01-14'
    }
  ])

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-gray-600">
          Track your medicine orders and delivery status
        </p>
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
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm ml-1">{order.pharmacy.rating}</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-600">
                            {order.pharmacy.distance} km away
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
            <Button asChild>
              <a href="/dashboard/patient/prescriptions">Upload Prescription</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}