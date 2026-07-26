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
export async function processSensorData(reading: SensorReading) {
  try {
    // Find device in database
    const device = await db.query.devices.findFirst({
      where: eq(devices.deviceId, reading.deviceId.toString()),
    })

    if (!device) {
      console.error(`[v0] Device not found: ${reading.deviceId}`)
      return
    }

    // Store current reading with all sensor channels
    const storedReading = await db.insert(currentReadings).values({
      deviceId: device.id,
      currentValue: reading.currentValue,
      voltage: reading.voltage || null,
      temperature: reading.temperature || null,
      tiltAngle: reading.tiltAngle || null,
      vibration: reading.vibration || null,
      batteryVoltage: reading.batteryVoltage || null,
      signalStrength: reading.signalStrength || null,
      timestamp: reading.timestamp || new Date(),
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
      if (reading.currentValue > thresholds.highCurrentThreshold) {
        anomalyDetected = true
        anomalyType = 'high_current'

        const defect = await db.insert(defects).values({
          deviceId: device.id,
          poleId: device.poleId,
          anomalyType: 'high_current',
          severity: reading.currentValue > thresholds.highCurrentThreshold * 1.5 ? 'high' : 'medium',
          currentValue: reading.currentValue,
          description: `High current: ${reading.currentValue.toFixed(2)}A (threshold: ${thresholds.highCurrentThreshold}A)`,
        }).returning()

        if (defect.length > 0) {
          await createAlert(defect[0], device, `High current at Pole #${device.poleId}`)
          updatePoleStatus(device.poleId, pole, 'high')
        }
      }

      // Check for low current
      if (reading.currentValue < thresholds.lowCurrentThreshold) {
        anomalyDetected = true
        anomalyType = 'low_current'

        const defect = await db.insert(defects).values({
          deviceId: device.id,
          poleId: device.poleId,
          anomalyType: 'low_current',
          severity: 'medium',
          currentValue: reading.currentValue,
          description: `Low current: ${reading.currentValue.toFixed(2)}A (threshold: ${thresholds.lowCurrentThreshold}A)`,
        }).returning()

        if (defect.length > 0) {
          await createAlert(defect[0], device, `Low current at Pole #${device.poleId}`)
        }
      }

      // Check for temperature anomaly
      if (reading.temperature && thresholds.temperatureThresholdC && reading.temperature > thresholds.temperatureThresholdC) {
        anomalyDetected = true
        anomalyType = 'overheating'

        const defect = await db.insert(defects).values({
          deviceId: device.id,
          poleId: device.poleId,
          anomalyType: 'overheating',
          severity: reading.temperature > (thresholds.temperatureThresholdC + 20) ? 'high' : 'medium',
          description: `Temperature alert: ${reading.temperature.toFixed(1)}°C (threshold: ${thresholds.temperatureThresholdC}°C)`,
        }).returning()

        if (defect.length > 0) {
          await createAlert(defect[0], device, `High temperature at Pole #${device.poleId}: ${reading.temperature.toFixed(1)}°C`)
          updatePoleStatus(device.poleId, pole, 'warning')
        }
      }

      // Check for tilt/structural damage
      if (reading.tiltAngle && thresholds.tiltThresholdDegrees && reading.tiltAngle > thresholds.tiltThresholdDegrees) {
        anomalyDetected = true
        anomalyType = 'structural_damage'

        const defect = await db.insert(defects).values({
          deviceId: device.id,
          poleId: device.poleId,
          anomalyType: 'structural_damage',
          severity: reading.tiltAngle > 30 ? 'high' : 'medium',
          description: `Tilt detected: ${reading.tiltAngle.toFixed(1)}° (threshold: ${thresholds.tiltThresholdDegrees}°)`,
        }).returning()

        if (defect.length > 0) {
          await createAlert(defect[0], device, `Structural damage at Pole #${device.poleId}: Tilt ${reading.tiltAngle.toFixed(1)}°`)
          updatePoleStatus(device.poleId, pole, 'high')
        }
      }

      // Check for vibration anomaly
      if (reading.vibration && thresholds.vibrationThreshold && reading.vibration > thresholds.vibrationThreshold) {
        anomalyDetected = true
        anomalyType = 'excessive_vibration'

        const defect = await db.insert(defects).values({
          deviceId: device.id,
          poleId: device.poleId,
          anomalyType: 'excessive_vibration',
          severity: reading.vibration > thresholds.vibrationThreshold * 2 ? 'high' : 'medium',
          description: `Vibration: ${reading.vibration.toFixed(2)} (threshold: ${thresholds.vibrationThreshold})`,
        }).returning()

        if (defect.length > 0) {
          await createAlert(defect[0], device, `Excessive vibration at Pole #${device.poleId}`)
        }
      }

      // Check for voltage/power issues
      if (reading.voltage && thresholds.voltageOutageThreshold && reading.voltage < thresholds.voltageOutageThreshold) {
        anomalyDetected = true
        anomalyType = 'voltage_outage'

        const defect = await db.insert(defects).values({
          deviceId: device.id,
          poleId: device.poleId,
          anomalyType: 'voltage_outage',
          severity: reading.voltage < 10 ? 'high' : 'medium',
          description: `Voltage low: ${reading.voltage.toFixed(1)}V (threshold: ${thresholds.voltageOutageThreshold}V)`,
        }).returning()

        if (defect.length > 0) {
          await createAlert(defect[0], device, `Power issue at Pole #${device.poleId}`)
          updatePoleStatus(device.poleId, pole, 'warning')
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

    // Update device status
    const isOnline = reading.signalStrength !== undefined && reading.signalStrength > -100
    await db.update(devices).set({
      lastReadingAt: new Date(),
      isOnline,
      lastOnlineAt: isOnline ? new Date() : device.lastOnlineAt,
      batteryLevel: reading.batteryVoltage ? Math.min(100, Math.max(0, reading.batteryVoltage / 3.3 * 100)) : device.batteryLevel,
      signalStrength: reading.signalStrength || device.signalStrength,
    }).where(eq(devices.id, device.id))

    // Broadcast reading update
    broadcastCurrentReading({
      deviceId: device.id,
      poleId: device.poleId,
      currentValue: reading.currentValue,
      temperature: reading.temperature,
      tiltAngle: reading.tiltAngle,
      vibration: reading.vibration,
      timestamp: reading.timestamp || new Date(),
      anomalyDetected,
      anomalyType: anomalyType || undefined,
    })

    // Broadcast device status
    broadcastDeviceStatus({
      deviceId: device.id,
      poleId: device.poleId,
      signalStrength: reading.signalStrength || device.signalStrength,
      batteryLevel: reading.batteryVoltage ? Math.min(100, Math.max(0, reading.batteryVoltage / 3.3 * 100)) : device.batteryLevel,
      lastReadingAt: new Date(),
      isOnline,
      status: anomalyDetected ? 'warning' : isOnline ? 'connected' : 'offline',
    })

    return storedReading[0]
  } catch (error) {
    console.error('[v0] Error processing sensor data:', error)
    throw error
  }
}

// Helper to create alert and broadcast
async function createAlert(defect: any, device: any, message: string) {
  await db.insert(alerts).values({
    defectId: defect.id,
    severity: defect.severity as 'low' | 'medium' | 'high',
  })

  broadcastAlert({
    id: defect.id,
    severity: defect.severity as 'low' | 'medium' | 'high',
    poleId: device.poleId,
    deviceId: device.id,
    message,
    timestamp: new Date(),
  })
}

// Helper to update pole status
async function updatePoleStatus(poleId: number, pole: any, newStatus: string) {
  if (pole) {
    await db.update(poles).set({ status: newStatus }).where(eq(poles.id, poleId))
    broadcastPoleStatusChange({
      poleId,
      newStatus,
      oldStatus: pole.status,
      timestamp: new Date(),
    })
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
