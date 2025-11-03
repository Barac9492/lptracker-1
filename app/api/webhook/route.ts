import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { scoreFromSignals, suggestAngle } from '@/lib/scoring'

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
      const { lpName, summary, tags, url, weight, source } = signalData

      if (!lpName || !summary) {
        results.push({
          success: false,
          error: 'lpName and summary are required',
          data: signalData,
        })
        continue
      }

      try {
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

        // Recompute score
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

        results.push({
          success: true,
          signal: {
            id: signal.id,
            lpId: lp.id,
            lpName: lp.name,
            summary: signal.summary,
            score: updatedLP.score,
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
