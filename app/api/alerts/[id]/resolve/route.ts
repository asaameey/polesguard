import { db } from '@/lib/db'
import { alerts, defects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = parseInt(params.id)

    // Update alert status
    const updated = await db
      .update(alerts)
      .set({
        status: 'resolved',
      })
      .where(eq(alerts.id, alertId))
      .returning()

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    // Also update the associated defect if it exists
    if (updated[0].defectId) {
      await db
        .update(defects)
        .set({
          resolvedAt: new Date(),
        })
        .where(eq(defects.id, updated[0].defectId))
    }

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('[v0] Failed to resolve alert:', error)
    return NextResponse.json(
      { error: 'Failed to resolve alert' },
      { status: 500 }
    )
  }
}
