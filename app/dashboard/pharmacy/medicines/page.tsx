'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Package, 
  Edit, 
  Trash2, 
  AlertCircle 
} from 'lucide-react'

export default function MedicinesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'tablet',
    stock: ''
  })

  // Mock medicines data
  const [medicines, setMedicines] = useState([
    {
      id: '1',
      name: 'Paracetamol 500mg',
      description: 'Pain reliever and fever reducer',
      price: 5.99,
      unit: 'tablet',
      stock: 150,
      isActive: true
    },
    {
      id: '2',
      name: 'Amoxicillin 250mg',
      description: 'Antibiotic for bacterial infections',
      price: 12.50,
      unit: 'capsule',
      stock: 75,
      isActive: true
    },
    {
      id: '3',
      name: 'Cough Syrup',
      description: 'Relief from dry and wet cough',
      price: 8.75,
      unit: '100ml bottle',
      stock: 5,
      isActive: true
    }
  ])

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddMedicine = () => {
    if (!newMedicine.name || !newMedicine.price || !newMedicine.stock) {
      return
    }

    const medicine = {
      id: (medicines.length + 1).toString(),
      name: newMedicine.name,
      description: newMedicine.description,
      price: parseFloat(newMedicine.price),
      unit: newMedicine.unit,
      stock: parseInt(newMedicine.stock),
      isActive: true
    }

    setMedicines([...medicines, medicine])
    setNewMedicine({
      name: '',
      description: '',
      price: '',
      unit: 'tablet',
      stock: ''
    })
    setShowAddForm(false)
  }

  const getLowStockColor = (stock: number) => {
    if (stock <= 10) return 'text-red-600 bg-red-50'
    if (stock <= 25) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Medicine Catalog</h1>
          <p className="text-gray-600">
            Manage your medicine inventory and pricing
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Medicine Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Medicine</CardTitle>
            <CardDescription>Enter the details of the new medicine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Medicine Name</label>
                <Input
                  placeholder="e.g., Paracetamol 500mg"
                  value={newMedicine.name}
                  onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit Type</label>
                <select
                  title='unit'
                  className="w-full h-10 px-3 py-2 border border-input bg-transparent rounded-md text-sm"
                  value={newMedicine.unit}
                  onChange={(e) => setNewMedicine({ ...newMedicine, unit: e.target.value })}
                >
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="ml">ML</option>
                  <option value="mg">MG</option>
                  <option value="bottle">Bottle</option>
                  <option value="sachet">Sachet</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newMedicine.price}
                  onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Quantity</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newMedicine.stock}
                  onChange={(e) => setNewMedicine({ ...newMedicine, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Brief description of the medicine"
                value={newMedicine.description}
                onChange={(e) => setNewMedicine({ ...newMedicine, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddMedicine}>
                Add Medicine
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medicine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedicines.map((medicine) => (
          <Card key={medicine.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Package className="h-8 w-8 text-primary" />
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{medicine.name}</CardTitle>
              <CardDescription className="text-sm">
                {medicine.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price per {medicine.unit}</span>
                  <span className="text-lg font-bold text-primary">
                    ${medicine.price}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stock</span>
                  <div className="flex items-center space-x-2">
                    {medicine.stock <= 10 && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLowStockColor(medicine.stock)}`}>
                      {medicine.stock} {medicine.unit}s
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    medicine.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {medicine.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {medicine.stock <= 10 && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Low stock alert!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMedicines.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No medicines found' : 'No medicines yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start by adding medicines to your catalog'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Medicine
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}