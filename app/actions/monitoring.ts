'use server'

import { db } from '@/lib/db'
import {
  poles,
  devices,
  currentReadings,
  defects,
  alerts,
  sensorThresholds,
} from '@/lib/db/schema'
import { eq, desc, and, gte, lte } from 'drizzle-orm'

// Get all poles with their current status
export async function getPoles() {
  try {
    return await db.select().from(poles).orderBy(poles.name)
  } catch (error) {
    console.error('[v0] Error fetching poles:', error)
    throw error
  }
}

// Get pole with its devices and latest readings
export async function getPoleWithDevices(poleId: number) {
  try {
    const poleData = await db.select().from(poles).where(eq(poles.id, poleId)).limit(1)

    if (!poleData.length) {
      return null
    }

    const devicesList = await db.select().from(devices).where(eq(devices.poleId, poleId))

    const devicesWithReadings = await Promise.all(
      devicesList.map(async (device) => {
        const latestReading = await db
          .select()
          .from(currentReadings)
          .where(eq(currentReadings.deviceId, device.id))
          .orderBy(desc(currentReadings.timestamp))
          .limit(1)

        return {
          ...device,
          latestReading: latestReading[0] || null,
        }
      })
    )

    return {
      ...poleData[0],
      devices: devicesWithReadings,
    }
  } catch (error) {
    console.error('[v0] Error fetching pole with devices:', error)
    throw error
  }
}

// Get all active defects/alerts
export async function getActiveAlerts() {
  try {
    const activeAlerts = await db
      .select({
        alert: alerts,
        defect: defects,
        device: devices,
        pole: poles,
      })
      .from(alerts)
      .innerJoin(defects, eq(alerts.defectId, defects.id))
      .innerJoin(devices, eq(defects.deviceId, devices.id))
      .innerJoin(poles, eq(defects.poleId, poles.id))
      .where(eq(alerts.status, 'pending'))
      .orderBy(desc(alerts.createdAt))

    return activeAlerts
  } catch (error) {
    console.error('[v0] Error fetching alerts:', error)
    throw error
  }
}

// Get recent readings for a device
export async function getDeviceReadings(deviceId: number, hours: number = 24) {
  try {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)

    return await db
      .select()
      .from(currentReadings)
      .where(
        and(
          eq(currentReadings.deviceId, deviceId),
          gte(currentReadings.timestamp, cutoffTime)
        )
      )
      .orderBy(currentReadings.timestamp)
  } catch (error) {
    console.error('[v0] Error fetching device readings:', error)
    throw error
  }
}

// Get defect history
export async function getDefectHistory(poleId?: number, deviceId?: number, limit: number = 50) {
  try {
    let query = db.select().from(defects)

    if (poleId) {
      query = query.where(eq(defects.poleId, poleId))
    } else if (deviceId) {
      query = query.where(eq(defects.deviceId, deviceId))
    }

    return await query.orderBy(desc(defects.detectedAt)).limit(limit)
  } catch (error) {
    console.error('[v0] Error fetching defect history:', error)
    throw error
  }
}

// Acknowledge an alert
export async function acknowledgeAlert(alertId: number, userId: string) {
  try {
    await db
      .update(alerts)
      .set({
        status: 'acknowledged',
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
      })
      .where(eq(alerts.id, alertId))

    return { success: true }
  } catch (error) {
    console.error('[v0] Error acknowledging alert:', error)
    throw error
  }
}

// Get device thresholds
export async function getDeviceThresholds(deviceId: number) {
  try {
    return await db
      .select()
      .from(sensorThresholds)
      .where(eq(sensorThresholds.deviceId, deviceId))
      .limit(1)
  } catch (error) {
    console.error('[v0] Error fetching device thresholds:', error)
    throw error
  }
}

// Update device thresholds
export async function updateDeviceThresholds(
  deviceId: number,
  thresholdData: {
    highCurrentThreshold: number
    lowCurrentThreshold: number
    normalBaseline?: number
    anomalyDurationMinutes?: number
    rapidFluctuationPercent?: number
  }
) {
  try {
    const existing = await db
      .select()
      .from(sensorThresholds)
      .where(eq(sensorThresholds.deviceId, deviceId))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(sensorThresholds)
        .set(thresholdData)
        .where(eq(sensorThresholds.deviceId, deviceId))
    } else {
      await db.insert(sensorThresholds).values({
        deviceId,
        currentType: 'AC',
        ...thresholdData,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating thresholds:', error)
    throw error
  }
}

// Resolve a defect
export async function resolveDefect(defectId: number) {
  try {
    await db
      .update(defects)
      .set({ resolvedAt: new Date() })
      .where(eq(defects.id, defectId))

    return { success: true }
  } catch (error) {
    console.error('[v0] Error resolving defect:', error)
    throw error
  }
}

// Get system statistics
export async function getSystemStats() {
  try {
    const allPoles = await db.select().from(poles)
    const allDevices = await db.select().from(devices)
    const activeDefects = await db
      .select()
      .from(defects)
      .where(eq(defects.resolvedAt, null))
    const pendingAlerts = await db
      .select()
      .from(alerts)
      .where(eq(alerts.status, 'pending'))

    return {
      totalPoles: allPoles.length,
      totalDevices: allDevices.length,
      activeDefects: activeDefects.length,
      pendingAlerts: pendingAlerts.length,
    }
  } catch (error) {
    console.error('[v0] Error fetching system stats:', error)
    throw error
  }
}
