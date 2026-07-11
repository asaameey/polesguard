'use client'

import Link from 'next/link'
import { AlertTriangle, CheckCircle2, AlertCircle, Zap } from 'lucide-react'

interface Pole {
  id: number
  name: string
  location: string
  status: string
  latitude?: number | null
  longitude?: number | null
  createdAt: Date
  updatedAt: Date
}

interface PolesGridProps {
  poles: Pole[]
}

export default function PolesGrid({ poles }: PolesGridProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-600" />
      case 'normal':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      default:
        return <Zap className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'critical':
        return 'border-l-4 border-red-600 bg-red-50'
      case 'warning':
        return 'border-l-4 border-amber-600 bg-amber-50'
      case 'normal':
        return 'border-l-4 border-green-600 bg-green-50'
      default:
        return 'border-l-4 border-gray-400 bg-gray-50'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Monitored Poles</h2>
        <p className="mt-1 text-sm text-muted-foreground">{poles.length} poles active</p>
      </div>

      {poles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <Zap className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <p className="mt-4 text-sm text-muted-foreground">No poles configured yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {poles.map((pole) => (
            <Link key={pole.id} href={`/poles/${pole.id}`}>
              <div className={`cursor-pointer rounded-lg border border-border p-4 transition-all hover:shadow-lg ${getStatusBg(pole.status)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{pole.name}</h3>
                      {getStatusIcon(pole.status)}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{pole.location}</p>
                    <div className="mt-3">
                      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {getStatusLabel(pole.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
