import { db } from '@/lib/db'
import { devices, poles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const allDevices = await db.query.devices.findMany({
      limit: 100,
    })

    return NextResponse.json(allDevices)
  } catch (error) {
    console.error('[v0] Failed to fetch devices:', error)
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, deviceName, poleId, currentType } = body

    if (!deviceId || !deviceName || !poleId || !currentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify pole exists
    const pole = await db.query.poles.findFirst({
      where: eq(poles.id, parseInt(poleId)),
    })

    if (!pole) {
      return NextResponse.json(
        { error: 'Pole not found' },
        { status: 404 }
      )
    }

    // Create device
    const newDevice = await db.insert(devices).values({
      deviceId,
      deviceName,
      poleId: parseInt(poleId),
      currentType,
    }).returning()

    return NextResponse.json(newDevice[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Failed to create device:', error)
    return NextResponse.json(
      { error: 'Failed to create device' },
      { status: 500 }
    )
  }
}
