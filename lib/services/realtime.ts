// Real-time event emitter for broadcasting sensor data updates
// This service handles broadcasting of current readings, alerts, and pole status changes

type EventListener = (...args: any[]) => void

class RealtimeService {
  private listeners: Map<string, EventListener[]> = new Map()

  // Subscribe to an event
  on(event: string, listener: EventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event)
      if (eventListeners) {
        const index = eventListeners.indexOf(listener)
        if (index > -1) {
          eventListeners.splice(index, 1)
        }
      }
    }
  }

  // Emit an event to all listeners
  emit(event: string, ...args: any[]) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(...args)
        } catch (error) {
          console.error(`[v0] Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  // Remove all listeners for an event
  off(event: string) {
    this.listeners.delete(event)
  }

  // Clear all listeners
  clear() {
    this.listeners.clear()
  }
}

// Singleton instance
export const realtime = new RealtimeService()

// Event types for broadcasting
export interface CurrentReadingEvent {
  deviceId: number
  poleId: number
  currentValue: number
  timestamp: Date
  anomalyDetected: boolean
  anomalyType?: string
}

export interface AlertEvent {
  id: number
  severity: 'low' | 'medium' | 'high'
  poleId: number
  deviceId: number
  message: string
  timestamp: Date
}

export interface PoleStatusChangeEvent {
  poleId: number
  newStatus: string
  oldStatus: string
  timestamp: Date
}

export interface DeviceStatusEvent {
  deviceId: number
  poleId: number
  signalStrength: number | null
  batteryLevel: number | null
  lastReadingAt: Date
  status: 'connected' | 'disconnected' | 'warning'
}

// Convenience methods for emitting specific events
export const broadcastCurrentReading = (data: CurrentReadingEvent) => {
  realtime.emit('current-reading', data)
}

export const broadcastAlert = (data: AlertEvent) => {
  realtime.emit('alert', data)
}

export const broadcastPoleStatusChange = (data: PoleStatusChangeEvent) => {
  realtime.emit('pole-status-changed', data)
}

export const broadcastDeviceStatus = (data: DeviceStatusEvent) => {
  realtime.emit('device-status', data)
}

// Subscribe convenience methods
export const onCurrentReading = (listener: (data: CurrentReadingEvent) => void) => {
  return realtime.on('current-reading', listener)
}

export const onAlert = (listener: (data: AlertEvent) => void) => {
  return realtime.on('alert', listener)
}

export const onPoleStatusChange = (listener: (data: PoleStatusChangeEvent) => void) => {
  return realtime.on('pole-status-changed', listener)
}

export const onDeviceStatus = (listener: (data: DeviceStatusEvent) => void) => {
  return realtime.on('device-status', listener)
}
