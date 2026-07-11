import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { currentReadings, defects, devices, sensorThresholds } from '@/lib/db/schema'
import { eq, and, desc, limit } from 'drizzle-orm'
import { createAlert } from '@/lib/services/alert-service'

// Interface for LoRaWAN sensor payload
interface SensorPayload {
  deviceId: string
  current: number // in mA
  voltage?: number // optional voltage reading
  batteryLevel?: number // 0-100
  signalStrength?: number // RSSI in dBm
}

// Anomaly detection types
type AnomalyType = 
  | 'high_current'
  | 'low_current'
  | 'rapid_fluctuation'
  | 'zero_current'
  | 'battery_low'
  | 'signal_weak'
  | 'baseline_deviation'

export async function POST(request: NextRequest) {
  try {
    const payload: SensorPayload = await request.json()
    
    // Validate payload
    if (!payload.deviceId || payload.current === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: deviceId, current' },
        { status: 400 }
      )
    }

    // Find device
    const device = await db
      .select()
      .from(devices)
      .where(eq(devices.deviceId, payload.deviceId))
      .limit(1)
    
    if (!device.length) {
      return NextResponse.json(
        { error: `Device ${payload.deviceId} not found` },
        { status: 404 }
      )
    }

    const deviceRecord = device[0]
    const currentValueAmp = payload.current / 1000 // Convert mA to A

    // Update device last reading and battery/signal
    await db
      .update(devices)
      .set({
        lastReadingAt: new Date(),
        batteryLevel: payload.batteryLevel,
        signalStrength: payload.signalStrength,
      })
      .where(eq(devices.id, deviceRecord.id))

    // Store the reading
    const reading = await db
      .insert(currentReadings)
      .values({
        deviceId: deviceRecord.id,
        currentValue: currentValueAmp,
        voltage: payload.voltage,
        timestamp: new Date(),
      })
      .returning()

    // Check for anomalies
    const anomalies = await detectAnomalies(
      deviceRecord.id,
      currentValueAmp,
      payload.voltage,
      payload.batteryLevel,
      payload.signalStrength
    )

    // Create defects for detected anomalies
    for (const anomaly of anomalies) {
      await createDefect(
        deviceRecord.id,
        deviceRecord.poleId,
        anomaly.type,
        anomaly.severity,
        currentValueAmp,
        anomaly.description
      )
    }

    return NextResponse.json({
      success: true,
      readingId: reading[0].id,
      anomalies: anomalies.length > 0 ? anomalies : null,
    })
  } catch (error) {
    console.error('[v0] Sensor data API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function detectAnomalies(
  deviceId: number,
  currentValue: number,
  voltage: number | undefined,
  batteryLevel: number | undefined,
  signalStrength: number | undefined
): Promise<Array<{ type: AnomalyType; severity: 'low' | 'medium' | 'high'; description: string }>> {
  const anomalies: Array<{ type: AnomalyType; severity: 'low' | 'medium' | 'high'; description: string }> = []

  // Get device thresholds
  const thresholds = await db
    .select()
    .from(sensorThresholds)
    .where(eq(sensorThresholds.deviceId, deviceId))
    .limit(1)

  if (!thresholds.length) {
    return anomalies
  }

  const threshold = thresholds[0]

  // 1. Check for high current
  if (currentValue > threshold.highCurrentThreshold) {
    anomalies.push({
      type: 'high_current',
      severity: currentValue > threshold.highCurrentThreshold * 1.5 ? 'high' : 'medium',
      description: `High current detected: ${currentValue.toFixed(2)}A (threshold: ${threshold.highCurrentThreshold}A)`,
    })
  }

  // 2. Check for low current
  if (currentValue < threshold.lowCurrentThreshold && currentValue > 0) {
    anomalies.push({
      type: 'low_current',
      severity: currentValue < threshold.lowCurrentThreshold * 0.5 ? 'high' : 'low',
      description: `Low current detected: ${currentValue.toFixed(2)}A (threshold: ${threshold.lowCurrentThreshold}A)`,
    })
  }

  // 3. Check for zero current (likely device disconnected)
  if (currentValue === 0) {
    anomalies.push({
      type: 'zero_current',
      severity: 'high',
      description: 'Zero current detected - device or connection may be disconnected',
    })
  }

  // 4. Check for rapid fluctuations
  const recentReadings = await db
    .select()
    .from(currentReadings)
    .where(eq(currentReadings.deviceId, deviceId))
    .orderBy(desc(currentReadings.timestamp))
    .limit(3)

  if (recentReadings.length >= 2) {
    const previousReading = recentReadings[1]
    const avgCurrent = (currentValue + previousReading.currentValue) / 2
    const fluctuationPercent =
      avgCurrent > 0
        ? Math.abs((currentValue - previousReading.currentValue) / avgCurrent) * 100
        : 0

    if (
      fluctuationPercent > (threshold.rapidFluctuationPercent || 15) &&
      previousReading.currentValue > 0
    ) {
      anomalies.push({
        type: 'rapid_fluctuation',
        severity: fluctuationPercent > 50 ? 'high' : 'medium',
        description: `Rapid current fluctuation: ${fluctuationPercent.toFixed(1)}% change (threshold: ${threshold.rapidFluctuationPercent}%)`,
      })
    }
  }

  // 5. Check battery level
  if (batteryLevel !== undefined) {
    if (batteryLevel < 10) {
      anomalies.push({
        type: 'battery_low',
        severity: 'high',
        description: `Critical battery level: ${batteryLevel}% - device maintenance required`,
      })
    } else if (batteryLevel < 20) {
      anomalies.push({
        type: 'battery_low',
        severity: 'medium',
        description: `Low battery level: ${batteryLevel}% - device service needed soon`,
      })
    }
  }

  // 6. Check signal strength
  if (signalStrength !== undefined) {
    if (signalStrength < -120) {
      anomalies.push({
        type: 'signal_weak',
        severity: 'high',
        description: `Weak LoRaWAN signal: ${signalStrength} dBm - connectivity issue`,
      })
    } else if (signalStrength < -110) {
      anomalies.push({
        type: 'signal_weak',
        severity: 'medium',
        description: `Signal strength degraded: ${signalStrength} dBm`,
      })
    }
  }

  // 7. Check for baseline deviation
  if (threshold.normalBaseline) {
    const recentReadings24h = await db
      .select()
      .from(currentReadings)
      .where(
        and(
          eq(currentReadings.deviceId, deviceId),
          // This is a simplified check - in production, filter by last 24 hours
        )
      )
      .orderBy(desc(currentReadings.timestamp))
      .limit(100)

    if (recentReadings24h.length > 10) {
      const readings = recentReadings24h.map((r) => r.currentValue)
      const mean = readings.reduce((a, b) => a + b, 0) / readings.length
      const variance =
        readings.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / readings.length
      const stdDev = Math.sqrt(variance)

      if (stdDev > 0 && Math.abs(currentValue - mean) > 3 * stdDev) {
        anomalies.push({
          type: 'baseline_deviation',
          severity: 'medium',
          description: `Current deviation from baseline: ${Math.abs(currentValue - mean).toFixed(2)}A (mean: ${mean.toFixed(2)}A)`,
        })
      }
    }
  }

  return anomalies
}

async function createDefect(
  deviceId: number,
  poleId: number,
  anomalyType: AnomalyType,
  severity: 'low' | 'medium' | 'high',
  currentValue: number,
  description: string
) {
  try {
    // Check if a recent defect of same type exists (to avoid duplicates)
    const recentDefect = await db
      .select()
      .from(defects)
      .where(
        and(
          eq(defects.deviceId, deviceId),
          eq(defects.anomalyType, anomalyType),
          // In production, add timestamp check for last 5 minutes
        )
      )
      .orderBy(desc(defects.detectedAt))
      .limit(1)

    // Only create if no recent defect exists
    if (!recentDefect.length) {
      const newDefect = await db
        .insert(defects)
        .values({
          deviceId,
          poleId,
          anomalyType,
          severity,
          currentValue,
          description,
        })
        .returning()

      // Trigger alert for the new defect
      if (newDefect.length) {
        await createAlert(newDefect[0].id)
      }
    }
  } catch (error) {
    console.error('[v0] Failed to create defect:', error)
  }
}
