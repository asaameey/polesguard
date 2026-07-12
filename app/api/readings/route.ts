import { db } from '@/lib/db'
import { currentReadings } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const deviceId = searchParams.get('deviceId')
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      )
    }

    const readings = await db.query.currentReadings.findMany({
      where: eq(currentReadings.deviceId, parseInt(deviceId)),
      limit: Math.min(limit, 1000), // Cap at 1000
      orderBy: desc(currentReadings.timestamp),
    })

    return NextResponse.json(readings)
  } catch (error) {
    console.error('[v0] Failed to fetch readings:', error)
    return NextResponse.json({ error: 'Failed to fetch readings' }, { status: 500 })
  }
}
