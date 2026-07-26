import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import MaintenanceTracker from '@/components/dashboard/maintenance-tracker'

export const metadata = {
  title: 'Maintenance Tracking - IoT Monitoring',
  description: 'Schedule and track pole maintenance activities',
}

export default async function MaintenancePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }
  
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
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition">
                Dashboard
              </Link>
              <Link href="/dashboard/admin" className="text-muted-foreground hover:text-foreground transition">
                Admin
              </Link>
              <Link href="/dashboard/maintenance" className="text-foreground font-medium border-b-2 border-primary">
                Maintenance
              </Link>
            </div>
          </div>
          <Link href="/api/auth/sign-out">
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </Link>
        </div>
      </nav>
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Maintenance Tracking</h1>
            <p className="text-muted-foreground">
              Schedule, track, and complete maintenance activities for your poles
            </p>
          </div>
          <Button className="gap-2">
            <span className="text-lg">+</span> Schedule Maintenance
          </Button>
        </div>
        
        {/* Maintenance Tracker */}
        <MaintenanceTracker />
      </div>
    </main>
  )
}
