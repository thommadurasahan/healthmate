'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  TestTube, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface LabTest {
  id: string
  name: string
  category: string
  description: string
  price: number
  duration: string
  requirements: string
  preparationInstructions: string
  sampleType: string
  normalRange?: string
  isActive: boolean
  methodology: string
  turnaroundTime: number // in hours
  fasting: boolean
  homeCollection: boolean
}

export default function LabTestsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [tests, setTests] = useState<LabTest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTest, setEditingTest] = useState<LabTest | null>(null)
  const [newTest, setNewTest] = useState<Partial<LabTest>>({
    name: '',
    category: '',
    description: '',
    price: 0,
    duration: '',
    requirements: '',
    preparationInstructions: '',
    sampleType: 'blood',
    methodology: '',
    turnaroundTime: 24,
    fasting: false,
    homeCollection: false,
    isActive: true
  })

  const categories = [
    'Blood Tests',
    'Urine Tests',
    'Radiology',
    'Cardiology',
    'Pathology',
    'Microbiology',
    'Biochemistry',
    'Hematology',
    'Immunology',
    'Genetic Tests'
  ]

  const sampleTypes = ['blood', 'urine', 'stool', 'saliva', 'tissue', 'swab', 'other']

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setTests([
      {
        id: '1',
        name: 'Complete Blood Count (CBC)',
        category: 'Blood Tests',
        description: 'Comprehensive blood analysis including RBC, WBC, platelets, and hemoglobin',
        price: 25.00,
        duration: '2-4 hours',
        requirements: 'No special preparation required',
        preparationInstructions: 'No fasting required. Stay hydrated.',
        sampleType: 'blood',
        normalRange: 'Age and gender specific',
        isActive: true,
        methodology: 'Automated Cell Counter',
        turnaroundTime: 4,
        fasting: false,
        homeCollection: true
      },
      {
        id: '2',
        name: 'Lipid Profile',
        category: 'Blood Tests',
        description: 'Cholesterol and triglyceride levels assessment',
        price: 35.00,
        duration: '4-6 hours',
        requirements: '12-hour fasting required',
        preparationInstructions: 'Fast for 12 hours before test. Water is allowed.',
        sampleType: 'blood',
        normalRange: 'Total Cholesterol: <200 mg/dL',
        isActive: true,
        methodology: 'Enzymatic Method',
        turnaroundTime: 6,
        fasting: true,
        homeCollection: true
      },
      {
        id: '3',
        name: 'Chest X-Ray',
        category: 'Radiology',
        description: 'X-ray imaging of chest to examine lungs, heart, and bones',
        price: 45.00,
        duration: '15-30 minutes',
        requirements: 'Remove metal objects and jewelry',
        preparationInstructions: 'Wear comfortable clothing without metal fasteners.',
        sampleType: 'other',
        isActive: true,
        methodology: 'Digital Radiography',
        turnaroundTime: 2,
        fasting: false,
        homeCollection: false
      },
      {
        id: '4',
        name: 'Urinalysis',
        category: 'Urine Tests',
        description: 'Complete urine examination for infection, diabetes, kidney disease',
        price: 20.00,
        duration: '1-2 hours',
        requirements: 'Clean catch midstream urine',
        preparationInstructions: 'Collect first morning urine sample if possible.',
        sampleType: 'urine',
        normalRange: 'Protein: Negative, Glucose: Negative',
        isActive: true,
        methodology: 'Microscopic Examination',
        turnaroundTime: 2,
        fasting: false,
        homeCollection: true
      },
      {
        id: '5',
        name: 'Thyroid Function Test (TFT)',
        category: 'Blood Tests',
        description: 'TSH, T3, T4 levels to assess thyroid function',
        price: 55.00,
        duration: '4-6 hours',
        requirements: 'No special preparation required',
        preparationInstructions: 'Take medications as usual unless advised otherwise.',
        sampleType: 'blood',
        normalRange: 'TSH: 0.4-4.0 mIU/L',
        isActive: true,
        methodology: 'Electrochemiluminescence',
        turnaroundTime: 8,
        fasting: false,
        homeCollection: true
      }
    ])
    setLoading(false)
  }, [])

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || test.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const handleAddTest = () => {
    if (!newTest.name || !newTest.category || !newTest.price) {
      return
    }

    const test: LabTest = {
      id: (tests.length + 1).toString(),
      name: newTest.name!,
      category: newTest.category!,
      description: newTest.description || '',
      price: newTest.price!,
      duration: newTest.duration || '2-4 hours',
      requirements: newTest.requirements || 'No special preparation required',
      preparationInstructions: newTest.preparationInstructions || 'Follow standard preparation guidelines',
      sampleType: newTest.sampleType || 'blood',
      normalRange: newTest.normalRange,
      isActive: newTest.isActive ?? true,
      methodology: newTest.methodology || 'Standard Laboratory Method',
      turnaroundTime: newTest.turnaroundTime || 24,
      fasting: newTest.fasting || false,
      homeCollection: newTest.homeCollection || false
    }

    setTests([...tests, test])
    setNewTest({
      name: '',
      category: '',
      description: '',
      price: 0,
      duration: '',
      requirements: '',
      preparationInstructions: '',
      sampleType: 'blood',
      methodology: '',
      turnaroundTime: 24,
      fasting: false,
      homeCollection: false,
      isActive: true
    })
    setShowAddForm(false)
  }

  const handleToggleStatus = (id: string) => {
    setTests(tests.map(test => 
      test.id === id ? { ...test, isActive: !test.isActive } : test
    ))
  }

  const activeTests = tests.filter(test => test.isActive).length
  const totalRevenue = tests.reduce((sum, test) => sum + test.price, 0)
  const avgTurnaround = tests.reduce((sum, test) => sum + test.turnaroundTime, 0) / tests.length

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
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Lab Tests Management</h1>
        <p className="text-cyan-100">
          Manage your laboratory test catalog, pricing, and test procedures
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tests.length}</div>
            <p className="text-xs text-muted-foreground">{activeTests} active tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(tests.map(t => t.category)).size}</div>
            <p className="text-xs text-muted-foreground">Test categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / tests.length).toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Per test average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Turnaround</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTurnaround.toFixed(0)}h</div>
            <p className="text-xs text-muted-foreground">Average processing time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <label htmlFor="category-filter" className="sr-only">Filter tests by category</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 py-2 border border-input bg-transparent rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Test
        </Button>
      </div>

      {/* Add Test Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Lab Test</CardTitle>
            <CardDescription>Enter the details of the new laboratory test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Test Name *</label>
                <Input
                  placeholder="e.g., Complete Blood Count"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="test-category" className="text-sm font-medium">Category *</label>
                <select
                  id="test-category"
                  className="w-full h-10 px-3 py-2 border border-input bg-transparent rounded-md text-sm"
                  value={newTest.category}
                  onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price ($) *</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newTest.price}
                  onChange={(e) => setNewTest({ ...newTest, price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Turnaround Time (hours)</label>
                <Input
                  type="number"
                  placeholder="24"
                  value={newTest.turnaroundTime}
                  onChange={(e) => setNewTest({ ...newTest, turnaroundTime: parseInt(e.target.value) || 24 })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sample-type" className="text-sm font-medium">Sample Type</label>
                <select
                  id="sample-type"
                  className="w-full h-10 px-3 py-2 border border-input bg-transparent rounded-md text-sm"
                  value={newTest.sampleType}
                  onChange={(e) => setNewTest({ ...newTest, sampleType: e.target.value })}
                >
                  {sampleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Methodology</label>
                <Input
                  placeholder="e.g., Automated Cell Counter"
                  value={newTest.methodology}
                  onChange={(e) => setNewTest({ ...newTest, methodology: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Brief description of the test"
                value={newTest.description}
                onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preparation Instructions</label>
              <Input
                placeholder="Patient preparation guidelines"
                value={newTest.preparationInstructions}
                onChange={(e) => setNewTest({ ...newTest, preparationInstructions: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Normal Range</label>
              <Input
                placeholder="e.g., 4.5-11.0 × 10³/μL"
                value={newTest.normalRange}
                onChange={(e) => setNewTest({ ...newTest, normalRange: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTest.fasting || false}
                  onChange={(e) => setNewTest({ ...newTest, fasting: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm">Fasting Required</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTest.homeCollection || false}
                  onChange={(e) => setNewTest({ ...newTest, homeCollection: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm">Home Collection Available</span>
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddTest}>
                Add Test
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <TestTube className="h-8 w-8 text-primary" />
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleToggleStatus(test.id)}
                    className={test.isActive ? "text-red-500 hover:text-red-700" : "text-green-500 hover:text-green-700"}
                  >
                    {test.isActive ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{test.name}</CardTitle>
              <CardDescription className="text-sm">
                {test.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Category</span>
                  <Badge variant="outline">{test.category}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price</span>
                  <span className="text-lg font-bold text-primary">
                    ${test.price.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Turnaround</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {test.turnaroundTime}h
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sample</span>
                  <span className="text-sm font-medium capitalize">
                    {test.sampleType}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {test.fasting && (
                    <Badge variant="secondary" className="text-xs">Fasting</Badge>
                  )}
                  {test.homeCollection && (
                    <Badge variant="secondary" className="text-xs">Home Collection</Badge>
                  )}
                  <Badge variant={test.isActive ? "default" : "destructive"} className="text-xs">
                    {test.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {test.normalRange && (
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    <strong>Normal Range:</strong> {test.normalRange}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || categoryFilter !== 'all' ? 'No tests found' : 'No tests yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search terms or filters'
                : 'Start by adding lab tests to your catalog'
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Test
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}