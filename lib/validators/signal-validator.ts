/**
 * Signal Validation System
 * Ensures data quality for incoming signals
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  normalizedData?: NormalizedSignalData
}

export interface NormalizedSignalData {
  lpName: string
  summary: string
  tags: string[]
  url?: string
  weight: number
}

export interface SignalInput {
  lpName?: string
  summary?: string
  tags?: string[]
  url?: string
  weight?: number
}

/**
 * Validate a signal before ingestion
 * @param signal Raw signal data
 * @returns Validation result with errors and normalized data
 */
export function validateSignal(signal: SignalInput): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Type checking first (before calling string methods)
  if (signal.lpName !== undefined && signal.lpName !== null && typeof signal.lpName !== 'string') {
    errors.push('lpName must be a string')
  }

  if (signal.summary !== undefined && signal.summary !== null && typeof signal.summary !== 'string') {
    errors.push('summary must be a string')
  }

  if (signal.weight !== undefined && signal.weight !== null && typeof signal.weight !== 'number') {
    errors.push('weight must be a number')
  }

  if (signal.url !== undefined && signal.url !== null && typeof signal.url !== 'string') {
    errors.push('url must be a string or null')
  }

  // Required field validation (after type checking)
  if (!signal.lpName || (typeof signal.lpName === 'string' && signal.lpName.trim() === '')) {
    errors.push('lpName is required')
  }

  if (!signal.summary || (typeof signal.summary === 'string' && signal.summary.trim() === '')) {
    errors.push('summary is required')
  }

  if (!signal.tags || !Array.isArray(signal.tags) || signal.tags.length === 0) {
    errors.push('tags array is required and must have at least one tag')
  }

  if (signal.weight === undefined || signal.weight === null) {
    errors.push('weight is required')
  }

  // If there are type errors or required field errors, return early
  if (errors.length > 0) {
    return { valid: false, errors, warnings }
  }

  // Validate each tag is a string
  if (Array.isArray(signal.tags)) {
    signal.tags.forEach((tag, index) => {
      if (typeof tag !== 'string') {
        errors.push(`tags[${index}] must be a string`)
      }
    })
  }

  // Weight range validation (0-5 scale based on scoring algorithm)
  if (typeof signal.weight === 'number') {
    if (signal.weight < 0 || signal.weight > 5) {
      errors.push('weight must be between 0 and 5')
    }

    // Warning for unusual weights
    if (signal.weight < 0.5) {
      warnings.push('weight is unusually low (< 0.5)')
    }
    if (signal.weight > 3) {
      warnings.push('weight is unusually high (> 3) - verify signal importance')
    }
  }

  // URL format validation
  if (signal.url && signal.url.trim() !== '') {
    const urlPattern = /^https?:\/\/.+/i
    if (!urlPattern.test(signal.url)) {
      errors.push('url must be a valid HTTP or HTTPS URL')
    }
  }

  // Summary length validation
  if (signal.summary && signal.summary.length < 10) {
    warnings.push('summary is very short (< 10 characters) - consider adding more context')
  }

  if (signal.summary && signal.summary.length > 500) {
    warnings.push('summary is very long (> 500 characters) - consider condensing')
  }

  // LP name validation
  if (signal.lpName) {
    if (signal.lpName.length < 3) {
      errors.push('lpName must be at least 3 characters')
    }

    if (signal.lpName.length > 200) {
      errors.push('lpName is too long (max 200 characters)')
    }

    // Check for common LP naming patterns
    const hasValidPattern = /pension|endowment|fund|investment|capital|teachers|retirement|university|college/i.test(signal.lpName)
    if (!hasValidPattern) {
      warnings.push('lpName does not match common LP patterns (pension, endowment, fund, etc.) - verify this is a correct LP')
    }
  }

  // Tag validation
  if (signal.tags && Array.isArray(signal.tags)) {
    if (signal.tags.length > 10) {
      warnings.push('More than 10 tags - consider consolidating')
    }

    // Check for empty tags
    const emptyTags = signal.tags.filter((tag: string) => typeof tag === 'string' && tag.trim() === '')
    if (emptyTags.length > 0) {
      errors.push('tags array contains empty strings')
    }

    // Normalize tags to lowercase
    const normalizedTags = signal.tags.map((tag: string) => tag.toLowerCase().trim())
    const uniqueTags = [...new Set(normalizedTags)]
    if (uniqueTags.length < signal.tags.length) {
      warnings.push('Duplicate tags detected - will be deduplicated')
    }
  }

  // If there are errors, return invalid
  if (errors.length > 0) {
    return { valid: false, errors, warnings }
  }

  // Normalize the data
  const normalizedData: NormalizedSignalData = {
    lpName: signal.lpName!.trim(),
    summary: signal.summary!.trim(),
    tags: [...new Set(signal.tags!.map((tag: string) => tag.toLowerCase().trim()))],
    weight: signal.weight!,
  }

  // Add URL if present and valid
  if (signal.url && signal.url.trim() !== '') {
    normalizedData.url = signal.url.trim()
  }

  return {
    valid: true,
    errors: [],
    warnings,
    normalizedData,
  }
}

/**
 * Check if a signal is a potential duplicate
 * @param newSignal The signal to check
 * @param existingSignals Array of existing signals
 * @returns Duplicate detection result
 */
export function detectDuplicate(
  newSignal: NormalizedSignalData,
  existingSignals: Array<{ lpId: string; summary: string; url: string | null; createdAt: Date }>
): {
  isDuplicate: boolean
  matchedSignal?: any
  reason?: string
} {
  for (const existing of existingSignals) {
    // Exact URL match
    if (newSignal.url && existing.url && newSignal.url === existing.url) {
      return {
        isDuplicate: true,
        matchedSignal: existing,
        reason: 'Exact URL match',
      }
    }

    // Similar summary (> 80% match)
    const similarity = calculateStringSimilarity(
      newSignal.summary.toLowerCase(),
      existing.summary.toLowerCase()
    )

    if (similarity > 0.8) {
      // Check recency - only consider duplicates from last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      if (new Date(existing.createdAt) > thirtyDaysAgo) {
        return {
          isDuplicate: true,
          matchedSignal: existing,
          reason: `Similar summary (${Math.round(similarity * 100)}% match) within 30 days`,
        }
      }
    }
  }

  return { isDuplicate: false }
}

/**
 * Find the best matching LP name from database
 * Uses fuzzy matching to handle variations
 * @param inputName Input LP name
 * @param existingLPs Array of existing LP records
 * @returns Best match or null
 */
export function fuzzyMatchLP(
  inputName: string,
  existingLPs: Array<{ id: string; name: string }>
): {
  matched: boolean
  lpId?: string
  lpName?: string
  confidence: number
} {
  if (existingLPs.length === 0) {
    return { matched: false, confidence: 0 }
  }

  const normalizedInput = normalizeForMatching(inputName)

  let bestMatch = {
    lpId: '',
    lpName: '',
    confidence: 0,
  }

  for (const lp of existingLPs) {
    const normalizedLP = normalizeForMatching(lp.name)

    // Exact match
    if (normalizedInput === normalizedLP) {
      return {
        matched: true,
        lpId: lp.id,
        lpName: lp.name,
        confidence: 1.0,
      }
    }

    // Calculate similarity
    const similarity = calculateStringSimilarity(normalizedInput, normalizedLP)

    if (similarity > bestMatch.confidence) {
      bestMatch = {
        lpId: lp.id,
        lpName: lp.name,
        confidence: similarity,
      }
    }
  }

  // Return match if confidence > 0.85
  if (bestMatch.confidence > 0.85) {
    return {
      matched: true,
      lpId: bestMatch.lpId,
      lpName: bestMatch.lpName,
      confidence: bestMatch.confidence,
    }
  }

  return { matched: false, confidence: bestMatch.confidence }
}

/**
 * Normalize string for matching
 * Removes common variations and punctuation
 */
function normalizeForMatching(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\b(the|a|an|inc|llc|ltd|corp|corporation|company|fund|funds|investment|investments|pension|plan)\b/g, '') // Remove common words
    .trim()
}

/**
 * Calculate string similarity using Levenshtein distance
 * @param str1 First string
 * @param str2 Second string
 * @returns Similarity score (0-1)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) {
    return 1.0
  }

  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Batch validate multiple signals
 * @param signals Array of signal inputs
 * @returns Array of validation results
 */
export function validateSignalBatch(signals: SignalInput[]): ValidationResult[] {
  return signals.map(signal => validateSignal(signal))
}

/**
 * Validation statistics helper
 * @param results Array of validation results
 * @returns Summary statistics
 */
export function getValidationStats(results: ValidationResult[]): {
  total: number
  valid: number
  invalid: number
  withWarnings: number
  validPercentage: number
} {
  const total = results.length
  const valid = results.filter(r => r.valid).length
  const invalid = results.filter(r => !r.valid).length
  const withWarnings = results.filter(r => r.warnings.length > 0).length

  return {
    total,
    valid,
    invalid,
    withWarnings,
    validPercentage: total > 0 ? Math.round((valid / total) * 100) : 0,
  }
}
