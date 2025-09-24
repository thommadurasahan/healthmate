'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthHeader } from '@/components/auth-header'
import { AuthFooter } from '@/components/auth-footer'
import { Heart, Eye, EyeOff } from 'lucide-react'

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT',
    // Pharmacy fields
    pharmacyName: '',
    address: '',
    phone: '',
    license: '',
    // Laboratory fields
    laboratoryName: '',
    labLicense: '',
    // Doctor fields
    specialization: '',
    qualifications: '',
    experience: '',
    consultationFee: '',
    doctorLicense: '',
    // Delivery Partner fields
    vehicleType: '',
    licenseNumber: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')

  // Initialize role based on URL parameter
  React.useEffect(() => {
    if (roleParam && ['PATIENT', 'PHARMACY', 'LABORATORY', 'DOCTOR', 'DELIVERY_PARTNER', 'ADMIN'].includes(roleParam)) {
      setFormData(prev => ({ ...prev, role: roleParam }))
    }
  }, [roleParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/auth/signin?message=Registration successful')
      } else {
        const data = await response.json()
        setError(data.error || 'Something went wrong')
      }
    } catch (error) {
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const isPharmacy = formData.role === 'PHARMACY'
  const requiresAdditionalInfo = ['PHARMACY', 'LABORATORY', 'DOCTOR', 'DELIVERY_PARTNER', 'ADMIN'].includes(formData.role)

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'PATIENT':
        return 'patient'
      case 'PHARMACY':
        return 'pharmacy'
      case 'LABORATORY':
        return 'laboratory'
      case 'DOCTOR':
        return 'doctor'
      case 'DELIVERY_PARTNER':
        return 'delivery partner'
      case 'ADMIN':
        return 'admin'
      default:
        return role.toLowerCase()
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 px-4 py-8">
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-primary fill-current" />
          </div>
          <CardTitle className="text-2xl">Join HealthMate</CardTitle>
          <CardDescription>
            Create your account as a {getRoleDisplayName(formData.role)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Type</label>
              <select
                title='role'
                className="w-full h-10 px-3 py-2 border border-input bg-background text-foreground rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>option]:bg-background [&>option]:text-foreground"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="PATIENT">Patient</option>
                <option value="PHARMACY">Pharmacy</option>
                <option value="LABORATORY">Laboratory</option>
                <option value="DOCTOR">Doctor</option>
                <option value="DELIVERY_PARTNER">Delivery Partner</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Basic Information */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {isPharmacy ? 'Contact Person Name' : 'Full Name'}
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {/* Pharmacy-specific fields */}
            {isPharmacy && (
              <>
                <div className="space-y-2">
                  <label htmlFor="pharmacyName" className="text-sm font-medium">
                    Pharmacy Name
                  </label>
                  <Input
                    id="pharmacyName"
                    type="text"
                    placeholder="Enter pharmacy name"
                    value={formData.pharmacyName}
                    onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Address
                  </label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter pharmacy address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="license" className="text-sm font-medium">
                      License No.
                    </label>
                    <Input
                      id="license"
                      type="text"
                      placeholder="License number"
                      value={formData.license}
                      onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Delivery Partner fields */}
            {formData.role === 'DELIVERY_PARTNER' && (
              <>
                <div className="space-y-2">
                  <label htmlFor="vehicleType" className="text-sm font-medium">
                    Vehicle Type
                  </label>
                  <select
                    id="vehicleType"
                    className="w-full h-10 px-3 py-2 border border-input bg-background text-foreground rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>option]:bg-background [&>option]:text-foreground"
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    required
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="CAR">Car</option>
                    <option value="VAN">Van</option>
                    <option value="BICYCLE">Bicycle</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="licenseNumber" className="text-sm font-medium">
                      License Number
                    </label>
                    <Input
                      id="licenseNumber"
                      type="text"
                      placeholder="Driving license number"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Address
                  </label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Your address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {/* Laboratory fields */}
            {formData.role === 'LABORATORY' && (
              <>
                <div className="space-y-2">
                  <label htmlFor="laboratoryName" className="text-sm font-medium">
                    Laboratory Name
                  </label>
                  <Input
                    id="laboratoryName"
                    type="text"
                    placeholder="Enter laboratory name"
                    value={formData.laboratoryName}
                    onChange={(e) => setFormData({ ...formData, laboratoryName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Address
                  </label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Laboratory address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="labLicense" className="text-sm font-medium">
                      License No.
                    </label>
                    <Input
                      id="labLicense"
                      type="text"
                      placeholder="Lab license number"
                      value={formData.labLicense}
                      onChange={(e) => setFormData({ ...formData, labLicense: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Doctor fields */}
            {formData.role === 'DOCTOR' && (
              <>
                <div className="space-y-2">
                  <label htmlFor="specialization" className="text-sm font-medium">
                    Specialization
                  </label>
                  <Input
                    id="specialization"
                    type="text"
                    placeholder="e.g., Cardiology, Dermatology"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="qualifications" className="text-sm font-medium">
                    Qualifications
                  </label>
                  <Input
                    id="qualifications"
                    type="text"
                    placeholder="e.g., MBBS, MD"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="experience" className="text-sm font-medium">
                      Experience (Years)
                    </label>
                    <Input
                      id="experience"
                      type="number"
                      placeholder="Years of experience"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      required
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="consultationFee" className="text-sm font-medium">
                      Consultation Fee ($)
                    </label>
                    <Input
                      id="consultationFee"
                      type="number"
                      placeholder="Fee per consultation"
                      value={formData.consultationFee}
                      onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="doctorLicense" className="text-sm font-medium">
                      Medical License
                    </label>
                    <Input
                      id="doctorLicense"
                      type="text"
                      placeholder="Medical license number"
                      value={formData.doctorLicense}
                      onChange={(e) => setFormData({ ...formData, doctorLicense: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password fields */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
      <AuthFooter />
    </div>
  )
}