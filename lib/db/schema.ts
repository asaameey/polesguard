import { pgTable, text, timestamp, boolean, serial, integer, doublePrecision } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Add your app tables below. Always include a plain `userId` column so queries
// can be scoped per user — the security model depends on this column existing,
// not on a foreign key. Do NOT add a foreign key constraint
// (`.references(() => user.id, ...)`) unless the user explicitly asks for
// foreign keys or referential integrity; FK constraints make iterating on the
// schema harder.
//
// Example:
//
// import { serial } from "drizzle-orm/pg-core"
//
// export const todos = pgTable("todos", {
//   id: serial("id").primaryKey(),
//   userId: text("userId").notNull(),
//   title: text("title").notNull(),
//   completed: boolean("completed").notNull().default(false),
//   createdAt: timestamp("createdAt").notNull().defaultNow(),
// })
//
// If the user asks for foreign keys, add the reference back in:
//   userId: text("userId")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),

// --- Pole Defect Detector App Tables ---

export const poles = pgTable('poles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  status: text('status').notNull().default('normal'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const devices = pgTable('devices', {
  id: serial('id').primaryKey(),
  poleId: integer('poleId').notNull(),
  deviceId: text('deviceId').notNull().unique(),
  deviceName: text('deviceName').notNull(),
  currentType: text('currentType').notNull(),
  sensitivity: doublePrecision('sensitivity'),
  batteryLevel: integer('batteryLevel'),
  lastReadingAt: timestamp('lastReadingAt'),
  signalStrength: integer('signalStrength'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const sensorThresholds = pgTable('sensor_thresholds', {
  id: serial('id').primaryKey(),
  deviceId: integer('deviceId').notNull(),
  currentType: text('currentType').notNull(),
  highCurrentThreshold: doublePrecision('highCurrentThreshold').notNull(),
  lowCurrentThreshold: doublePrecision('lowCurrentThreshold').notNull(),
  normalBaseline: doublePrecision('normalBaseline'),
  anomalyDurationMinutes: integer('anomalyDurationMinutes').default(5),
  rapidFluctuationPercent: doublePrecision('rapidFluctuationPercent').default(15),
  enabled: boolean('enabled').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const currentReadings = pgTable('current_readings', {
  id: serial('id').primaryKey(),
  deviceId: integer('deviceId').notNull(),
  currentValue: doublePrecision('currentValue').notNull(),
  voltage: doublePrecision('voltage'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  anomalyDetected: boolean('anomalyDetected').default(false),
  anomalyType: text('anomalyType'),
})

export const defects = pgTable('defects', {
  id: serial('id').primaryKey(),
  deviceId: integer('deviceId').notNull(),
  poleId: integer('poleId').notNull(),
  anomalyType: text('anomalyType').notNull(),
  severity: text('severity').notNull(),
  currentValue: doublePrecision('currentValue'),
  detectedAt: timestamp('detectedAt').notNull().defaultNow(),
  resolvedAt: timestamp('resolvedAt'),
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  defectId: integer('defectId').notNull(),
  severity: text('severity').notNull(),
  status: text('status').notNull().default('pending'),
  acknowledgedBy: text('acknowledgedBy'),
  acknowledgedAt: timestamp('acknowledgedAt'),
  emailSent: boolean('emailSent').default(false),
  smsSent: boolean('smsSent').default(false),
  escalatedAt: timestamp('escalatedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const operatorSettings = pgTable('operator_settings', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  emailNotifications: boolean('emailNotifications').default(true),
  smsNotifications: boolean('smsNotifications').default(true),
  inAppNotifications: boolean('inAppNotifications').default(true),
  minSeverityLevel: text('minSeverityLevel').default('low'),
  phoneNumber: text('phoneNumber'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
