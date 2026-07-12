'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, Zap, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Alert {
  id: number
  defectId: number
  severity: 'low' | 'medium' | 'high'
  status: 'pending' | 'acknowledged' | 'resolved'
  createdAt: string
  acknowledgedAt: string | null
  defect?: {
    id: number
    deviceId: number
    poleId: number
    anomalyType: string
    currentValue: number | null
    detectedAt: string
    description: string | null
  }
}

export default function AlertsCenter() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'acknowledged' | 'resolved'>('all')

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/alerts')
        if (response.ok) {
          const data = await response.json()
          setAlerts(data)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const handleAcknowledge = async (alertId: number) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
      })
      if (response.ok) {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a))
      }
    } catch (error) {
      console.error('[v0] Failed to acknowledge alert:', error)
    }
  }

  const handleResolve = async (alertId: number) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'PATCH',
      })
      if (response.ok) {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a))
      }
    } catch (error) {
      console.error('[v0] Failed to resolve alert:', error)
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    return alert.status === filter
  })

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'low':
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      case 'low':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'acknowledged':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
          <p className="text-sm text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Real-time Alerts</h2>

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-2 border-b border-border">
        {(['all', 'pending', 'acknowledged', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <p className="mt-2 text-sm font-medium text-foreground">All systems normal</p>
          <p className="text-xs text-muted-foreground">No {filter !== 'all' ? filter : ''} alerts at this time</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border p-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {alert.defect?.anomalyType || 'Alert'}
                      </h3>
                      <span className="text-xs font-medium uppercase">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pole #{alert.defect?.poleId} • Device #{alert.defect?.deviceId}
                    </p>
                    {alert.defect?.currentValue !== null && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4" />
                        Current: {alert.defect.currentValue?.toFixed(2)}A
                      </p>
                    )}
                    {alert.defect?.description && (
                      <p className="mt-2 text-sm text-foreground">{alert.defect.description}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(alert.status)}
                    <span className="text-xs font-medium">{alert.status}</span>
                  </div>

                  {alert.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}

                  {(alert.status === 'pending' || alert.status === 'acknowledged') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(alert.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
