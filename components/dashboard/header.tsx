'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  user?: {
    id: string
    name?: string | null
    email: string
  } | null
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="font-bold text-primary-foreground">PD</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Pole Defect Monitor</h1>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary">
            Dashboard
          </Link>
          <Link href="/map" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Map
          </Link>
          <Link href="/sensors" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Sensors
          </Link>
          <Link href="/alerts" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Alerts
          </Link>
          <Link href="/devices" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Devices
          </Link>
          <Link href="/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Settings
          </Link>

          {user ? (
            <div className="flex items-center gap-3 border-l border-border pl-6">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-border pl-6">
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link href="/auth/login">Sign in</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
