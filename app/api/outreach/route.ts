import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { lpId, subject, body: messageBody, channel } = body

    if (!lpId) {
      return NextResponse.json(
        { error: 'lpId is required' },
        { status: 400 }
      )
    }

    const outreach = await db.outreach.create({
      data: {
        lpId,
        subject: subject || null,
        body: messageBody || null,
        channel: channel || 'email',
      },
    })

    return NextResponse.json(outreach)
  } catch (error) {
    console.error('Error creating outreach:', error)
    return NextResponse.json(
      { error: 'Failed to create outreach' },
      { status: 500 }
    )
  }
}
