'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { updateDeviceThresholds } from '@/app/actions/monitoring'

interface ThresholdConfigFormProps {
  deviceId: number
  currentType: string
  existingThresholds: {
    id: number
    deviceId: number
    currentType: string
    highCurrentThreshold: number
    lowCurrentThreshold: number
    normalBaseline?: number | null
    anomalyDurationMinutes: number
    rapidFluctuationPercent: number
    enabled: boolean
  } | null
}

export default function ThresholdConfigForm({
  deviceId,
  currentType,
  existingThresholds,
}: ThresholdConfigFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Set default values based on current type
  const defaultHighCurrent = currentType === 'AC' ? 60 : 25
  const defaultLowCurrent = currentType === 'AC' ? 5 : 2

  const [formData, setFormData] = useState({
    highCurrentThreshold: existingThresholds?.highCurrentThreshold || defaultHighCurrent,
    lowCurrentThreshold: existingThresholds?.lowCurrentThreshold || defaultLowCurrent,
    normalBaseline: existingThresholds?.normalBaseline || undefined,
    anomalyDurationMinutes: existingThresholds?.anomalyDurationMinutes || 5,
    rapidFluctuationPercent: existingThresholds?.rapidFluctuationPercent || 15,
  })

  const handleChange = (field: string, value: number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await updateDeviceThresholds(deviceId, formData)
      setSuccess(true)
      setTimeout(() => {
        router.push('/devices')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update thresholds')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Current Thresholds */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">Current Flow Thresholds</h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="high" className="block text-sm font-medium text-foreground">
              High Current Threshold (A)
            </label>
            <input
              id="high"
              type="number"
              step="0.1"
              value={formData.highCurrentThreshold}
              onChange={(e) => handleChange('highCurrentThreshold', parseFloat(e.target.value))}
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Alert will trigger when current exceeds this value
            </p>
          </div>

          <div>
            <label htmlFor="low" className="block text-sm font-medium text-foreground">
              Low Current Threshold (A)
            </label>
            <input
              id="low"
              type="number"
              step="0.1"
              value={formData.lowCurrentThreshold}
              onChange={(e) => handleChange('lowCurrentThreshold', parseFloat(e.target.value))}
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Alert will trigger when current drops below this value
            </p>
          </div>
        </div>
      </div>

      {/* Anomaly Detection Settings */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">Anomaly Detection</h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-foreground">
              Anomaly Duration (minutes)
            </label>
            <input
              id="duration"
              type="number"
              min="1"
              value={formData.anomalyDurationMinutes}
              onChange={(e) => handleChange('anomalyDurationMinutes', parseInt(e.target.value))}
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              How long an anomaly must persist before triggering an alert
            </p>
          </div>

          <div>
            <label htmlFor="fluctuation" className="block text-sm font-medium text-foreground">
              Rapid Fluctuation Threshold (%)
            </label>
            <input
              id="fluctuation"
              type="number"
              step="1"
              value={formData.rapidFluctuationPercent}
              onChange={(e) => handleChange('rapidFluctuationPercent', parseInt(e.target.value))}
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Percentage change between readings that indicates unstable power
            </p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="baseline" className="block text-sm font-medium text-foreground">
              Normal Baseline Current (A) - Optional
            </label>
            <input
              id="baseline"
              type="number"
              step="0.1"
              value={formData.normalBaseline || ''}
              onChange={(e) =>
                handleChange('normalBaseline', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              placeholder="Leave empty to calculate automatically"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Expected current during normal operation. Used for baseline deviation detection.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">Configuration updated successfully!</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
