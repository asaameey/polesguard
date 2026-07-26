'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MaintenanceRecord {
  id: number
  poleId: number
  type: 'inspection' | 'repair' | 'replacement' | 'cleaning'
  description: string
  scheduledDate: string
  completedDate?: string
  status: 'scheduled' | 'in_progress' | 'completed'
  technician?: string
}

const mockRecords: MaintenanceRecord[] = [
  {
    id: 1,
    poleId: 1,
    type: 'inspection',
    description: 'Routine structural inspection',
    scheduledDate: '2024-01-20',
    status: 'completed',
    completedDate: '2024-01-20',
    technician: 'John Smith',
  },
  {
    id: 2,
    poleId: 2,
    type: 'repair',
    description: 'Replace damaged cross-arm',
    scheduledDate: '2024-01-22',
    status: 'scheduled',
    technician: 'Sarah Johnson',
  },
  {
    id: 3,
    poleId: 3,
    type: 'cleaning',
    description: 'Clean insulators',
    scheduledDate: '2024-01-25',
    status: 'scheduled',
  },
]

export default function MaintenanceTracker() {
  const [records] = useState<MaintenanceRecord[]>(mockRecords)
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-700 dark:text-green-400'
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
      case 'scheduled':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
      default:
        return 'bg-gray-500/20 text-gray-700'
    }
  }
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inspection':
        return '🔍'
      case 'repair':
        return '🔧'
      case 'replacement':
        return '⚙️'
      case 'cleaning':
        return '🧹'
      default:
        return '📋'
    }
  }
  
  const upcomingRecords = records.filter(r => r.status !== 'completed')
  const completedRecords = records.filter(r => r.status === 'completed')
  
  return (
    <div className="space-y-8">
      {/* Upcoming Maintenance */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Upcoming Maintenance</h2>
        <div className="space-y-3">
          {upcomingRecords.map((record) => (
            <Card key={record.id} className="p-4 bg-card border border-border hover:border-primary/50 transition">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="text-3xl">{getTypeIcon(record.type)}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      Pole #{record.poleId} - {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">{record.description}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Scheduled: {new Date(record.scheduledDate).toLocaleDateString()} 
                      {record.technician && ` • Technician: ${record.technician}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                    {record.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                  </span>
                  <Button size="sm" variant="ghost">
                    ⋮
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Completed Maintenance */}
      {completedRecords.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Completed Maintenance</h2>
          <div className="space-y-3">
            {completedRecords.map((record) => (
              <Card key={record.id} className="p-4 bg-secondary/20 border border-border/50">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="text-3xl">{getTypeIcon(record.type)}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">
                        Pole #{record.poleId} - {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">{record.description}</div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Completed: {record.completedDate && new Date(record.completedDate).toLocaleDateString()}
                        {record.technician && ` • Technician: ${record.technician}`}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                    Completed
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {records.length === 0 && (
        <Card className="p-12 bg-card border border-dashed border-border text-center">
          <div className="text-4xl mb-3">📋</div>
          <div className="text-foreground font-semibold">No maintenance records</div>
          <div className="text-muted-foreground text-sm">Schedule maintenance for your poles to get started</div>
        </Card>
      )}
    </div>
  )
}
