import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import DashboardHeader from '@/components/dashboard/header'
import SensorConnectionDashboard from '@/components/sensors/sensor-connection-dashboard'
import SensorRegistrationForm from '@/components/sensors/sensor-registration-form'

export const metadata = {
  title: 'Sensor Integration - PolesGuard',
  description: 'Connect and manage LoRaWAN sensors for pole monitoring',
}

export default async function SensorsPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader user={session?.user} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Sensor Integration</h1>
          <p className="mt-2 text-muted-foreground">
            Connect and manage LoRaWAN sensors to monitor pole current flow in real-time
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Registration Form */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Register New Sensor</h2>
              <SensorRegistrationForm />
            </div>
          </div>

          {/* Connected Sensors Dashboard */}
          <div className="lg:col-span-2">
            <SensorConnectionDashboard />
          </div>
        </div>
      </div>
    </main>
  )
}
