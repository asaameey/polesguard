import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { devices, poles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import DevicesTable from '@/components/devices/devices-table'

export const metadata = {
  title: 'Device Management - Pole Defect Detector',
}

export default async function DevicesPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  try {
    const devicesList = await db.select().from(devices).orderBy(devices.deviceName)

    const devicesWithPoles = await Promise.all(
      devicesList.map(async (device) => {
        const pole = await db.select().from(poles).where(eq(poles.id, device.poleId)).limit(1)
        return {
          ...device,
          pole: pole[0] || null,
        }
      })
    )

    return (
      <main className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground">Device Management</h1>
            <Link href="/devices/add">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Device
              </Button>
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <DevicesTable devices={devicesWithPoles} />
        </div>
      </main>
    )
  } catch (error) {
    console.error('[v0] Devices page error:', error)
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">Error loading devices. Please try refreshing.</p>
          </div>
        </div>
      </main>
    )
  }
}
