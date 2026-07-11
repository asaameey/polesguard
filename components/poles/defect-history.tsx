'use client'

import { AlertTriangle, CheckCircle2 } from 'lucide-react'

interface Defect {
  id: number
  deviceId: number
  poleId: number
  anomalyType: string
  severity: string
  currentValue?: number | null
  detectedAt: Date
  resolvedAt?: Date | null
  description?: string | null
  createdAt: Date
  updatedAt: Date
}

interface DefectHistoryProps {
  defects: Defect[]
}

export default function DefectHistory({ defects }: DefectHistoryProps) {
  const activeDefects = defects.filter((d) => !d.resolvedAt)
  const resolvedDefects = defects.filter((d) => d.resolvedAt)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-l-4 border-red-600 bg-red-50'
      case 'medium':
        return 'border-l-4 border-amber-600 bg-amber-50'
      case 'low':
        return 'border-l-4 border-blue-600 bg-blue-50'
      default:
        return 'border-l-4 border-gray-400 bg-gray-50'
    }
  }

  const getAnomalyLabel = (anomalyType: string) => {
    return anomalyType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-6 text-lg font-bold text-foreground">Defect History</h3>

      {activeDefects.length === 0 && resolvedDefects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-green-300 bg-green-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
          <p className="mt-2 text-sm font-medium text-green-900">No defects detected</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeDefects.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Active</p>
              <div className="space-y-2">
                {activeDefects.map((defect) => (
                  <div key={defect.id} className={`rounded p-3 ${getSeverityColor(defect.severity)}`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {getAnomalyLabel(defect.anomalyType)}
                        </p>
                        {defect.description && (
                          <p className="mt-1 text-xs text-muted-foreground">{defect.description}</p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(defect.detectedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resolvedDefects.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Resolved</p>
              <div className="space-y-2">
                {resolvedDefects.slice(0, 5).map((defect) => (
                  <div
                    key={defect.id}
                    className="rounded border border-border bg-background p-3 opacity-60"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {getAnomalyLabel(defect.anomalyType)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(defect.detectedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {resolvedDefects.length > 5 && (
                  <p className="text-xs text-muted-foreground">+{resolvedDefects.length - 5} more</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
