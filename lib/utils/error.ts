/**
 * Create a short, human-readable error summary from unknown error values.
 * This is especially useful when dealing with AggregateError instances
 * produced by network libraries (e.g. rss-parser) that otherwise dump a
 * massive stack trace for each failed connection attempt.
 */
export function summarizeError(error: unknown): string {
  if (error instanceof AggregateError) {
    const aggregate = error as AggregateError & { errors?: unknown[] }
    const codes = new Set<string>()
    const messages = new Set<string>()

    for (const inner of aggregate.errors ?? []) {
      if (!inner) continue

      if (inner instanceof Error) {
        if (inner.message) {
          messages.add(inner.message)
        }
        const code = (inner as unknown as { code?: unknown }).code
        if (typeof code === 'string') {
          codes.add(code)
        }
        continue
      }

      if (typeof inner === 'object') {
        const maybeCode = (inner as { code?: unknown }).code
        if (typeof maybeCode === 'string') {
          codes.add(maybeCode)
        }

        const maybeMessage = (inner as { message?: unknown }).message
        if (typeof maybeMessage === 'string' && maybeMessage.length > 0) {
          messages.add(maybeMessage)
        }
      }
    }

    const codePart = codes.size > 0 ? ` (${Array.from(codes).join(', ')})` : ''
    const messagePart = messages.size > 0 ? `: ${Array.from(messages)[0]}` : ''
    return `Network request failed${codePart}${messagePart}`
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') {
      return message
    }
  }

  if (typeof error === 'string') {
    return error
  }

  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

/**
 * Convenience helper that prefixes a summary with contextual information.
 */
export function formatErrorWithContext(context: string, error: unknown): string {
  const summary = summarizeError(error)
  return summary ? `${context}: ${summary}` : context
}
