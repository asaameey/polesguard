import { db } from '@/lib/db'
import { poles, sensorReadings, alerts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

// Alert thresholds
const THRESHOLDS = {
  current: { max: 200, min: 0 },
  voltage: { max: 240, min: 180 },
  temperature: { max: 80, min: -40 },
  tilt: { max: 5, min: -5 },
  vibration: { max: 10, min: 0 },
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const { deviceName, poleId, current_A, voltage_V, temperature_C, tilt_degrees, vibration_level } = data
    
    if (!deviceName || !poleId) {
      return NextResponse.json(
        { error: 'Missing required fields: deviceName, poleId' },
        { status: 400 }
      )
    }
    
    // Find the pole by ID
    const pole = await db.select().from(poles).where(eq(poles.poleId, poleId)).limit(1)
    
    if (pole.length === 0) {
      return NextResponse.json({ error: 'Pole not found' }, { status: 404 })
    }
    
    const poleRecord = pole[0]
    const userId = poleRecord.userId
    
    // Record sensor reading
    await db.insert(sensorReadings).values({
      poleId: poleRecord.id,
      userId,
      current_A: current_A ?? null,
      voltage_V: voltage_V ?? null,
      temperature_C: temperature_C ?? null,
      tilt_degrees: tilt_degrees ?? null,
      vibration_level: vibration_level ?? null,
    })
    
    // Update pole status and latest readings
    let newStatus = 'normal'
    const alertsToCreate = []
    
    // Check for overcurrent
    if (current_A !== undefined && current_A > THRESHOLDS.current.max) {
      newStatus = 'alert'
      alertsToCreate.push({
        poleId: poleRecord.id,
        userId,
        alertType: 'overcurrent',
        severity: current_A > 250 ? 'critical' : 'high',
        message: `Overcurrent detected: ${current_A.toFixed(2)}A (threshold: ${THRESHOLDS.current.max}A)`,
        value: current_A,
        threshold: THRESHOLDS.current.max,
      })
    }
    
    // Check for voltage anomaly
    if (voltage_V !== undefined && (voltage_V > THRESHOLDS.voltage.max || voltage_V < THRESHOLDS.voltage.min)) {
      if (voltage_V < 50) {
        newStatus = 'alert'
        alertsToCreate.push({
          poleId: poleRecord.id,
          userId,
          alertType: 'power_loss',
          severity: 'critical',
          message: `Power loss or severe voltage drop: ${voltage_V.toFixed(2)}V`,
          value: voltage_V,
          threshold: THRESHOLDS.voltage.min,
        })
      } else {
        newStatus = 'alert'
        alertsToCreate.push({
          poleId: poleRecord.id,
          userId,
          alertType: 'voltage',
          severity: 'medium',
          message: `Voltage out of range: ${voltage_V.toFixed(2)}V (normal: 180-240V)`,
          value: voltage_V,
          threshold: THRESHOLDS.voltage.max,
        })
      }
    }
    
    // Check for temperature issues
    if (temperature_C !== undefined && temperature_C > THRESHOLDS.temperature.max) {
      newStatus = 'alert'
      alertsToCreate.push({
        poleId: poleRecord.id,
        userId,
        alertType: 'temperature',
        severity: temperature_C > 100 ? 'critical' : 'high',
        message: `High temperature detected: ${temperature_C.toFixed(2)}°C (threshold: ${THRESHOLDS.temperature.max}°C)`,
        value: temperature_C,
        threshold: THRESHOLDS.temperature.max,
      })
    }
    
    // Check for pole tilt
    if (tilt_degrees !== undefined && Math.abs(tilt_degrees) > THRESHOLDS.tilt.max) {
      newStatus = 'alert'
      alertsToCreate.push({
        poleId: poleRecord.id,
        userId,
        alertType: 'tilt',
        severity: Math.abs(tilt_degrees) > 10 ? 'critical' : 'high',
        message: `Pole tilt detected: ${tilt_degrees.toFixed(2)}° (safe range: ±${THRESHOLDS.tilt.max}°)`,
        value: tilt_degrees,
        threshold: THRESHOLDS.tilt.max,
      })
    }
    
    // Check for vibration
    if (vibration_level !== undefined && vibration_level > THRESHOLDS.vibration.max) {
      newStatus = 'alert'
      alertsToCreate.push({
        poleId: poleRecord.id,
        userId,
        alertType: 'vibration',
        severity: vibration_level > 15 ? 'critical' : 'high',
        message: `High vibration detected: ${vibration_level.toFixed(2)} (threshold: ${THRESHOLDS.vibration.max})`,
        value: vibration_level,
        threshold: THRESHOLDS.vibration.max,
      })
    }
    
    // Update pole record
    await db
      .update(poles)
      .set({
        status: newStatus,
        currentA: current_A,
        voltage: voltage_V,
        temperature: temperature_C,
        tiltAngle: tilt_degrees,
        vibration: vibration_level,
        lastSeen: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(poles.id, poleRecord.id))
    
    // Create alerts
    for (const alert of alertsToCreate) {
      await db.insert(alerts).values({
        ...alert,
        status: 'active',
      })
    }
    
    return NextResponse.json({
      success: true,
      poleId: poleRecord.id,
      status: newStatus,
      alertsCreated: alertsToCreate.length,
    })
  } catch (error) {
    console.error('[v0] IoT telemetry error:', error)
    return NextResponse.json(
      { error: 'Failed to process telemetry data' },
      { status: 500 }
    )
  }
}
