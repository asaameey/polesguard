# IoT Pole Defect Detection System - Complete Implementation Guide

## Overview

This is a production-ready utility-scale pole monitoring system using IoT sensors and cloud infrastructure. The system detects electrical faults, structural damage, and maintenance needs in real-time across power distribution networks.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloud Dashboard                          │
│  (Next.js React Frontend - Real-time Web UI)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                    Backend API Layer                        │
│         (Next.js Route Handlers & Server Actions)          │
│  ✓ IoT Telemetry Ingestion (/api/iot/telemetry)           │
│  ✓ Pole Management (CRUD operations)                       │
│  ✓ Alert Processing & Notifications                        │
└──────────────┬────────────────────────────────────────────┬─┘
               │                                            │
        ┌──────┴─────────┐                        ┌────────┴────────┐
        │                │                        │                 │
   ┌────▼────┐    ┌──────▼───────┐        ┌──────▼──────┐   ┌─────▼──┐
   │PostgreSQL│    │AWS IoT Core  │        │   Drizzle   │   │ Better  │
   │ Database │    │  (MQTT)      │        │    ORM      │   │  Auth   │
   └──────────┘    └──────────────┘        └─────────────┘   └─────────┘
        ▲                    ▲
        │                    │ MQTT Publish
        │           ┌────────┴──────────┐
        │           │                   │
   ┌────┴───────────▼──────────┐  ┌────▼──────────────────┐
   │  IoT Devices (ESP32/STM32)│  │ AWS Lambda Ingestion  │
   │  - Current Sensors (CT)   │  │ (Route to DB)         │
   │  - Voltage Sensors (PT)   │  │                       │
   │  - Temperature Sensors    │  └───────────────────────┘
   │  - Tilt Sensors           │
   │  - Vibration Sensors      │
   │  - GPS Module             │
   │  - 4G/LoRa Module         │
   └──────────────────────────┘
```

## Database Schema

### Core Tables

1. **poles** - Physical pole records
   - `id` (PK): Unique identifier
   - `userId` (FK): Owner user
   - `poleId`: Unique pole identifier (e.g., "POLE-001")
   - `latitude/longitude`: GPS coordinates
   - `location`: Human-readable location name
   - `status`: 'normal' | 'alert' | 'offline'
   - `lastSeen`: Last telemetry timestamp

2. **sensor_readings** - Time-series sensor data
   - `id` (PK): Record identifier
   - `poleId` (FK): Reference to poles
   - `userId`: For scoping queries
   - `current_A`, `voltage_V`, `temperature_C`, `tilt_degrees`, `vibration_level`
   - `timestamp`: When reading was recorded
   - Indexed on (poleId, timestamp) for fast time-series queries

3. **alerts** - Fault notifications
   - `id` (PK): Alert identifier
   - `poleId` (FK): Associated pole
   - `alertType`: 'overcurrent' | 'power_loss' | 'voltage' | 'temperature' | 'tilt' | 'vibration' | 'offline'
   - `severity`: 'critical' | 'high' | 'medium' | 'low'
   - `status`: 'active' | 'resolved'
   - `value`, `threshold`: Sensor values that triggered alert

4. **maintenance_records** - Maintenance tracking
   - `id` (PK): Record identifier
   - `poleId` (FK): Associated pole
   - `maintenanceType`: 'inspection' | 'repair' | 'replacement' | 'cleaning'
   - `status`: 'scheduled' | 'in_progress' | 'completed'
   - `scheduledDate`, `completedDate`

5. **aws_iot_devices** - Device certificates
   - `id` (PK): Device record
   - `poleId` (FK): Associated pole
   - `deviceName`: Unique AWS IoT device name
   - `certificateArn`, `publicKey`, `privateKey`
   - `status`: 'active' | 'inactive' | 'revoked'

## API Endpoints

### IoT Telemetry Ingestion

**POST /api/iot/telemetry**

Receives sensor data from IoT devices via AWS IoT Core.

Request:
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

Response:
```json
{
  "success": true,
  "poleId": 1,
  "status": "normal",
  "alertsCreated": 0
}
```

Alert Thresholds:
- **Current**: > 200A (warning), > 250A (critical)
- **Voltage**: < 180V or > 240V (warning), < 50V (critical - power loss)
- **Temperature**: > 80°C (warning), > 100°C (critical)
- **Tilt**: > ±5° (warning), > ±10° (critical)
- **Vibration**: > 10 (warning), > 15 (critical)

## Server Actions (Authentication Required)

All server actions in `app/actions/iot.ts`:

### Pole Management
- `createPole(data)` - Register new pole
- `getPoles()` - Fetch all user poles
- `getPoleById(poleId)` - Get pole details
- `updatePoleStatus(poleId, status, data)` - Update pole state

### Sensor Readings
- `recordSensorReading(poleId, data)` - Store sensor data
- `getSensorReadings(poleId, hours)` - Get historical readings

### Alerts
- `createAlert(data)` - Create alert
- `getActiveAlerts()` - Fetch unresolved alerts
- `resolveAlert(alertId)` - Mark alert resolved

### Maintenance
- `scheduleMaintenance(data)` - Schedule maintenance
- `getMaintenanceRecords(poleId?)` - Get maintenance history
- `completeMaintenance(recordId)` - Mark maintenance complete

## IoT Device Configuration

### ESP32-S3 Firmware Example

```cpp
#include <WiFi.h>
#include <ArduinoMqttClient.h>
#include <WiFiSSL.h>

// AWS IoT credentials (from aws_iot_devices table)
const char* AWS_IOT_ENDPOINT = "your-iot-endpoint.amazonaws.com";
const char* DEVICE_NAME = "pole-001-device";
const char* CA_CERT = R"(-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----)"

// Sensor pins
const int CURRENT_SENSOR_PIN = 34;  // ADC pin for current transformer
const int VOLTAGE_SENSOR_PIN = 35;  // ADC pin for voltage
const int TEMP_SENSOR_PIN = 21;     // DS18B20 bus
const int TILT_SENSOR_I2C = 22;     // I2C for accelerometer
const int VIBRATION_PIN = 32;       // Vibration sensor

WiFiSSLClient wifiClient;
MqttClient mqttClient(wifiClient);

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin("SSID", "PASSWORD");
  while (WiFi.status() != WL_CONNECTED) delay(500);
  
  // Setup MQTT
  mqttClient.setId(DEVICE_NAME);
  mqttClient.setUsernamePassword("", ""); // AWS IoT uses certs, not user/pass
  
  // Set client certificate and key
  wifiClient.setCACert(CA_CERT);
  wifiClient.setClientCertificate(CLIENT_CERT);
  wifiClient.setPrivateKey(PRIVATE_KEY);
  
  // Connect to AWS IoT Core
  if (!mqttClient.connect(AWS_IOT_ENDPOINT, 8883)) {
    Serial.println("MQTT connection failed!");
    while(1) delay(1000);
  }
  
  Serial.println("Connected to AWS IoT");
}

void loop() {
  mqttClient.poll();
  
  // Read sensors every 30 seconds
  static unsigned long lastPublish = 0;
  if (millis() - lastPublish >= 30000) {
    publishTelemetry();
    lastPublish = millis();
  }
}

void publishTelemetry() {
  // Read current (CT sensor with burden resistor)
  float rawCurrent = analogRead(CURRENT_SENSOR_PIN);
  float current_A = (rawCurrent - 2048) * 0.1;  // Scale based on calibration
  
  // Read voltage (voltage divider)
  float rawVoltage = analogRead(VOLTAGE_SENSOR_PIN);
  float voltage_V = (rawVoltage / 4095.0) * 3.3 * 76.7;  // 76.7x divider
  
  // Read temperature from DS18B20
  float temperature_C = readDS18B20();
  
  // Read tilt from MPU6050
  float tilt_degrees = readAccelerometer();
  
  // Read vibration
  float vibration = readVibrationSensor();
  
  // Create JSON payload
  String payload = "";
  payload += "{";
  payload += "\"deviceName\":\"" + String(DEVICE_NAME) + "\",";
  payload += "\"poleId\":\"POLE-001\",";  // Should be set during provisioning
  payload += "\"current_A\":" + String(current_A, 2) + ",";
  payload += "\"voltage_V\":" + String(voltage_V, 2) + ",";
  payload += "\"temperature_C\":" + String(temperature_C, 2) + ",";
  payload += "\"tilt_degrees\":" + String(tilt_degrees, 2) + ",";
  payload += "\"vibration_level\":" + String(vibration, 2);
  payload += "}";
  
  // Publish to AWS IoT topic
  mqttClient.beginMessage("$aws/things/" + String(DEVICE_NAME) + "/shadow/update");
  mqttClient.print(payload);
  mqttClient.endMessage();
  
  Serial.println("Published: " + payload);
}

float readDS18B20() {
  // Implementation for DS18B20 one-wire sensor
  // Return temperature in Celsius
}

float readAccelerometer() {
  // Implementation for MPU6050 I2C sensor
  // Calculate tilt angle from accelerometer data
  // Return angle in degrees
}

float readVibrationSensor() {
  // Implementation for vibration sensor
  // Could be analog RMS or digital I2C sensor
  // Return vibration level
}
```

### AWS IoT Core Rules Engine

Create a rule to route MQTT messages to your API:

```json
{
  "ruleName": "PoleMonitoringToAPI",
  "topicRulePayload": {
    "ruleDisabled": false,
    "sql": "SELECT * FROM '$aws/things/+/shadow/update'",
    "actions": [
      {
        "http": {
          "url": "https://your-app.vercel.app/api/iot/telemetry",
          "confirmationUrl": "",
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer YOUR_API_KEY"
          },
          "encoding": "UTF-8"
        }
      }
    ]
  }
}
```

## Deployment

### 1. Database Setup
- Neon PostgreSQL automatically provisioned with environment variable `DATABASE_URL`
- Schema migrations run automatically via SQL scripts

### 2. Authentication
- Better Auth provides user management and sessions
- Environment variable: `BETTER_AUTH_SECRET` (required - generate with `openssl rand -base64 32`)

### 3. AWS IoT Integration
- Connect AWS account for IoT device management
- Create IoT policy for devices
- Provision device certificates and attach to things
- Configure MQTT rules engine to forward data to API

### 4. Deployment to Vercel
```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Deploy
vercel deploy
```

Environment variables needed:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Session signing secret
- (Optional) AWS credentials if managing devices server-side

## Dashboard Features

### Real-time Status
- Color-coded pole status (🟢 Normal, 🟠 Alert, ⚫ Offline)
- Quick stats showing total poles, alerts, and device status
- Sort by ID, status, or voltage

### Pole Details
- Current sensor readings
- Location and coordinates
- 24-hour sensor history with timestamps
- Maintenance schedule and completion tracking

### Alert Management
- Real-time alert panel with severity indicators
- One-click alert resolution
- Alert history with timestamps
- Automatic alert creation based on thresholds

### Maintenance Tracking
- Schedule maintenance appointments
- Track maintenance type and status
- Historical maintenance records
- Completion logging

## Security

### Data Protection
- All poles and readings scoped by `userId` (no RLS, enforced at query level)
- HTTPS encryption in transit
- TLS 1.2+ for AWS IoT Core MQTT connections

### Authentication
- Email + password via Better Auth
- Secure session cookies
- CSRF protection built-in

### Device Security
- X.509 certificates for IoT devices
- Policy-based access control
- Device attestation via certificate pinning

## Monitoring & Alerts

### Alert Types
1. **Overcurrent** - Current exceeding 200A (normal) / 250A (critical)
2. **Power Loss** - Voltage drop below 50V
3. **Voltage Anomaly** - Voltage outside 180-240V range
4. **Overheating** - Temperature exceeding 80°C / 100°C
5. **Pole Tilt** - Structural lean > ±5° / ±10°
6. **Vibration** - Abnormal vibration > 10 / 15
7. **Offline** - Device not reporting for > 5 minutes

### Recommended Actions
- **Critical**: Immediate field inspection, circuit isolation if safe
- **High**: Schedule urgent maintenance, monitor closely
- **Medium**: Log event, schedule routine maintenance
- **Low**: Informational, monitor trend

## Future Enhancements

- [ ] Machine learning for predictive maintenance
- [ ] Mobile app for field technicians
- [ ] SMS/Email/Slack notifications
- [ ] Integration with SCADA systems
- [ ] Drone inspection scheduling
- [ ] Historical trend analysis dashboard
- [ ] Multi-user team roles and permissions
- [ ] Export reports (PDF/CSV)
- [ ] API authentication tokens for external integrations
- [ ] WebSocket real-time updates instead of polling

## Support & Resources

- AWS IoT Documentation: https://docs.aws.amazon.com/iot/latest/developerguide/
- Drizzle ORM: https://orm.drizzle.team/
- Better Auth: https://www.better-auth.com/
- Next.js: https://nextjs.org/docs
