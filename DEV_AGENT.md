# Development Agent System

An autonomous development and quality assurance system that continuously builds, tests, and iterates on the LP Intelligence Tracker.

---

## 🤖 Overview

The dev agent system consists of three interconnected components:

1. **PRD.md** - Product Requirements Document with all features and success criteria
2. **dev-agent.ts** - Analyzes, validates, and provides feedback
3. **iterate.ts** - Guides implementation of next features

Together, they create a continuous improvement loop:

```
┌─────────────────────────────────────────────┐
│                                             │
│    ┌──────────┐      ┌──────────┐         │
│    │   PRD    │─────▶│Dev Agent │         │
│    │  (Goals) │      │(Analyze) │         │
│    └──────────┘      └────┬─────┘         │
│                           │                │
│                           ▼                │
│                      ┌─────────┐           │
│                      │Validate │           │
│                      │& Review │           │
│                      └────┬────┘           │
│                           │                │
│                           ▼                │
│                    ┌──────────────┐        │
│          ┌─────────│   Iterate    │        │
│          │         │(Build Next)  │        │
│          │         └──────┬───────┘        │
│          │                │                │
│          │                ▼                │
│          │          [Implement]            │
│          │                │                │
│          └────────────────┘                │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Run Dev Agent (Analysis & Validation)

```bash
npm run dev-agent
```

**What it does:**
- ✅ Analyzes current implementation vs PRD
- ✅ Validates signal catching functionality
- ✅ Checks code quality
- ✅ Suggests next features to build
- ✅ Generates implementation plan
- ✅ Provides actionable recommendations

**Output:**
```
🤖 Development Agent Starting...

📊 ANALYZING CURRENT STATE
✅ Complete: 3
⏳ Not Started: 5
  ✓ RSS Feed Monitoring
  ✓ News API Integration
  ✓ Webhook Endpoint
  ✗ LinkedIn Scraping (Priority 1)
  ✗ Signal Validation System (Priority 1)

🔍 VALIDATING SIGNAL CATCHING
✅ Signal catching script exists: Script found
✅ RSS monitor module exists: Module found
✅ Database configured: DATABASE_URL found

🎨 CODE QUALITY CHECK
✅ TypeScript compilation: No errors
⚠️  Code TODOs: Found 3 TODO comments

🚀 NEXT STEPS
1. LinkedIn Scraping (Priority 1)
2. Signal Validation System (Priority 1)
3. Testing Framework (Priority 1)

📋 IMPLEMENTATION PLAN: LinkedIn Scraping
1. Install: npm install apify-client
2. Create: lib/signal-catchers/linkedin-monitor.ts
3. Implement: fetchLinkedInSignals(lpNames: string[])
[...]

📈 SUMMARY & RECOMMENDATIONS
Progress: 30% of planned features complete
🎯 Recommended Actions:
1. Implement the next priority feature from the plan above
2. Run signal catching to test: npm run catch-signals
3. Validate quality: npm run dev-agent
```

### 2. Run Iteration Agent (Build Next Feature)

```bash
npm run iterate
```

**What it does:**
- 📊 Shows implementation progress
- 🎯 Identifies next priority feature
- 📋 Displays step-by-step implementation guide
- 🏗️ Creates file scaffolding automatically
- 📦 Installs required dependencies
- 🔄 Prepares for next iteration

**Interaction:**
```
🔄 Development Iteration Agent

📊 Analyzing current implementation...

✅ Implemented: 3/8
   ✓ RSS Feed Monitoring
   ✓ News API Integration
   ✓ Webhook Endpoint

⏳ Remaining: 5
   ○ LinkedIn Scraping (Priority 1)
   ○ Signal Validation System (Priority 1)
   ○ Testing Framework (Priority 1)

🎯 Next Feature: LinkedIn Scraping

Would you like to see the implementation guide? (y/n): y

[Shows detailed guide]

Would you like me to create the file scaffolding? (y/n): y

🏗️  Creating file scaffolding...
✅ Created: lib/signal-catchers/linkedin-monitor.ts
📦 Installing dependencies...

✅ Scaffolding complete!
📝 Now implement the logic following the guide above.
```

---

## 🔄 Development Workflow

### Standard Iteration Cycle

1. **Analyze** - Run `npm run dev-agent` to see what's needed
2. **Plan** - Review the implementation plan
3. **Build** - Run `npm run iterate` to scaffold and build
4. **Implement** - Follow the guide to add the logic
5. **Test** - Run `npm run catch-signals` or relevant tests
6. **Validate** - Run `npm run dev-agent` again to verify
7. **Commit** - Git commit your changes
8. **Repeat** - Run `npm run iterate` for next feature

### Example Session

```bash
# Day 1: Start with analysis
$ npm run dev-agent
# Shows: LinkedIn Scraping is next priority

# Get implementation guide
$ npm run iterate
# Choose: y (see guide)
# Choose: y (create scaffolding)

# Implement the feature
$ code lib/signal-catchers/linkedin-monitor.ts
# (Add logic following guide)

# Test it
$ npm run catch-signals

# Validate
$ npm run dev-agent
# All checks pass!

# Commit
$ git add -A
$ git commit -m "feat: Add LinkedIn scraping"

# Next iteration
$ npm run iterate
# Shows: Signal Validation System is next
```

---

## 📋 Feature Queue

Current priority queue (as of latest PRD):

**Priority 1 (Critical):**
1. ✅ RSS Feed Monitoring
2. ✅ News API Integration
3. ✅ Webhook Endpoint
4. ⏳ LinkedIn Scraping
5. ⏳ Signal Validation System
6. ⏳ Testing Framework

**Priority 2 (Important):**
7. ⏳ Email Newsletter Parsing
8. ⏳ SEC Filing Tracking
9. ⏳ Response Tracking
10. ⏳ Data Quality Dashboard

**Priority 3 (Nice-to-have):**
- Conference tracking
- Podcast mentions
- ML scoring model
- AI message generation

---

## 🎯 Success Criteria

The dev agent validates against these criteria:

### Signal Catching
- ✅ All source modules exist
- ✅ Automation script operational
- ✅ Database connection configured
- ✅ API endpoints functional

### Code Quality
- ✅ TypeScript compiles without errors
- ⚠️ Minimal TODO/FIXME comments
- ✅ Files follow naming conventions
- ✅ Modules properly exported

### Feature Completeness
- ✅ All Priority 1 features implemented
- ⏳ Priority 2 features in progress
- 📊 Progress tracked in PRD

---

## 🛠️ Customization

### Adding New Features

Edit `scripts/iterate.ts` and add to `FEATURE_QUEUE`:

```typescript
{
  name: 'Your New Feature',
  priority: 1,
  implemented: false,
  files: ['path/to/file.ts'],
  dependencies: ['npm-package']
}
```

### Adding Implementation Guides

Add to the `guides` object in `iterate.ts`:

```typescript
'Your New Feature': [
  '1. Step one',
  '2. Step two',
  '3. Code example:',
  '```typescript',
  'export function yourFeature() {',
  '  // Implementation',
  '}',
  '```',
]
```

### Customizing Validation

Edit `scripts/dev-agent.ts` in the `validateSignalCatching()` function:

```typescript
results.push({
  test: 'Your custom test',
  passed: yourCondition,
  message: 'Your message'
})
```

---

## 📊 Monitoring Progress

### Check Implementation Progress

```bash
npm run dev-agent
```

Look for:
- **Complete**: How many features are done
- **Pass Rate**: Validation success percentage
- **Progress**: Overall completion percentage

### Track Quality Metrics

The dev agent checks:
- File existence
- TypeScript compilation
- Database connectivity
- Code cleanliness (TODOs)

### View PRD Status

Open `PRD.md` to see:
- ✅ Completed features
- 🔄 In-progress features
- ⏳ Not started features
- 🎯 Success metrics

---

## 🔧 Troubleshooting

### Dev Agent Reports Failures

**Issue:** Validation tests failing
**Solution:** Review the specific test that failed and fix the issue

Example:
```
❌ TypeScript compilation: Errors found
```
Run: `npx tsc --noEmit` to see errors

### Iteration Agent Can't Find Next Feature

**Issue:** "All features implemented!"
**Solution:** Update PRD.md with Phase 2 goals and add to `FEATURE_QUEUE` in `iterate.ts`

### Files Not Created

**Issue:** Scaffolding fails
**Solution:** Check directory permissions and run with proper access

### Dependencies Won't Install

**Issue:** npm install fails in iterate
**Solution:** Install manually: `npm install package-name`

---

## 📖 Advanced Usage

### Batch Building

Build multiple features in one session:

```bash
# Iterate 3 times
for i in {1..3}; do
  npm run iterate
  # Implement feature
  npm run dev-agent
  git commit -am "feat: Feature $i"
done
```

### Continuous Integration

Add to CI/CD pipeline:

```yaml
# .github/workflows/dev-agent.yml
name: Dev Agent Check
on: [push]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run dev-agent
```

### Quality Gates

Use dev-agent as a quality gate:

```bash
#!/bin/bash
npm run dev-agent
if [ $? -eq 0 ]; then
  echo "✅ Quality checks passed"
  git push
else
  echo "❌ Quality checks failed"
  exit 1
fi
```

---

## 🎓 Best Practices

1. **Run dev-agent before starting work** - Know what's needed
2. **Use iterate for scaffolding** - Saves time and ensures consistency
3. **Follow implementation guides** - They're tested patterns
4. **Validate after each feature** - Catch issues early
5. **Keep PRD updated** - Single source of truth
6. **Commit frequently** - Small, focused commits
7. **Test as you go** - Don't accumulate technical debt

---

## 🚀 Next Steps

1. Run `npm run dev-agent` to see current status
2. Run `npm run iterate` to start building next feature
3. Follow the implementation guide
4. Test your work
5. Validate with dev-agent
6. Commit and repeat

**Goal:** Continuous iteration toward PRD completion! 🎯
