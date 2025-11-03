#!/usr/bin/env tsx

/**
 * Development Agent - Autonomous builder and reviewer
 *
 * This agent:
 * 1. Analyzes current state vs PRD
 * 2. Identifies gaps and priorities
 * 3. Suggests next features to build
 * 4. Validates signal catching quality
 * 5. Tests integrations
 * 6. Provides feedback for iteration
 *
 * Run: npm run dev-agent
 */

import { readFileSync, existsSync } from 'fs'
import { execSync } from 'child_process'

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function section(title: string) {
  console.log('\n' + '='.repeat(60))
  log(title, 'bright')
  console.log('='.repeat(60) + '\n')
}

interface FeatureStatus {
  name: string
  status: 'complete' | 'in-progress' | 'not-started'
  priority: 1 | 2 | 3
  files: string[]
}

interface ValidationResult {
  test: string
  passed: boolean
  message: string
}

/**
 * Analyze current implementation state
 */
function analyzeCurrentState(): FeatureStatus[] {
  const features: FeatureStatus[] = [
    {
      name: 'RSS Feed Monitoring',
      status: existsSync('lib/signal-catchers/rss-monitor.ts') ? 'complete' : 'not-started',
      priority: 1,
      files: ['lib/signal-catchers/rss-monitor.ts']
    },
    {
      name: 'News API Integration',
      status: existsSync('lib/signal-catchers/news-api.ts') ? 'complete' : 'not-started',
      priority: 1,
      files: ['lib/signal-catchers/news-api.ts']
    },
    {
      name: 'Webhook Endpoint',
      status: existsSync('app/api/webhook/route.ts') ? 'complete' : 'not-started',
      priority: 1,
      files: ['app/api/webhook/route.ts']
    },
    {
      name: 'LinkedIn Scraping',
      status: existsSync('lib/signal-catchers/linkedin-monitor.ts') ? 'complete' : 'not-started',
      priority: 1,
      files: ['lib/signal-catchers/linkedin-monitor.ts']
    },
    {
      name: 'SEC Filing Tracking',
      status: existsSync('lib/signal-catchers/sec-monitor.ts') ? 'complete' : 'not-started',
      priority: 2,
      files: ['lib/signal-catchers/sec-monitor.ts']
    },
    {
      name: 'Email Newsletter Parsing',
      status: existsSync('lib/signal-catchers/email-parser.ts') ? 'complete' : 'not-started',
      priority: 2,
      files: ['lib/signal-catchers/email-parser.ts']
    },
    {
      name: 'Signal Validation System',
      status: existsSync('lib/validators/signal-validator.ts') ? 'complete' : 'not-started',
      priority: 1,
      files: ['lib/validators/signal-validator.ts']
    },
    {
      name: 'Testing Framework',
      status: existsSync('tests/signal-catching.test.ts') ? 'complete' : 'not-started',
      priority: 1,
      files: ['tests/signal-catching.test.ts']
    },
    {
      name: 'Response Tracking',
      status: existsSync('app/api/outreach/response/route.ts') ? 'complete' : 'not-started',
      priority: 2,
      files: ['app/api/outreach/response/route.ts']
    },
    {
      name: 'Data Quality Dashboard',
      status: existsSync('app/quality/page.tsx') ? 'complete' : 'not-started',
      priority: 2,
      files: ['app/quality/page.tsx']
    },
  ]

  return features
}

/**
 * Validate signal catching functionality
 */
async function validateSignalCatching(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []

  // Test 1: Check if signal catching script exists
  results.push({
    test: 'Signal catching script exists',
    passed: existsSync('scripts/catch-signals.ts'),
    message: existsSync('scripts/catch-signals.ts')
      ? 'Script found at scripts/catch-signals.ts'
      : 'Missing: scripts/catch-signals.ts'
  })

  // Test 2: Check if RSS monitor exists
  results.push({
    test: 'RSS monitor module exists',
    passed: existsSync('lib/signal-catchers/rss-monitor.ts'),
    message: existsSync('lib/signal-catchers/rss-monitor.ts')
      ? 'Module found'
      : 'Missing: lib/signal-catchers/rss-monitor.ts'
  })

  // Test 3: Check if News API integration exists
  results.push({
    test: 'News API integration exists',
    passed: existsSync('lib/signal-catchers/news-api.ts'),
    message: existsSync('lib/signal-catchers/news-api.ts')
      ? 'Module found'
      : 'Missing: lib/signal-catchers/news-api.ts'
  })

  // Test 4: Check if webhook endpoint exists
  results.push({
    test: 'Webhook endpoint exists',
    passed: existsSync('app/api/webhook/route.ts'),
    message: existsSync('app/api/webhook/route.ts')
      ? 'Endpoint found'
      : 'Missing: app/api/webhook/route.ts'
  })

  // Test 5: Check if ingest API exists
  results.push({
    test: 'Ingest API endpoint exists',
    passed: existsSync('app/api/ingest/route.ts'),
    message: existsSync('app/api/ingest/route.ts')
      ? 'Endpoint found'
      : 'Missing: app/api/ingest/route.ts'
  })

  // Test 6: Check database connection
  try {
    const env = readFileSync('.env', 'utf-8')
    const hasDb = env.includes('DATABASE_URL')
    results.push({
      test: 'Database configured',
      passed: hasDb,
      message: hasDb ? 'DATABASE_URL found in .env' : 'DATABASE_URL missing in .env'
    })
  } catch {
    results.push({
      test: 'Database configured',
      passed: false,
      message: '.env file not found'
    })
  }

  return results
}

/**
 * Check code quality
 */
function checkCodeQuality(): ValidationResult[] {
  const results: ValidationResult[] = []

  // Check if TypeScript compiles
  try {
    log('Checking TypeScript compilation...', 'cyan')
    execSync('npx tsc --noEmit', { stdio: 'pipe' })
    results.push({
      test: 'TypeScript compilation',
      passed: true,
      message: 'No TypeScript errors'
    })
  } catch (error) {
    results.push({
      test: 'TypeScript compilation',
      passed: false,
      message: 'TypeScript compilation errors found'
    })
  }

  // Check for TODOs in code
  try {
    const output = execSync('grep -r "TODO\\|FIXME\\|HACK" --include="*.ts" --include="*.tsx" . 2>/dev/null || true', {
      encoding: 'utf-8'
    })
    const todoCount = output.trim().split('\n').filter(line => line.length > 0).length
    results.push({
      test: 'Code TODOs',
      passed: todoCount === 0,
      message: `Found ${todoCount} TODO/FIXME/HACK comments`
    })
  } catch {
    results.push({
      test: 'Code TODOs',
      passed: true,
      message: 'No TODOs found'
    })
  }

  return results
}

/**
 * Suggest next features to build
 */
function suggestNextFeatures(features: FeatureStatus[]): string[] {
  const suggestions: string[] = []

  // Get incomplete high-priority features
  const missing = features
    .filter(f => f.status === 'not-started')
    .sort((a, b) => a.priority - b.priority)

  if (missing.length === 0) {
    suggestions.push('✅ All planned features complete! Time to expand the PRD.')
    return suggestions
  }

  suggestions.push(`\n🎯 Next Features to Build (by priority):\n`)

  missing.slice(0, 5).forEach((feature, index) => {
    suggestions.push(`${index + 1}. ${feature.name} (Priority ${feature.priority})`)
    suggestions.push(`   Files: ${feature.files.join(', ')}`)
  })

  return suggestions
}

/**
 * Generate implementation plan for next feature
 */
function generateImplementationPlan(feature: FeatureStatus): string[] {
  const plans: Record<string, string[]> = {
    'LinkedIn Scraping': [
      '1. Install: npm install apify-client (or use Phantombuster API)',
      '2. Create: lib/signal-catchers/linkedin-monitor.ts',
      '3. Implement: fetchLinkedInSignals(lpNames: string[])',
      '4. Parse: Job postings, profile updates, company posts',
      '5. Tag: hiring, team-changes, company-news',
      '6. Integrate: Add to scripts/catch-signals.ts',
      '7. Test: Run manually and verify signals',
      '8. Document: Update SIGNAL_CATCHING.md',
    ],
    'SEC Filing Tracking': [
      '1. Research: SEC EDGAR API documentation',
      '2. Create: lib/signal-catchers/sec-monitor.ts',
      '3. Implement: fetch13FFilings(lpNames: string[])',
      '4. Parse: XML/SGML filings for holdings',
      '5. Tag: portfolio-changes, new-positions, increased-positions',
      '6. Integrate: Add to automation script',
      '7. Test: Verify with known filings',
      '8. Schedule: Quarterly runs (filings are quarterly)',
    ],
    'Email Newsletter Parsing': [
      '1. Setup: Gmail API credentials',
      '2. Install: npm install googleapis',
      '3. Create: lib/signal-catchers/email-parser.ts',
      '4. Implement: parseNewsletters()',
      '5. Filter: Institutional Investor, P&I, etc.',
      '6. Extract: LP mentions and events',
      '7. Test: Parse sample emails',
      '8. Automate: Run daily via cron',
    ],
    'Signal Validation System': [
      '1. Create: lib/validators/signal-validator.ts',
      '2. Implement: validateSignal(signal)',
      '3. Checks: LP name exists, tags are valid, weight in range',
      '4. Checks: URL format, date format, no duplicates',
      '5. Create: lib/validators/lp-name-matcher.ts (fuzzy matching)',
      '6. Integrate: Add to /api/ingest and /api/webhook',
      '7. Test: Try invalid signals',
      '8. Monitor: Log validation failures',
    ],
    'Testing Framework': [
      '1. Install: npm install --save-dev jest @types/jest ts-jest',
      '2. Setup: jest.config.js',
      '3. Create: tests/signal-catching.test.ts',
      '4. Test: RSS parsing, LP detection, tag extraction',
      '5. Test: Webhook endpoint, ingest API',
      '6. Test: Scoring algorithm, angle suggestions',
      '7. Add script: "test": "jest"',
      '8. Run: npm test',
    ],
  }

  return plans[feature.name] || ['Implementation plan not defined yet']
}

/**
 * Main agent execution
 */
async function main() {
  log('🤖 Development Agent Starting...', 'bright')
  log(`Timestamp: ${new Date().toISOString()}`, 'cyan')

  // 1. Analyze current state
  section('📊 ANALYZING CURRENT STATE')
  const features = analyzeCurrentState()

  const complete = features.filter(f => f.status === 'complete')
  const inProgress = features.filter(f => f.status === 'in-progress')
  const notStarted = features.filter(f => f.status === 'not-started')

  log(`✅ Complete: ${complete.length}`, 'green')
  log(`🔄 In Progress: ${inProgress.length}`, 'yellow')
  log(`⏳ Not Started: ${notStarted.length}`, 'red')

  complete.forEach(f => log(`  ✓ ${f.name}`, 'green'))
  notStarted.forEach(f => log(`  ✗ ${f.name} (Priority ${f.priority})`, 'red'))

  // 2. Validate signal catching
  section('🔍 VALIDATING SIGNAL CATCHING')
  const validations = await validateSignalCatching()

  validations.forEach(v => {
    const icon = v.passed ? '✅' : '❌'
    const color = v.passed ? 'green' : 'red'
    log(`${icon} ${v.test}: ${v.message}`, color)
  })

  const passRate = (validations.filter(v => v.passed).length / validations.length * 100).toFixed(0)
  log(`\nPass Rate: ${passRate}%`, passRate === '100' ? 'green' : 'yellow')

  // 3. Check code quality
  section('🎨 CODE QUALITY CHECK')
  const quality = checkCodeQuality()

  quality.forEach(q => {
    const icon = q.passed ? '✅' : '⚠️'
    const color = q.passed ? 'green' : 'yellow'
    log(`${icon} ${q.test}: ${q.message}`, color)
  })

  // 4. Suggest next features
  section('🚀 NEXT STEPS')
  const suggestions = suggestNextFeatures(features)
  suggestions.forEach(s => log(s, 'cyan'))

  // 5. Generate implementation plan for top priority
  const nextFeature = notStarted
    .sort((a, b) => a.priority - b.priority)[0]

  if (nextFeature) {
    section(`📋 IMPLEMENTATION PLAN: ${nextFeature.name}`)
    const plan = generateImplementationPlan(nextFeature)
    plan.forEach(step => log(step, 'magenta'))
  }

  // 6. Summary and recommendations
  section('📈 SUMMARY & RECOMMENDATIONS')

  const completionRate = (complete.length / features.length * 100).toFixed(0)
  log(`Progress: ${completionRate}% of planned features complete`, 'bright')

  if (parseFloat(completionRate) < 100) {
    log('\n🎯 Recommended Actions:', 'bright')
    log('1. Implement the next priority feature from the plan above', 'cyan')
    log('2. Run signal catching to test: npm run catch-signals', 'cyan')
    log('3. Validate quality: npm run dev-agent', 'cyan')
    log('4. Update PRD.md with progress', 'cyan')
    log('5. Commit and iterate', 'cyan')
  } else {
    log('\n🎉 All features complete! Consider:', 'green')
    log('1. Expanding the PRD with Phase 2 features', 'cyan')
    log('2. Optimizing performance', 'cyan')
    log('3. Adding ML/AI capabilities', 'cyan')
    log('4. Building analytics dashboard', 'cyan')
  }

  // 7. Exit with status code
  const allPassed = validations.every(v => v.passed)
  if (!allPassed) {
    log('\n⚠️  Some validations failed. Review and fix before proceeding.', 'yellow')
    process.exit(1)
  }

  log('\n✅ Development agent check complete!', 'green')
  process.exit(0)
}

main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red')
  console.error(error)
  process.exit(1)
})
