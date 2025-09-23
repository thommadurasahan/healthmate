'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Save,
  AlertCircle
} from 'lucide-react'

interface Availability {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

export default function DoctorAvailabilityPage() {
  const { data: session } = useSession()
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAvailabilities()
  }, [])

  const fetchAvailabilities = async () => {
    try {
      const response = await fetch('/api/doctors/availability')
      if (response.ok) {
        const data = await response.json()
        setAvailabilities(data)
      } else {
        // Initialize with default availabilities
        setAvailabilities(DAYS_OF_WEEK.map((_, index) => ({
          dayOfWeek: index,
          startTime: '09:00',
          endTime: '17:00',
          isActive: index >= 1 && index <= 5 // Monday to Friday
        })))
      }
    } catch (error) {
      console.error('Error fetching availabilities:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveAvailabilities = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/doctors/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilities })
      })

      if (response.ok) {
        alert('Availability updated successfully!')
      }
    } catch (error) {
      console.error('Error saving availabilities:', error)
      alert('Failed to save availability')
    } finally {
      setSaving(false)
    }
  }

  const updateAvailability = (dayOfWeek: number, field: string, value: any) => {
    setAvailabilities(prev => prev.map(availability => 
      availability.dayOfWeek === dayOfWeek
        ? { ...availability, [field]: value }
        : availability
    ))
  }

  const getActiveSlots = () => {
    return availabilities.filter(availability => availability.isActive)
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Manage Availability</h1>
        <p className="text-blue-100">
          Set your available time slots for patient appointments
        </p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability Summary
          </CardTitle>
          <CardDescription>
            You have {getActiveSlots().length} active time slots configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getActiveSlots().map((availability) => (
              <div key={availability.dayOfWeek} className="bg-green-50 p-3 rounded-lg">
                <p className="font-medium text-green-800">
                  {DAYS_OF_WEEK[availability.dayOfWeek]}
                </p>
                <p className="text-sm text-green-600">
                  {availability.startTime} - {availability.endTime}
                </p>
              </div>
            ))}
          </div>
          {getActiveSlots().length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No active time slots configured</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability Configuration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Configure Weekly Schedule</CardTitle>
            <CardDescription>
              Set your available hours for each day of the week
            </CardDescription>
          </div>
          <Button onClick={saveAvailabilities} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day, index) => {
              const availability = availabilities.find(a => a.dayOfWeek === index)
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-3 cursor-pointer" htmlFor={`availability-${index}`}>
                      <input
                        id={`availability-${index}`}
                        type="checkbox"
                        checked={availability?.isActive || false}
                        onChange={(e) => updateAvailability(index, 'isActive', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded"
                        aria-label={`Toggle availability for ${day}`}
                      />
                      <h3 className="text-lg font-medium">{day}</h3>
                    </label>
                    <Badge variant={availability?.isActive ? "default" : "secondary"}>
                      {availability?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {availability?.isActive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Start Time
                        </label>
                        <Input
                          type="time"
                          value={availability.startTime}
                          onChange={(e) => updateAvailability(index, 'startTime', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          End Time
                        </label>
                        <Input
                          type="time"
                          value={availability.endTime}
                          onChange={(e) => updateAvailability(index, 'endTime', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {!availability?.isActive && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Not available on {day}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Tips */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Tips for setting availability:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Patients can book appointments during your active time slots</li>
              <li>• Consider buffer time between appointments for notes and preparation</li>
              <li>• You can modify your availability anytime, but it may affect existing bookings</li>
              <li>• Inactive days will not show up in patient booking calendars</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}