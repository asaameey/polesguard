# Supabase Database Setup for PolesGuard

## Connection Details

**Project ID:** `zmothpxrmkaasehcymij`  
**Project URL:** `https://zmothpxrmkaasehcymij.supabase.co`  
**Region:** us-east-1  
**Database Engine:** PostgreSQL 17

## Database Schema

The following tables have been created in your Supabase database:

### Core Tables

#### 1. `poles` - Pole Infrastructure Management
- `id` (PRIMARY KEY): Auto-incrementing identifier
- `pole_id` (UNIQUE): Unique identifier for the pole
- `location`: Address or location description
- `latitude`, `longitude`: GPS coordinates
- `status`: Current state (normal, warning, high, offline)
- `current_a`: AC current in amperes
- `voltage`: Voltage reading
- `temperature`: Environmental temperature (°C)
- `tilt_angle`: Structural tilt angle (degrees)
- `vibration`: Vibration magnitude
- `created_at`, `updated_at`, `last_seen`: Timestamps

#### 2. `devices` - Sensor Devices
- `id` (PRIMARY KEY): Auto-incrementing identifier
- `pole_id` (FOREIGN KEY): Reference to poles table
- `device_id` (UNIQUE): Hardware device identifier
- `device_name`: Human-readable device name
- `current_type`: AC or DC
- `sensitivity`, `battery_level`, `signal_strength`: Device metrics
- `controller_type`: Hardware controller (Arduino, STM32, etc.)
- `comm_type`: Communication protocol (LoRaWAN, 4G, WiFi)
- `firmware_version`: Device firmware
- `power_source`: Power supply type (Battery, Solar, AC)
- `device_latitude`, `device_longitude`: GPS from device
- `is_online`: Current connectivity status
- `last_online_at`: Last successful connection
- `created_at`, `updated_at`: Timestamps

#### 3. `current_readings` - Sensor Data
- `id` (PRIMARY KEY): Auto-incrementing identifier
- `device_id` (FOREIGN KEY): Reference to devices table
- `current_value`: Current measurement (A)
- `voltage`: Voltage measurement (V)
- `temperature`: Temperature (°C)
- `tilt_angle`: Tilt angle (degrees)
- `vibration`: Vibration magnitude
- `battery_voltage`: Device battery voltage
- `signal_strength`: Signal quality (dBm)
- `timestamp`: Reading timestamp
- `anomaly_detected`: Boolean flag for anomalies
- `anomaly_type`: Type of anomaly detected

#### 4. `sensor_thresholds` - Alert Thresholds
- `id` (PRIMARY KEY): Auto-incrementing identifier
- `device_id` (FOREIGN KEY): Reference to devices table
- `current_type`: AC or DC
- `high_current_threshold`: High alarm threshold (A)
- `low_current_threshold`: Low alarm threshold (A)
- `normal_baseline`: Expected normal value
- `anomaly_duration_minutes`: Duration to trigger alert
- `rapid_fluctuation_percent`: Fluctuation percentage
- `tilt_threshold_degrees`: Tilt alert threshold (°)
- `temperature_threshold_c`: Temperature alert (°C)
- `vibration_threshold`: Vibration alert threshold
- `voltage_outage_threshold`: Voltage alert threshold (V)
- `enabled`: Enable/disable thresholds
- `created_at`, `updated_at`: Timestamps

#### 5. `defects` - Incident Records
- `id` (PRIMARY KEY): Auto-incrementing identifier
- `device_id` (FOREIGN KEY): Reference to devices table
- `pole_id` (FOREIGN KEY): Reference to poles table
- `anomaly_type`: Type of defect (high_current, overheating, structural_damage, etc.)
- `severity`: low, medium, or high
- `current_value`: Value that triggered the defect
- `description`: Detailed description
- `reported_at`: When the defect was detected
- `resolved_at`: When the defect was resolved

#### 6. `alerts` - Alert Management
- `id` (PRIMARY KEY): Auto-incrementing identifier
- `defect_id` (FOREIGN KEY): Reference to defects table
- `severity`: Alert severity level
- `status`: pending, acknowledged, or resolved
- `acknowledged_at`: When the alert was acknowledged
- `resolved_at`: When the alert was resolved
- `created_at`: Alert creation timestamp

#### 7. `operator_settings` - User Preferences
- `id` (PRIMARY KEY): Auto-incrementing identifier
- `user_id`: Reference to auth user
- `high_current_alert`, `low_current_alert`, `temperature_alert`, `tilt_alert`, `vibration_alert`, `offline_alert`: Alert preferences
- `alert_threshold_minutes`: Delay before triggering alert
- `created_at`, `updated_at`: Timestamps

### Indexes

Performance indexes have been created on:
- `devices.pole_id` - For finding devices by pole
- `devices.device_id` - For finding devices by ID
- `current_readings.device_id` - For finding readings by device
- `current_readings.timestamp` - For time-range queries
- `defects.pole_id`, `defects.device_id` - For tracking defects
- `alerts.defect_id`, `alerts.status` - For alert queries
- `poles.latitude, longitude` - For geographic queries

## Multi-Channel Sensor Data

The system supports monitoring multiple sensor channels per device:

1. **Current**: AC/DC current flow (Amperes)
2. **Voltage**: AC/DC voltage (Volts)
3. **Temperature**: Environmental temperature (°C)
4. **Tilt/Angle**: Structural tilt (degrees)
5. **Vibration**: Vibration magnitude
6. **Battery**: Device battery voltage
7. **Signal**: LoRaWAN/cellular signal strength (dBm)

## API Integration

### Receiving Sensor Data

**Endpoint:** `POST /api/sensor-reading`

**Request Format:**
```json
{
  "deviceId": 123,
  "currentValue": 15.5,
  "voltage": 230,
  "temperature": 45.2,
  "tiltAngle": 3.5,
  "vibration": 1.2,
  "batteryVoltage": 3.2,
  "signalStrength": -85,
  "timestamp": "2026-07-26T15:00:00Z"
}
```

All fields except `deviceId` and `currentValue` are optional. New sensor readings are automatically stored and analyzed for anomalies.

## Anomaly Detection Rules

The system automatically detects and alerts on:

1. **High Current**: When current > high_current_threshold
2. **Low Current**: When current < low_current_threshold
3. **Overheating**: When temperature > temperature_threshold_c
4. **Structural Damage**: When tilt_angle > tilt_threshold_degrees
5. **Excessive Vibration**: When vibration > vibration_threshold
6. **Voltage Issues**: When voltage < voltage_outage_threshold
7. **Device Offline**: When no readings for 30+ minutes
8. **Rapid Fluctuation**: When current changes > rapid_fluctuation_percent between readings

## Authentication

Supabase authentication is integrated via:
- **Email + Password** authentication
- **Magic links** for passwordless sign-in (optional)
- **Session management** with automatic token refresh
- **Row Level Security (RLS)** for data protection

User accounts are stored in the `auth.users` table managed by Supabase Auth.

## Environment Variables

Add these to your `.env.local` or v0 project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://zmothpxrmkaasehcymij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

Get these keys from the Supabase dashboard:
1. Go to [Supabase Console](https://app.supabase.com)
2. Select the project `supabase-chestnut-lantern`
3. Navigate to Settings > API Keys
4. Copy the `anon` public key and service role key

## Data Persistence

All sensor data is permanently stored in PostgreSQL for:
- Historical trend analysis
- Incident investigation
- Performance optimization
- Compliance and auditing

## Next Steps

1. **Configure Auth Keys**: Add Supabase environment variables to your v0 project
2. **Register Poles**: Create pole infrastructure records
3. **Register Devices**: Add sensor devices and assign to poles
4. **Set Thresholds**: Configure alert thresholds per device
5. **Start Monitoring**: Begin sending sensor data via the API

## Support

For Supabase documentation, visit: https://supabase.com/docs
For PolesGuard API documentation, see: [SENSOR_API.md](./SENSOR_API.md)
