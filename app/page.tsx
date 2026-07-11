import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import PublicHeader from '@/components/public-header'
import Link from 'next/link'

export const metadata = {
  title: 'Pole Defect Detector - Monitoring Dashboard',
  description: 'Real-time monitoring of pole-mounted current sensors',
}

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-background">
        <PublicHeader />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Pole Defect Monitor
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Real-time monitoring of pole-mounted current sensors
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  redirect('/dashboard')
}
