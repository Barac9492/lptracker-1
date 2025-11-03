#!/usr/bin/env tsx

/**
 * Iteration Script - Continuous Development Loop
 *
 * This script runs a continuous development cycle:
 * 1. Check PRD for next feature
 * 2. Build the feature
 * 3. Test it
 * 4. Review quality
 * 5. Get feedback
 * 6. Repeat
 *
 * Run: npm run iterate
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

interface Feature {
  name: string
  priority: number
  implemented: boolean
  files: string[]
  dependencies: string[]
}

const FEATURE_QUEUE: Feature[] = [
  {
    name: 'LinkedIn Scraping',
    priority: 1,
    implemented: false,
    files: ['lib/signal-catchers/linkedin-monitor.ts'],
    dependencies: ['apify-client']
  },
  {
    name: 'Signal Validation System',
    priority: 1,
    implemented: false,
    files: [
      'lib/validators/signal-validator.ts',
      'lib/validators/lp-name-matcher.ts'
    ],
    dependencies: []
  },
  {
    name: 'Testing Framework',
    priority: 1,
    implemented: false,
    files: [
      'tests/signal-catching.test.ts',
      'jest.config.js'
    ],
    dependencies: ['jest', '@types/jest', 'ts-jest']
  },
  {
    name: 'Email Newsletter Parsing',
    priority: 2,
    implemented: false,
    files: ['lib/signal-catchers/email-parser.ts'],
    dependencies: ['googleapis']
  },
  {
    name: 'SEC Filing Tracking',
    priority: 2,
    implemented: false,
    files: ['lib/signal-catchers/sec-monitor.ts'],
    dependencies: []
  },
]

/**
 * Check which features are already implemented
 */
function checkImplementedFeatures(): Feature[] {
  return FEATURE_QUEUE.map(feature => ({
    ...feature,
    implemented: feature.files.every(file => existsSync(file))
  }))
}

/**
 * Get next feature to implement
 */
function getNextFeature(features: Feature[]): Feature | null {
  const notImplemented = features
    .filter(f => !f.implemented)
    .sort((a, b) => a.priority - b.priority)

  return notImplemented[0] || null
}

/**
 * Display implementation guide for feature
 */
function displayImplementationGuide(feature: Feature) {
  console.log('\n' + '='.repeat(60))
  console.log(`🎯 FEATURE: ${feature.name}`)
  console.log('='.repeat(60))

  const guides: Record<string, string[]> = {
    'LinkedIn Scraping': [
      '\n📋 Implementation Guide:',
      '',
      '1. Install dependency:',
      '   npm install apify-client',
      '',
      '2. Get API key:',
      '   - Sign up at https://apify.com/',
      '   - Get free tier API key',
      '   - Add to .env: APIFY_API_KEY="your-key"',
      '',
      '3. Create lib/signal-catchers/linkedin-monitor.ts:',
      '```typescript',
      'import { ApifyClient } from \'apify-client\'',
      '',
      'export interface LinkedInSignal {',
      '  lpName: string',
      '  summary: string',
      '  tags: string[]',
      '  url: string',
      '  weight: number',
      '}',
      '',
      'export async function fetchLinkedInSignals(',
      '  lpNames: string[]',
      '): Promise<LinkedInSignal[]> {',
      '  const client = new ApifyClient({',
      '    token: process.env.APIFY_API_KEY,',
      '  })',
      '',
      '  const signals: LinkedInSignal[] = []',
      '',
      '  for (const lpName of lpNames) {',
      '    // Search company page',
      '    const input = {',
      '      search: lpName,',
      '      type: "company"',
      '    }',
      '',
      '    const run = await client.actor("apify/linkedin-company-scraper")',
      '      .call(input)',
      '',
      '    const { items } = await client.dataset(run.defaultDatasetId)',
      '      .listItems()',
      '',
      '    // Parse posts and job listings',
      '    for (const item of items) {',
      '      if (item.jobs && item.jobs.length > 0) {',
      '        signals.push({',
      '          lpName,',
      '          summary: `Hiring: ${item.jobs.length} open positions`,',
      '          tags: [\'hiring\', \'team-growth\'],',
      '          url: item.url,',
      '          weight: 1.5',
      '        })',
      '      }',
      '',
      '      if (item.recent_posts) {',
      '        // Parse for VC/investment mentions',
      '      }',
      '    }',
      '  }',
      '',
      '  return signals',
      '}',
      '```',
      '',
      '4. Integrate into scripts/catch-signals.ts',
      '5. Test: npm run catch-signals',
      '6. Document in SIGNAL_CATCHING.md',
    ],
    'Signal Validation System': [
      '\n📋 Implementation Guide:',
      '',
      '1. Create lib/validators/signal-validator.ts:',
      '```typescript',
      'export interface ValidationError {',
      '  field: string',
      '  message: string',
      '}',
      '',
      'export function validateSignal(signal: any): ValidationError[] {',
      '  const errors: ValidationError[] = []',
      '',
      '  if (!signal.lpName || typeof signal.lpName !== \'string\') {',
      '    errors.push({ field: \'lpName\', message: \'Required and must be string\' })',
      '  }',
      '',
      '  if (!signal.summary || signal.summary.length < 10) {',
      '    errors.push({ field: \'summary\', message: \'Must be at least 10 characters\' })',
      '  }',
      '',
      '  if (!Array.isArray(signal.tags)) {',
      '    errors.push({ field: \'tags\', message: \'Must be an array\' })',
      '  }',
      '',
      '  if (signal.weight && (signal.weight < 0 || signal.weight > 5)) {',
      '    errors.push({ field: \'weight\', message: \'Must be between 0 and 5\' })',
      '  }',
      '',
      '  if (signal.url && !isValidUrl(signal.url)) {',
      '    errors.push({ field: \'url\', message: \'Invalid URL format\' })',
      '  }',
      '',
      '  return errors',
      '}',
      '',
      'function isValidUrl(url: string): boolean {',
      '  try {',
      '    new URL(url)',
      '    return true',
      '  } catch {',
      '    return false',
      '  }',
      '}',
      '```',
      '',
      '2. Create lib/validators/lp-name-matcher.ts for fuzzy matching',
      '3. Integrate into app/api/ingest/route.ts',
      '4. Add validation to webhook endpoint',
      '5. Test with invalid signals',
    ],
    'Testing Framework': [
      '\n📋 Implementation Guide:',
      '',
      '1. Install dependencies:',
      '   npm install --save-dev jest @types/jest ts-jest',
      '',
      '2. Create jest.config.js:',
      '```javascript',
      'module.exports = {',
      '  preset: \'ts-jest\',',
      '  testEnvironment: \'node\',',
      '  roots: [\'<rootDir>/tests\'],',
      '  testMatch: [\'**/*.test.ts\'],',
      '  collectCoverage: true,',
      '  coverageDirectory: \'coverage\',',
      '}',
      '```',
      '',
      '3. Create tests/signal-catching.test.ts',
      '4. Write tests for key functions',
      '5. Add "test": "jest" to package.json scripts',
      '6. Run: npm test',
    ],
  }

  const guide = guides[feature.name] || ['Implementation guide not available yet.']
  guide.forEach(line => console.log(line))
}

/**
 * Main iteration loop
 */
async function main() {
  console.log('\n🔄 Development Iteration Agent')
  console.log('================================\n')

  // Check current state
  console.log('📊 Analyzing current implementation...\n')
  const features = checkImplementedFeatures()

  const implemented = features.filter(f => f.implemented)
  const remaining = features.filter(f => !f.implemented)

  console.log(`✅ Implemented: ${implemented.length}/${features.length}`)
  implemented.forEach(f => console.log(`   ✓ ${f.name}`))

  console.log(`\n⏳ Remaining: ${remaining.length}`)
  remaining.forEach(f => console.log(`   ○ ${f.name} (Priority ${f.priority})`))

  // Get next feature
  const nextFeature = getNextFeature(features)

  if (!nextFeature) {
    console.log('\n🎉 All features implemented! Check PRD.md for next phase.')
    rl.close()
    return
  }

  console.log(`\n🎯 Next Feature: ${nextFeature.name}`)

  const proceed = await ask('\nWould you like to see the implementation guide? (y/n): ')

  if (proceed.toLowerCase() === 'y' || proceed.toLowerCase() === 'yes') {
    displayImplementationGuide(nextFeature)

    console.log('\n' + '='.repeat(60))
    console.log('📝 Implementation Steps:')
    console.log('='.repeat(60))
    console.log('1. Follow the guide above to implement the feature')
    console.log('2. Run: npm run dev-agent (to validate)')
    console.log('3. Run: npm run iterate (to continue to next feature)')
    console.log('4. Commit your changes')
    console.log('\n')

    const buildNow = await ask('Would you like me to create the file scaffolding? (y/n): ')

    if (buildNow.toLowerCase() === 'y' || buildNow.toLowerCase() === 'yes') {
      console.log('\n🏗️  Creating file scaffolding...\n')

      for (const file of nextFeature.files) {
        if (!existsSync(file)) {
          const template = generateFileTemplate(nextFeature.name, file)
          const dir = file.split('/').slice(0, -1).join('/')
          if (dir && !existsSync(dir)) {
            execSync(`mkdir -p ${dir}`)
          }
          writeFileSync(file, template)
          console.log(`✅ Created: ${file}`)
        }
      }

      if (nextFeature.dependencies.length > 0) {
        console.log('\n📦 Installing dependencies...')
        console.log(`   npm install ${nextFeature.dependencies.join(' ')}`)
        try {
          execSync(`npm install ${nextFeature.dependencies.join(' ')}`, { stdio: 'inherit' })
        } catch (error) {
          console.log('⚠️  Dependency installation failed. Install manually.')
        }
      }

      console.log('\n✅ Scaffolding complete!')
      console.log('📝 Now implement the logic following the guide above.')
    }
  }

  rl.close()
}

/**
 * Generate file template
 */
function generateFileTemplate(featureName: string, filePath: string): string {
  const templates: Record<string, string> = {
    'lib/signal-catchers/linkedin-monitor.ts': `/**
 * LinkedIn Signal Monitor
 * Tracks LP activity on LinkedIn (job postings, posts, team changes)
 */

export interface LinkedInSignal {
  lpName: string
  summary: string
  tags: string[]
  url: string
  weight: number
  source: 'linkedin'
}

/**
 * Fetch LinkedIn signals for target LPs
 * Requires APIFY_API_KEY in .env
 */
export async function fetchLinkedInSignals(
  lpNames: string[]
): Promise<LinkedInSignal[]> {
  const signals: LinkedInSignal[] = []

  // TODO: Implement LinkedIn scraping
  // 1. Use Apify LinkedIn scraper
  // 2. Parse job postings
  // 3. Parse company posts
  // 4. Detect team changes
  // 5. Extract signals

  return signals
}
`,
    'lib/validators/signal-validator.ts': `/**
 * Signal Validation
 * Ensures signal data quality before ingestion
 */

export interface ValidationError {
  field: string
  message: string
}

/**
 * Validate signal data
 */
export function validateSignal(signal: any): ValidationError[] {
  const errors: ValidationError[] = []

  // TODO: Implement validation rules
  // 1. Check required fields
  // 2. Validate data types
  // 3. Check value ranges
  // 4. Validate URLs
  // 5. Check for duplicates

  return errors
}

/**
 * Check if signal is valid
 */
export function isValidSignal(signal: any): boolean {
  return validateSignal(signal).length === 0
}
`,
  }

  return templates[filePath] || `// TODO: Implement ${featureName}\n\nexport {}\n`
}

main().catch(error => {
  console.error('Error:', error)
  rl.close()
  process.exit(1)
})
