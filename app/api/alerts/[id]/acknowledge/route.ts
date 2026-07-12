import { db } from '@/lib/db'
import { alerts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = parseInt(params.id)

    const updated = await db
      .update(alerts)
      .set({
        status: 'acknowledged',
        acknowledgedAt: new Date(),
      })
      .where(eq(alerts.id, alertId))
      .returning()

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('[v0] Failed to acknowledge alert:', error)
    return NextResponse.json(
      { error: 'Failed to acknowledge alert' },
      { status: 500 }
    )
  }
}
