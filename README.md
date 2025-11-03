# LPint - LP Intelligence Tracker

A Next.js 15 application for tracking Limited Partner (LP) signals and prioritizing outreach.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Prisma** + **Supabase** (PostgreSQL)
- **Tailwind CSS**
- **PapaCSV** for CSV uploads

## Features

- 📊 Dashboard with Top 3 priority LPs and full LP table
- 🔍 LP detail pages with signals, scoring, and outreach tracking
- 📤 CSV upload for bulk LP import
- 🤖 Automated scoring based on signals
- 💡 Smart message angle suggestions
- 📨 Outreach logging and history
- ⏰ Daily cron job with optional Slack notifications

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a Supabase project and get your PostgreSQL connection string.

Update `.env`:

```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

### 3. Run Prisma Migrations

```bash
npm run prisma:migrate
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Seed Database

```bash
npm run seed
```

This creates 3 sample LPs with signals so you can immediately see the app in action.

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
lpint/
├── app/
│   ├── api/
│   │   ├── ingest/          # POST - Create signals
│   │   ├── score/           # POST - Recompute LP scores
│   │   ├── outreach/        # POST - Log outreach
│   │   ├── lp/upsert/       # POST - Create/update LPs
│   │   └── cron/daily/      # GET  - Daily top 3 report
│   ├── lp/[id]/             # LP detail page
│   ├── upload/              # CSV upload page
│   └── page.tsx             # Dashboard
├── lib/
│   ├── db.ts                # Prisma singleton
│   └── scoring.ts           # Scoring logic
└── prisma/
    ├── schema.prisma        # Database schema
    └── seed.ts              # Seed data
```

## API Routes

### POST /api/ingest

Create a signal and update LP score.

```json
{
  "lpName": "Sequoia Capital",
  "summary": "Announced new $2B fund",
  "tags": ["funding", "expansion"],
  "url": "https://example.com/article",
  "weight": 2.0
}
```

### POST /api/score

Recompute score and message angle for an LP.

```json
{
  "lpId": "clx..."
}
```

### POST /api/outreach

Log an outreach attempt.

```json
{
  "lpId": "clx...",
  "subject": "Partnership opportunity",
  "body": "Message content...",
  "channel": "email"
}
```

### GET /api/cron/daily?secret=YOUR_SECRET

Returns top 3 LPs and optionally posts to Slack.

## Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."

# Optional
CRON_SECRET="your-secret-here"
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

## CSV Upload Format

Upload CSVs with these columns:

```csv
name,contactName,email,geo,strategy
Sequoia Capital,Jane Doe,jane@sequoia.com,USA,"Growth,Enterprise"
```

- **name** (required): LP firm name
- **contactName** (optional): Primary contact
- **email** (optional): Contact email
- **geo** (optional): Geographic location
- **strategy** (optional): Comma-separated or JSON array

## Scoring Logic

Scores are calculated from signals based on:
- Signal weight (default: 1.0)
- High-value tags (funding, acquisition, partnership, etc.)
- Recency bonus for signals in last 30 days

Message angles are suggested based on most frequent signal tags.

## Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
npm run seed             # Seed database with sample data
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add `DATABASE_URL` environment variable
4. Deploy

### Other Platforms

1. Run `npm run build`
2. Set environment variables
3. Run `npm start`

## License

MIT
