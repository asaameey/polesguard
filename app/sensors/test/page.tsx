import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import DashboardHeader from '@/components/dashboard/header'
import SensorTestTool from '@/components/sensors/sensor-test-tool'

export const metadata = {
  title: 'Sensor Testing - PolesGuard',
  description: 'Test and simulate sensor data for development and debugging',
}

export default async function SensorTestPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader user={session?.user} />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Sensor Testing Tool</h1>
          <p className="mt-2 text-muted-foreground">
            Test sensors and simulate real-time current data for development purposes
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <SensorTestTool />
        </div>
      </div>
    </main>
  )
}
