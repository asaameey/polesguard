import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getPoleById, getSensorReadings, getMaintenanceRecords } from '@/app/actions/iot'
import PoleDetail from '@/components/dashboard/pole-detail'

export const metadata = {
  title: 'Pole Details - IoT Monitoring',
  description: 'Detailed information and sensor readings for utility pole',
}

interface PolePageProps {
  params: Promise<{ id: string }>
}

export default async function PolePage({ params }: PolePageProps) {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }
  
  const { id } = await params
  const poleId = parseInt(id, 10)
  
  if (isNaN(poleId)) {
    notFound()
  }
  
  const pole = await getPoleById(poleId)
  
  if (!pole) {
    notFound()
  }
  
  const [readings, maintenance] = await Promise.all([
    getSensorReadings(poleId, 24),
    getMaintenanceRecords(poleId),
  ])
  
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <PoleDetail pole={pole} readings={readings} maintenance={maintenance} />
      </div>
    </main>
  )
}
