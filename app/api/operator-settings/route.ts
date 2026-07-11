import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { operatorSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, emailNotifications, smsNotifications, inAppNotifications, minSeverityLevel, phoneNumber } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Check if settings exist
    const existing = await db
      .select()
      .from(operatorSettings)
      .where(eq(operatorSettings.userId, userId))
      .limit(1)

    if (existing.length > 0) {
      // Update existing settings
      await db
        .update(operatorSettings)
        .set({
          emailNotifications,
          smsNotifications,
          inAppNotifications,
          minSeverityLevel,
          phoneNumber,
          updatedAt: new Date(),
        })
        .where(eq(operatorSettings.userId, userId))
    } else {
      // Create new settings
      await db.insert(operatorSettings).values({
        userId,
        emailNotifications,
        smsNotifications,
        inAppNotifications,
        minSeverityLevel,
        phoneNumber,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Operator settings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
