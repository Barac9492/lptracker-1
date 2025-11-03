import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { scoreFromSignals, suggestAngle } from '@/lib/scoring'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { lpName, summary, tags, url, weight } = body

    if (!lpName || !summary) {
      return NextResponse.json(
        { error: 'lpName and summary are required' },
        { status: 400 }
      )
    }

    // Find or create LP
    let lp = await prisma.lP.findUnique({ where: { name: lpName } })
    if (!lp) {
      lp = await prisma.lP.create({
        data: { name: lpName },
      })
    }

    // Create signal
    const signal = await prisma.signal.create({
      data: {
        lpId: lp.id,
        summary,
        tags: Array.isArray(tags) ? tags : [],
        url: url || null,
        weight: weight || 1.0,
      },
    })

    // Recompute score and message angle
    const allSignals = await prisma.signal.findMany({
      where: { lpId: lp.id },
    })

    const newScore = scoreFromSignals(allSignals)
    const newAngle = suggestAngle(allSignals)

    const updatedLP = await prisma.lP.update({
      where: { id: lp.id },
      data: {
        score: newScore,
        messageAngle: newAngle,
      },
    })

    return NextResponse.json({ signal, lp: updatedLP })
  } catch (error) {
    console.error('Error ingesting signal:', error)
    return NextResponse.json(
      { error: 'Failed to ingest signal' },
      { status: 500 }
    )
  }
}
