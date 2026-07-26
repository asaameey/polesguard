# IoT Pole Defect Detection - Quick Start Guide

## System Is Now Live! 🚀

Your production IoT pole monitoring system is deployed at:
- **Primary**: https://v0-project-iota-sage.vercel.app
- **Backup**: https://v0-project-clmzgvzwz-abu-saameeys-projects.vercel.app

## 1. Test the System (2 minutes)

### Create Your First Account

1. Go to https://v0-project-iota-sage.vercel.app
2. Click "Sign Up"
3. Enter email: `test@example.com`
4. Enter password: `SecurePassword123!`
5. Click "Create Account"

### Register a Test Pole

1. From dashboard, click **"+ Add Pole"**
2. Fill in the form:
   - **Pole ID**: POLE-TEST-001
   - **Latitude**: 40.7128
   - **Longitude**: -74.0060
   - **Location**: Manhattan, NY
3. Click "Create Pole"
4. See it appear in the dashboard with 🟢 Normal status

### View Pole Details

1. Click on the pole in the list
2. See sensor readings (currently empty)
3. View alert history (none yet)
4. See maintenance tracker

## 2. Configure AWS IoT Core (20 minutes)

### A. Create AWS IoT Thing

```bash
# In AWS Console > IoT Core > Manage > Things
1. Create new thing
2. Name: pole-test-001-device
3. Device type: Thing
4. Create
```

### B. Create Certificate & Policy

```bash
# In AWS Console > IoT Core > Certificates
1. Click "Create certificate"
2. Choose "Create with demo certificate"
3. Download:
   - Certificate (public key)
   - Public key file
   - Private key
   - CA certificate
4. Activate certificate
```

### C. Create MQTT Policy

```bash
# In AWS Console > IoT Core > Policies
1. Create policy named: PoleMonitorPolicy
2. Add statement:
   {
     "Effect": "Allow",
     "Action": "iot:*",
     "Resource": "*"
   }
3. Attach to your certificate
```

### D. Get AWS IoT Endpoint

```bash
# In AWS Console > Settings
1. Copy your AWS IoT endpoint (looks like: xxxxx.iot.us-east-1.amazonaws.com)
2. Save for device firmware
```

## 3. Deploy Device Firmware (30 minutes)

### For ESP32

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "xxxxx.iot.us-east-1.amazonaws.com";
const int mqtt_port = 8883;

// AWS IoT certificates (paste your downloaded certs)
const char* ca_cert = "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----\n";
const char* client_cert = "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----\n";
const char* private_key = "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n";

WiFiClientSecure espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  // Configure TLS
  espClient.setCACert(ca_cert);
  espClient.setCertificate(client_cert);
  espClient.setPrivateKey(private_key);
  
  // Connect to MQTT
  client.setServer(mqtt_server, mqtt_port);
  while (!client.connected()) {
    client.connect("pole-test-001-device");
    delay(500);
  }
}

void loop() {
  // Read sensors
  float current = readCurrentSensor();
  float voltage = readVoltageSensor();
  float temperature = readTempSensor();
  float tilt = readTiltSensor();
  float vibration = readVibrationSensor();
  float latitude = readGPS_Lat();
  float longitude = readGPS_Long();
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["deviceName"] = "pole-test-001-device";
  doc["poleId"] = "POLE-TEST-001";
  doc["current_A"] = current;
  doc["voltage_V"] = voltage;
  doc["temperature_C"] = temperature;
  doc["tilt_degrees"] = tilt;
  doc["vibration_level"] = vibration;
  
  // Publish to AWS IoT
  char buffer[256];
  serializeJson(doc, buffer);
  client.publish("pole-monitor/telemetry", buffer);
  
  delay(60000); // Send every 60 seconds
}

// Sensor reading functions
float readCurrentSensor() {
  // Read from Split-Core CT via ADC
  int raw = analogRead(A0);
  return (raw / 4095.0) * 300.0; // Scale to 0-300A
}

float readVoltageSensor() {
  // Read from Potential Transformer
  int raw = analogRead(A1);
  return (raw / 4095.0) * 300.0; // Scale to 0-300V
}

float readTempSensor() {
  // Read from DS18B20 or similar
  // Implementation depends on your sensor library
  return 25.0; // Placeholder
}

float readTiltSensor() {
  // Read from accelerometer (MPU6050 or similar)
  // Calculate angle from acceleration
  return 0.5; // Placeholder
}

float readVibrationSensor() {
  // Read vibration level from piezo/MEMS sensor
  return 2.1; // Placeholder
}

float readGPS_Lat() {
  // Read from GPS module
  return 40.7128; // Placeholder
}

float readGPS_Long() {
  // Read from GPS module
  return -74.0060; // Placeholder
}
```

### Flash to Device

```bash
# Using Arduino IDE
1. Select Board: ESP32-S3 (or your board)
2. Select Port: /dev/ttyUSB0 (or COM port)
3. Upload Sketch
4. Monitor serial output at 115200 baud
```

## 4. Register Device in Dashboard

### Via Admin Panel

1. Go to `/dashboard/admin`
2. Click "Add Device"
3. Fill in:
   - **Device Name**: pole-test-001-device
   - **Pole ID**: POLE-TEST-001 (select from dropdown)
   - **Certificate ARN**: (from AWS console)
   - **Public Key**: (paste contents of public key file)
4. Click "Save Device"

### Or via API

```bash
curl -X POST https://v0-project-iota-sage.vercel.app/api/iot/devices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "deviceName": "pole-test-001-device",
    "poleId": "POLE-TEST-001",
    "certificateArn": "arn:aws:iot:us-east-1:123456789:cert/xxx",
    "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
  }'
```

## 5. Monitor Live Data (Real-time)

### Watch Data Flow

1. **Refresh dashboard every 60 seconds** (device sends every 60s)
2. **Check "Quick Stats"** - should show last reading timestamp
3. **Click pole** - view live sensor values
4. **Charts update** - 24-hour history builds up
5. **Alerts trigger** - when thresholds are exceeded

### Example: Overcurrent Alert

If device reads 250A (exceeds 200A threshold):
1. Alert created automatically
2. Severity: HIGH
3. Appears in alert panel (red badge)
4. Pole status changes to 🔴 ALERT
5. Quick stats show "+1 Alert"

## 6. Configure Alert Thresholds

### Edit Thresholds

1. Go to `/dashboard/admin`
2. Scroll to "Alert Thresholds"
3. Adjust values:
   - Overcurrent: 200A → (e.g., 180A)
   - Voltage: 200V → (e.g., 210V)
   - Temperature: 60°C → (e.g., 55°C)
   - Tilt: 5° → (e.g., 3°)
4. Click "Update Thresholds"

### Thresholds Apply Immediately

- New alerts use updated thresholds
- Existing alerts unaffected
- Each pole can have custom thresholds (future enhancement)

## 7. Schedule Maintenance

### Create Maintenance Task

1. Go to `/dashboard/maintenance`
2. Click "Schedule Maintenance"
3. Fill in:
   - **Pole**: Select from dropdown
   - **Type**: Inspection / Repair / Replacement / Cleaning
   - **Description**: Loose connector at base
   - **Scheduled Date**: 2026-07-20
4. Click "Schedule"

### Track Progress

1. View in Maintenance tracker
2. Update status: Scheduled → In Progress → Completed
3. Mark completed with timestamp
4. Export reports for compliance

## 8. Troubleshooting

### Device Not Sending Data?

**Check AWS IoT Core:**
```bash
# In AWS Console > Test > MQTT Test Client
1. Subscribe to: pole-monitor/telemetry
2. Check if messages arrive every 60 seconds
3. If not, check device logs
```

**Check Device Logs:**
```bash
# Via Serial Monitor in Arduino IDE
1. Set baud rate to 115200
2. Look for WiFi connection messages
3. Look for AWS IoT connection status
4. Check sensor readings
```

### Dashboard Not Updating?

1. Check network connection
2. Verify API endpoint is responding:
   ```bash
   curl https://v0-project-iota-sage.vercel.app/api/iot/telemetry
   # Should return 400 (requires POST data)
   ```
3. Check browser console for errors (F12)

### Database Connection Issues?

1. Verify DATABASE_URL in Vercel settings
2. Test Neon connection:
   ```bash
   psql $DATABASE_URL -c "SELECT * FROM poles LIMIT 1;"
   ```
3. Check Neon dashboard for connection limits

## Next Steps

### Production Deployment

1. Register all utility poles in your network
2. Deploy firmware to all Pole Monitoring Units
3. Configure alert thresholds for your environment
4. Set up maintenance schedule
5. Enable notifications (future enhancement)

### Advanced Features

See `ARCHITECTURE.md` for:
- Custom alert rules
- Machine learning anomaly detection
- Mobile app integration
- Historical data export
- Predictive maintenance

### Support

- **API docs**: `API_REFERENCE.md`
- **System design**: `IOT_SYSTEM.md`
- **AWS setup**: `AWS_IOT_SETUP.md`
- **Architecture**: `ARCHITECTURE.md`

## Summary

You now have:
✅ Live production system  
✅ User authentication  
✅ Pole registration  
✅ Device management  
✅ Real-time monitoring  
✅ Alert system  
✅ Maintenance tracking  

**Next**: Deploy firmware and start monitoring poles!
