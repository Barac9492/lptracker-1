import axios from 'axios'
import { summarizeError } from '../utils/error'

export interface NewsSignal {
  lpName: string
  summary: string
  tags: string[]
  url?: string
  weight: number
  source: string
  publishedAt: Date
}

/**
 * Fetch news from NewsAPI.org
 * Get your API key at: https://newsapi.org/
 */
export async function fetchNewsAPISignals(apiKey: string, query?: string): Promise<NewsSignal[]> {
  if (!apiKey) {
    console.warn('NewsAPI key not provided')
    return []
  }

  const signals: NewsSignal[] = []

  try {
    const searchQuery = query || 'pension fund OR endowment venture capital OR CalPERS OR "Yale Endowment"'

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: searchQuery,
        apiKey,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 50,
      },
    })

    for (const article of response.data.articles || []) {
      const signal = parseNewsArticle(article)
      if (signal) {
        signals.push(signal)
      }
    }
  } catch (error: any) {
    console.error('Error fetching from NewsAPI:', error.response?.data || error.message)
  }

  return signals
}

/**
 * Parse news article and extract signal
 */
function parseNewsArticle(article: any): NewsSignal | null {
  const title = article.title || ''
  const description = article.description || ''
  const content = article.content || ''
  const combined = `${title} ${description} ${content}`.toLowerCase()

  // Detect LP mention
  const lpName = detectLPName(combined)
  if (!lpName) return null

  // Extract tags
  const tags = extractTags(combined)

  // Calculate weight
  const weight = calculateWeight(combined, tags)

  return {
    lpName,
    summary: title,
    tags,
    url: article.url,
    weight,
    source: 'newsapi',
    publishedAt: new Date(article.publishedAt),
  }
}

/**
 * Detect LP name from text
 */
function detectLPName(text: string): string | null {
  const lpPatterns = [
    { pattern: /calpers|california public employees/i, name: 'CalPERS (California Public Employees Retirement System)' },
    { pattern: /yale endowment/i, name: 'Yale Endowment' },
    { pattern: /ontario teachers|otpp/i, name: 'Ontario Teachers Pension Plan' },
    { pattern: /cppib|canada pension plan investment/i, name: 'Canada Pension Plan Investment Board' },
    { pattern: /harvard (management|endowment)/i, name: 'Harvard Management Company' },
    { pattern: /mit (investment|endowment)/i, name: 'MIT Investment Management Company' },
    { pattern: /stanford (management|endowment)/i, name: 'Stanford Management Company' },
    { pattern: /texas teachers|trs texas/i, name: 'Teacher Retirement System of Texas' },
    { pattern: /new york (state )?common/i, name: 'New York State Common Retirement Fund' },
    { pattern: /florida sba|florida state board/i, name: 'Florida State Board of Administration' },
    { pattern: /washington state investment/i, name: 'Washington State Investment Board' },
  ]

  for (const { pattern, name } of lpPatterns) {
    if (pattern.test(text)) {
      return name
    }
  }

  return null
}

/**
 * Extract tags from text
 */
function extractTags(text: string): string[] {
  const tags: string[] = []

  const tagPatterns = [
    { pattern: /\b(allocat|commit|invest.*\$[\d.]+[mb])/i, tag: 'funding' },
    { pattern: /venture capital|early.?stage|vc fund/i, tag: 'venture-capital' },
    { pattern: /private equity|buyout/i, tag: 'private-equity' },
    { pattern: /hir(e|ing)|appoint|recruit|new (cio|cfo|investment officer)/i, tag: 'hiring' },
    { pattern: /partner(ship)?|collaborat|joint venture/i, tag: 'partnership' },
    { pattern: /expand|new office|open|launch/i, tag: 'expansion' },
    { pattern: /return|performance|gain|\d+%/i, tag: 'performance' },
    { pattern: /acqui(re|sition)|bought|purchase/i, tag: 'acquisition' },
    { pattern: /speak|conference|panel|summit/i, tag: 'speaking' },
    { pattern: /award|recogni|honor|top \d+/i, tag: 'award' },
    { pattern: /emerging manager|first.?time fund/i, tag: 'emerging-managers' },
    { pattern: /esg|sustainable|climate|impact invest/i, tag: 'impact' },
    { pattern: /diversit|inclusion|dei/i, tag: 'diversity' },
  ]

  for (const { pattern, tag } of tagPatterns) {
    if (pattern.test(text) && !tags.includes(tag)) {
      tags.push(tag)
    }
  }

  return tags
}

/**
 * Calculate weight
 */
function calculateWeight(text: string, tags: string[]): number {
  let weight = 1.0

  // Dollar amount mentions
  if (/\$\d+\s*billion/i.test(text)) weight += 1.0
  if (/\$\d+\s*million/i.test(text)) weight += 0.5

  // Key phrases
  if (/new fund|raised|commitment|allocation/i.test(text)) weight += 0.5
  if (/cio|chief investment/i.test(text)) weight += 0.4

  // Tag bonuses
  if (tags.includes('funding')) weight += 0.6
  if (tags.includes('hiring')) weight += 0.4
  if (tags.includes('partnership')) weight += 0.3
  if (tags.includes('emerging-managers')) weight += 0.5

  return Math.min(weight, 3.0)
}

/**
 * Fetch Google News via RSS (free alternative to NewsAPI)
 */
export async function fetchGoogleNewsSignals(query: string): Promise<NewsSignal[]> {
  const signals: NewsSignal[] = []
  const encodedQuery = encodeURIComponent(query)
  const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`

  try {
    const Parser = (await import('rss-parser')).default
    const parser = new Parser()
    const feed = await parser.parseURL(rssUrl)

    for (const item of feed.items) {
      const title = item.title || ''
      const content = item.contentSnippet || ''
      const combined = `${title} ${content}`.toLowerCase()

      const lpName = detectLPName(combined)
      if (!lpName) continue

      const tags = extractTags(combined)
      const weight = calculateWeight(combined, tags)

      signals.push({
        lpName,
        summary: title,
        tags,
        url: item.link,
        weight,
        source: 'google-news',
        publishedAt: new Date(item.pubDate || Date.now()),
      })
    }
  } catch (error: unknown) {
    console.error(`Error fetching Google News: ${summarizeError(error)}`)
  }

  return signals
}
