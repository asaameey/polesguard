import { getHeaderUser } from '@/lib/supabase/user'
import DashboardHeader from '@/components/dashboard/header'
import PoleMapView from '@/components/map/pole-map-view'

export const metadata = {
  title: 'Live Map - PolesGuard',
  description: 'Real-time map view of all monitored poles',
}

export default async function MapPage() {
  const user = await getHeaderUser()

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="h-[calc(100vh-80px)]">
        <PoleMapView />
      </div>
    </main>
  )
}
