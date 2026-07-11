'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'

interface NotificationPreferencesFormProps {
  userId: string
  existingSettings: {
    id: number
    userId: string
    emailNotifications: boolean
    smsNotifications: boolean
    inAppNotifications: boolean
    minSeverityLevel: string
    phoneNumber?: string | null
  } | null
}

export default function NotificationPreferencesForm({
  userId,
  existingSettings,
}: NotificationPreferencesFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    emailNotifications: existingSettings?.emailNotifications ?? true,
    smsNotifications: existingSettings?.smsNotifications ?? true,
    inAppNotifications: existingSettings?.inAppNotifications ?? true,
    minSeverityLevel: existingSettings?.minSeverityLevel ?? 'low',
    phoneNumber: existingSettings?.phoneNumber ?? '',
  })

  const handleChange = (field: string, value: any) => {
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
      const response = await fetch('/api/operator-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Email Notifications */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Email Notifications</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Receive alerts via email to {/* placeholder for email */}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('emailNotifications', !formData.emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.emailNotifications ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">SMS Notifications</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Receive urgent alerts via SMS (high and medium severity only)
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('smsNotifications', !formData.smsNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.smsNotifications ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {formData.smsNotifications && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Include country code for international numbers
              </p>
            </div>
          )}
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">In-App Notifications</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              See alerts in the monitoring dashboard
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleChange('inAppNotifications', !formData.inAppNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.inAppNotifications ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.inAppNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Alert Severity Filter */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 font-medium text-foreground">Minimum Alert Severity</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Only receive notifications for alerts with this severity or higher
        </p>
        <div className="space-y-3">
          {['low', 'medium', 'high'].map((level) => (
            <label key={level} className="flex items-center gap-3">
              <input
                type="radio"
                name="severity"
                value={level}
                checked={formData.minSeverityLevel === level}
                onChange={(e) => handleChange('minSeverityLevel', e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-sm text-foreground capitalize">{level} and higher</span>
            </label>
          ))}
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
          <p className="text-sm text-green-800">Preferences updated successfully!</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </form>
  )
}
