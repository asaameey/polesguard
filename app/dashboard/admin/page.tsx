import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import DeviceManagementPanel from '@/components/dashboard/device-management-panel'
import AlertThresholdsPanel from '@/components/dashboard/alert-thresholds-panel'

export const metadata = {
  title: 'Admin Panel - IoT Monitoring',
  description: 'Device and alert configuration management',
}

export default async function AdminPage() {
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
            <div className="flex gap-4">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition">
                Dashboard
              </Link>
              <Link href="/dashboard/admin" className="text-foreground font-medium border-b-2 border-primary">
                Admin
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage IoT devices, configure alert thresholds, and system settings
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-border pb-4">
          <div className="text-sm font-medium text-primary">
            Device Management
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Management */}
          <div>
            <DeviceManagementPanel />
          </div>
          
          {/* Alert Thresholds */}
          <div>
            <AlertThresholdsPanel />
          </div>
        </div>
        
        {/* System Information */}
        <Card className="mt-8 p-6 bg-card border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">System Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="text-xs font-semibold text-muted-foreground uppercase">API Version</div>
              <div className="text-lg font-bold text-foreground">v1.0.0</div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Database</div>
              <div className="text-lg font-bold text-foreground">PostgreSQL</div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="text-xs font-semibold text-muted-foreground uppercase">MQTT Broker</div>
              <div className="text-lg font-bold text-foreground">AWS IoT</div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Status</div>
              <div className="text-lg font-bold text-green-600">Operational</div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
