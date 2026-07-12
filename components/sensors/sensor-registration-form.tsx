'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SensorRegistrationForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    deviceId: '',
    deviceName: '',
    poleId: '',
    currentType: 'AC',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to register sensor')
      }

      setSuccess(true)
      setFormData({ deviceId: '', deviceName: '', poleId: '', currentType: 'AC' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="deviceId" className="text-sm font-medium text-foreground">
          Device ID
        </Label>
        <Input
          id="deviceId"
          placeholder="LORA_DEVICE_001"
          value={formData.deviceId}
          onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="deviceName" className="text-sm font-medium text-foreground">
          Sensor Name
        </Label>
        <Input
          id="deviceName"
          placeholder="Main Street Pole #1"
          value={formData.deviceName}
          onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="poleId" className="text-sm font-medium text-foreground">
          Pole ID
        </Label>
        <Input
          id="poleId"
          type="number"
          placeholder="1"
          value={formData.poleId}
          onChange={(e) => setFormData({ ...formData, poleId: e.target.value })}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="currentType" className="text-sm font-medium text-foreground">
          Current Type
        </Label>
        <select
          id="currentType"
          value={formData.currentType}
          onChange={(e) => setFormData({ ...formData, currentType: e.target.value })}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="AC">AC Current</option>
          <option value="DC">DC Current</option>
          <option value="Both">AC/DC</option>
        </select>
      </div>

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          Sensor registered successfully!
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Registering...' : 'Register Sensor'}
      </Button>
    </form>
  )
}
