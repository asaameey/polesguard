'use client'

import Link from 'next/link'
import { Battery, Wifi, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  pole: {
    id: number
    name: string
    location: string
  } | null
}

interface DevicesTableProps {
  devices: Device[]
}

export default function DevicesTable({ devices }: DevicesTableProps) {
  const getBatteryStatus = (level?: number | null) => {
    if (!level) return { text: 'Unknown', color: 'text-gray-500' }
    if (level < 20) return { text: 'Critical', color: 'text-red-600' }
    if (level < 50) return { text: 'Low', color: 'text-amber-600' }
    return { text: 'Good', color: 'text-green-600' }
  }

  const getSignalStatus = (strength?: number | null) => {
    if (!strength) return { text: 'Unknown', color: 'text-gray-500' }
    if (strength < -120) return { text: 'Poor', color: 'text-red-600' }
    if (strength < -110) return { text: 'Fair', color: 'text-amber-600' }
    return { text: 'Good', color: 'text-green-600' }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Device</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Pole</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Battery</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Signal</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Last Reading</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {devices.map((device) => {
              const batteryStatus = getBatteryStatus(device.batteryLevel)
              const signalStatus = getSignalStatus(device.signalStrength)
              return (
                <tr key={device.id} className="hover:bg-background/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">{device.deviceName}</p>
                      <p className="text-xs text-muted-foreground">{device.deviceId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {device.pole ? (
                      <Link
                        href={`/poles/${device.pole.id}`}
                        className="text-primary hover:underline"
                      >
                        {device.pole.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{device.currentType}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4" />
                      <div>
                        <p className={`text-sm font-medium ${batteryStatus.color}`}>
                          {batteryStatus.text}
                        </p>
                        {device.batteryLevel !== null && (
                          <p className="text-xs text-muted-foreground">{device.batteryLevel}%</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      <div>
                        <p className={`text-sm font-medium ${signalStatus.color}`}>
                          {signalStatus.text}
                        </p>
                        {device.signalStrength !== null && (
                          <p className="text-xs text-muted-foreground">{device.signalStrength} dBm</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {device.lastReadingAt
                      ? new Date(device.lastReadingAt).toLocaleTimeString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/devices/${device.id}/config`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Config
                      </Button>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {devices.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No devices configured yet</p>
        </div>
      )}
    </div>
  )
}
