import Parser from 'rss-parser'
import { summarizeError } from '../utils/error'

export interface RSSSignal {
  lpName: string
  summary: string
  tags: string[]
  url?: string
  weight: number
  source: string
}

const parser = new Parser()

/**
 * Parse RSS feed and extract LP-related signals
 */
export async function fetchRSSSignals(feedUrl: string): Promise<RSSSignal[]> {
  const signals: RSSSignal[] = []

  try {
    const feed = await parser.parseURL(feedUrl)

    for (const item of feed.items) {
      const signal = parseRSSItem(item)
      if (signal) {
        signals.push(signal)
      }
    }
  } catch (error: unknown) {
    console.error(`Error fetching RSS feed ${feedUrl}: ${summarizeError(error)}`)
  }

  return signals
}

/**
 * Parse individual RSS item and extract signal data
 */
function parseRSSItem(item: any): RSSSignal | null {
  const title = item.title || ''
  const content = item.contentSnippet || item.content || ''
  const combined = `${title} ${content}`.toLowerCase()

  // Detect LP mentions
  const lpName = detectLPName(combined)
  if (!lpName) return null

  // Extract tags from content
  const tags = extractTags(combined)

  // Calculate weight based on keywords
  const weight = calculateWeight(combined, tags)

  return {
    lpName,
    summary: item.title || '',
    tags,
    url: item.link,
    weight,
    source: 'rss'
  }
}

/**
 * Detect LP name from text
 */
function detectLPName(text: string): string | null {
  const lpPatterns = [
    { pattern: /calpers/i, name: 'CalPERS (California Public Employees Retirement System)' },
    { pattern: /california public employees/i, name: 'CalPERS (California Public Employees Retirement System)' },
    { pattern: /yale endowment/i, name: 'Yale Endowment' },
    { pattern: /ontario teachers/i, name: 'Ontario Teachers Pension Plan' },
    { pattern: /otpp/i, name: 'Ontario Teachers Pension Plan' },
    { pattern: /cppib/i, name: 'Canada Pension Plan Investment Board' },
    { pattern: /harvard endowment/i, name: 'Harvard Management Company' },
    { pattern: /mit endowment/i, name: 'MIT Investment Management Company' },
    { pattern: /stanford endowment/i, name: 'Stanford Management Company' },
    { pattern: /texas teachers/i, name: 'Teacher Retirement System of Texas' },
    { pattern: /new york common/i, name: 'New York State Common Retirement Fund' },
  ]

  for (const { pattern, name } of lpPatterns) {
    if (pattern.test(text)) {
      return name
    }
  }

  return null
}

/**
 * Extract relevant tags from text
 */
function extractTags(text: string): string[] {
  const tags: string[] = []

  const tagPatterns = [
    { pattern: /\b(fund|funding|capital|allocation|commitment)\b/i, tag: 'funding' },
    { pattern: /\b(venture capital|vc|early stage)\b/i, tag: 'venture-capital' },
    { pattern: /\b(private equity|pe)\b/i, tag: 'private-equity' },
    { pattern: /\b(hiring|recruit|job|position|appointment)\b/i, tag: 'hiring' },
    { pattern: /\b(partnership|partner|collaborate)\b/i, tag: 'partnership' },
    { pattern: /\b(expansion|expand|new office|opening)\b/i, tag: 'expansion' },
    { pattern: /\b(performance|return|gain|profit)\b/i, tag: 'performance' },
    { pattern: /\b(acquisition|acquire|buy|purchase)\b/i, tag: 'acquisition' },
    { pattern: /\b(speaking|conference|summit|event)\b/i, tag: 'speaking' },
    { pattern: /\b(award|recognition|honor)\b/i, tag: 'award' },
    { pattern: /\b(emerging manager|new manager|first-time fund)\b/i, tag: 'emerging-managers' },
    { pattern: /\b(esg|impact|sustainable|climate)\b/i, tag: 'impact' },
  ]

  for (const { pattern, tag } of tagPatterns) {
    if (pattern.test(text) && !tags.includes(tag)) {
      tags.push(tag)
    }
  }

  return tags
}

/**
 * Calculate signal weight based on content
 */
function calculateWeight(text: string, tags: string[]): number {
  let weight = 1.0

  // High-value keywords
  if (/\b(billion|million)\b/i.test(text)) weight += 0.5
  if (/\b(new fund|raised|commitment)\b/i.test(text)) weight += 0.5
  if (/\b(cio|chief investment officer)\b/i.test(text)) weight += 0.3

  // Tag bonuses
  if (tags.includes('funding')) weight += 0.5
  if (tags.includes('hiring')) weight += 0.3
  if (tags.includes('partnership')) weight += 0.3

  return Math.min(weight, 3.0) // Cap at 3.0
}

/**
 * Common LP-related RSS feeds
 */
export const LP_RSS_FEEDS = [
  'https://news.google.com/rss/search?q=pension+fund+venture+capital',
  'https://news.google.com/rss/search?q=endowment+investment',
  'https://news.google.com/rss/search?q=CalPERS',
  'https://www.pionline.com/rss.xml', // Pensions & Investments
  'https://www.institutionalinvestor.com/RSS', // Institutional Investor (if available)
]
