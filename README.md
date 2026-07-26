# IoT Pole Defect Detection System

A comprehensive utility-scale power distribution pole monitoring system using IoT sensors, AWS IoT Core, and real-time cloud dashboarding.

## Features

- **Real-time Monitoring**: Live sensor data from current, voltage, temperature, tilt, and vibration sensors
- **Intelligent Alerting**: Automatic detection of overcurrent, power loss, overheating, structural damage, and offline devices
- **GPS Tracking**: Precise location identification and mapping of poles
- **Historical Analysis**: 24-hour, 7-day, and 30-day sensor history with trends
- **Maintenance Scheduling**: Built-in tracking and scheduling of maintenance tasks
- **AWS IoT Integration**: Production-grade MQTT communication with X.509 certificate security
- **Multi-user Support**: Role-based access with Better Auth email/password authentication
- **Responsive Dashboard**: Real-time status visualization with alert management

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd pole-monitoring-system
pnpm install
```

### 2. Set Environment Variables

```bash
# Generate a secure secret
openssl rand -base64 32

# Add to .env.local
BETTER_AUTH_SECRET=<your-generated-secret>
DATABASE_URL=<neon-postgres-url>
```

### 3. Database Setup

The database schema is automatically applied via Neon. Tables include:
- `poles` - Physical pole records
- `sensor_readings` - Time-series sensor data
- `alerts` - Fault notifications
- `maintenance_records` - Maintenance tracking
- `aws_iot_devices` - Device certificate management

### 4. Run Dev Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the dashboard.

### 5. Configure AWS IoT Core

Follow the detailed setup guide in [AWS_IOT_SETUP.md](./AWS_IOT_SETUP.md) to:
- Create IoT policies and certificates
- Configure MQTT rules engine
- Connect physical devices

## Architecture

```
┌─────────────────────────────┐
│   React Dashboard UI        │
│  Real-time Pole Status      │
│  Alert Management           │
│  Maintenance Scheduling     │
└──────────────┬──────────────┘
               │
┌──────────────┴──────────────┐
│  Next.js Backend            │
│  /api/iot/telemetry         │
│  Server Actions (Drizzle)   │
│  Better Auth Sessions       │
└──────────────┬──────────────┘
               │
      ┌────────┴────────┐
      │                 │
   ┌──▼──┐         ┌────▼────┐
   │Neon │         │AWS IoT  │
   │DB   │         │Core MQTT│
   └─────┘         └─────────┘
```

## Project Structure

```
app/
  api/
    auth/[...all]/route.ts      # Better Auth handler
    iot/telemetry/route.ts      # Telemetry ingestion endpoint
  actions/
    iot.ts                      # Server actions for CRUD
  dashboard/
    page.tsx                    # Main dashboard
    add-pole/page.tsx           # Pole registration
    poles/[id]/page.tsx         # Pole details
  sign-in/page.tsx              # Login page
  sign-up/page.tsx              # Registration page
  page.tsx                      # Landing page

components/
  dashboard/
    pole-map-dashboard.tsx      # Pole list/map view
    alert-panel.tsx             # Active alerts
    quick-stats.tsx             # KPI cards
    pole-detail.tsx             # Pole details page
    add-pole-form.tsx           # Registration form
  auth-form.tsx                 # Shared login/signup
  ui/                           # shadcn components

lib/
  auth.ts                       # Better Auth config
  auth-client.ts                # Browser auth client
  db/
    index.ts                    # Drizzle setup
    schema.ts                   # Database schema

documentation/
  IOT_SYSTEM.md                 # System architecture & setup
  AWS_IOT_SETUP.md              # AWS IoT Core guide
  API_REFERENCE.md              # Complete API docs
  README.md                     # This file
```

## Key Technologies

- **Frontend**: React 19, Next.js 16, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Server Actions, Drizzle ORM
- **Database**: Neon (PostgreSQL)
- **Authentication**: Better Auth
- **IoT Cloud**: AWS IoT Core (MQTT)
- **Sensors**: ESP32/STM32, Current Transformers, Temperature, Tilt, Vibration, GPS

## API Endpoints

### Public Endpoints

- `POST /api/iot/telemetry` - Receive sensor data from IoT devices

### Protected Endpoints (Server Actions)

**Poles**
- `createPole(data)` - Register new pole
- `getPoles()` - Get all poles
- `getPoleById(id)` - Get pole details
- `updatePoleStatus(id, status, data)` - Update pole state

**Sensors**
- `recordSensorReading(poleId, data)` - Store sensor data
- `getSensorReadings(poleId, hours)` - Get historical readings

**Alerts**
- `createAlert(data)` - Create alert
- `getActiveAlerts()` - Get unresolved alerts
- `resolveAlert(id)` - Mark alert resolved

**Maintenance**
- `scheduleMaintenance(data)` - Schedule maintenance
- `getMaintenanceRecords(poleId)` - Get maintenance history
- `completeMaintenance(id)` - Mark complete

See [API_REFERENCE.md](./API_REFERENCE.md) for complete documentation.

## Alert System

Alerts are automatically created based on sensor thresholds:

| Type | Threshold | Severity |
|------|-----------|----------|
| Overcurrent | >200A / >250A | high / critical |
| Power Loss | <50V | critical |
| Voltage | <180V or >240V | medium |
| Temperature | >80°C / >100°C | high / critical |
| Tilt | >±5° / >±10° | high / critical |
| Vibration | >10 / >15 | high / critical |

## Hardware Requirements

### Pole Monitoring Unit
- **Controller**: ESP32-S3 or STM32
- **Current Sensor**: Split-Core CT (100-200A)
- **Voltage Sensor**: Potential Transformer (PT)
- **Temperature**: DS18B20 sensor
- **Tilt**: MPU6050 accelerometer
- **Vibration**: Analog/I2C vibration sensor
- **GPS**: u-blox NEO-6M module

### Power & Communication
- **Solar Panel**: 20-50W
- **Battery**: 12V LiFePO₄ (for nighttime)
- **Communication**: SIM7600 (4G) or LoRa SX1276
- **Cloud**: AWS IoT Core with MQTT

## Deployment

### Local Development

```bash
pnpm install
pnpm dev
```

### Production (Vercel)

```bash
# Push to GitHub
git push origin main

# Vercel automatically deploys on push
# Or manually:
pnpm i -g vercel
vercel
```

**Environment Variables** (set in Vercel Dashboard):
- `DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Session signing secret (≥32 chars)

## Testing

### Test Telemetry Endpoint

```bash
curl -X POST http://localhost:3000/api/iot/telemetry \
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

### Test Server Actions

```typescript
// In Next.js component
import { createPole, getPoles } from '@/app/actions/iot'

const pole = await createPole({
  poleId: "POLE-001",
  latitude: 40.7128,
  longitude: -74.0060,
  location: "Downtown Grid A"
})

const allPoles = await getPoles()
```

## Monitoring & Alerts

### Alert Notifications (Future)
- Email alerts
- SMS notifications
- Slack/Teams integration
- Mobile push notifications

### Dashboard Monitoring
- Real-time status indicators (🟢🟠⚫)
- Active alert panel with one-click resolution
- Historical sensor charts
- Maintenance schedule tracking

## Security

### Authentication
- Email + password via Better Auth
- Session-based with secure cookies
- Password hashing with bcrypt

### Data Protection
- All data scoped by user ID (enforced at query level)
- HTTPS encryption in transit
- TLS 1.2+ for AWS IoT Core
- X.509 certificates for device authentication

### Compliance
- Row-level security at application level
- Secure credential storage in database
- No sensitive data in logs
- Device certificate rotation support

## Performance

### Optimization
- Server-side rendering for critical pages
- Incremental static regeneration
- Database query optimization with indexes
- Connection pooling via Drizzle/Neon

### Scaling
- Serverless architecture (scales automatically)
- Time-series data partitioning (optional)
- Redis caching for alerts (future)
- Webhook batching support

## Troubleshooting

### Database Connection Issues
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Auth Issues
```bash
# Verify BETTER_AUTH_SECRET is set
echo $BETTER_AUTH_SECRET

# Should be ≥32 characters
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
pnpm build
```

### IoT Telemetry Not Received
1. Verify AWS IoT device certificate is valid
2. Check AWS IoT Rules Engine configuration
3. Verify API endpoint is accessible
4. Check server logs for errors

## Roadmap

- [ ] Mobile app for field technicians
- [ ] SMS/Email/Slack notifications
- [ ] Machine learning for predictive maintenance
- [ ] SCADA system integration
- [ ] Drone inspection scheduling
- [ ] Advanced analytics dashboard
- [ ] Multi-user team roles
- [ ] PDF/CSV report export
- [ ] WebSocket real-time updates
- [ ] Offline mode for mobile app

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

MIT - See LICENSE file for details

## Support & Documentation

- **System Architecture**: See [IOT_SYSTEM.md](./IOT_SYSTEM.md)
- **AWS IoT Setup**: See [AWS_IOT_SETUP.md](./AWS_IOT_SETUP.md)
- **API Reference**: See [API_REFERENCE.md](./API_REFERENCE.md)
- **Better Auth Docs**: https://www.better-auth.com/
- **AWS IoT Docs**: https://docs.aws.amazon.com/iot/
- **Next.js Docs**: https://nextjs.org/docs

## Contact

For issues, questions, or suggestions, please open an GitHub issue or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2026-07-13  
**Status**: Production-Ready
