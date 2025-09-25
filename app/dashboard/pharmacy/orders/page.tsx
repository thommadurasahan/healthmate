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
  DollarSign,
  AlertTriangle,
  Phone,
  Mail
} from 'lucide-react'

export default function PharmacyOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [isLoading, setIsLoading] = useState(false)

  // Mock orders data - more comprehensive and realistic
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
      paymentStatus: 'PAID',
      priority: 'normal',
      notes: 'Patient requested fast processing'
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
      paymentStatus: 'PAID',
      priority: 'normal',
      notes: ''
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
      paymentStatus: 'PAID',
      priority: 'urgent',
      notes: 'Urgent - patient needs medication today'
    },
    {
      id: 'ORD-004',
      patient: {
        name: 'Sarah Wilson',
        phone: '+1-555-0126',
        address: '321 Elm Street, Riverside'
      },
      prescriptionId: 'RX-004',
      items: [
        { name: 'Blood Pressure Medication', quantity: 30, unitPrice: 25.00, totalPrice: 750.00 },
        { name: 'Heart Supplement', quantity: 1, unitPrice: 45.00, totalPrice: 45.00 }
      ],
      totalAmount: 829.50,
      commissionAmount: 41.48,
      pharmacyAmount: 788.02,
      status: 'CONFIRMED',
      createdAt: '2024-01-16 08:00 AM',
      paymentStatus: 'PAID',
      priority: 'normal',
      notes: 'Regular monthly prescription'
    },
    {
      id: 'ORD-005',
      patient: {
        name: 'Robert Brown',
        phone: '+1-555-0127',
        address: '654 Maple Ave, Hillside'
      },
      prescriptionId: 'RX-005',
      items: [
        { name: 'Antibiotics', quantity: 14, unitPrice: 18.50, totalPrice: 259.00 },
        { name: 'Pain Relief Cream', quantity: 2, unitPrice: 12.99, totalPrice: 25.98 }
      ],
      totalAmount: 310.73,
      commissionAmount: 15.54,
      pharmacyAmount: 295.19,
      status: 'DELIVERED',
      createdAt: '2024-01-15 04:20 PM',
      paymentStatus: 'PAID',
      priority: 'normal',
      notes: 'Delivered successfully'
    }
  ])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || order.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'READY_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'ON_HOLD':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'normal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
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
      case 'CANCELLED':
        return ShoppingBag
      case 'ON_HOLD':
        return Clock
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
      case 'READY_FOR_DELIVERY':
        return { status: 'DELIVERED', label: 'Mark as Delivered', color: 'bg-green-500 hover:bg-green-600' }
      default:
        return null
    }
  }

  const handleCancelOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'CANCELLED' } : order
    ))
  }

  const handleHoldOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'ON_HOLD' } : order
    ))
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
        <h1 className="text-2xl font-bold dark:text-white">Orders Management</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Process and manage customer orders
        </p>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{orders.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Today</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {formatCurrency(orders.reduce((sum, order) => sum + order.pharmacyAmount, 0))}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">After commission</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {orders.filter(o => o.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Need attention</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">On Hold</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {orders.filter(o => o.status === 'ON_HOLD').length}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Cancelled</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {orders.filter(o => o.status === 'CANCELLED').length}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Cancelled orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search by order ID or patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="h-10 px-3 py-2 border border-input bg-transparent rounded-md text-sm min-w-[150px] dark:text-gray-300 dark:border-gray-600"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
            <select
              className="h-10 px-3 py-2 border border-input bg-transparent rounded-md text-sm min-w-[150px] dark:text-gray-300 dark:border-gray-600"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
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
            <Card key={order.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg dark:text-white">Order #{order.id}</CardTitle>
                      <CardDescription className="flex items-center space-x-4 dark:text-gray-300">
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
                    <Badge className={getPriorityColor(order.priority)}>
                      {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                    </Badge>
                    <Badge variant="outline" className={
                      order.paymentStatus === 'PAID' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Patient Information */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 dark:text-white">Patient Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Name:</p>
                      <p className="font-medium dark:text-gray-200">{order.patient.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Phone:</p>
                      <p className="font-medium dark:text-gray-200">{order.patient.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-600 dark:text-gray-400">Address:</p>
                      <p className="font-medium dark:text-gray-200">{order.patient.address}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2 dark:text-white">Items ({order.items.length})</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600 last:border-0">
                        <div>
                          <p className="font-medium dark:text-gray-200">{item.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <p className="font-medium dark:text-gray-200">{formatCurrency(item.totalPrice)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Notes */}
                {order.notes && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 dark:text-white">Order Notes</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{order.notes}</p>
                  </div>
                )}

                {/* Financial Summary */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300">Order Total:</span>
                      <span className="font-medium dark:text-gray-200">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Platform Commission (5%):</span>
                      <span>-{formatCurrency(order.commissionAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 dark:border-gray-600">
                      <span className="dark:text-gray-300">Your Revenue:</span>
                      <span className="text-green-600 dark:text-green-400">{formatCurrency(order.pharmacyAmount)}</span>
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
                      <Phone className="h-4 w-4 mr-2" />
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
                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Order
                      </Button>
                    )}
                    {order.status === 'PENDING' && (
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => handleHoldOrder(order.id)}
                      >
                        Hold Order
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
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="text-center py-12">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
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