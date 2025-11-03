import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Verify secret if configured
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const { searchParams } = new URL(req.url)
      const providedSecret = searchParams.get('secret')

      if (providedSecret !== cronSecret) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Get top 3 LPs
    const top3 = await prisma.lP.findMany({
      orderBy: { score: 'desc' },
      take: 3,
      select: {
        id: true,
        name: true,
        score: true,
        messageAngle: true,
        contactName: true,
        email: true,
      },
    })

    // Send to Slack if webhook configured
    const slackWebhook = process.env.SLACK_WEBHOOK_URL
    if (slackWebhook && top3.length > 0) {
      const message = {
        text: '📊 *Top 3 Priority LPs Today*',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📊 Top 3 Priority LPs',
            },
          },
          {
            type: 'divider',
          },
          ...top3.flatMap((lp, index) => [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*#${index + 1} ${lp.name}* (Score: ${lp.score})\n${lp.contactName ? `Contact: ${lp.contactName}` : ''}\n${lp.messageAngle ? `_${lp.messageAngle}_` : ''}`,
              },
            },
            {
              type: 'divider',
            },
          ]),
        ],
      }

      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      })
    }

    return NextResponse.json({ top3 })
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { error: 'Failed to execute cron job' },
      { status: 500 }
    )
  }
}
