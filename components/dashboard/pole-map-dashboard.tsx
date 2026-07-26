'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PoleMapDashboardProps {
  poles: any[]
}

export default function PoleMapDashboard({ poles }: PoleMapDashboardProps) {
  const [selectedPole, setSelectedPole] = useState<any>(null)
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'voltage'>('name')
  
  const sortedPoles = [...poles].sort((a, b) => {
    if (sortBy === 'status') {
      const statusOrder = { alert: 0, offline: 1, normal: 2 }
      return (statusOrder[a.status as keyof typeof statusOrder] ?? 3) - 
             (statusOrder[b.status as keyof typeof statusOrder] ?? 3)
    }
    if (sortBy === 'voltage') {
      return (b.voltage || 0) - (a.voltage || 0)
    }
    return a.poleId.localeCompare(b.poleId)
  })
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500'
      case 'alert': return 'bg-orange-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-blue-500'
    }
  }
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'normal': return '🟢 Normal'
      case 'alert': return '🟠 Alert'
      case 'offline': return '⚫ Offline'
      default: return '🔵 Unknown'
    }
  }
  
  return (
    <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Pole Network Status</h2>
        <Link href="/dashboard/add-pole">
          <Button>Add Pole</Button>
        </Link>
      </div>
      
      <div className="mb-4 flex gap-2">
        <label className="text-sm text-muted-foreground">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-1 bg-background border border-border rounded text-sm text-foreground"
        >
          <option value="name">Pole ID</option>
          <option value="status">Status</option>
          <option value="voltage">Voltage</option>
        </select>
      </div>
      
      <div className="grid gap-3 max-h-[600px] overflow-y-auto">
        {sortedPoles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">No poles registered yet</p>
            <Link href="/dashboard/add-pole">
              <Button variant="outline">Add Your First Pole</Button>
            </Link>
          </div>
        ) : (
          sortedPoles.map((pole) => (
            <Link
              key={pole.id}
              href={`/dashboard/poles/${pole.id}`}
            >
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedPole?.id === pole.id
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary'
                }`}
                onClick={() => setSelectedPole(pole)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-foreground mb-2">
                      Pole {pole.poleId}
                    </div>
                    <div className={`inline-block px-2 py-1 rounded text-white text-sm font-medium mb-2 ${getStatusColor(pole.status)}`}>
                      {getStatusLabel(pole.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {pole.location || `${pole.latitude.toFixed(4)}, ${pole.longitude.toFixed(4)}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-foreground">
                      {pole.voltage ? `${pole.voltage.toFixed(1)}V` : '—'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {pole.currentA ? `${pole.currentA.toFixed(1)}A` : '—'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {pole.temperature ? `${pole.temperature.toFixed(1)}°C` : '—'}
                    </div>
                  </div>
                </div>
                {pole.lastSeen && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Last seen: {new Date(pole.lastSeen).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
