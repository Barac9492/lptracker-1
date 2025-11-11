import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { scoreFromSignals, suggestAngle } from '@/lib/scoring'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { lpId } = body

    if (!lpId) {
      return NextResponse.json(
        { error: 'lpId is required' },
        { status: 400 }
      )
    }

    // Get all signals for this LP
    const signals = await db.signal.findMany({
      where: { lpId },
    })

    // Compute score and angle
    const newScore = scoreFromSignals(signals)
    const newAngle = suggestAngle(signals)

    // Update LP
    const updatedLP = await db.lp.update({
      where: { id: lpId },
      data: {
        score: newScore,
        messageAngle: newAngle,
      },
    })

    return NextResponse.json(updatedLP)
  } catch (error) {
    console.error('Error computing score:', error)
    return NextResponse.json(
      { error: 'Failed to compute score' },
      { status: 500 }
    )
  }
}
