import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { scoreFromSignals, suggestAngle } from '@/lib/scoring'
import {
  validateSignal,
  fuzzyMatchLP,
  detectDuplicate,
} from '@/lib/validators/signal-validator'

/**
 * Webhook endpoint for receiving signals from external sources
 *
 * Use cases:
 * - Zapier integration
 * - Make.com workflows
 * - Custom scrapers
 * - Email parsing services
 * - Third-party monitoring tools
 *
 * Authentication: Bearer token or secret query param
 */
export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret if configured
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (webhookSecret) {
      const authHeader = req.headers.get('authorization')
      const { searchParams } = new URL(req.url)
      const secretParam = searchParams.get('secret')

      const providedSecret = authHeader?.replace('Bearer ', '') || secretParam

      if (providedSecret !== webhookSecret) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const body = await req.json()

    // Support both single signal and batch signals
    const signals = Array.isArray(body) ? body : [body]
    const results = []

    for (const signalData of signals) {
      try {
        // Step 1: Validate the signal
        const validationResult = validateSignal(signalData)

        if (!validationResult.valid) {
          results.push({
            success: false,
            error: 'Signal validation failed',
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            data: signalData,
          })
          continue
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
          results.push({
            success: false,
            error: 'Failed to find or create LP',
            data: signalData,
          })
          continue
        }

        // Step 3: Check for duplicate signals
        const existingSignals = await db.signal.findMany({
          where: { lpId: lp.id },
          orderBy: { createdAt: 'desc' },
          take: 50,
        })

        const duplicateCheck = detectDuplicate(
          { lpName: lp.name, summary, tags, url, weight },
          existingSignals
        )

        if (duplicateCheck.isDuplicate) {
          results.push({
            success: false,
            error: 'Duplicate signal detected',
            reason: duplicateCheck.reason,
            warnings: validationResult.warnings,
            data: signalData,
          })
          continue
        }

        // Step 4: Create signal
        const signal = await db.signal.create({
          data: {
            lpId: lp.id,
            summary,
            tags,
            url: url || null,
            weight,
          },
        })

        // Step 5: Recompute score
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

        results.push({
          success: true,
          signal: {
            id: signal.id,
            lpId: lp.id,
            lpName: lp.name,
            summary: signal.summary,
            score: updatedLP.score,
          },
          validation: {
            warnings: validationResult.warnings,
            lpMatch: lpMatchInfo,
          },
        })
      } catch (error: any) {
        results.push({
          success: false,
          error: error.message,
          data: signalData,
        })
      }
    }

    // Return batch results
    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount

    return NextResponse.json({
      processed: results.length,
      success: successCount,
      failed: failCount,
      results,
    })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to verify webhook is working
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const webhookSecret = process.env.WEBHOOK_SECRET

  if (webhookSecret && secret !== webhookSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
