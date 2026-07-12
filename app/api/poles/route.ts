import { db } from '@/lib/db'
import { poles } from '@/lib/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const allPoles = await db.query.poles.findMany({
      limit: 200,
    })

    return NextResponse.json(allPoles)
  } catch (error) {
    console.error('[v0] Failed to fetch poles:', error)
    return NextResponse.json({ error: 'Failed to fetch poles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, location, latitude, longitude, status } = body

    if (!name || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newPole = await db.insert(poles).values({
      name,
      location,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      status: status || 'normal',
    }).returning()

    return NextResponse.json(newPole[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Failed to create pole:', error)
    return NextResponse.json(
      { error: 'Failed to create pole' },
      { status: 500 }
    )
  }
}
