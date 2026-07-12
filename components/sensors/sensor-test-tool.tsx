'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Zap } from 'lucide-react'

export default function SensorTestTool() {
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [testMode, setTestMode] = useState<'manual' | 'simulate' | 'stress'>('manual')
  const [formData, setFormData] = useState({
    deviceId: 'LORA_DEVICE_001',
    currentValue: '10.5',
    voltage: '',
  })
  const [simulationRunning, setSimulationRunning] = useState(false)

  const handleTestSensor = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/sensor-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: formData.deviceId,
          currentValue: parseFloat(formData.currentValue),
          voltage: formData.voltage ? parseFloat(formData.voltage) : undefined,
        }),
      })

      const data = await response.json()
      setTestResult({
        success: response.ok,
        status: response.status,
        data,
        timestamp: new Date().toLocaleString(),
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSimulateData = async () => {
    setSimulationRunning(true)
    const iterations = testMode === 'stress' ? 100 : 10
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < iterations; i++) {
      try {
        // Simulate varying current readings
        const baseValue = 15 + Math.random() * 10
        const variance = Math.sin(i * 0.5) * 5 // Add some variation
        const currentValue = Math.max(0, baseValue + variance)

        const response = await fetch('/api/sensor-reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: formData.deviceId,
            currentValue: parseFloat(currentValue.toFixed(2)),
            voltage: 240 + Math.random() * 10,
          }),
        })

        if (response.ok) {
          successCount++
        } else {
          errorCount++
        }

        // Add delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        errorCount++
      }
    }

    setTestResult({
      success: true,
      mode: testMode,
      iterations,
      successCount,
      errorCount,
      successRate: ((successCount / iterations) * 100).toFixed(1),
      timestamp: new Date().toLocaleString(),
    })

    setSimulationRunning(false)
  }

  return (
    <div className="space-y-6">
      {/* Test Mode Selection */}
      <div>
        <Label className="text-base font-semibold text-foreground">Test Mode</Label>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {(['manual', 'simulate', 'stress'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTestMode(mode)}
              disabled={simulationRunning}
              className={`rounded-lg border-2 p-3 text-center transition-colors ${
                testMode === mode
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-muted/50 hover:border-primary'
              }`}
            >
              <p className="font-medium text-foreground">
                {mode === 'manual' ? 'Manual Test' : mode === 'simulate' ? 'Simulate 10' : 'Stress (100)'}
              </p>
              <p className="text-xs text-muted-foreground">
                {mode === 'manual'
                  ? 'Single reading'
                  : mode === 'simulate'
                    ? 'Realistic data'
                    : 'High frequency'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Test Form */}
      {testMode === 'manual' && (
        <form onSubmit={handleTestSensor} className="space-y-4 border-t border-border pt-6">
          <h3 className="font-semibold text-foreground">Send Test Reading</h3>

          <div>
            <Label htmlFor="deviceId" className="text-sm font-medium text-foreground">
              Device ID
            </Label>
            <Input
              id="deviceId"
              value={formData.deviceId}
              onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="currentValue" className="text-sm font-medium text-foreground">
              Current Value (A)
            </Label>
            <Input
              id="currentValue"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.currentValue}
              onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="voltage" className="text-sm font-medium text-foreground">
              Voltage (V) - Optional
            </Label>
            <Input
              id="voltage"
              type="number"
              step="0.1"
              value={formData.voltage}
              onChange={(e) => setFormData({ ...formData, voltage: e.target.value })}
              className="mt-1"
            />
          </div>

          <Button type="submit" disabled={loading || simulationRunning} className="w-full">
            {loading ? 'Sending...' : 'Send Test Reading'}
          </Button>
        </form>
      )}

      {/* Simulation Controls */}
      {(testMode === 'simulate' || testMode === 'stress') && (
        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-foreground">Simulation Settings</h3>

          <div className="mt-4 space-y-3">
            <div>
              <Label htmlFor="simDeviceId" className="text-sm font-medium text-foreground">
                Device ID
              </Label>
              <Input
                id="simDeviceId"
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleSimulateData}
              disabled={simulationRunning}
              className="w-full"
            >
              {simulationRunning
                ? `Running... ${testMode === 'stress' ? '100' : '10'} iterations`
                : `Start ${testMode === 'stress' ? 'Stress' : 'Simulation'} Test`}
            </Button>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResult && (
        <div className="border-t border-border pt-6">
          <h3 className="mb-4 font-semibold text-foreground">Test Results</h3>

          <div
            className={`rounded-lg border p-4 ${
              testResult.success
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-start gap-3">
              {testResult.success ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600" />
              )}

              <div className="flex-1">
                <h4 className={`font-semibold ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {testResult.mode === 'manual'
                    ? testResult.success
                      ? 'Reading Sent Successfully'
                      : 'Failed to Send Reading'
                    : `${testResult.mode === 'stress' ? 'Stress' : 'Simulation'} Test Complete`}
                </h4>

                <div className="mt-2 space-y-1 text-sm">
                  {testResult.mode === 'manual' && (
                    <>
                      <p className={testResult.success ? 'text-green-700' : 'text-red-700'}>
                        Status: {testResult.status}
                      </p>
                      {testResult.error && <p className="text-red-700">Error: {testResult.error}</p>}
                      {testResult.data && (
                        <details className="cursor-pointer">
                          <summary className="hover:underline">Show Response</summary>
                          <pre className="mt-2 overflow-auto rounded bg-slate-100 p-2 text-xs">
                            {JSON.stringify(testResult.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </>
                  )}

                  {(testResult.mode === 'simulate' || testResult.mode === 'stress') && (
                    <>
                      <p className="text-green-700">Success: {testResult.successCount}/{testResult.iterations}</p>
                      <p className="text-red-700">Failed: {testResult.errorCount}/{testResult.iterations}</p>
                      <p className="font-semibold text-green-700">Success Rate: {testResult.successRate}%</p>
                    </>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Timestamp: {testResult.timestamp}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="flex items-center gap-2 font-semibold text-blue-900">
          <Zap className="h-4 w-4" />
          How to Use This Tool
        </h4>
        <ul className="mt-3 space-y-2 text-sm text-blue-800">
          <li>• <strong>Manual Test:</strong> Send a single current reading to test the API</li>
          <li>• <strong>Simulate:</strong> Send 10 readings with realistic variations over time</li>
          <li>• <strong>Stress Test:</strong> Send 100 readings to test system performance</li>
          <li>• Monitor the dashboard to see real-time updates and alert generation</li>
          <li>• Check the Alerts page to verify anomaly detection is working</li>
        </ul>
      </div>
    </div>
  )
}
