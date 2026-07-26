'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { poles, sensorReadings, alerts, maintenanceRecords } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// --- Pole Management ---

export async function createPole(data: {
  poleId: string
  latitude: number
  longitude: number
  location?: string
}) {
  const userId = await getUserId()
  
  const result = await db
    .insert(poles)
    .values({
      ...data,
      userId,
      status: 'normal',
    })
    .returning()
  
  revalidatePath('/dashboard')
  return result[0]
}

export async function getPoles() {
  const userId = await getUserId()
  
  return db
    .select()
    .from(poles)
    .where(eq(poles.userId, userId))
    .orderBy(desc(poles.createdAt))
}

export async function getPoleById(poleId: number) {
  const userId = await getUserId()
  
  const result = await db
    .select()
    .from(poles)
    .where(and(eq(poles.id, poleId), eq(poles.userId, userId)))
  
  return result[0]
}

export async function updatePoleStatus(poleId: number, status: string, data?: {
  voltage?: number
  currentA?: number
  temperature?: number
  tiltAngle?: number
  vibration?: number
}) {
  const userId = await getUserId()
  
  const result = await db
    .update(poles)
    .set({
      status,
      voltage: data?.voltage,
      currentA: data?.currentA,
      temperature: data?.temperature,
      tiltAngle: data?.tiltAngle,
      vibration: data?.vibration,
      lastSeen: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(poles.id, poleId), eq(poles.userId, userId)))
    .returning()
  
  revalidatePath('/dashboard')
  return result[0]
}

// --- Sensor Readings ---

export async function recordSensorReading(poleId: number, data: {
  current_A?: number
  voltage_V?: number
  temperature_C?: number
  tilt_degrees?: number
  vibration_level?: number
}) {
  const userId = await getUserId()
  
  const reading = await db
    .insert(sensorReadings)
    .values({
      poleId,
      userId,
      ...data,
    })
    .returning()
  
  return reading[0]
}

export async function getSensorReadings(poleId: number, hours: number = 24) {
  const userId = await getUserId()
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  
  return db
    .select()
    .from(sensorReadings)
    .where(
      and(
        eq(sensorReadings.poleId, poleId),
        eq(sensorReadings.userId, userId)
      )
    )
    .orderBy(desc(sensorReadings.timestamp))
}

// --- Alerts ---

export async function createAlert(data: {
  poleId: number
  alertType: string
  severity: string
  message?: string
  value?: number
  threshold?: number
}) {
  const userId = await getUserId()
  
  const alert = await db
    .insert(alerts)
    .values({
      ...data,
      userId,
      status: 'active',
    })
    .returning()
  
  revalidatePath('/dashboard')
  return alert[0]
}

export async function getActiveAlerts() {
  const userId = await getUserId()
  
  return db
    .select()
    .from(alerts)
    .where(
      and(
        eq(alerts.userId, userId),
        eq(alerts.status, 'active')
      )
    )
    .orderBy(desc(alerts.createdAt))
}

export async function resolveAlert(alertId: number) {
  const userId = await getUserId()
  
  const result = await db
    .update(alerts)
    .set({
      status: 'resolved',
      resolvedAt: new Date(),
    })
    .where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)))
    .returning()
  
  revalidatePath('/dashboard')
  return result[0]
}

// --- Maintenance Records ---

export async function scheduleMaintenance(data: {
  poleId: number
  maintenanceType: string
  description?: string
  scheduledDate: Date
}) {
  const userId = await getUserId()
  
  const record = await db
    .insert(maintenanceRecords)
    .values({
      ...data,
      userId,
      status: 'scheduled',
    })
    .returning()
  
  revalidatePath('/dashboard')
  return record[0]
}

export async function getMaintenanceRecords(poleId?: number) {
  const userId = await getUserId()
  
  let query = db
    .select()
    .from(maintenanceRecords)
    .where(eq(maintenanceRecords.userId, userId))
  
  if (poleId) {
    query = query.where(eq(maintenanceRecords.poleId, poleId))
  }
  
  return query.orderBy(desc(maintenanceRecords.scheduledDate))
}

export async function completeMaintenance(recordId: number) {
  const userId = await getUserId()
  
  const result = await db
    .update(maintenanceRecords)
    .set({
      status: 'completed',
      completedDate: new Date(),
    })
    .where(
      and(
        eq(maintenanceRecords.id, recordId),
        eq(maintenanceRecords.userId, userId)
      )
    )
    .returning()
  
  revalidatePath('/dashboard')
  return result[0]
}
