'use client'

import { useEffect, useState, useCallback } from 'react'

// Hook for handling real-time sensor data updates
// This simulates polling for real-time updates (in production, use WebSocket)

export interface UseRealtimeUpdatesOptions {
  pollInterval?: number // milliseconds between polls
  enabled?: boolean
}

export function useRealtimeUpdates<T>(
  fetchFn: () => Promise<T>,
  options: UseRealtimeUpdatesOptions = {}
) {
  const { pollInterval = 5000, enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      console.error('[v0] Real-time update error:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    if (!enabled) return

    // Fetch immediately
    fetchData()

    // Set up polling interval
    const interval = setInterval(fetchData, pollInterval)

    return () => clearInterval(interval)
  }, [fetchData, enabled, pollInterval])

  return { data, loading, error, refetch: fetchData }
}

// Hook for subscribing to real-time alerts
export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [newAlertCount, setNewAlertCount] = useState(0)

  useEffect(() => {
    // Simulate polling for new alerts
    const pollAlerts = async () => {
      try {
        const response = await fetch('/api/alerts')
        if (response.ok) {
          const data = await response.json()
          const pendingAlerts = data.filter((a: any) => a.status === 'pending')
          setAlerts(pendingAlerts)
          setNewAlertCount(pendingAlerts.length)
        }
      } catch (error) {
        console.error('[v0] Failed to poll alerts:', error)
      }
    }

    pollAlerts()
    const interval = setInterval(pollAlerts, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [])

  return { alerts, newAlertCount }
}

// Hook for subscribing to sensor readings in real-time
export function useRealtimeSensorReadings(deviceId?: number) {
  const [readings, setReadings] = useState<any[]>([])
  const [latestReading, setLatestReading] = useState<any>(null)

  useEffect(() => {
    if (!deviceId) return

    const pollReadings = async () => {
      try {
        const response = await fetch(`/api/readings?deviceId=${deviceId}&limit=10`)
        if (response.ok) {
          const data = await response.json()
          setReadings(data)
          if (data.length > 0) {
            setLatestReading(data[0])
          }
        }
      } catch (error) {
        console.error('[v0] Failed to poll sensor readings:', error)
      }
    }

    pollReadings()
    const interval = setInterval(pollReadings, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [deviceId])

  return { readings, latestReading }
}

// Hook for monitoring device status
export function useRealtimeDeviceStatus(poleId?: number) {
  const [devices, setDevices] = useState<any[]>([])
  const [deviceStatus, setDeviceStatus] = useState<Record<number, string>>({})

  useEffect(() => {
    if (!poleId) return

    const pollDevices = async () => {
      try {
        const response = await fetch(`/api/devices?poleId=${poleId}`)
        if (response.ok) {
          const data = await response.json()
          setDevices(data)
          const statusMap: Record<number, string> = {}
          data.forEach((device: any) => {
            // Determine status based on last reading time
            if (!device.lastReadingAt) {
              statusMap[device.id] = 'offline'
            } else {
              const minutesSinceLastReading =
                (Date.now() - new Date(device.lastReadingAt).getTime()) / 60000
              if (minutesSinceLastReading > 5) {
                statusMap[device.id] = 'offline'
              } else if (device.signalStrength && device.signalStrength < -110) {
                statusMap[device.id] = 'warning'
              } else if (device.batteryLevel && device.batteryLevel < 20) {
                statusMap[device.id] = 'warning'
              } else {
                statusMap[device.id] = 'connected'
              }
            }
          })
          setDeviceStatus(statusMap)
        }
      } catch (error) {
        console.error('[v0] Failed to poll device status:', error)
      }
    }

    pollDevices()
    const interval = setInterval(pollDevices, 15000) // Poll every 15 seconds

    return () => clearInterval(interval)
  }, [poleId])

  return { devices, deviceStatus }
}
