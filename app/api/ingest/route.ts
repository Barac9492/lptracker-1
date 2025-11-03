import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { scoreFromSignals, suggestAngle } from '@/lib/scoring'
import {
  validateSignal,
  fuzzyMatchLP,
  detectDuplicate,
} from '@/lib/validators/signal-validator'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Step 1: Validate the signal
    const validationResult = validateSignal(body)

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: 'Signal validation failed',
          errors: validationResult.errors,
          warnings: validationResult.warnings,
        },
        { status: 400 }
      )
    }

    // Use normalized data from validation
    const { lpName, summary, tags, url, weight } = validationResult.normalizedData!

    // Step 2: Fuzzy match LP name to existing LPs
    const existingLPs = await db.lp.findMany({})
    const lpList = existingLPs.map(lp => ({ id: lp.id, name: lp.name }))

    const matchResult = fuzzyMatchLP(lpName, lpList)

    let lp
    let lpMatchInfo

    if (matchResult.matched) {
      // Use matched LP
      lp = await db.lp.findUnique({
        where: { id: matchResult.lpId },
      })
      lpMatchInfo = {
        matched: true,
        originalName: lpName,
        matchedName: matchResult.lpName,
        confidence: matchResult.confidence,
      }
    } else {
      // Create new LP
      lp = await db.lp.create({
        data: { name: lpName },
      })
      lpMatchInfo = {
        matched: false,
        originalName: lpName,
        created: true,
      }
    }

    if (!lp) {
      return NextResponse.json(
        { error: 'Failed to find or create LP' },
        { status: 500 }
      )
    }

    // Step 3: Check for duplicate signals
    const existingSignals = await db.signal.findMany({
      where: { lpId: lp.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Check last 50 signals
    })

    const duplicateCheck = detectDuplicate(
      { lpName: lp.name, summary, tags, url, weight },
      existingSignals
    )

    if (duplicateCheck.isDuplicate) {
      return NextResponse.json(
        {
          error: 'Duplicate signal detected',
          reason: duplicateCheck.reason,
          existingSignal: duplicateCheck.matchedSignal,
          warnings: validationResult.warnings,
        },
        { status: 409 } // 409 Conflict
      )
    }

    // Step 4: Create the signal
    const signal = await db.signal.create({
      data: {
        lpId: lp.id,
        summary,
        tags,
        url: url || null,
        weight,
      },
    })

    // Step 5: Recompute score and message angle
    const allSignals = await db.signal.findMany({
      where: { lpId: lp.id },
    })

    const newScore = scoreFromSignals(allSignals)
    const newAngle = suggestAngle(allSignals)

    const updatedLP = await db.lp.update({
      where: { id: lp.id },
      data: {
        score: newScore,
        messageAngle: newAngle,
      },
    })

    // Step 6: Return success response with validation info
    return NextResponse.json({
      success: true,
      signal,
      lp: updatedLP,
      validation: {
        warnings: validationResult.warnings,
        lpMatch: lpMatchInfo,
      },
    })
  } catch (error) {
    console.error('Error ingesting signal:', error)
    return NextResponse.json(
      { error: 'Failed to ingest signal', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
