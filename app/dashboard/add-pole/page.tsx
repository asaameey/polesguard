import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AddPoleForm from '@/components/dashboard/add-pole-form'

export const metadata = {
  title: 'Add Pole - IoT Monitoring',
  description: 'Register a new utility pole in the monitoring system',
}

export default async function AddPolePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }
  
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-8">
          <a href="/dashboard" className="text-primary hover:underline text-sm mb-4 block">
            ← Back to Dashboard
          </a>
          <h1 className="text-4xl font-bold text-foreground mb-2">Register New Pole</h1>
          <p className="text-muted-foreground">
            Add a new utility pole to the monitoring system with its location and device information.
          </p>
        </div>
        
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <AddPoleForm />
        </div>
      </div>
    </main>
  )
}
