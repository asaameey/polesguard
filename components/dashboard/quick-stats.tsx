'use client'

interface QuickStatsProps {
  poles: any[]
  alerts: any[]
}

export default function QuickStats({ poles, alerts }: QuickStatsProps) {
  const normalPoles = poles.filter(p => p.status === 'normal').length
  const alertPoles = poles.filter(p => p.status === 'alert').length
  const offlinePoles = poles.filter(p => p.status === 'offline').length
  
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
  const highAlerts = alerts.filter(a => a.severity === 'high').length
  
  const stats = [
    {
      label: 'Total Poles',
      value: poles.length,
      bgColor: 'bg-gradient-to-br from-primary/10 to-primary/5',
      textColor: 'text-primary',
      icon: '📍',
    },
    {
      label: 'Normal',
      value: normalPoles,
      bgColor: 'bg-gradient-to-br from-green-500/10 to-green-500/5',
      textColor: 'text-green-600 dark:text-green-400',
      icon: '✓',
    },
    {
      label: 'Alert',
      value: alertPoles,
      bgColor: 'bg-gradient-to-br from-orange-500/10 to-orange-500/5',
      textColor: 'text-orange-600 dark:text-orange-400',
      icon: '⚠',
    },
    {
      label: 'Offline',
      value: offlinePoles,
      bgColor: 'bg-gradient-to-br from-gray-500/10 to-gray-500/5',
      textColor: 'text-gray-600 dark:text-gray-400',
      icon: '⊘',
    },
    {
      label: 'Critical',
      value: criticalAlerts,
      bgColor: 'bg-gradient-to-br from-red-500/10 to-red-500/5',
      textColor: 'text-red-600 dark:text-red-400',
      icon: '!',
    },
  ]
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className={`${stat.bgColor} border border-border rounded-lg p-4 backdrop-blur-sm transition hover:border-primary/50`}>
          <div className={`text-3xl mb-2 ${stat.textColor}`}>{stat.icon}</div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
          <div className={`text-3xl font-bold ${stat.textColor} mt-2`}>{stat.value}</div>
        </div>
      ))}
    </div>
  )
}
