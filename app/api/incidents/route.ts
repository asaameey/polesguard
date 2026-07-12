import { db } from '@/lib/db'
import { defects } from '@/lib/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { poleId, incidentType, description, severity } = body

    if (!poleId || !incidentType || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create defect record
    const newDefect = await db.insert(defects).values({
      deviceId: 0, // 0 indicates manual report
      poleId: parseInt(poleId),
      anomalyType: incidentType,
      severity: severity || 'medium',
      description,
    }).returning()

    return NextResponse.json(newDefect[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Failed to create incident:', error)
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    )
  }
}
