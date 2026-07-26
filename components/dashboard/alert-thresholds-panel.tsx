'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Threshold {
  id: string
  name: string
  unit: string
  warning: number
  critical: number
}

const defaultThresholds: Threshold[] = [
  {
    id: 'current',
    name: 'Overcurrent',
    unit: 'A',
    warning: 150,
    critical: 200,
  },
  {
    id: 'voltage',
    name: 'Voltage Drop',
    unit: 'V',
    warning: 220,
    critical: 200,
  },
  {
    id: 'temperature',
    name: 'Temperature',
    unit: '°C',
    warning: 60,
    critical: 75,
  },
  {
    id: 'tilt',
    name: 'Tilt Angle',
    unit: '°',
    warning: 2.5,
    critical: 5.0,
  },
]

export default function AlertThresholdsPanel() {
  const [thresholds, setThresholds] = useState<Threshold[]>(defaultThresholds)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const handleUpdate = (id: string, field: 'warning' | 'critical', value: number) => {
    setThresholds(thresholds.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ))
  }
  
  const handleSave = () => {
    setEditingId(null)
    // TODO: Save to backend
  }
  
  return (
    <Card className="p-6 bg-card border border-border">
      <h2 className="text-xl font-bold text-foreground mb-6">Alert Thresholds</h2>
      
      <div className="space-y-4">
        {thresholds.map((threshold) => (
          <div key={threshold.id} className="p-4 bg-secondary/30 rounded-lg border border-border/50">
            <div className="font-medium text-foreground mb-3">{threshold.name} ({threshold.unit})</div>
            
            {editingId === threshold.id ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Warning</Label>
                  <Input 
                    type="number"
                    value={threshold.warning}
                    onChange={(e) => handleUpdate(threshold.id, 'warning', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Critical</Label>
                  <Input 
                    type="number"
                    value={threshold.critical}
                    onChange={(e) => handleUpdate(threshold.id, 'critical', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <Button size="sm" className="col-span-2" onClick={handleSave}>
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex gap-6">
                  <div>
                    <div className="text-xs text-muted-foreground">Warning</div>
                    <div className="text-lg font-semibold text-orange-600">{threshold.warning}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Critical</div>
                    <div className="text-lg font-semibold text-red-600">{threshold.critical}</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(threshold.id)}>
                  Edit
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="text-sm text-muted-foreground">
          Thresholds are checked in real-time. Violations trigger instant notifications.
        </div>
      </div>
    </Card>
  )
}
