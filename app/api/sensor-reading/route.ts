import { processSensorData } from '@/lib/services/sensor-processor'
import { NextRequest, NextResponse } from 'next/server'

// This endpoint receives multi-channel sensor data from LoRaWAN devices
// Format: POST /api/sensor-reading
// Body: {
//   deviceId: string,
//   currentValue: number,
//   voltage?: number,
//   temperature?: number (Celsius),
//   tiltAngle?: number (degrees),
//   vibration?: number (magnitude),
//   batteryVoltage?: number,
//   signalStrength?: number (dBm),
//   timestamp?: ISO string
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      deviceId,
      currentValue,
      voltage,
      temperature,
      tiltAngle,
      vibration,
      batteryVoltage,
      signalStrength,
      timestamp,
    } = body

    if (!deviceId || currentValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: deviceId, currentValue' },
        { status: 400 }
      )
    }

    // Process the sensor data with all channels
    const reading = await processSensorData({
      deviceId: parseInt(deviceId),
      currentValue: parseFloat(currentValue),
      voltage: voltage ? parseFloat(voltage) : undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      tiltAngle: tiltAngle ? parseFloat(tiltAngle) : undefined,
      vibration: vibration ? parseFloat(vibration) : undefined,
      batteryVoltage: batteryVoltage ? parseFloat(batteryVoltage) : undefined,
      signalStrength: signalStrength ? parseInt(signalStrength) : undefined,
      timestamp: timestamp ? new Date(timestamp) : undefined,
    })

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
