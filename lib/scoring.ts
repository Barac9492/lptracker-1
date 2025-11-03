import { Signal } from '@prisma/client'

/**
 * Calculate LP score from their signals
 * @param signals Array of signals for an LP
 * @returns Calculated score
 */
export function scoreFromSignals(signals: Signal[]): number {
  if (signals.length === 0) return 0

  // Base score calculation: sum of (signal count * weight)
  let totalScore = 0

  signals.forEach(signal => {
    // Each signal contributes based on its weight
    totalScore += signal.weight

    // Bonus for high-value tags
    const highValueTags = ['funding', 'acquisition', 'partnership', 'hiring', 'expansion']
    const matchingTags = signal.tags.filter(tag =>
      highValueTags.some(hvt => tag.toLowerCase().includes(hvt.toLowerCase()))
    )
    totalScore += matchingTags.length * 0.5
  })

  // Recency bonus: signals from last 30 days get a 20% boost
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentSignals = signals.filter(s => new Date(s.createdAt) > thirtyDaysAgo)
  totalScore += recentSignals.length * 0.3

  return Math.round(totalScore * 100) / 100
}

/**
 * Suggest outreach message angle based on signals
 * @param signals Array of signals for an LP
 * @returns Suggested message angle
 */
export function suggestAngle(signals: Signal[]): string {
  if (signals.length === 0) return 'General introduction'

  // Collect all tags
  const allTags = signals.flatMap(s => s.tags.map(t => t.toLowerCase()))
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Sort tags by frequency
  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)

  // Determine angle based on most common tags
  if (sortedTags.length === 0) return 'General introduction'

  const topTag = sortedTags[0][0]

  // Map tags to angles
  const angleMap: Record<string, string> = {
    'funding': 'Congrats on recent funding - discuss growth opportunities',
    'acquisition': 'Reference recent acquisition - strategic partnership angle',
    'partnership': 'Build on recent partnership momentum',
    'hiring': 'Scaling team - offer relevant expertise/network',
    'expansion': 'Geographic/market expansion support',
    'product': 'Product launch collaboration opportunity',
    'award': 'Recognition acknowledgment - thought leadership',
    'speaking': 'Industry visibility - event/content collaboration',
    'fundraising': 'Capital raising discussion',
    'ipo': 'Public market preparation support',
  }

  // Find matching angle
  for (const [keyword, angle] of Object.entries(angleMap)) {
    if (topTag.includes(keyword)) {
      return angle
    }
  }

  // Get most recent signal summary as fallback
  const mostRecent = signals.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0]

  return `Reference: ${mostRecent.summary.substring(0, 60)}...`
}
