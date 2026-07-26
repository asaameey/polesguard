# PolesGuard Multi-Channel Sensor API

Real-time pole monitoring system with support for current, temperature, tilt, vibration, and power monitoring.

## Sensor Reading Endpoint

**POST** `/api/sensor-reading`

Submit multi-channel sensor telemetry from LoRaWAN or other IoT devices.

### Request Body

```json
{
  "deviceId": "device-001",
  "currentValue": 15.5,
  "voltage": 230.0,
  "temperature": 42.3,
  "tiltAngle": 5.2,
  "vibration": 1.8,
  "batteryVoltage": 3.2,
  "signalStrength": -85,
  "timestamp": "2026-07-26T14:37:00Z"
}
```

### Parameters

| Field | Type | Required | Unit | Description |
|-------|------|----------|------|-------------|
| `deviceId` | string | Yes | - | Unique device identifier |
| `currentValue` | number | Yes | Amps | AC/DC current reading |
| `voltage` | number | No | Volts | AC/DC voltage reading |
| `temperature` | number | No | °C | Ambient/pole temperature |
| `tiltAngle` | number | No | degrees | Pole tilt angle (0-180°) |
| `vibration` | number | No | magnitude | Vibration sensor reading |
| `batteryVoltage` | number | No | Volts | Device battery voltage |
| `signalStrength` | number | No | dBm | Signal strength (-140 to -30 dBm) |
| `timestamp` | string | No | ISO 8601 | Reading timestamp (defaults to now) |

### Response

**201 Created**
```json
{
  "success": true,
  "reading": {
    "id": 12345,
    "deviceId": 1,
    "currentValue": 15.5,
    "voltage": 230.0,
    "temperature": 42.3,
    "tiltAngle": 5.2,
    "vibration": 1.8,
    "timestamp": "2026-07-26T14:37:00Z",
    "anomalyDetected": false
  }
}
```

### Example Request

```bash
curl -X POST https://polesguard.com/api/sensor-reading \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "pole-001-sensor",
    "currentValue": 18.5,
    "voltage": 228.4,
    "temperature": 45.2,
    "tiltAngle": 3.1,
    "vibration": 2.1,
    "batteryVoltage": 3.15,
    "signalStrength": -82,
    "timestamp": "2026-07-26T14:37:00Z"
  }'
```

## Anomaly Detection

The system automatically detects and alerts on:

### Current Flow Anomalies
- **High Current**: Current exceeds configured threshold (default: device-specific)
- **Low Current**: Current drops below configured threshold
- **Rapid Fluctuation**: Current changes >15% between readings

### Environmental Anomalies
- **Overheating**: Temperature exceeds threshold (default: 75°C)
- **Structural Damage**: Tilt angle exceeds threshold (default: 15°)
- **Excessive Vibration**: Vibration magnitude exceeds threshold (default: 2.5)

### Power Anomalies
- **Voltage Outage**: Voltage drops below threshold (default: 50V for 230V base)
- **Low Battery**: Device battery voltage critical
- **Device Offline**: No readings for >30 minutes

## Alert Severity Levels

- **Low**: Minor anomalies (unusual fluctuations, minor tilt)
- **Medium**: Moderate issues (temperature warnings, low current)
- **High**: Critical issues (high current, structural damage, outages)

## Real-time Monitoring

All readings and alerts are broadcast via real-time events:

- `current_reading` - New sensor reading received
- `device_status` - Device connection/battery/signal update
- `alert_created` - New anomaly detected
- `pole_status_changed` - Pole status updated

## Device Metadata

Each device stores hardware information:
- Controller type (Arduino, STM32, Raspberry Pi, etc.)
- Communication type (LoRaWAN, 4G, WiFi, etc.)
- Firmware version
- Power source (Battery, Solar, AC, etc.)
- GPS location (if available)
- Online/offline state
- Last online timestamp

## Configuration

Set per-device sensor thresholds via the **Device Configuration** page at `/devices/[id]/config`:

- High/low current thresholds
- Temperature threshold
- Tilt angle threshold
- Vibration threshold
- Voltage outage threshold
- Anomaly detection duration

## Rate Limiting

- Max 1000 readings per minute per device
- Max 100 alerts per device per hour

## Error Responses

**400 Bad Request**
```json
{
  "error": "Missing required fields: deviceId, currentValue"
}
```

**404 Not Found**
```json
{
  "error": "Device not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to process sensor reading"
}
```
