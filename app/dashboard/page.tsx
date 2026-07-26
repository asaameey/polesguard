import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getPoles, getActiveAlerts } from '@/app/actions/iot'
import PoleMapDashboard from '@/components/dashboard/pole-map-dashboard'
import AlertPanel from '@/components/dashboard/alert-panel'
import QuickStats from '@/components/dashboard/quick-stats'

export const metadata = {
  title: 'IoT Pole Monitoring - Dashboard',
  description: 'Real-time utility pole defect detection and monitoring system',
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }
  
  const poles = await getPoles()
  const activeAlerts = await getActiveAlerts()
  
  return (
    <main className="min-h-screen bg-background">
      {/* Header Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-2xl font-bold text-primary hover:text-primary/80 transition">
              PoleMon
            </Link>
            <div className="flex gap-6">
              <Link href="/dashboard" className="text-foreground font-medium border-b-2 border-primary">
                Dashboard
              </Link>
              <Link href="/dashboard/admin" className="text-muted-foreground hover:text-foreground transition">
                Admin
              </Link>
              <Link href="/dashboard/maintenance" className="text-muted-foreground hover:text-foreground transition">
                Maintenance
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <Link href="/api/auth/sign-out">
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto p-6">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Monitoring Dashboard
              </h1>
              <p className="text-muted-foreground">
                Real-time tracking and defect detection across your utility pole network
              </p>
            </div>
            <Link href="/dashboard/add-pole">
              <Button className="gap-2">
                <span className="text-lg">+</span> Add Pole
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Quick Stats */}
        <QuickStats poles={poles} alerts={activeAlerts} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Main Map/List Area */}
          <div className="lg:col-span-2">
            <PoleMapDashboard poles={poles} />
          </div>
          
          {/* Alerts Panel */}
          <div className="lg:col-span-1">
            <AlertPanel alerts={activeAlerts} />
          </div>
        </div>
      </div>
    </main>
  )
}
