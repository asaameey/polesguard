'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PoleDetailProps {
  pole: any
  readings: any[]
  maintenance: any[]
}

export default function PoleDetail({ pole, readings, maintenance }: PoleDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'maintenance'>('overview')
  
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
  
  const formatValue = (value: number | null | undefined, unit: string = '') => {
    if (value === null || value === undefined) return '—'
    return `${value.toFixed(2)}${unit}`
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/dashboard" className="text-primary hover:underline text-sm mb-4 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">Pole {pole.poleId}</h1>
          <div className={`inline-block px-3 py-1 rounded text-white font-medium ${getStatusColor(pole.status)}`}>
            {getStatusLabel(pole.status)}
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>Registered: {new Date(pole.createdAt).toLocaleDateString()}</div>
          <div>Last Updated: {new Date(pole.updatedAt).toLocaleTimeString()}</div>
          {pole.lastSeen && (
            <div>Last Seen: {new Date(pole.lastSeen).toLocaleTimeString()}</div>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4">
          {['overview', 'history', 'maintenance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Readings */}
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Current Readings</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-background rounded">
                <span className="text-muted-foreground">Voltage</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatValue(pole.voltage, 'V')}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded">
                <span className="text-muted-foreground">Current</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatValue(pole.currentA, 'A')}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded">
                <span className="text-muted-foreground">Temperature</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatValue(pole.temperature, '°C')}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded">
                <span className="text-muted-foreground">Tilt Angle</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatValue(pole.tiltAngle, '°')}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded">
                <span className="text-muted-foreground">Vibration Level</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatValue(pole.vibration)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Location & Info */}
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Location & Information</h2>
            <div className="space-y-4">
              <div className="p-3 bg-background rounded">
                <div className="text-sm text-muted-foreground mb-1">Location Name</div>
                <div className="font-semibold text-foreground">
                  {pole.location || 'Not specified'}
                </div>
              </div>
              <div className="p-3 bg-background rounded">
                <div className="text-sm text-muted-foreground mb-1">Coordinates</div>
                <div className="font-mono text-sm text-foreground">
                  {pole.latitude.toFixed(6)}, {pole.longitude.toFixed(6)}
                </div>
              </div>
              <div className="p-3 bg-background rounded">
                <div className="text-sm text-muted-foreground mb-1">Pole ID</div>
                <div className="font-mono text-foreground">{pole.poleId}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Sensor Reading History (Last 24 Hours)</h2>
          {readings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No readings available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-2 font-semibold">Time</th>
                    <th className="pb-2 font-semibold">Voltage (V)</th>
                    <th className="pb-2 font-semibold">Current (A)</th>
                    <th className="pb-2 font-semibold">Temp (°C)</th>
                    <th className="pb-2 font-semibold">Tilt (°)</th>
                    <th className="pb-2 font-semibold">Vibration</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.slice(0, 20).map((reading, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-background">
                      <td className="py-2 text-foreground">
                        {new Date(reading.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2 text-foreground">{formatValue(reading.voltage_V)}</td>
                      <td className="py-2 text-foreground">{formatValue(reading.current_A)}</td>
                      <td className="py-2 text-foreground">{formatValue(reading.temperature_C)}</td>
                      <td className="py-2 text-foreground">{formatValue(reading.tilt_degrees)}</td>
                      <td className="py-2 text-foreground">{formatValue(reading.vibration_level)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">Maintenance Records</h2>
            <Link href={`/dashboard/poles/${pole.id}/schedule-maintenance`}>
              <Button size="sm">Schedule Maintenance</Button>
            </Link>
          </div>
          {maintenance.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No maintenance records</p>
          ) : (
            <div className="space-y-3">
              {maintenance.map((record) => (
                <div key={record.id} className="p-4 border border-border rounded-lg hover:bg-accent transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-foreground">
                      {record.maintenanceType.toUpperCase()}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                      record.status === 'completed' ? 'bg-green-500' :
                      record.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  {record.description && (
                    <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Scheduled: {new Date(record.scheduledDate).toLocaleDateString()}
                    {record.completedDate && ` | Completed: ${new Date(record.completedDate).toLocaleDateString()}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
