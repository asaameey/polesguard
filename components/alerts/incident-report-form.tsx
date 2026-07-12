'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function IncidentReportForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    poleId: '',
    incidentType: 'unusual_activity',
    description: '',
    severity: 'medium',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to report incident')
      }

      setSuccess(true)
      setFormData({
        poleId: '',
        incidentType: 'unusual_activity',
        description: '',
        severity: 'medium',
      })
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
        <Label htmlFor="incidentType" className="text-sm font-medium text-foreground">
          Incident Type
        </Label>
        <select
          id="incidentType"
          value={formData.incidentType}
          onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="unusual_activity">Unusual Activity</option>
          <option value="pole_damage">Pole Damage</option>
          <option value="pole_collapsed">Pole Collapsed</option>
          <option value="pole_missing">Pole Missing</option>
          <option value="sensor_malfunction">Sensor Malfunction</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <Label htmlFor="severity" className="text-sm font-medium text-foreground">
          Severity
        </Label>
        <select
          id="severity"
          value={formData.severity}
          onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-medium text-foreground">
          Description
        </Label>
        <textarea
          id="description"
          placeholder="Describe the incident..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={4}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          Incident reported successfully!
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Reporting...' : 'Report Incident'}
      </Button>
    </form>
  )
}
