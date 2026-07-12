import { processSensorData } from '@/lib/services/sensor-processor'
import { NextRequest, NextResponse } from 'next/server'

// This endpoint receives sensor data from LoRaWAN devices
// Format: POST /api/sensor-reading
// Body: { deviceId: string, currentValue: number, voltage?: number }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, currentValue, voltage } = body

    if (!deviceId || currentValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: deviceId, currentValue' },
        { status: 400 }
      )
    }

    // Process the sensor data
    const reading = await processSensorData(
      deviceId,
      parseFloat(currentValue),
      voltage ? parseFloat(voltage) : undefined
    )

    return NextResponse.json(
      { success: true, reading },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Error processing sensor reading:', error)
    return NextResponse.json(
      { error: 'Failed to process sensor reading' },
      { status: 500 }
    )
  }
}
