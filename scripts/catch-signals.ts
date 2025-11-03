#!/usr/bin/env tsx

/**
 * Signal Catching Automation Script
 *
 * This script fetches signals from various sources and ingests them
 * Run via cron: */30 * * * * cd /path/to/lpint && tsx scripts/catch-signals.ts
 */

import { fetchRSSSignals, LP_RSS_FEEDS } from '../lib/signal-catchers/rss-monitor'
import { fetchNewsAPISignals, fetchGoogleNewsSignals } from '../lib/signal-catchers/news-api'

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function ingestSignal(signal: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signal),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`Failed to ingest signal: ${error}`)
      return false
    }

    return true
  } catch (error) {
    console.error('Error ingesting signal:', error)
    return false
  }
}

async function main() {
  console.log('🔍 Starting signal catching automation...')
  console.log(`Timestamp: ${new Date().toISOString()}`)

  let totalSignals = 0
  let newSignals = 0

  // 1. Fetch from RSS Feeds
  console.log('\n📰 Fetching RSS feeds...')
  for (const feedUrl of LP_RSS_FEEDS) {
    try {
      console.log(`  Checking: ${feedUrl}`)
      const signals = await fetchRSSSignals(feedUrl)
      console.log(`  Found ${signals.length} potential signals`)

      for (const signal of signals) {
        totalSignals++
        const success = await ingestSignal({
          lpName: signal.lpName,
          summary: signal.summary,
          tags: signal.tags,
          url: signal.url,
          weight: signal.weight,
        })
        if (success) newSignals++
      }
    } catch (error) {
      console.error(`  Error with feed ${feedUrl}:`, error)
    }
  }

  // 2. Fetch from NewsAPI (if key provided)
  const newsApiKey = process.env.NEWS_API_KEY
  if (newsApiKey) {
    console.log('\n📡 Fetching from NewsAPI...')
    try {
      const signals = await fetchNewsAPISignals(newsApiKey)
      console.log(`  Found ${signals.length} potential signals`)

      for (const signal of signals) {
        totalSignals++
        const success = await ingestSignal({
          lpName: signal.lpName,
          summary: signal.summary,
          tags: signal.tags,
          url: signal.url,
          weight: signal.weight,
        })
        if (success) newSignals++
      }
    } catch (error) {
      console.error('  Error with NewsAPI:', error)
    }
  } else {
    console.log('\n📡 NewsAPI key not found, skipping...')
  }

  // 3. Fetch from Google News (free alternative)
  console.log('\n🔍 Fetching from Google News...')
  const googleQueries = [
    'CalPERS venture capital',
    'pension fund investment',
    'endowment fund venture capital',
    'institutional investor allocation',
  ]

  for (const query of googleQueries) {
    try {
      console.log(`  Searching: ${query}`)
      const signals = await fetchGoogleNewsSignals(query)
      console.log(`  Found ${signals.length} potential signals`)

      for (const signal of signals) {
        totalSignals++
        const success = await ingestSignal({
          lpName: signal.lpName,
          summary: signal.summary,
          tags: signal.tags,
          url: signal.url,
          weight: signal.weight,
        })
        if (success) newSignals++
      }

      // Rate limiting: wait 2 seconds between queries
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`  Error with query "${query}":`, error)
    }
  }

  // Summary
  console.log('\n✅ Signal catching completed!')
  console.log(`Total signals found: ${totalSignals}`)
  console.log(`New signals ingested: ${newSignals}`)
  console.log(`Duplicates/errors: ${totalSignals - newSignals}`)

  // Optional: Send notification if configured
  const slackWebhook = process.env.SLACK_WEBHOOK_URL
  if (slackWebhook && newSignals > 0) {
    try {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔔 Signal Catch Update: ${newSignals} new signals ingested`,
        }),
      })
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
