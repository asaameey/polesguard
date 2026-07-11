import { db } from '@/lib/db'
import {
  alerts,
  defects,
  devices,
  poles,
  operatorSettings,
  user as userTable,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

interface AlertNotification {
  defectId: number
  severity: string
  poleName: string
  deviceName: string
  anomalyType: string
  description?: string
  currentValue?: number
}

/**
 * Create an alert from a defect and handle multi-channel notifications
 */
export async function createAlert(defectId: number): Promise<void> {
  try {
    // Get defect details
    const defectData = await db
      .select()
      .from(defects)
      .where(eq(defects.id, defectId))
      .limit(1)

    if (!defectData.length) {
      console.error('[v0] Defect not found:', defectId)
      return
    }

    const defect = defectData[0]

    // Get device and pole info
    const deviceData = await db
      .select()
      .from(devices)
      .where(eq(devices.id, defect.deviceId))
      .limit(1)

    const poleData = await db
      .select()
      .from(poles)
      .where(eq(poles.id, defect.poleId))
      .limit(1)

    if (!deviceData.length || !poleData.length) {
      console.error('[v0] Device or pole not found')
      return
    }

    const device = deviceData[0]
    const pole = poleData[0]

    // Create alert record
    const alert = await db
      .insert(alerts)
      .values({
        defectId,
        severity: defect.severity,
        status: 'pending',
      })
      .returning()

    if (!alert.length) {
      console.error('[v0] Failed to create alert record')
      return
    }

    // Prepare notification data
    const notification: AlertNotification = {
      defectId,
      severity: defect.severity,
      poleName: pole.name,
      deviceName: device.deviceName,
      anomalyType: defect.anomalyType,
      description: defect.description || undefined,
      currentValue: defect.currentValue || undefined,
    }

    // Get all operators with notification preferences
    const operators = await db
      .select({
        user: userTable,
        settings: operatorSettings,
      })
      .from(userTable)
      .leftJoin(operatorSettings, eq(operatorSettings.userId, userTable.id))

    // Send notifications based on operator preferences and severity
    for (const operator of operators) {
      const settings = operator.settings

      // Skip if operator doesn't have settings (shouldn't happen)
      if (!settings) continue

      // Check if operator should receive this alert based on severity
      const severityOrder = { low: 0, medium: 1, high: 2 }
      const minSeverity = severityOrder[settings.minSeverityLevel as keyof typeof severityOrder] || 0
      const alertSeverity = severityOrder[notification.severity as keyof typeof severityOrder] || 0

      if (alertSeverity < minSeverity) {
        continue
      }

      // Send email notification
      if (settings.emailNotifications) {
        await sendEmailAlert(operator.user.email, notification, alert[0].id)
      }

      // Send SMS notification for high/medium severity
      if (
        settings.smsNotifications &&
        settings.phoneNumber &&
        (notification.severity === 'high' || notification.severity === 'medium')
      ) {
        await sendSmsAlert(settings.phoneNumber, notification, alert[0].id)
      }
    }

    console.log('[v0] Alert created and notifications sent for defect:', defectId)
  } catch (error) {
    console.error('[v0] Error creating alert:', error)
  }
}

/**
 * Send email alert notification
 */
async function sendEmailAlert(
  email: string,
  notification: AlertNotification,
  alertId: number
): Promise<void> {
  try {
    // In production, use Resend, SendGrid, or similar
    // For now, just log the email
    const subject = `[${notification.severity.toUpperCase()}] Pole Defect Alert: ${notification.poleName}`
    const body = formatEmailBody(notification)

    console.log('[v0] Email alert:', { email, subject, body })

    // Update alert to mark email sent
    await db
      .update(alerts)
      .set({ emailSent: true })
      .where(eq(alerts.id, alertId))
  } catch (error) {
    console.error('[v0] Failed to send email alert:', error)
  }
}

/**
 * Send SMS alert notification
 */
async function sendSmsAlert(
  phoneNumber: string,
  notification: AlertNotification,
  alertId: number
): Promise<void> {
  try {
    // In production, use Twilio or similar SMS service
    // For now, just log the SMS
    const message = formatSmsBody(notification)

    console.log('[v0] SMS alert:', { phoneNumber, message })

    // Update alert to mark SMS sent
    await db
      .update(alerts)
      .set({ smsSent: true })
      .where(eq(alerts.id, alertId))
  } catch (error) {
    console.error('[v0] Failed to send SMS alert:', error)
  }
}

/**
 * Format email alert body
 */
function formatEmailBody(notification: AlertNotification): string {
  const anomalyLabel = notification.anomalyType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return `
Pole Defect Detector Alert

Severity: ${notification.severity.toUpperCase()}
Pole: ${notification.poleName}
Device: ${notification.deviceName}
Anomaly: ${anomalyLabel}

${notification.description || 'No additional details available.'}

${notification.currentValue !== undefined ? `Current Value: ${notification.currentValue.toFixed(2)}A` : ''}

Please log in to the monitoring dashboard to acknowledge this alert and take appropriate action.
  `.trim()
}

/**
 * Format SMS alert body
 */
function formatSmsBody(notification: AlertNotification): string {
  const anomalyLabel = notification.anomalyType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return `[POLE ALERT] ${notification.severity.toUpperCase()}: ${notification.poleName} - ${anomalyLabel}. Current: ${notification.currentValue?.toFixed(1) || '?'}A`
}

/**
 * Check for alerts that need escalation (pending for > 15 mins)
 */
export async function escalateUnacknowledgedAlerts(): Promise<void> {
  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000)

    const unacknowledged = await db
      .select()
      .from(alerts)
      .where(
        and(
          eq(alerts.status, 'pending'),
          // Simplified - in production add timestamp comparison
        )
      )

    for (const alert of unacknowledged) {
      // Mark for escalation if severity is high
      if (alert.severity === 'high') {
        await db
          .update(alerts)
          .set({ escalatedAt: new Date() })
          .where(eq(alerts.id, alert.id))

        console.log('[v0] Alert escalated:', alert.id)
      }
    }
  } catch (error) {
    console.error('[v0] Error escalating alerts:', error)
  }
}

/**
 * Resolve all alerts for a defect
 */
export async function resolveAlertsForDefect(defectId: number): Promise<void> {
  try {
    await db
      .update(alerts)
      .set({ status: 'resolved', updatedAt: new Date() })
      .where(eq(alerts.defectId, defectId))

    console.log('[v0] Alerts resolved for defect:', defectId)
  } catch (error) {
    console.error('[v0] Error resolving alerts:', error)
  }
}
