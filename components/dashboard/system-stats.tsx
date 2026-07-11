'use client'

import { Activity, AlertTriangle, Zap, Gauge } from 'lucide-react'

interface SystemStatsProps {
  stats: {
    totalPoles: number
    totalDevices: number
    activeDefects: number
    pendingAlerts: number
  }
}

export default function SystemStats({ stats }: SystemStatsProps) {
  const statItems = [
    {
      label: 'Total Poles',
      value: stats.totalPoles,
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Devices',
      value: stats.totalDevices,
      icon: Gauge,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Active Defects',
      value: stats.activeDefects,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Pending Alerts',
      value: stats.pendingAlerts,
      icon: Activity,
      color: stats.pendingAlerts > 0 ? 'text-red-600' : 'text-gray-600',
      bgColor: stats.pendingAlerts > 0 ? 'bg-red-50' : 'bg-gray-50',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{item.value}</p>
              </div>
              <div className={`rounded-lg ${item.bgColor} p-3`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
