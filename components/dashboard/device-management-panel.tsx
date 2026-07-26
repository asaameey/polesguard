'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Device {
  id: number
  deviceName: string
  poleId: number
  status: 'active' | 'inactive' | 'revoked'
  lastSeen?: string
}

const mockDevices: Device[] = [
  {
    id: 1,
    deviceName: 'pole-001-device',
    poleId: 1,
    status: 'active',
    lastSeen: '2 mins ago',
  },
  {
    id: 2,
    deviceName: 'pole-002-device',
    poleId: 2,
    status: 'active',
    lastSeen: '5 mins ago',
  },
  {
    id: 3,
    deviceName: 'pole-003-device',
    poleId: 3,
    status: 'inactive',
    lastSeen: '2 hours ago',
  },
]

export default function DeviceManagementPanel() {
  const [devices] = useState<Device[]>(mockDevices)
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-700 dark:text-green-400'
      case 'inactive':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
      case 'revoked':
        return 'bg-red-500/20 text-red-700 dark:text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-700'
    }
  }
  
  return (
    <Card className="p-6 bg-card border border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Connected Devices</h2>
        <Button size="sm" className="gap-2">
          <span>+</span> Add Device
        </Button>
      </div>
      
      <div className="space-y-3">
        {devices.map((device) => (
          <div key={device.id} className="p-4 bg-secondary/30 rounded-lg border border-border/50 hover:border-primary/50 transition flex justify-between items-center">
            <div className="flex-1">
              <div className="font-medium text-foreground">{device.deviceName}</div>
              <div className="text-sm text-muted-foreground">Pole {device.poleId}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground">{device.lastSeen}</div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(device.status)}`}>
                {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
              </span>
              <Button size="sm" variant="ghost">
                ⋮
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="text-sm text-muted-foreground">
          <strong>{devices.length}</strong> devices connected · <strong>{devices.filter(d => d.status === 'active').length}</strong> active
        </div>
      </div>
    </Card>
  )
}
