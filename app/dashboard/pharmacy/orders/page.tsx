'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck,
  Eye,
  User,
  Calendar,
  DollarSign
} from 'lucide-react'

export default function PharmacyOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Mock orders data
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      patient: {
        name: 'John Doe',
        phone: '+1-555-0123',
        address: '123 Patient St, Downtown'
      },
      prescriptionId: 'RX-001',
      items: [
        { name: 'Paracetamol 500mg', quantity: 20, unitPrice: 5.99, totalPrice: 119.80 },
        { name: 'Amoxicillin 250mg', quantity: 10, unitPrice: 12.50, totalPrice: 125.00 }
      ],
      totalAmount: 257.30,
      commissionAmount: 12.87,
      pharmacyAmount: 244.43,
      status: 'PENDING',
      createdAt: '2024-01-16 10:30 AM',
      paymentStatus: 'PAID'
    },
    {
      id: 'ORD-002',
      patient: {
        name: 'Jane Smith',
        phone: '+1-555-0124',
        address: '456 Oak Ave, Midtown'
      },
      prescriptionId: 'RX-002',
      items: [
        { name: 'Cough Syrup', quantity: 1, unitPrice: 8.75, totalPrice: 8.75 }
      ],
      totalAmount: 9.19,
      commissionAmount: 0.44,
      pharmacyAmount: 8.75,
      status: 'PROCESSING',
      createdAt: '2024-01-16 09:15 AM',
      paymentStatus: 'PAID'
    },
    {
      id: 'ORD-003',
      patient: {
        name: 'Mike Johnson',
        phone: '+1-555-0125',
        address: '789 Pine Rd, Uptown'
      },
      prescriptionId: 'RX-003',
      items: [
        { name: 'Vitamin D3', quantity: 30, unitPrice: 15.99, totalPrice: 479.70 },
        { name: 'Calcium Tablets', quantity: 60, unitPrice: 22.50, totalPrice: 1350.00 }
      ],
      totalAmount: 1920.19,
      commissionAmount: 91.49,
      pharmacyAmount: 1829.70,
      status: 'READY_FOR_DELIVERY',
      createdAt: '2024-01-15 02:45 PM',
      paymentStatus: 'PAID'
    }
  ])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
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

  const getNextStatusAction = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING':
        return { status: 'CONFIRMED', label: 'Confirm Order', color: 'bg-blue-500 hover:bg-blue-600' }
      case 'CONFIRMED':
        return { status: 'PROCESSING', label: 'Start Processing', color: 'bg-purple-500 hover:bg-purple-600' }
      case 'PROCESSING':
        return { status: 'READY_FOR_DELIVERY', label: 'Ready for Delivery', color: 'bg-orange-500 hover:bg-orange-600' }
      default:
        return null
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
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <p className="text-gray-600">
          Process and manage customer orders
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
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(orders.reduce((sum, order) => sum + order.pharmacyAmount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">After commission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => ['PROCESSING', 'READY_FOR_DELIVERY'].includes(o.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by order ID or patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="h-10 px-3 py-2 border border-input bg-transparent rounded-md text-sm min-w-[150px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const StatusIcon = getStatusIcon(order.status)
          const nextAction = getNextStatusAction(order.status)
          
          return (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {order.createdAt}
                        </span>
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {order.patient.name}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className={
                      order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-red-600'
                    }>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Patient Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Patient Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Name:</p>
                      <p className="font-medium">{order.patient.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone:</p>
                      <p className="font-medium">{order.patient.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-600">Address:</p>
                      <p className="font-medium">{order.patient.address}</p>
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
                          <p className="text-sm text-gray-600">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Order Total:</span>
                      <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Platform Commission (5%):</span>
                      <span>-{formatCurrency(order.commissionAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Your Revenue:</span>
                      <span className="text-green-600">{formatCurrency(order.pharmacyAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Prescription
                    </Button>
                    <Button variant="outline" size="sm">
                      Contact Patient
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    {nextAction && (
                      <Button
                        size="sm"
                        className={nextAction.color}
                        onClick={() => updateOrderStatus(order.id, nextAction.status)}
                      >
                        {nextAction.label}
                      </Button>
                    )}
                    {order.status === 'READY_FOR_DELIVERY' && (
                      <Button size="sm" variant="outline">
                        Find Delivery Partner
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms or filters'
                : 'Orders will appear here when patients place them'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}