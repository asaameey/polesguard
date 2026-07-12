import { getHeaderUser } from '@/lib/supabase/user'
import DashboardHeader from '@/components/dashboard/header'
import AlertsCenter from '@/components/alerts/alerts-center'
import IncidentReportForm from '@/components/alerts/incident-report-form'

export const metadata = {
  title: 'Alerts & Incidents - PolesGuard',
  description: 'Real-time alerts, anomalies, and incident reporting',
}

export default async function AlertsPage() {
  const user = await getHeaderUser()

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Alerts & Incidents</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor real-time alerts, anomalies, and report unusual pole activity
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Report Incident Form */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Report Incident</h2>
              <IncidentReportForm />
            </div>
          </div>

          {/* Alerts Center */}
          <div className="lg:col-span-3">
            <AlertsCenter />
          </div>
        </div>
      </div>
    </main>
  )
}
