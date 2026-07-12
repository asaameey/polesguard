import Link from 'next/link'
import { ChevronRight, MapPin, Zap, AlertTriangle, Settings, TestTube } from 'lucide-react'

export const metadata = {
  title: 'Documentation - PolesGuard',
  description: 'PolesGuard System Documentation and API Reference',
}

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">PolesGuard Documentation</h1>
          <p className="mt-2 text-muted-foreground">
            Real-time pole monitoring system for infrastructure management
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-3 font-semibold text-foreground">Getting Started</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#overview" className="text-primary hover:underline">
                      System Overview
                    </Link>
                  </li>
                  <li>
                    <Link href="#quick-start" className="text-primary hover:underline">
                      Quick Start
                    </Link>
                  </li>
                  <li>
                    <Link href="#features" className="text-primary hover:underline">
                      Key Features
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-3 font-semibold text-foreground">API Reference</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#sensor-data" className="text-primary hover:underline">
                      Sensor Data
                    </Link>
                  </li>
                  <li>
                    <Link href="#alerts" className="text-primary hover:underline">
                      Alerts & Incidents
                    </Link>
                  </li>
                  <li>
                    <Link href="#devices" className="text-primary hover:underline">
                      Device Management
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Section */}
            <section id="overview" className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-2xl font-bold text-foreground">System Overview</h2>
              <p className="mb-4 text-muted-foreground">
                PolesGuard is a comprehensive real-time monitoring system designed to track pole infrastructure and
                detect anomalies in current flow. The system provides instant alerts for high/low current conditions,
                unusual activity, and critical incidents like missing or collapsed poles.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4">
                  <Zap className="mb-2 h-6 w-6 text-amber-500" />
                  <h4 className="font-semibold text-foreground">Real-time Monitoring</h4>
                  <p className="text-sm text-muted-foreground">Track current flow across 10-100 poles simultaneously</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <AlertTriangle className="mb-2 h-6 w-6 text-red-500" />
                  <h4 className="font-semibold text-foreground">Smart Alerts</h4>
                  <p className="text-sm text-muted-foreground">Instant notifications for anomalies and critical events</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <MapPin className="mb-2 h-6 w-6 text-blue-500" />
                  <h4 className="font-semibold text-foreground">Live Map</h4>
                  <p className="text-sm text-muted-foreground">View all pole locations and status in real-time</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <Settings className="mb-2 h-6 w-6 text-green-500" />
                  <h4 className="font-semibold text-foreground">Configuration</h4>
                  <p className="text-sm text-muted-foreground">Customize thresholds and detection parameters</p>
                </div>
              </div>
            </section>

            {/* Quick Start Section */}
            <section id="quick-start" className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-2xl font-bold text-foreground">Quick Start Guide</h2>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</span>
                  <div>
                    <h4 className="font-semibold text-foreground">Register a Pole</h4>
                    <p className="text-sm text-muted-foreground">
                      Navigate to the Devices page and add a new pole with location coordinates
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</span>
                  <div>
                    <h4 className="font-semibold text-foreground">Connect Sensors</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to Sensors page and register LoRaWAN devices with device IDs
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">3</span>
                  <div>
                    <h4 className="font-semibold text-foreground">Configure Thresholds</h4>
                    <p className="text-sm text-muted-foreground">
                      Set current thresholds for each device in Device Configuration
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">4</span>
                  <div>
                    <h4 className="font-semibold text-foreground">Test & Monitor</h4>
                    <p className="text-sm text-muted-foreground">
                      Use the Sensor Testing Tool and view real-time data on Dashboard
                    </p>
                  </div>
                </li>
              </ol>
            </section>

            {/* Features Section */}
            <section id="features" className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-2xl font-bold text-foreground">Key Features</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Real-time Current Monitoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Continuously track AC/DC current flow with timestamp and anomaly detection
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Intelligent Anomaly Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically identify high current, low current, unusual fluctuations, and device health issues
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Missing/Collapsed Pole Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    Alert when no readings received for extended periods indicating possible infrastructure damage
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Multi-level Incident Reporting</h4>
                  <p className="text-sm text-muted-foreground">
                    Report unusual activity, damage, missing poles, or collapsed poles with severity levels
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Live Geospatial Mapping</h4>
                  <p className="text-sm text-muted-foreground">
                    View all poles with real-time status indicators (Green=Normal, Yellow=Warning, Red=Alert)
                  </p>
                </div>
              </div>
            </section>

            {/* API Reference */}
            <section id="sensor-data" className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-2xl font-bold text-foreground">API Reference</h2>

              <div className="mb-6 space-y-2">
                <h3 className="font-semibold text-foreground">Sensor Data Endpoint</h3>
                <div className="rounded-lg bg-muted/50 p-3 font-mono text-sm">
                  POST /api/sensor-reading
                </div>

                <p className="text-sm text-muted-foreground">Submit current readings from LoRaWAN sensors</p>

                <details className="cursor-pointer">
                  <summary className="font-semibold text-foreground hover:underline">Request Body</summary>
                  <pre className="mt-2 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
                    {`{
  "deviceId": "LORA_DEVICE_001",
  "currentValue": 12.5,
  "voltage": 240
}`}
                  </pre>
                </details>
              </div>

              <div className="mb-6 space-y-2">
                <h3 className="font-semibold text-foreground">Incidents Endpoint</h3>
                <div className="rounded-lg bg-muted/50 p-3 font-mono text-sm">
                  POST /api/incidents
                </div>

                <p className="text-sm text-muted-foreground">Report pole incidents and unusual activity</p>

                <details className="cursor-pointer">
                  <summary className="font-semibold text-foreground hover:underline">Request Body</summary>
                  <pre className="mt-2 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
                    {`{
  "poleId": 1,
  "incidentType": "pole_collapsed",
  "severity": "high",
  "description": "Pole damaged by vehicle"
}`}
                  </pre>
                </details>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Alerts Endpoint</h3>
                <div className="rounded-lg bg-muted/50 p-3 font-mono text-sm">
                  GET /api/alerts
                </div>

                <p className="text-sm text-muted-foreground">Retrieve all active alerts and incidents</p>
              </div>
            </section>

            {/* Testing Section */}
            <section className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-blue-900">
                <TestTube className="h-6 w-6" />
                Testing & Development
              </h2>
              <p className="mb-4 text-blue-800">
                Use the Sensor Testing Tool to validate your setup and test anomaly detection:
              </p>
              <Link
                href="/sensors/test"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Open Sensor Test Tool
                <ChevronRight className="h-4 w-4" />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
