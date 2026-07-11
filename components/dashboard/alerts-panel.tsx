'use client'

import { useState } from 'react'
import { Bell, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { acknowledgeAlert } from '@/app/actions/monitoring'
import { useRouter } from 'next/navigation'

interface Alert {
  alert: {
    id: number
    status: string
    severity: string
    createdAt: Date
    updatedAt: Date
    acknowledgedBy?: string | null
    acknowledgedAt?: Date | null
    emailSent: boolean
    smsSent: boolean
    escalatedAt?: Date | null
  }
  defect: {
    id: number
    anomalyType: string
    description?: string | null
    currentValue?: number | null
  }
  device: {
    id: number
    deviceName: string
    deviceId: string
  }
  pole: {
    id: number
    name: string
    location: string
  }
}

interface AlertsPanelProps {
  alerts: Alert[]
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const [isAcknowledging, setIsAcknowledging] = useState<number | null>(null)
  const router = useRouter()

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-amber-600" />
      case 'low':
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200'
      case 'medium':
        return 'bg-amber-50 border-amber-200'
      case 'low':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const handleAcknowledge = async (alertId: number, userId: string) => {
    setIsAcknowledging(alertId)
    try {
      await acknowledgeAlert(alertId, userId)
      router.refresh()
    } catch (error) {
      console.error('[v0] Failed to acknowledge alert:', error)
    } finally {
      setIsAcknowledging(null)
    }
  }

  const getAnomalyLabel = (anomalyType: string) => {
    return anomalyType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <Bell className="h-5 w-5 text-primary" />
        Active Alerts
      </h3>

      {alerts.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-green-300 bg-green-50 p-4 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
          <p className="mt-2 text-sm font-medium text-green-900">All systems normal</p>
          <p className="text-xs text-green-700">No active alerts</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {alerts.map((item) => (
            <div
              key={item.alert.id}
              className={`rounded-lg border p-3 ${getSeverityColor(item.alert.severity)}`}
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(item.alert.severity)}
                <div className="flex-1 text-sm">
                  <p className="font-medium text-foreground">{item.pole.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {getAnomalyLabel(item.defect.anomalyType)}
                  </p>
                  {item.defect.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{item.defect.description}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.alert.createdAt).toLocaleTimeString()}
                    </span>
                    {item.alert.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleAcknowledge(item.alert.id, 'current-user-id')}
                        disabled={isAcknowledging === item.alert.id}
                      >
                        {isAcknowledging === item.alert.id ? 'Acknowledging...' : 'Acknowledge'}
                      </Button>
                    )}
                    {item.alert.status === 'acknowledged' && (
                      <span className="text-xs font-medium text-green-700">Acknowledged</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {alerts.length > 0 && (
        <Button variant="outline" size="sm" className="mt-4 w-full text-xs">
          View All Alerts
        </Button>
      )}
    </div>
  )
}
