# IoT Pole Monitoring System - API Reference

## Authentication

All server actions require a valid user session. Authentication is handled by Better Auth with email/password.

- Sign up: `POST /api/auth/register`
- Sign in: `POST /api/auth/login`
- Sessions are cookie-based and automatically managed

## Server Actions (Authenticated Endpoints)

Server actions are located in `app/actions/iot.ts` and are called directly from client components or other server code.

### Pole Management

#### createPole
Creates a new pole in the monitoring system.

```typescript
await createPole({
  poleId: "POLE-001",
  latitude: 40.7128,
  longitude: -74.0060,
  location: "Downtown Grid A"
})
```

**Parameters:**
- `poleId` (string, required): Unique identifier for the pole
- `latitude` (number, required): GPS latitude (-90 to 90)
- `longitude` (number, required): GPS longitude (-180 to 180)
- `location` (string, optional): Human-readable location name

**Returns:** Pole object with `id`, `status`, `createdAt`

**Errors:**
- Unauthorized if not logged in
- Duplicate pole ID error if poleId already exists

---

#### getPoles
Retrieve all poles for the authenticated user.

```typescript
const poles = await getPoles()
```

**Returns:** Array of pole objects

**Example Response:**
```json
[
  {
    "id": 1,
    "poleId": "POLE-001",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "location": "Downtown Grid A",
    "status": "normal",
    "voltage": 235.2,
    "currentA": 145.5,
    "temperature": 45.3,
    "tiltAngle": 1.2,
    "vibration": 2.1,
    "lastSeen": "2026-07-13T03:30:00Z",
    "createdAt": "2026-07-13T02:00:00Z",
    "updatedAt": "2026-07-13T03:30:00Z"
  }
]
```

---

#### getPoleById
Retrieve details for a specific pole.

```typescript
const pole = await getPoleById(1)
```

**Parameters:**
- `poleId` (number): Internal database pole ID

**Returns:** Single pole object or undefined if not found

---

#### updatePoleStatus
Update pole status and sensor readings.

```typescript
await updatePoleStatus(1, "alert", {
  voltage: 235.2,
  currentA: 145.5,
  temperature: 45.3,
  tiltAngle: 1.2,
  vibration: 2.1
})
```

**Parameters:**
- `poleId` (number, required): Internal database pole ID
- `status` (string, required): "normal" | "alert" | "offline"
- `data` (object, optional): Sensor readings
  - `voltage` (number): Current voltage
  - `currentA` (number): Current in amps
  - `temperature` (number): Temperature in Celsius
  - `tiltAngle` (number): Tilt in degrees
  - `vibration` (number): Vibration level

**Returns:** Updated pole object

---

### Sensor Readings

#### recordSensorReading
Store a sensor reading for a pole.

```typescript
await recordSensorReading(1, {
  current_A: 145.5,
  voltage_V: 235.2,
  temperature_C: 45.3,
  tilt_degrees: 1.2,
  vibration_level: 2.1
})
```

**Parameters:**
- `poleId` (number, required): Internal database pole ID
- `data` (object): Sensor measurements
  - All fields optional: `current_A`, `voltage_V`, `temperature_C`, `tilt_degrees`, `vibration_level`

**Returns:** Sensor reading record

---

#### getSensorReadings
Retrieve historical sensor readings for a pole.

```typescript
const readings = await getSensorReadings(1, 24) // Last 24 hours
```

**Parameters:**
- `poleId` (number, required): Internal database pole ID
- `hours` (number, optional): Time window in hours (default: 24)

**Returns:** Array of sensor reading objects, sorted newest first

**Example Response:**
```json
[
  {
    "id": 100,
    "poleId": 1,
    "current_A": 145.5,
    "voltage_V": 235.2,
    "temperature_C": 45.3,
    "tilt_degrees": 1.2,
    "vibration_level": 2.1,
    "timestamp": "2026-07-13T03:30:00Z"
  }
]
```

---

### Alerts

#### createAlert
Manually create an alert for a pole.

```typescript
await createAlert({
  poleId: 1,
  alertType: "overcurrent",
  severity: "high",
  message: "Current exceeded 200A",
  value: 250.5,
  threshold: 200
})
```

**Parameters:**
- `poleId` (number, required): Internal database pole ID
- `alertType` (string, required): Alert category
  - "overcurrent" | "power_loss" | "voltage" | "temperature" | "tilt" | "vibration" | "offline"
- `severity` (string, required): "critical" | "high" | "medium" | "low"
- `message` (string, optional): Alert description
- `value` (number, optional): Measured value that triggered alert
- `threshold` (number, optional): Threshold that was exceeded

**Returns:** Alert object with `id`, `status: "active"`

---

#### getActiveAlerts
Retrieve all unresolved alerts for the user.

```typescript
const alerts = await getActiveAlerts()
```

**Returns:** Array of alert objects with `status: "active"`

**Example Response:**
```json
[
  {
    "id": 1,
    "poleId": 1,
    "alertType": "overcurrent",
    "severity": "high",
    "message": "Current exceeded 200A",
    "value": 250.5,
    "threshold": 200,
    "status": "active",
    "resolvedAt": null,
    "createdAt": "2026-07-13T03:30:00Z"
  }
]
```

---

#### resolveAlert
Mark an alert as resolved.

```typescript
await resolveAlert(1)
```

**Parameters:**
- `alertId` (number, required): Alert ID

**Returns:** Updated alert object with `status: "resolved"`, `resolvedAt: Date`

---

### Maintenance Records

#### scheduleMaintenance
Schedule maintenance for a pole.

```typescript
await scheduleMaintenance({
  poleId: 1,
  maintenanceType: "inspection",
  description: "Quarterly structural inspection",
  scheduledDate: new Date("2026-08-01")
})
```

**Parameters:**
- `poleId` (number, required): Internal database pole ID
- `maintenanceType` (string, required): "inspection" | "repair" | "replacement" | "cleaning"
- `description` (string, optional): Maintenance details
- `scheduledDate` (Date, required): When maintenance is scheduled

**Returns:** Maintenance record object with `status: "scheduled"`

---

#### getMaintenanceRecords
Retrieve maintenance history for a pole.

```typescript
const records = await getMaintenanceRecords(1)
```

**Parameters:**
- `poleId` (number, optional): Filter by specific pole

**Returns:** Array of maintenance records, sorted by scheduled date (newest first)

**Example Response:**
```json
[
  {
    "id": 1,
    "poleId": 1,
    "maintenanceType": "inspection",
    "description": "Quarterly structural inspection",
    "scheduledDate": "2026-08-01T00:00:00Z",
    "completedDate": null,
    "status": "scheduled",
    "createdAt": "2026-07-13T02:00:00Z"
  }
]
```

---

#### completeMaintenance
Mark maintenance as complete.

```typescript
await completeMaintenance(1)
```

**Parameters:**
- `recordId` (number, required): Maintenance record ID

**Returns:** Updated maintenance record with `status: "completed"`, `completedDate: Date`

---

## HTTP API Endpoints

### IoT Telemetry Ingestion

**POST /api/iot/telemetry**

Webhook endpoint for receiving sensor data from IoT devices via AWS IoT Core.

**Authentication:** None required (webhook from AWS)

**Request Body:**
```json
{
  "deviceName": "pole-001-device",
  "poleId": "POLE-001",
  "current_A": 145.5,
  "voltage_V": 235.2,
  "temperature_C": 45.3,
  "tilt_degrees": 1.2,
  "vibration_level": 2.1
}
```

**Required Fields:**
- `deviceName`: AWS IoT device name (must match existing device)
- `poleId`: Pole identifier as stored in database

**Optional Fields (but recommended):**
- `current_A`: Current in amperes
- `voltage_V`: Voltage in volts
- `temperature_C`: Temperature in Celsius
- `tilt_degrees`: Tilt angle in degrees
- `vibration_level`: Vibration measurement

**Response (200 OK):**
```json
{
  "success": true,
  "poleId": 1,
  "status": "normal",
  "alertsCreated": 0
}
```

**Response (200 OK with alerts):**
```json
{
  "success": true,
  "poleId": 1,
  "status": "alert",
  "alertsCreated": 2
}
```

**Error Responses:**

400 Bad Request - Missing required fields:
```json
{
  "error": "Missing required fields: deviceName, poleId"
}
```

404 Not Found - Pole doesn't exist:
```json
{
  "error": "Pole not found"
}
```

500 Internal Server Error:
```json
{
  "error": "Failed to process telemetry data"
}
```

---

## Alert Thresholds and Severity

The system automatically creates alerts based on these thresholds:

| Alert Type | Condition | Severity |
|------------|-----------|----------|
| overcurrent | > 200A | high |
| overcurrent | > 250A | critical |
| power_loss | < 50V | critical |
| voltage | < 180V or > 240V | medium |
| temperature | > 80°C | high |
| temperature | > 100°C | critical |
| tilt | > ±5° | high |
| tilt | > ±10° | critical |
| vibration | > 10 | high |
| vibration | > 15 | critical |

---

## Rate Limiting

Current implementation has no rate limiting, but consider adding:

- Per IP: 100 requests/minute to `/api/iot/telemetry`
- Per device: 1 reading every 30 seconds minimum
- Per user: 1000 API calls/hour for server actions

---

## Data Types

### Pole
```typescript
{
  id: number
  userId: string
  poleId: string
  latitude: number
  longitude: number
  location?: string
  voltage?: number
  currentA?: number
  temperature?: number
  tiltAngle?: number
  vibration?: number
  status: "normal" | "alert" | "offline"
  lastSeen?: Date
  createdAt: Date
  updatedAt: Date
}
```

### SensorReading
```typescript
{
  id: number
  poleId: number
  userId: string
  current_A?: number
  voltage_V?: number
  temperature_C?: number
  tilt_degrees?: number
  vibration_level?: number
  timestamp: Date
}
```

### Alert
```typescript
{
  id: number
  poleId: number
  userId: string
  alertType: "overcurrent" | "power_loss" | "voltage" | "temperature" | "tilt" | "vibration" | "offline"
  severity: "critical" | "high" | "medium" | "low"
  message?: string
  value?: number
  threshold?: number
  status: "active" | "resolved"
  resolvedAt?: Date
  createdAt: Date
}
```

### MaintenanceRecord
```typescript
{
  id: number
  poleId: number
  userId: string
  maintenanceType: "inspection" | "repair" | "replacement" | "cleaning"
  description?: string
  scheduledDate: Date
  completedDate?: Date
  status: "scheduled" | "in_progress" | "completed"
  createdAt: Date
}
```

---

## Best Practices

1. **Sensor Reading Frequency**: Send readings every 30-60 seconds
2. **Batch Operations**: For bulk pole registration, use individual `createPole` calls
3. **Error Handling**: Implement retry logic for failed telemetry uploads
4. **Data Validation**: Validate sensor readings client-side before sending
5. **Caching**: Cache pole list client-side with SWR for better UX
6. **Timestamps**: All times are in UTC/ISO 8601 format

---

## Webhook Integration

To integrate with external systems, use the exposed server actions:

```typescript
import { createAlert, updatePoleStatus } from '@/app/actions/iot'

// From external service
await createAlert({
  poleId: 1,
  alertType: "offline",
  severity: "critical",
  message: "Device has not reported in 5 minutes"
})
```

---

## Examples

### JavaScript/TypeScript (Browser)

```typescript
// In a client component
'use client'

import { getActiveAlerts, resolveAlert } from '@/app/actions/iot'
import { useEffect, useState } from 'react'

export function AlertManager() {
  const [alerts, setAlerts] = useState([])
  
  useEffect(() => {
    getActiveAlerts().then(setAlerts)
  }, [])
  
  const handleResolve = async (alertId: number) => {
    await resolveAlert(alertId)
    setAlerts(alerts.filter(a => a.id !== alertId))
  }
  
  return (
    <div>
      {alerts.map(alert => (
        <div key={alert.id}>
          <p>{alert.message}</p>
          <button onClick={() => handleResolve(alert.id)}>
            Resolve
          </button>
        </div>
      ))}
    </div>
  )
}
```

### cURL (Telemetry Upload)

```bash
curl -X POST https://your-app.vercel.app/api/iot/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "deviceName": "pole-001-device",
    "poleId": "POLE-001",
    "current_A": 145.5,
    "voltage_V": 235.2,
    "temperature_C": 45.3,
    "tilt_degrees": 1.2,
    "vibration_level": 2.1
  }'
```

### Python (Telemetry Upload)

```python
import requests
import json

url = "https://your-app.vercel.app/api/iot/telemetry"
data = {
    "deviceName": "pole-001-device",
    "poleId": "POLE-001",
    "current_A": 145.5,
    "voltage_V": 235.2,
    "temperature_C": 45.3,
    "tilt_degrees": 1.2,
    "vibration_level": 2.1
}

response = requests.post(url, json=data)
print(response.json())
```

---

## Support

For issues or questions:
1. Check the `IOT_SYSTEM.md` for architecture overview
2. Review `AWS_IOT_SETUP.md` for AWS IoT Core configuration
3. Check server console logs for errors
4. Verify database connectivity and schema
