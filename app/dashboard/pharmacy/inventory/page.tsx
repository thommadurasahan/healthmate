'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Package2, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
  ShoppingCart,
  Calendar,
  Truck
} from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  currentStock: number
  reorderLevel: number
  maxStock: number
  unit: string
  supplier: string
  lastRestocked: string
  avgDailyUsage: number
  daysToStockout: number
  category: string
  batchNumber?: string
  expiryDate?: string
}

export default function PharmacyInventoryPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setInventory([
      {
        id: '1',
        name: 'Paracetamol 500mg',
        currentStock: 45,
        reorderLevel: 50,
        maxStock: 200,
        unit: 'tablets',
        supplier: 'MediCorp Ltd',
        lastRestocked: '2024-01-15',
        avgDailyUsage: 8,
        daysToStockout: 6,
        category: 'Pain Relief',
        batchNumber: 'PC500-240115',
        expiryDate: '2025-12-31'
      },
      {
        id: '2',
        name: 'Amoxicillin 250mg',
        currentStock: 15,
        reorderLevel: 25,
        maxStock: 100,
        unit: 'capsules',
        supplier: 'PharmaTech Solutions',
        lastRestocked: '2024-01-10',
        avgDailyUsage: 3,
        daysToStockout: 5,
        category: 'Antibiotics',
        batchNumber: 'AMX250-240110',
        expiryDate: '2025-08-15'
      },
      {
        id: '3',
        name: 'Cough Syrup 100ml',
        currentStock: 120,
        reorderLevel: 30,
        maxStock: 150,
        unit: 'bottles',
        supplier: 'HealthPlus Distributors',
        lastRestocked: '2024-01-18',
        avgDailyUsage: 2,
        daysToStockout: 60,
        category: 'Cold & Flu',
        batchNumber: 'CS100-240118',
        expiryDate: '2024-12-31'
      },
      {
        id: '4',
        name: 'Insulin Pens',
        currentStock: 8,
        reorderLevel: 15,
        maxStock: 50,
        unit: 'pens',
        supplier: 'DiabeteCare Inc',
        lastRestocked: '2024-01-12',
        avgDailyUsage: 1,
        daysToStockout: 8,
        category: 'Diabetes',
        batchNumber: 'INS-240112',
        expiryDate: '2024-11-30'
      }
    ])
    setLoading(false)
  }, [])

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= item.reorderLevel) return 'critical'
    if (item.currentStock <= item.reorderLevel * 1.5) return 'low'
    if (item.currentStock >= item.maxStock * 0.9) return 'high'
    return 'normal'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />
      case 'low':
        return <TrendingDown className="h-4 w-4" />
      case 'high':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Package2 className="h-4 w-4" />
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    return matchesSearch && getStockStatus(item) === filter
  })

  const criticalItems = inventory.filter(item => getStockStatus(item) === 'critical')
  const lowStockItems = inventory.filter(item => getStockStatus(item) === 'low')
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * 10), 0) // Assuming avg price $10

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Inventory Management</h1>
        <p className="text-purple-100">
          Monitor stock levels, manage reorders, and track inventory value
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalItems.length}</div>
            <p className="text-xs text-muted-foreground">Need immediate reorder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Below reorder level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current stock value</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Stock Alerts
            </CardTitle>
            <CardDescription className="text-red-700">
              These items are at or below reorder level and need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalItems.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-900">{item.name}</p>
                    <p className="text-sm text-red-700">
                      Only {item.currentStock} {item.unit} left • {item.daysToStockout} days to stockout
                    </p>
                  </div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Reorder Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search items, categories, suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <label htmlFor="inventory-filter" className="sr-only">Filter inventory by stock status</label>
            <select
              id="inventory-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 px-3 py-2 border border-input bg-transparent rounded-md text-sm"
            >
              <option value="all">All Items</option>
              <option value="critical">Critical Stock</option>
              <option value="low">Low Stock</option>
              <option value="normal">Normal Stock</option>
              <option value="high">High Stock</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Bulk Reorder
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Details</CardTitle>
          <CardDescription>
            Detailed view of all inventory items with stock levels and reorder information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Item</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Current Stock</th>
                  <th className="text-left py-3 px-4 font-medium">Reorder Level</th>
                  <th className="text-left py-3 px-4 font-medium">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium">Days to Stockout</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item)
                  const isExpiringSoon = item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                  
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Batch: {item.batchNumber}
                          </p>
                          {isExpiringSoon && (
                            <p className="text-xs text-orange-600 font-medium">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Expires: {item.expiryDate}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{item.category}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-right">
                          <p className="font-medium">{item.currentStock}</p>
                          <p className="text-sm text-gray-500">{item.unit}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-right">
                          <p className="font-medium">{item.reorderLevel}</p>
                          <p className="text-sm text-gray-500">{item.unit}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{item.supplier}</p>
                          <p className="text-sm text-gray-500">
                            <Truck className="h-3 w-3 inline mr-1" />
                            Last: {new Date(item.lastRestocked).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-center">
                          <p className={`font-medium ${item.daysToStockout <= 7 ? 'text-red-600' : item.daysToStockout <= 14 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {item.daysToStockout}
                          </p>
                          <p className="text-xs text-gray-500">days</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(status)}
                          {status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <ShoppingCart className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No inventory items found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}