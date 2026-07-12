'use client'

import { useEffect, useState } from 'react'

interface ConnectedSensor {
  id: number
  deviceId: string
  deviceName: string
  poleId: number
  currentType: string
  signalStrength: number | null
  batteryLevel: number | null
  lastReadingAt: string | null
  status: 'connected' | 'disconnected' | 'warning'
}

export default function SensorConnectionDashboard() {
  const [sensors, setSensors] = useState<ConnectedSensor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await fetch('/api/devices')
        if (response.ok) {
          const data = await response.json()
          setSensors(data)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch sensors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSensors()
    const interval = setInterval(fetchSensors, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'disconnected':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"><span className="h-2 w-2 rounded-full bg-green-600"></span>Connected</span>
      case 'warning':
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"><span className="h-2 w-2 rounded-full bg-yellow-600"></span>Warning</span>
      case 'disconnected':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"><span className="h-2 w-2 rounded-full bg-red-600"></span>Offline</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
            <p className="text-sm text-muted-foreground">Loading sensors...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Connected Sensors</h2>

      {sensors.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">No sensors connected yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Register a new sensor to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sensors.map((sensor) => (
            <div
              key={sensor.id}
              className={`rounded-lg border p-4 ${getStatusColor(sensor.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{sensor.deviceName}</h3>
                    {getStatusBadge(sensor.status)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Device ID: {sensor.deviceId}</p>
                  <p className="text-xs text-muted-foreground">Pole #{sensor.poleId} • {sensor.currentType}</p>
                </div>
                <div className="ml-4 text-right">
                  {sensor.signalStrength !== null && (
                    <div className="text-xs text-muted-foreground">
                      <p>Signal: {sensor.signalStrength} dBm</p>
                    </div>
                  )}
                  {sensor.batteryLevel !== null && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      <p>Battery: {sensor.batteryLevel}%</p>
                    </div>
                  )}
                  {sensor.lastReadingAt && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      <p>Last: {new Date(sensor.lastReadingAt).toLocaleTimeString()}</p>
                    </div>
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
