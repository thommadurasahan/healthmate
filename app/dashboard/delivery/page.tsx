'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import {
  Package,
  MapPin,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

interface Delivery {
  id: string
  status: string
  pickupAddress: string
  deliveryAddress: string
  estimatedTime?: string
  deliveryFee: number
  order: {
    id: string
    totalAmount: number
    patient: {
      user: {
        name: string
        phone: string
      }
    }
    pharmacy: {
      name: string
      address: string
      phone: string
    }
    orderItems: Array<{
      medicine: {
        name: string
      }
      quantity: number
    }>
  }
}

export default function DeliveryDashboard() {
  const { data: session } = useSession()
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([])
  const [myDeliveries, setMyDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      // Fetch available deliveries
      const availableRes = await fetch('/api/deliveries?status=available')
      const availableData = availableRes.ok ? await availableRes.json() : []

      // Fetch my assigned deliveries
      const myRes = await fetch('/api/deliveries')
      const myData = myRes.ok ? await myRes.json() : []

      setAvailableDeliveries(availableData)
      setMyDeliveries(myData)
    } catch (error) {
      console.error('Failed to fetch deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  const acceptDelivery = async (deliveryId: string) => {
    try {
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId })
      })

      if (response.ok) {
        fetchDeliveries() // Refresh the lists
      }
    } catch (error) {
      console.error('Failed to accept delivery:', error)
    }
  }

  const updateDeliveryStatus = async (deliveryId: string, status: string) => {
    try {
      const response = await fetch(`/api/deliveries/${deliveryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchDeliveries() // Refresh the lists
      }
    } catch (error) {
      console.error('Failed to update delivery status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'PICKED_UP':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'IN_TRANSIT':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 dark:border-orange-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {session?.user?.name}!
        </h1>
        <p className="text-white/90">
          Manage your delivery requests and earn money by delivering medicines to patients.
        </p>
        {session?.user?.deliveryPartner?.isApproved === false && (
          <div className="mt-4 bg-yellow-500/20 border border-yellow-300 text-yellow-100 p-3 rounded-md">
            <AlertTriangle className="h-5 w-5 inline mr-2" />
            Your account is pending admin approval. You'll be able to accept deliveries once approved.
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Available Deliveries</CardTitle>
            <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{availableDeliveries.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Ready to accept</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">My Deliveries</CardTitle>
            <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{myDeliveries.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">In progress</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {myDeliveries.filter(d => d.status === 'DELIVERED').length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Deliveries completed</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Estimated Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${myDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0).toFixed(2)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Today's earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Deliveries */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Available Delivery Requests</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            First-come-first-serve delivery requests from pharmacies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(delivery.status)}>
                        {delivery.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Order #{delivery.order.id.slice(-8)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Pickup</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{delivery.order.pharmacy.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{delivery.pickupAddress}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Delivery</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{delivery.order.patient.user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{delivery.deliveryAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <span>Items: {delivery.order.orderItems.length}</span>
                      <span>Value: ${delivery.order.totalAmount}</span>
                      <span>Fee: ${delivery.deliveryFee}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => acceptDelivery(delivery.id)}
                    className="ml-4 bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-700 dark:hover:bg-orange-800"
                  >
                    Accept Delivery
                  </Button>
                </div>
              </div>
            ))}

            {availableDeliveries.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No delivery requests available at the moment</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Deliveries */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">My Assigned Deliveries</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Track and update your delivery status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(delivery.status)}>
                        {delivery.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Order #{delivery.order.id.slice(-8)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Pickup</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{delivery.order.pharmacy.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{delivery.pickupAddress}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{delivery.order.pharmacy.phone}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Delivery</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{delivery.order.patient.user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{delivery.deliveryAddress}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{delivery.order.patient.user.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                      <span>Items: {delivery.order.orderItems.length}</span>
                      <span>Value: ${delivery.order.totalAmount}</span>
                      <span>Fee: ${delivery.deliveryFee}</span>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Medicines: {delivery.order.orderItems.map(item => 
                        `${item.medicine.name} (${item.quantity})`
                      ).join(', ')}
                    </div>
                  </div>
                  
                  <div className="ml-4 space-y-2">
                    {delivery.status === 'ASSIGNED' && (
                      <Button 
                        onClick={() => updateDeliveryStatus(delivery.id, 'PICKED_UP')}
                        size="sm"
                      >
                        Mark as Picked Up
                      </Button>
                    )}
                    {delivery.status === 'PICKED_UP' && (
                      <Button 
                        onClick={() => updateDeliveryStatus(delivery.id, 'IN_TRANSIT')}
                        size="sm"
                      >
                        Mark as In Transit
                      </Button>
                    )}
                    {delivery.status === 'IN_TRANSIT' && (
                      <Button 
                        onClick={() => updateDeliveryStatus(delivery.id, 'DELIVERED')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {myDeliveries.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No assigned deliveries</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}