# IoT Pole Monitoring System - Architecture Diagrams

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    IoT POLE MONITORING SYSTEM                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Dashboard   │  │   Auth Flow  │  │  Pole Detail │          │
│  │  (Real-time) │  │  (Sign-in)   │  │  (History)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│       React Components with TypeScript                           │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴─────────────────────────────────────┐
│                    API & APPLICATION LAYER                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js Server Components                   │   │
│  │  - Server Actions (getUser, createPole, getAlerts)      │   │
│  │  - Route Handlers (/api/iot/telemetry, /api/auth)       │   │
│  │  - Middleware (auth, CORS)                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Drizzle ORM Query Layer                       │   │
│  │  - Type-safe database queries                           │   │
│  │  - Connection pooling                                   │   │
│  │  - Prepared statements                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴─────────────────────────────────────┐
│                    DATA LAYER                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Neon PostgreSQL Database                        │   │
│  │                                                          │   │
│  │  Core Tables:                                           │   │
│  │  - poles (GPS locations, current status)               │   │
│  │  - sensor_readings (time-series data)                  │   │
│  │  - alerts (fault notifications)                        │   │
│  │  - maintenance_records (service history)               │   │
│  │  - aws_iot_devices (certificate management)            │   │
│  │                                                          │   │
│  │  Auth Tables (Better Auth):                            │   │
│  │  - user, session, account, verification                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴─────────────────────────────────────┐
│                    IOT INTEGRATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            AWS IoT Core (MQTT Broker)                   │   │
│  │                                                          │   │
│  │  - Device Certificate Management                        │   │
│  │  - Message Publishing/Subscription                      │   │
│  │  - Rules Engine for Routing                             │   │
│  │  - Shadow Service for State Sync                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴─────────────────────────────────────┐
│                    FIELD DEVICES LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Pole #1      │  │ Pole #2      │  │ Pole #N      │           │
│  │ (ESP32-S3)   │  │ (ESP32-S3)   │  │ (ESP32-S3)   │           │
│  │              │  │              │  │              │           │
│  │ ├─CT (200A)  │  │ ├─CT (200A)  │  │ ├─CT (200A)  │           │
│  │ ├─PT         │  │ ├─PT         │  │ ├─PT         │           │
│  │ ├─Temp       │  │ ├─Temp       │  │ ├─Temp       │           │
│  │ ├─Tilt       │  │ ├─Tilt       │  │ ├─Tilt       │           │
│  │ ├─Vibration  │  │ ├─Vibration  │  │ ├─Vibration  │           │
│  │ ├─GPS        │  │ ├─GPS        │  │ ├─GPS        │           │
│  │ └─4G/LoRa    │  │ └─4G/LoRa    │  │ └─4G/LoRa    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow - Telemetry Ingestion

```
IoT Device (Pole)
    │
    │ MQTT Publish
    │ Topic: $aws/things/pole-001/shadow/update
    ▼
AWS IoT Core
    │
    │ Match Rule
    │ SQL: SELECT * FROM "$aws/things/+/shadow/update"
    ▼
AWS Rules Engine
    │
    │ HTTP Action
    │ Target: /api/iot/telemetry
    ▼
Next.js API Handler
    │
    ├─ Parse JSON payload
    │
    ├─ Validate required fields
    │
    ├─ Look up Pole by poleId
    │
    ├─ Insert sensor_readings
    │
    ├─ Check thresholds:
    │  ├─ Current > 200A? → Create alert
    │  ├─ Voltage < 50V? → Create alert
    │  ├─ Temp > 80°C? → Create alert
    │  ├─ Tilt > ±5°? → Create alert
    │  └─ Vibration > 10? → Create alert
    │
    ├─ Update pole status
    │
    ├─ Revalidate dashboard cache
    │
    └─ Return success response
        ▼
    Database Updated
    Dashboard Shows New Data
```

## Data Models & Relationships

```
┌─────────────────────────────────────────────────────────┐
│                    Database Schema                      │
└─────────────────────────────────────────────────────────┘

    USER (Better Auth)
      │ id (PK)
      ├─ email
      ├─ emailVerified
      └─ name
           │
           ├─ 1:N ─────► POLES
           │              │ id (PK)
           │              ├─ poleId (unique)
           │              ├─ latitude, longitude
           │              ├─ status (normal|alert|offline)
           │              ├─ voltage, currentA, temperature
           │              └─ lastSeen
           │                   │
           │                   ├─ 1:N ─────► SENSOR_READINGS
           │                   │              │ id (PK)
           │                   │              ├─ current_A
           │                   │              ├─ voltage_V
           │                   │              ├─ temperature_C
           │                   │              ├─ tilt_degrees
           │                   │              ├─ vibration_level
           │                   │              └─ timestamp
           │                   │
           │                   ├─ 1:N ─────► ALERTS
           │                   │              │ id (PK)
           │                   │              ├─ alertType
           │                   │              ├─ severity
           │                   │              ├─ status (active|resolved)
           │                   │              ├─ value, threshold
           │                   │              └─ createdAt
           │                   │
           │                   ├─ 1:N ─────► MAINTENANCE_RECORDS
           │                   │              │ id (PK)
           │                   │              ├─ maintenanceType
           │                   │              ├─ status (scheduled|completed)
           │                   │              ├─ scheduledDate
           │                   │              └─ completedDate
           │                   │
           │                   └─ 1:N ─────► AWS_IOT_DEVICES
           │                                  │ id (PK)
           │                                  ├─ deviceName (unique)
           │                                  ├─ certificateArn
           │                                  ├─ publicKey, privateKey
           │                                  └─ status
           │
           └─ 1:N ─────► SESSION (Better Auth)
                         │ id (PK)
                         ├─ token
                         ├─ expiresAt
                         └─ ipAddress
```

## Request/Response Flow - Create Pole

```
CLIENT                          SERVER                          DATABASE
  │                                │                                │
  ├─ Sign-in Required ──────────────► check session                │
  │                                │                                │
  ├─ Fill Form                      │                                │
  │ - Pole ID: POLE-001            │                                │
  │ - Lat: 40.7128                 │                                │
  │ - Long: -74.0060               │                                │
  └─ Submit ───────────────────────► createPole()                   │
                                    │                                │
                                    ├─ getUserId()                   │
                                    │ (from session)                 │
                                    │                                │
                                    ├─ Validate inputs              │
                                    │ (lat/long bounds)             │
                                    │                                │
                                    ├─ INSERT INTO poles ───────────► CREATE pole
                                    │ (userId, poleId,               │
                                    │  latitude, longitude)          │
                                    │                                │
                                    ├─ revalidatePath()             │
                                    │ (update dashboard cache)      │
                                    │                                │
  ◄─ Redirect /dashboard ◄─────────┤ return pole object            │
  │                                │                                │
  └─ Show success message          │                                │
     Pole appears in list          │                                │
```

## Alert Decision Tree

```
Telemetry Received
    │
    ├─ currentA?
    │   ├─ > 250A? ─────────► Create CRITICAL alert "Overcurrent"
    │   └─ > 200A? ─────────► Create HIGH alert "Overcurrent Warning"
    │
    ├─ voltageV?
    │   ├─ < 50V? ──────────► Create CRITICAL alert "Power Loss"
    │   ├─ < 180V or > 240V?─► Create MEDIUM alert "Voltage Anomaly"
    │
    ├─ temperatureC?
    │   ├─ > 100°C? ────────► Create CRITICAL alert "Severe Overheating"
    │   └─ > 80°C? ─────────► Create HIGH alert "High Temperature"
    │
    ├─ tiltDegrees?
    │   ├─ > ±10°? ─────────► Create CRITICAL alert "Pole Fallen/Severe Tilt"
    │   └─ > ±5°? ──────────► Create HIGH alert "Structural Tilt"
    │
    ├─ vibrationLevel?
    │   ├─ > 15? ───────────► Create CRITICAL alert "Severe Vibration"
    │   └─ > 10? ───────────► Create HIGH alert "High Vibration"
    │
    └─ Update pole status
        └─ alerts created? ─► status = "alert"
           └─ no alerts? ───► status = "normal"
```

## Authentication Flow

```
UNAUTHENTICATED USER
    │
    ├─ Visit localhost:3000
    │
    ├─ Redirect to /sign-in
    │
    ├─ Enter email + password
    │
    ├─ Submit ──────► authClient.signIn.email()
    │                     │
    │                     ├─ POST /api/auth/signin
    │                     │
    │                     ├─ Verify credentials with bcrypt
    │                     │
    │                     ├─ Create session token
    │                     │
    │                     └─ Set cookie: better-auth
    │
    ├─ Redirect to /dashboard
    │
    ├─ Middleware checks cookie
    │
    ├─ auth.api.getSession() retrieves user
    │
    └─ Render authenticated page
        │
        └─ Server Actions now accessible
           ├─ Can call getPoles()
           ├─ Can call createPole()
           └─ userId automatically scoped

AUTHENTICATED USER
    │
    ├─ All queries scoped by userId
    │
    ├─ Cannot access other users' data
    │
    └─ Session expires after inactivity
        └─ Redirect to /sign-in
```

## Performance & Scalability

```
Single User (1 pole):
    - Response time: < 100ms
    - DB queries: 2-3 per request
    - Storage: ~1KB per sensor reading

Scaling to 100 Poles:
    - Response time: < 200ms
    - Queries optimized with indexes
    - Storage: ~30MB per day
    - Add: ReadReplica or Caching

Scaling to 10,000 Poles:
    - Response time: 200-500ms
    - Implement: Time-series partitioning
    - Add: Redis for active alerts cache
    - Add: CloudFront CDN for dashboard
    - Batch telemetry: 100 readings → 1 request

Scaling to 100,000+ Poles:
    - Multi-region deployment
    - Database sharding by region
    - Message queue (SNS/SQS) for reliability
    - Lambda for background processing
    - DynamoDB for real-time cache
```

## Deployment Architecture

```
GitHub Repository
    │
    ├─ Push to main branch
    │
    ▼
Vercel (Continuous Deployment)
    │
    ├─ Build Next.js app
    ├─ Run TypeScript checks
    ├─ Deploy to edge network
    │
    ▼
Global Edge Network (Vercel)
    │
    ├─ Serve frontend (cached)
    ├─ Route API requests to serverless functions
    ├─ Auto-scale based on traffic
    │
    ▼
Database Layer
    │
    ├─ Neon PostgreSQL
    ├─ Connection pooling
    ├─ Automatic backups
    │
    ▼
AWS IoT Core
    │
    ├─ MQTT broker (managed)
    ├─ Rules engine
    ├─ Device certificates
    │
    └─ Routes telemetry → /api/iot/telemetry → Vercel → Neon
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                        │
└─────────────────────────────────────────────────────────┘

Layer 1: Transport Security
    ├─ HTTPS/TLS 1.2+ (enforced)
    ├─ HSTS headers
    └─ Certificate pinning for AWS IoT

Layer 2: Authentication
    ├─ Email + password (bcrypt hashed)
    ├─ Session tokens (secure cookies)
    ├─ Token expiration (24h default)
    └─ Device certificates (X.509)

Layer 3: Authorization
    ├─ User ID scoping on all queries
    ├─ Row-level access control
    ├─ Server-side session validation
    └─ API rate limiting (per IP/user)

Layer 4: Data Protection
    ├─ Encrypted at rest (Neon)
    ├─ Encrypted in transit (TLS)
    ├─ No sensitive data in logs
    └─ Secure credential storage

Layer 5: API Security
    ├─ CORS configuration
    ├─ CSRF protection
    ├─ Input validation
    └─ SQL injection prevention (Drizzle ORM)

Layer 6: Infrastructure
    ├─ Serverless (no server management)
    ├─ DDoS protection (Vercel)
    ├─ WAF (optional add-on)
    └─ Backup & disaster recovery
```

## Monitoring & Observability

```
Application Metrics
    │
    ├─ Request latency (p50, p95, p99)
    ├─ Error rates (4xx, 5xx)
    ├─ Active alerts count
    ├─ Devices online/offline
    └─ API response times

Database Metrics
    │
    ├─ Query latency
    ├─ Connection pool usage
    ├─ Storage size
    ├─ Disk I/O
    └─ Slow query log

AWS IoT Metrics
    │
    ├─ MQTT connections
    ├─ Messages published/received
    ├─ Rules engine triggers
    └─ Certificate expiration

Logging
    │
    ├─ Application logs (stdout)
    ├─ Error tracking (Sentry)
    ├─ Audit logs (auth events)
    └─ CloudWatch logs (AWS)
```

---

**Last Updated**: 2026-07-13  
**Version**: 1.0.0
