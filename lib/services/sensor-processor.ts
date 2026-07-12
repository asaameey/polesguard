import { db } from '@/lib/db'
import { currentReadings, devices, defects, alerts, poles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import {
  broadcastCurrentReading,
  broadcastAlert,
  broadcastPoleStatusChange,
  broadcastDeviceStatus,
} from './realtime'

// Process incoming sensor data and detect anomalies
export async function processSensorData(
  deviceId: string,
  currentValue: number,
  voltage?: number
) {
  try {
    // Find device in database
    const device = await db.query.devices.findFirst({
      where: eq(devices.deviceId, deviceId),
    })

    if (!device) {
      console.error(`[v0] Device not found: ${deviceId}`)
      return
    }

    // Store current reading
    const reading = await db.insert(currentReadings).values({
      deviceId: device.id,
      currentValue,
      voltage: voltage || null,
    }).returning()

    // Get sensor thresholds
    const thresholds = await db.query.sensorThresholds.findFirst({
      where: eq(devices.id, device.id),
    })

    // Detect anomalies
    let anomalyDetected = false
    let anomalyType = null
    const pole = await db.query.poles.findFirst({
      where: eq(poles.id, device.poleId),
    })

    if (thresholds && thresholds.enabled) {
      // Check for high current
      if (currentValue > thresholds.highCurrentThreshold) {
        anomalyDetected = true
        anomalyType = 'high_current'

        // Create defect record
        const defect = await db.insert(defects).values({
          deviceId: device.id,
          poleId: device.poleId,
          anomalyType: 'high_current',
          severity: currentValue > thresholds.highCurrentThreshold * 1.5 ? 'high' : 'medium',
          currentValue,
          description: `High current detected: ${currentValue.toFixed(2)}A (threshold: ${thresholds.highCurrentThreshold}A)`,
        }).returning()

        // Create alert
        if (defect.length > 0) {
          await db.insert(alerts).values({
            defectId: defect[0].id,
            severity: defect[0].severity as 'low' | 'medium' | 'high',
          })

          // Broadcast alert
          broadcastAlert({
            id: defect[0].id,
            severity: defect[0].severity as 'low' | 'medium' | 'high',
            poleId: device.poleId,
            deviceId: device.id,
            message: `High current detected at Pole #${device.poleId}: ${currentValue.toFixed(2)}A`,
            timestamp: new Date(),
          })
        }

        // Update pole status
        if (pole) {
          await db.update(poles).set({ status: 'high' }).where(eq(poles.id, device.poleId))
          broadcastPoleStatusChange({
            poleId: device.poleId,
            newStatus: 'high',
            oldStatus: pole.status,
            timestamp: new Date(),
          })
        }
      }

      // Check for low current
      if (currentValue < thresholds.lowCurrentThreshold) {
        anomalyDetected = true
        anomalyType = 'low_current'

        const defect = await db.insert(defects).values({
          deviceId: device.id,
          poleId: device.poleId,
          anomalyType: 'low_current',
          severity: 'medium',
          currentValue,
          description: `Low current detected: ${currentValue.toFixed(2)}A (threshold: ${thresholds.lowCurrentThreshold}A)`,
        }).returning()

        if (defect.length > 0) {
          await db.insert(alerts).values({
            defectId: defect[0].id,
            severity: 'medium',
          })

          broadcastAlert({
            id: defect[0].id,
            severity: 'medium',
            poleId: device.poleId,
            deviceId: device.id,
            message: `Low current detected at Pole #${device.poleId}: ${currentValue.toFixed(2)}A`,
            timestamp: new Date(),
          })
        }
      }

      // Check for rapid fluctuations
      const recentReadings = await db.query.currentReadings.findMany({
        where: eq(currentReadings.deviceId, device.id),
        limit: 5,
      })

      if (recentReadings.length > 1) {
        const previousValue = recentReadings[1].currentValue
        const fluctuationPercent = Math.abs((currentValue - previousValue) / previousValue) * 100

        if (fluctuationPercent > (thresholds.rapidFluctuationPercent || 15)) {
          anomalyDetected = true
          anomalyType = 'unusual_fluctuation'

          const defect = await db.insert(defects).values({
            deviceId: device.id,
            poleId: device.poleId,
            anomalyType: 'unusual_fluctuation',
            severity: 'low',
            currentValue,
            description: `Rapid current fluctuation: ${fluctuationPercent.toFixed(1)}% change`,
          }).returning()

          if (defect.length > 0) {
            await db.insert(alerts).values({
              defectId: defect[0].id,
              severity: 'low',
            })
          }
        }
      }
    }

    // Update device's last reading timestamp
    await db.update(devices).set({
      lastReadingAt: new Date(),
    }).where(eq(devices.id, device.id))

    // Broadcast reading update
    broadcastCurrentReading({
      deviceId: device.id,
      poleId: device.poleId,
      currentValue,
      timestamp: new Date(),
      anomalyDetected,
      anomalyType: anomalyType || undefined,
    })

    // Broadcast device status
    broadcastDeviceStatus({
      deviceId: device.id,
      poleId: device.poleId,
      signalStrength: device.signalStrength,
      batteryLevel: device.batteryLevel,
      lastReadingAt: new Date(),
      status: anomalyDetected ? 'warning' : 'connected',
    })

    return reading[0]
  } catch (error) {
    console.error('[v0] Error processing sensor data:', error)
    throw error
  }
}

// Detect missing or collapsed poles (no readings for extended period)
export async function checkForMissingPoles() {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

    // Find devices with no recent readings
    const inactiveDevices = await db.query.devices.findMany()

    for (const device of inactiveDevices) {
      if (device.lastReadingAt && device.lastReadingAt < thirtyMinutesAgo) {
        // Create defect record for missing pole
        const defect = await db.insert(defects).values({
          deviceId: device.id,
          poleId: device.poleId,
          anomalyType: 'pole_missing',
          severity: 'high',
          description: `No sensor readings for ${Math.floor((Date.now() - device.lastReadingAt.getTime()) / 60000)} minutes. Pole may be missing or collapsed.`,
        }).returning()

        if (defect.length > 0) {
          await db.insert(alerts).values({
            defectId: defect[0].id,
            severity: 'high',
          })

          // Update pole status
          await db.update(poles).set({
            status: 'offline',
          }).where(eq(poles.id, device.poleId))

          broadcastAlert({
            id: defect[0].id,
            severity: 'high',
            poleId: device.poleId,
            deviceId: device.id,
            message: `No readings from Pole #${device.poleId}. Pole may be missing or collapsed.`,
            timestamp: new Date(),
          })

          broadcastPoleStatusChange({
            poleId: device.poleId,
            newStatus: 'offline',
            oldStatus: 'normal',
            timestamp: new Date(),
          })
        }
      }
    }
  } catch (error) {
    console.error('[v0] Error checking for missing poles:', error)
  }
}
