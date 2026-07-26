# IoT Pole Defect Detection System - Complete Documentation

## 🚀 System Live!

**Production URL**: https://v0-project-iota-sage.vercel.app

---

## 📚 Documentation Files

### Getting Started
1. **[QUICK_START.md](./QUICK_START.md)** - **START HERE**
   - 5-minute system test
   - AWS IoT Core setup (20 min)
   - Device firmware example
   - Live data monitoring
   - Troubleshooting guide

2. **[README.md](./README.md)**
   - Project overview
   - Tech stack
   - Features list
   - Installation for local development

### Deployment & Infrastructure

3. **[DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md)**
   - ✅ Production status
   - Live URLs and endpoints
   - Environment variables verified
   - Next steps for production
   - Cost analysis

4. **[DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)**
   - Pre-deployment checklist
   - Environment setup
   - Database verification
   - Security configuration

### System Architecture

5. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
   - System diagrams
   - Data flows
   - Component relationships
   - Technology stack visualization
   - Security model

6. **[IOT_SYSTEM.md](./IOT_SYSTEM.md)**
   - Complete system design
   - Hardware specifications
   - Firmware examples (ESP32/STM32)
   - Sensor integration guide
   - Power and communication options

### AWS IoT Integration

7. **[AWS_IOT_SETUP.md](./AWS_IOT_SETUP.md)**
   - AWS IoT Core configuration
   - Certificate creation
   - Policy setup
   - Device provisioning
   - Testing and debugging
   - Lambda function examples

### API & Development

8. **[API_REFERENCE.md](./API_REFERENCE.md)**
   - Complete API endpoints
   - Authentication flows
   - Request/response examples
   - Error handling
   - Rate limiting
   - WebSocket real-time updates

### Implementation Details

9. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)**
   - What was built
   - Code organization
   - Key features
   - Technology decisions
   - Testing approach

---

## 🎯 Quick Navigation

### I want to...

**Get the system running**
→ [QUICK_START.md](./QUICK_START.md)

**Understand the architecture**
→ [ARCHITECTURE.md](./ARCHITECTURE.md)

**Deploy to production**
→ [DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md)

**Set up AWS IoT**
→ [AWS_IOT_SETUP.md](./AWS_IOT_SETUP.md)

**Write firmware**
→ [IOT_SYSTEM.md](./IOT_SYSTEM.md)

**Call the API**
→ [API_REFERENCE.md](./API_REFERENCE.md)

**Understand implementation**
→ [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## 📊 System Overview

### What's Deployed

```
┌─────────────────────────────────────────┐
│   Production System (Vercel)            │
│   https://v0-project-iota-sage.vercel.app
├─────────────────────────────────────────┤
│                                         │
│  Frontend        Backend        Database
│  ─────────       ─────────      ────────
│  React 19        Next.js 16     Neon
│  Tailwind        Node.js        PostgreSQL
│  shadcn/ui       Drizzle        Time-series
│                  Auth: Better    optimized
│                  
│  Dashboard       API Routes
│  └─ Monitoring   ├─ GET /poles
│  └─ Admin        ├─ POST /poles
│  └─ Maintenance  ├─ GET /alerts
│  └─ Map View     ├─ POST /alerts
│                  ├─ POST /telemetry
│                  └─ Auth endpoints
└─────────────────────────────────────────┘
       ↕
    ↕  MQTT  ↕
       ↕
   AWS IoT Core
   (Device broker)
```

### IoT Device Flow

```
ESP32/STM32 Device
    │
    ├─ Read Sensors (every 60s)
    │  ├─ Current (CT sensor)
    │  ├─ Voltage (PT)
    │  ├─ Temperature (DS18B20)
    │  ├─ Tilt (MPU6050)
    │  ├─ Vibration (Piezo)
    │  └─ GPS (u-blox)
    │
    ├─ Validate vs Thresholds
    │  ├─ If overcurrent → flag alert
    │  ├─ If voltage low → flag alert
    │  └─ ...etc
    │
    ├─ Publish to AWS IoT
    │  └─ Topic: pole-monitor/telemetry
    │
    └─ AWS Lambda → Webhook
       └─ POST /api/iot/telemetry
          ├─ Save sensor readings
          ├─ Generate alerts if needed
          ├─ Update pole status
          └─ Response: 200 OK
```

---

## 🔐 Security & Authentication

### User Authentication
- Email + password via Better Auth
- Secure session cookies (sameSite, secure)
- Password hashing (bcrypt)

### IoT Device Authentication
- X.509 certificates (AWS IoT Core)
- MQTT TLS/SSL encryption
- Device-specific policies

### Database Security
- Connection pooling via pg
- SQL injection prevention (parameterized queries)
- User-scoped data isolation

---

## 📈 Features Implemented

### Dashboard
- ✅ Real-time pole status indicators
- ✅ Quick stats (total, normal, alert, offline, critical)
- ✅ Pole list with search/filter
- ✅ Pole detail view with charts
- ✅ Alert panel with severity badges

### Admin Panel
- ✅ Device management
- ✅ Alert threshold configuration
- ✅ System health metrics
- ✅ User management (future)

### Maintenance Tracking
- ✅ Schedule maintenance tasks
- ✅ Track status (scheduled/in-progress/completed)
- ✅ Assign technicians (future)
- ✅ Export reports (future)

### IoT Integration
- ✅ MQTT telemetry ingestion
- ✅ Automatic alert generation
- ✅ Threshold-based fault detection
- ✅ 7 alert types (overcurrent, voltage, temperature, tilt, vibration, offline)
- ✅ 4 severity levels (low, medium, high, critical)

### Data Analysis
- ✅ 24-hour sensor history
- ✅ 7-day trending
- ✅ 30-day trends
- ✅ Export to CSV (future)

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16.2.6
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 4.2.0
- **Components**: shadcn/ui
- **State**: Server actions + SWR

### Backend
- **Runtime**: Node.js (Vercel Serverless)
- **Framework**: Next.js API routes
- **Auth**: Better Auth 1.6.23
- **ORM**: Drizzle 0.45.2
- **Database**: PostgreSQL (Neon)

### IoT
- **Protocol**: MQTT
- **Broker**: AWS IoT Core
- **Client**: mqtt 5.15.2
- **Webhook**: REST API

### Infrastructure
- **Hosting**: Vercel
- **Database**: Neon PostgreSQL
- **IoT**: AWS IoT Core
- **CDN**: Vercel Edge Network

---

## 📝 Documentation Checklist

- ✅ QUICK_START.md - Getting started guide
- ✅ DEPLOYMENT_COMPLETE.md - Live system status
- ✅ ARCHITECTURE.md - System diagrams
- ✅ IOT_SYSTEM.md - Hardware & firmware
- ✅ AWS_IOT_SETUP.md - AWS configuration
- ✅ API_REFERENCE.md - Complete API docs
- ✅ README.md - Project overview
- ✅ IMPLEMENTATION_SUMMARY.md - What was built
- ✅ DEPLOYMENT_READY.md - Pre-deployment checklist
- ✅ DOCS_INDEX.md - This file

---

## 🚀 Next Steps

1. **Test the system**: [QUICK_START.md](./QUICK_START.md)
2. **Configure AWS IoT**: [AWS_IOT_SETUP.md](./AWS_IOT_SETUP.md)
3. **Deploy firmware**: [IOT_SYSTEM.md](./IOT_SYSTEM.md)
4. **Start monitoring**: Dashboard at live URL
5. **Scale production**: Add more poles and devices

---

## 📞 Support Resources

- **Live System**: https://v0-project-iota-sage.vercel.app
- **GitHub**: [Your repository]
- **Issues**: GitHub issues
- **Docs**: All markdown files in this directory

---

## 📄 File Sizes

| File | Lines | Size |
|------|-------|------|
| QUICK_START.md | 370 | 12KB |
| API_REFERENCE.md | 600 | 18KB |
| ARCHITECTURE.md | 440 | 14KB |
| IOT_SYSTEM.md | 400 | 13KB |
| AWS_IOT_SETUP.md | 407 | 15KB |
| DEPLOYMENT_COMPLETE.md | 274 | 11KB |
| README.md | 373 | 12KB |
| **Total** | **2,864** | **95KB** |

---

## 📋 Deployment Status

| Component | Status | Details |
|-----------|--------|---------|
| Frontend | ✅ Live | Vercel, auto-scaling |
| Backend | ✅ Live | Node.js serverless |
| Database | ✅ Connected | Neon PostgreSQL |
| Auth | ✅ Active | Better Auth configured |
| API | ✅ Active | 10+ endpoints |
| AWS IoT | ⏳ Ready | Awaiting device config |

---

Last Updated: July 13, 2026  
System Status: **PRODUCTION READY** ✅
