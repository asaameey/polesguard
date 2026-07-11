import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getPoleWithDevices, getDefectHistory } from '@/app/actions/monitoring'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PoleDevicesList from '@/components/poles/devices-list'
import DefectHistory from '@/components/poles/defect-history'

interface PoleDetailPageProps {
  params: {
    id: string
  }
}

export const metadata = {
  title: 'Pole Details - Pole Defect Detector',
}

export default async function PoleDetailPage({ params }: PoleDetailPageProps) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const poleId = parseInt(params.id, 10)
  if (isNaN(poleId)) {
    redirect('/dashboard')
  }

  try {
    const [poleData, defects] = await Promise.all([
      getPoleWithDevices(poleId),
      getDefectHistory(poleId),
    ])

    if (!poleData) {
      redirect('/dashboard')
    }

    const pole = poleData

    return (
      <main className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">{pole.name}</h1>
            <p className="mt-2 text-muted-foreground">{pole.location}</p>
            <div className="mt-4 flex items-center gap-3">
              <div className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                pole.status === 'critical' ? 'bg-red-100 text-red-900' :
                pole.status === 'warning' ? 'bg-amber-100 text-amber-900' :
                'bg-green-100 text-green-900'
              }`}>
                {pole.status.charAt(0).toUpperCase() + pole.status.slice(1)}
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Devices */}
            <div className="lg:col-span-2">
              <PoleDevicesList devices={pole.devices || []} />
            </div>

            {/* Defect History */}
            <div>
              <DefectHistory defects={defects} />
            </div>
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error('[v0] Pole detail error:', error)
    redirect('/dashboard')
  }
}
