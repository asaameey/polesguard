import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { operatorSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import NotificationPreferencesForm from '@/components/settings/notification-preferences-form'

export const metadata = {
  title: 'Settings - Pole Defect Detector',
}

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  try {
    const settings = await db
      .select()
      .from(operatorSettings)
      .where(eq(operatorSettings.userId, session.user.id))
      .limit(1)

    return (
      <main className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure how you receive alerts from the pole defect monitoring system
            </p>
          </div>

          <NotificationPreferencesForm
            userId={session.user.id}
            existingSettings={settings[0] || null}
          />
        </div>
      </main>
    )
  } catch (error) {
    console.error('[v0] Settings page error:', error)
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">Error loading settings. Please try refreshing.</p>
          </div>
        </div>
      </main>
    )
  }
}
