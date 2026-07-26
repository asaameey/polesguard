'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPole } from '@/app/actions/iot'
import { Button } from '@/components/ui/button'

export default function AddPoleForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    poleId: '',
    latitude: '',
    longitude: '',
    location: '',
  })
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // Validate required fields
      if (!formData.poleId.trim()) {
        throw new Error('Pole ID is required')
      }
      if (!formData.latitude.trim()) {
        throw new Error('Latitude is required')
      }
      if (!formData.longitude.trim()) {
        throw new Error('Longitude is required')
      }
      
      const latitude = parseFloat(formData.latitude)
      const longitude = parseFloat(formData.longitude)
      
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Latitude and Longitude must be valid numbers')
      }
      
      if (latitude < -90 || latitude > 90) {
        throw new Error('Latitude must be between -90 and 90')
      }
      
      if (longitude < -180 || longitude > 180) {
        throw new Error('Longitude must be between -180 and 180')
      }
      
      await createPole({
        poleId: formData.poleId.trim(),
        latitude,
        longitude,
        location: formData.location.trim() || undefined,
      })
      
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pole')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Pole ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="poleId"
          value={formData.poleId}
          onChange={handleChange}
          placeholder="e.g., POLE-001, P-123"
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Unique identifier for this pole
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Latitude <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="latitude"
            step="0.000001"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="e.g., 40.7128"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Longitude <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="longitude"
            step="0.000001"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="e.g., -74.0060"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Location Name (Optional)
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., Downtown Grid A, Network 5"
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Human-readable location description
        </p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Next Steps:</strong> After creating the pole, you&apos;ll need to configure the AWS IoT device and install sensors on the pole to start receiving telemetry data.
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Creating...' : 'Create Pole'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
