import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import DashboardHeader from '@/components/dashboard/header'
import PoleMapView from '@/components/map/pole-map-view'

export const metadata = {
  title: 'Live Map - PolesGuard',
  description: 'Real-time map view of all monitored poles',
}

export default async function MapPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader user={session?.user} />

      <div className="h-[calc(100vh-80px)]">
        <PoleMapView />
      </div>
    </main>
  )
}
