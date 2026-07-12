import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getDeviceThresholds } from '@/app/actions/monitoring'
import { db } from '@/lib/db'
import { devices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ChevronLeft } from 'lucide-react'
import ThresholdConfigForm from '@/components/devices/threshold-config-form'

interface DeviceConfigPageProps {
  params: {
    id: string
  }
}

export const metadata = {
  title: 'Device Configuration - Pole Defect Detector',
}

export default async function DeviceConfigPage({ params }: DeviceConfigPageProps) {
  const session = await auth.api.getSession({ headers: await headers() })

  const deviceId = parseInt(params.id, 10)
  if (isNaN(deviceId)) {
    redirect('/devices')
  }

  try {
    const deviceData = await db.select().from(devices).where(eq(devices.id, deviceId)).limit(1)

    if (!deviceData.length) {
      redirect('/devices')
    }

    const device = deviceData[0]
    const thresholds = await getDeviceThresholds(deviceId)

    return (
      <main className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/devices" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              Back to Devices
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">{device.deviceName}</h1>
          <p className="mt-1 text-muted-foreground">Device ID: {device.deviceId}</p>
          <p className="mt-1 text-sm text-muted-foreground">Type: {device.currentType}</p>

          <div className="mt-8">
            <ThresholdConfigForm
              deviceId={deviceId}
              currentType={device.currentType}
              existingThresholds={thresholds[0] || null}
            />
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error('[v0] Device config error:', error)
    redirect('/devices')
  }
}
