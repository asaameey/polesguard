'use client'

import { resolveAlert } from '@/app/actions/iot'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface AlertPanelProps {
  alerts: any[]
}

export default function AlertPanel({ alerts: initialAlerts }: AlertPanelProps) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [loading, setLoading] = useState<number | null>(null)
  
  const handleResolveAlert = async (alertId: number) => {
    setLoading(alertId)
    try {
      await resolveAlert(alertId)
      setAlerts(alerts.filter(a => a.id !== alertId))
    } catch (error) {
      console.error('[v0] Error resolving alert:', error)
    } finally {
      setLoading(null)
    }
  }
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-4 border-l-red-600 bg-red-50'
      case 'high': return 'border-l-4 border-l-orange-500 bg-orange-50'
      case 'medium': return 'border-l-4 border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-4 border-l-blue-500 bg-blue-50'
      default: return 'border-l-4 border-l-gray-500 bg-gray-50'
    }
  }
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '⚡'
      case 'low': return 'ℹ️'
      default: return '•'
    }
  }
  
  return (
    <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
      <h2 className="text-2xl font-bold text-foreground mb-4">Active Alerts</h2>
      
      {alerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">✓</div>
          <p>All poles operating normally</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg ${getSeverityColor(alert.severity)}`}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2 mb-1 text-foreground">
                    <span>{getSeverityIcon(alert.severity)}</span>
                    {alert.alertType.replace('_', ' ').toUpperCase()}
                  </div>
                  <p className="text-sm text-foreground mb-2">{alert.message}</p>
                  <div className="text-xs text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResolveAlert(alert.id)}
                  disabled={loading === alert.id}
                  className="whitespace-nowrap"
                >
                  {loading === alert.id ? 'Resolving...' : 'Resolve'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
