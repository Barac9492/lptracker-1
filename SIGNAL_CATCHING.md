# Signal Catching Guide

Automated signal catching is the core feature that tracks LP activity across the web and automatically updates your dashboard.

## 🎯 Overview

The system catches signals from multiple sources:
- **RSS Feeds** (Google News, industry publications)
- **News APIs** (NewsAPI.org)
- **Webhooks** (Zapier, Make.com, custom integrations)

Signals are automatically:
- ✅ Parsed and classified
- ✅ Tagged with relevant keywords
- ✅ Weighted by importance
- ✅ Assigned to the correct LP
- ✅ Used to update LP scores and message angles

---

## 🚀 Quick Start

### 1. Run Signal Catcher Manually

```bash
npm run catch-signals
```

This will:
- Scan RSS feeds for LP news
- Check Google News for LP mentions
- Parse and ingest any new signals
- Update LP scores automatically

### 2. Schedule Automated Runs

**Using cron (Linux/Mac):**
```bash
# Edit crontab
crontab -e

# Add this line to run every 30 minutes
*/30 * * * * cd /path/to/lpint && npm run catch-signals >> /var/log/lpint-signals.log 2>&1
```

**Using Windows Task Scheduler:**
- Create a new task
- Trigger: Every 30 minutes
- Action: Run `npm run catch-signals` in your project directory

---

## 📡 Data Sources

### Built-in (Free)

**1. Google News RSS**
- Searches for: "pension fund venture capital", "endowment investment", etc.
- Updates: Real-time
- Rate limits: ~100 requests/day recommended

**2. RSS Feeds**
- Pensions & Investments
- Institutional Investor
- Custom LP websites
- No API key needed

### Optional (Requires API Key)

**3. NewsAPI.org**
- Get API key: https://newsapi.org/
- Free tier: 100 requests/day
- Add to `.env`: `NEWS_API_KEY="your-key-here"`

**4. LinkedIn (via Apify)**
- Get API key: https://apify.com/
- Free tier: $5/month credit
- Tracks: Job postings, company posts, team changes
- Add to `.env`: `APIFY_API_KEY="your-key-here"`
- Module: `lib/signal-catchers/linkedin-monitor.ts`

---

## 🔧 Configuration

### Tracked LPs

Edit `lib/signal-catchers/rss-monitor.ts` to add your target LPs:

```typescript
const lpPatterns = [
  { pattern: /calpers/i, name: 'CalPERS (California Public Employees Retirement System)' },
  { pattern: /yale endowment/i, name: 'Yale Endowment' },
  // Add your LPs here:
  { pattern: /harvard endowment/i, name: 'Harvard Management Company' },
  { pattern: /mit endowment/i, name: 'MIT Investment Management Company' },
]
```

### Tag Classification

Customize how signals are tagged in `lib/signal-catchers/news-api.ts`:

```typescript
const tagPatterns = [
  { pattern: /\b(fund|funding|allocation)\b/i, tag: 'funding' },
  { pattern: /\b(hiring|recruit)\b/i, tag: 'hiring' },
  // Add your custom tags
]
```

### Weight Calculation

Adjust signal importance in `calculateWeight()` function:

```typescript
if (/\$\d+\s*billion/i.test(text)) weight += 1.0
if (/new fund|raised/i.test(text)) weight += 0.5
// Customize weights for your use case
```

---

## 🔗 Webhook Integration

### Setup

1. Add webhook secret to `.env`:
```bash
WEBHOOK_SECRET="your-secret-key-123"
```

2. Test endpoint:
```bash
curl http://localhost:3000/api/webhook?secret=your-secret-key-123
```

### Usage

**Send single signal:**
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Authorization: Bearer your-secret-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "lpName": "CalPERS (California Public Employees Retirement System)",
    "summary": "CalPERS announces $500M commitment to emerging managers",
    "tags": ["funding", "emerging-managers"],
    "url": "https://calpers.ca.gov/press",
    "weight": 2.0
  }'
```

**Send batch signals:**
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Authorization: Bearer your-secret-key-123" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "lpName": "Yale Endowment",
      "summary": "Yale hires new CIO",
      "tags": ["hiring"],
      "weight": 1.5
    },
    {
      "lpName": "Ontario Teachers Pension Plan",
      "summary": "Ontario Teachers expands VC allocation",
      "tags": ["expansion", "venture-capital"],
      "weight": 2.0
    }
  ]'
```

---

## 🔌 Third-Party Integrations

### Zapier

1. Create a Zap with trigger (e.g., "New RSS Item", "New Email")
2. Add action: **Webhooks by Zapier → POST**
3. Configure:
   - URL: `https://your-domain.com/api/webhook`
   - Method: POST
   - Headers: `Authorization: Bearer your-secret-key-123`
   - Body:
     ```json
     {
       "lpName": "{{LP Name}}",
       "summary": "{{Title}}",
       "tags": ["{{Tag}}"],
       "url": "{{URL}}",
       "weight": 1.5
     }
     ```

### Make.com (Integromat)

1. Create scenario with data source module
2. Add HTTP module → Make a request
3. Configure webhook as above

### Custom Scripts

Create custom scrapers or parsers that POST to the webhook:

```python
import requests

def send_signal(lp_name, summary, tags, url, weight=1.0):
    response = requests.post(
        'http://localhost:3000/api/webhook',
        headers={
            'Authorization': 'Bearer your-secret-key-123',
            'Content-Type': 'application/json'
        },
        json={
            'lpName': lp_name,
            'summary': summary,
            'tags': tags,
            'url': url,
            'weight': weight
        }
    )
    return response.json()

# Example usage
send_signal(
    'CalPERS (California Public Employees Retirement System)',
    'CalPERS increases alternative investments allocation',
    ['funding', 'allocation'],
    'https://example.com/article',
    2.0
)
```

---

## 📊 Monitoring

### Check Signal Catcher Output

```bash
npm run catch-signals
```

Output shows:
- Number of signals found
- Successful ingestions
- Errors/duplicates

### View Logs

```bash
# If running via cron
tail -f /var/log/lpint-signals.log
```

### Slack Notifications

Add to `.env`:
```bash
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

You'll get notifications when new signals are ingested.

---

## 🎨 Customization

### Add New Data Sources

Create a new signal catcher in `lib/signal-catchers/`:

```typescript
// lib/signal-catchers/linkedin-monitor.ts
export async function fetchLinkedInSignals(lpNames: string[]) {
  // Your logic here
  return signals
}
```

Then add to `scripts/catch-signals.ts`:

```typescript
import { fetchLinkedInSignals } from '../lib/signal-catchers/linkedin-monitor'

// In main():
const linkedInSignals = await fetchLinkedInSignals(['CalPERS', 'Yale'])
for (const signal of linkedInSignals) {
  await ingestSignal(signal)
}
```

### Custom Signal Processing

Modify `app/api/ingest/route.ts` to add custom logic:
- Auto-tag based on content
- Adjust weights dynamically
- Send notifications for high-value signals
- Integrate with CRM

---

## 🔒 Security

### Webhook Authentication

Always use webhook secrets in production:

```bash
# .env
WEBHOOK_SECRET="use-a-strong-random-string-here"
```

### Rate Limiting

Add rate limiting to webhook endpoint if exposed publicly:

```typescript
// Consider using @upstash/ratelimit or similar
```

### API Key Protection

Never commit API keys to git. Use environment variables only.

---

## 🐛 Troubleshooting

**No signals found:**
- Check RSS feed URLs are accessible
- Verify LP name patterns match actual mentions
- Test individual feeds with `fetchRSSSignals(url)`

**Duplicate signals:**
- Normal behavior - system prevents duplicate ingestion
- Signals are unique per (lpId + summary)

**Rate limits:**
- Add delays between requests
- Use free tier limits wisely
- Consider caching results

**Webhook not working:**
- Verify webhook secret matches
- Check server logs for errors
- Test with curl first

---

## 📈 Best Practices

1. **Start with free sources** (RSS, Google News) before paying for APIs
2. **Run signal catcher 2-4x per day** - hourly is overkill for LP news
3. **Monitor for false positives** - refine LP name patterns over time
4. **Adjust weights** based on what signals actually lead to successful outreach
5. **Keep webhook secret secure** - rotate periodically
6. **Log everything** - helps debug and improve over time

---

## 🚀 Next Steps

1. Run `npm run catch-signals` to test
2. Set up cron job for automation
3. Customize LP patterns for your targets
4. Add your own data sources
5. Integrate with Zapier/Make for email parsing
6. Monitor and refine over time

Happy signal catching! 🎯
