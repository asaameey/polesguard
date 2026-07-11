'use client'

import { Zap, Wifi, Battery } from 'lucide-react'

interface Device {
  id: number
  poleId: number
  deviceId: string
  deviceName: string
  currentType: string
  sensitivity?: number | null
  batteryLevel?: number | null
  lastReadingAt?: Date | null
  signalStrength?: number | null
  createdAt: Date
  updatedAt: Date
  latestReading?: {
    id: number
    deviceId: number
    currentValue: number
    voltage?: number | null
    timestamp: Date
    anomalyDetected: boolean
    anomalyType?: string | null
  } | null
}

interface DevicesListProps {
  devices: Device[]
}

export default function PoleDevicesList({ devices }: DevicesListProps) {
  const getBatteryColor = (level?: number | null) => {
    if (!level) return 'text-gray-400'
    if (level < 20) return 'text-red-600'
    if (level < 50) return 'text-amber-600'
    return 'text-green-600'
  }

  const getSignalColor = (strength?: number | null) => {
    if (!strength) return 'text-gray-400'
    if (strength < -120) return 'text-red-600'
    if (strength < -110) return 'text-amber-600'
    return 'text-green-600'
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-6 text-xl font-bold text-foreground">Sensors</h2>

      {devices.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center">
          <Zap className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <p className="mt-4 text-sm text-muted-foreground">No sensors configured for this pole</p>
        </div>
      ) : (
        <div className="space-y-4">
          {devices.map((device) => (
            <div key={device.id} className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{device.deviceName}</h3>
                  <p className="text-xs text-muted-foreground">ID: {device.deviceId}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Type: {device.currentType}</p>

                  {device.latestReading && (
                    <div className="mt-3 rounded bg-primary/5 p-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {device.latestReading.currentValue.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">A</span>
                      </div>
                      {device.latestReading.voltage && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Voltage: {device.latestReading.voltage.toFixed(1)}V
                        </p>
                      )}
                      {device.latestReading.anomalyDetected && (
                        <p className="mt-1 text-xs font-medium text-amber-600">
                          ⚠️ Anomaly: {device.latestReading.anomalyType || 'Unknown'}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Last reading: {new Date(device.latestReading.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {device.batteryLevel !== null && (
                    <div className="flex items-center gap-2">
                      <Battery className={`h-4 w-4 ${getBatteryColor(device.batteryLevel)}`} />
                      <span className="text-xs text-muted-foreground">{device.batteryLevel}%</span>
                    </div>
                  )}
                  {device.signalStrength !== null && (
                    <div className="flex items-center gap-2">
                      <Wifi className={`h-4 w-4 ${getSignalColor(device.signalStrength)}`} />
                      <span className="text-xs text-muted-foreground">{device.signalStrength} dBm</span>
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
