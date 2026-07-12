import { db } from '@/lib/db'
import { alerts, defects } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const allAlerts = await db.query.alerts.findMany({
      limit: 100,
      orderBy: desc(alerts.createdAt),
      with: {
        defect: true,
      },
    })

    return NextResponse.json(allAlerts)
  } catch (error) {
    console.error('[v0] Failed to fetch alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}
