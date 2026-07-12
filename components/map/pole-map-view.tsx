'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, MapPin, Signal, Zap } from 'lucide-react'

interface PoleData {
  id: number
  name: string
  location: string
  latitude: number | null
  longitude: number | null
  status: string
  currentReading?: number
  signalStrength?: number | null
  batteryLevel?: number | null
}

export default function PoleMapView() {
  const [poles, setPoles] = useState<PoleData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPole, setSelectedPole] = useState<PoleData | null>(null)
  const [zoomLevel, setZoomLevel] = useState(100)

  useEffect(() => {
    const fetchPoles = async () => {
      try {
        const response = await fetch('/api/poles')
        if (response.ok) {
          const data = await response.json()
          setPoles(data)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch poles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPoles()
    const interval = setInterval(fetchPoles, 15000) // Refresh every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return '#10b981' // Green
      case 'warning':
        return '#f59e0b' // Orange
      case 'high':
        return '#ef4444' // Red
      case 'offline':
        return '#6b7280' // Gray
      default:
        return '#8b5cf6' // Purple
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return 'Normal'
      case 'warning':
        return 'Warning'
      case 'high':
        return 'Alert'
      case 'offline':
        return 'Offline'
      default:
        return 'Unknown'
    }
  }

  // Normalize coordinates for display (0-100 scale for demo)
  const normalizeCoord = (value: number | null, defaultValue: number) => {
    if (value === null) return defaultValue
    // Simple normalization - in production, use proper map projection
    return ((value % 1) * 100)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Map Canvas */}
      <div className="relative flex-1 bg-gradient-to-br from-slate-50 to-slate-100">
        <svg width="100%" height="100%" className="w-full">
          {/* Grid Background */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Poles */}
          {poles.map((pole) => {
            const x = normalizeCoord(pole.longitude, Math.random() * 90 + 5)
            const y = normalizeCoord(pole.latitude, Math.random() * 90 + 5)
            const scaledX = (x / 100) * (window.innerWidth * (zoomLevel / 100))
            const scaledY = (y / 100) * (window.innerHeight * (zoomLevel / 100))

            return (
              <g key={pole.id} onClick={() => setSelectedPole(pole)}>
                {/* Outer ring for status */}
                <circle
                  cx={scaledX}
                  cy={scaledY}
                  r={20}
                  fill={getStatusColor(pole.status)}
                  opacity="0.2"
                />

                {/* Main marker */}
                <circle
                  cx={scaledX}
                  cy={scaledY}
                  r={12}
                  fill={getStatusColor(pole.status)}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:r-15"
                />

                {/* Pole label */}
                <text
                  x={scaledX}
                  y={scaledY + 25}
                  textAnchor="middle"
                  className="fill-foreground text-xs font-medium"
                >
                  {pole.name}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
          <button
            onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
            className="rounded-lg bg-white p-2 shadow-lg hover:bg-slate-50"
          >
            +
          </button>
          <div className="rounded-lg bg-white px-3 py-2 text-center text-xs font-medium shadow-lg">
            {zoomLevel}%
          </div>
          <button
            onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
            className="rounded-lg bg-white p-2 shadow-lg hover:bg-slate-50"
          >
            −
          </button>
        </div>
      </div>

      {/* Selected Pole Info Panel */}
      {selectedPole && (
        <div className="border-t border-border bg-card p-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">{selectedPole.name}</h3>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium`}
                  style={{
                    backgroundColor: getStatusColor(selectedPole.status) + '20',
                    color: getStatusColor(selectedPole.status),
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getStatusColor(selectedPole.status) }}></span>
                  {getStatusLabel(selectedPole.status)}
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">{selectedPole.location}</p>

              <div className="mt-3 grid grid-cols-3 gap-4">
                {selectedPole.currentReading !== undefined && (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="font-semibold text-foreground">{selectedPole.currentReading.toFixed(2)}A</p>
                    </div>
                  </div>
                )}

                {selectedPole.signalStrength !== null && (
                  <div className="flex items-center gap-2">
                    <Signal className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Signal</p>
                      <p className="font-semibold text-foreground">{selectedPole.signalStrength} dBm</p>
                    </div>
                  </div>
                )}

                {selectedPole.batteryLevel !== null && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Battery</p>
                      <p className="font-semibold text-foreground">{selectedPole.batteryLevel}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedPole(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
