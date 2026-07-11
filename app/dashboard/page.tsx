import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getSystemStats, getPoles, getActiveAlerts } from '@/app/actions/monitoring'
import DashboardHeader from '@/components/dashboard/header'
import AlertsPanel from '@/components/dashboard/alerts-panel'
import PolesGrid from '@/components/dashboard/poles-grid'
import SystemStats from '@/components/dashboard/system-stats'

export const metadata = {
  title: 'Pole Defect Detector - Monitoring Dashboard',
  description: 'Real-time monitoring of pole-mounted current sensors',
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  try {
    const [stats, poles, alerts] = await Promise.all([
      getSystemStats(),
      getPoles(),
      getActiveAlerts(),
    ])

    return (
      <main className="min-h-screen bg-background">
        <DashboardHeader user={session.user} />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* System Statistics */}
          <SystemStats stats={stats} />

          {/* Main Grid */}
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Poles Grid */}
            <div className="lg:col-span-2">
              <PolesGrid poles={poles} />
            </div>

            {/* Active Alerts Panel */}
            <div>
              <AlertsPanel alerts={alerts} />
            </div>
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error('[v0] Dashboard error:', error)
    return (
      <main className="min-h-screen bg-background">
        <DashboardHeader user={session.user} />
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Error loading dashboard. Please try refreshing the page.
            </p>
          </div>
        </div>
      </main>
    )
  }
}
