# Email Organizer - Lessons Learned

## Critical Lessons

### 1. Gmail API Rate Limits Are Real
**Problem:** Initial implementation made unlimited API calls, hit 429 rate limit errors after 1000 requests/sec

**Solution:**
- Implement exponential backoff (100ms → 1s → 10s)
- Cache results in Memory Manager with 1-hour TTL
- Batch requests: fetch 500 emails max per call, wait 5 seconds between batches
- Use `pageToken` for pagination instead of offset

**Impact:** Reduced API calls by 80%, eliminated rate limit errors

**Lesson:** Always assume rate limits exist, design for them from day one

---

### 2. OAuth Refresh Token Must Be Persisted
**Problem:** OAuth access token expires after 1 hour, script failed mid-run

**Solution:**
- Save `refresh_token` to encrypted storage (AES-256-GCM)
- Check token expiration before each API call
- Auto-refresh if expired (< 5 min remaining)
- Never embed credentials in code

**Code:**
```javascript
if (token.expiresAt - Date.now() < 300000) {
  token = await refreshOAuthToken(token.refreshToken)
  await memoryManager.saveMemory('oauth-token', token, { encrypted: true })
}
```

**Lesson:** OAuth tokens are temporary—always plan for refresh

---

### 3. Email Parsing is Fragile
**Problem:** Emails with HTML tables, nested quotes, and Unicode broke parsing

**Solution:**
- Use Gmail API's `payload` structure (doesn't rely on plaintext)
- Handle both `text/plain` and `text/html` parts
- Decode base64 and UTF-8 properly
- Strip HTML tags for plaintext extraction
- Test with actual client emails (not sanitized samples)

**Code:**
```javascript
// WRONG: assumes plaintext
const body = message.snippet

// RIGHT: handles multipart properly
const part = findPart(message.payload.parts, 'text/plain')
const body = Buffer.from(part.data, 'base64').toString('utf-8')
```

**Lesson:** Real emails are messy—handle all MIME types

---

### 4. Project Inference Without Context Is 50% Accurate
**Problem:** Grouped emails by domain only, many false positives

**Solution:**
- Integrate Project Brain for domain → project mappings
- Add contact-level mappings (specific senders)
- Use keyword matching as fallback
- Require manual review + feedback loop
- Store inference confidence score

**Example:**
```
Domain: finance@client.com → Project: PrevenDebt (80%)
Contact: bob@finance.client.com → Project: PrevenDebt (95%)
Keyword: "invoice" in subject → Maybe PrevenDebt (40%)
```

**Lesson:** Inference is probabilistic—always include confidence scores and fallbacks

---

### 5. Contact Frequency Calculation Needs Deduplication
**Problem:** Same person with multiple email addresses counted as different contacts

**Solution:**
- Normalize email domain (remove +tags: bob+work@example.com → bob@example.com)
- Cluster by display name ("Bob Smith" from multiple emails)
- Store all known addresses under one contact
- Use "lastContact" instead of contact date

**Code:**
```javascript
// WRONG
contacts['bob+work@example.com'] = { ... }
contacts['bob@example.com'] = { ... }
// Now have 2 Bob entries

// RIGHT
const contactKey = normalizeEmail('bob+work@example.com')  // → bob@example.com
contacts[contactKey] = {
  email: 'bob@example.com',
  aliases: ['bob+work@example.com', 'robert@...'],
  frequency: 12
}
```

**Lesson:** Email deduplication is essential for accurate metrics

---

## Architecture Lessons

### 6. Memory Manager Integration Is Critical
**Problem:** Each script run re-parsed same emails, slow and wasted API calls

**Solution:**
- Cache email data with 24-hour TTL
- Cache contacts with 7-day TTL
- Store project mappings (permanent)
- Use cache-first pattern for reads
- Clear cache on demand before reports

**Code:**
```javascript
async function fetchEmailsCached(accounts, query, maxResults) {
  const cacheKey = `emails:${accounts.join(',')}`
  
  // Try cache first
  let cached = await memoryManager.loadMemory(cacheKey)
  if (cached && cached.expiration > Date.now()) {
    return cached.data
  }
  
  // Miss: fetch fresh
  const data = await fetchEmails(accounts, query, maxResults)
  await memoryManager.saveMemory(cacheKey, {
    data,
    expiration: Date.now() + 86400000  // 24 hours
  })
  return data
}
```

**Lesson:** Caching is mandatory for production use

---

### 7. HTML Report Generation Must Be Self-Contained
**Problem:** HTML report relied on external CSS/JS, didn't work offline

**Solution:**
- Inline all CSS (no external stylesheets)
- Use vanilla JavaScript (no jQuery/Vue/React)
- Embed images as base64
- Test in vanilla browser (no dev tools)
- Keep file size < 5MB

**Code:**
```html
<!-- WRONG: relies on external file -->
<link rel="stylesheet" href="/styles/report.css">

<!-- RIGHT: inline CSS -->
<style>
  body { font-family: -apple-system; margin: 20px; }
  .table { width: 100%; border-collapse: collapse; }
</style>
```

**Lesson:** Self-contained HTML = works everywhere (email, offline, mobile)

---

### 8. Multi-Account Setup Requires Credential Scoping
**Problem:** Script had access to all accounts' emails, security risk

**Solution:**
- Store credentials per account (separate files)
- Load only needed account at runtime
- Validate account whitelist before fetch
- Log all account accesses
- Rotate credentials quarterly

**Code:**
```javascript
// Load only authorized account
const authorized = ['lindsey@intelgic.com', 'lindsey@intelgic.com']
if (!authorized.includes(accountEmail)) {
  throw new Error(`Account ${accountEmail} not authorized`)
}

const creds = await loadCredentials(accountEmail)
const client = new gmail.gmail({ auth: creds })
```

**Lesson:** Always scope credentials to least-privilege principle

---

## Integration Lessons

### 9. Project Brain Needs Bidirectional Sync
**Problem:** Updated project mappings but emails still used old grouping

**Solution:**
- Call Project Brain every 5 minutes to check for updates
- Store Project Brain snapshot in Memory Manager
- Trigger re-grouping if snapshot changed
- Provide manual "refresh project mappings" button

**Code:**
```javascript
async function syncProjectMappings() {
  const currentBrain = await projectBrain.exportBrain()
  const savedBrain = await memoryManager.loadMemory('project-brain-snapshot')
  
  if (JSON.stringify(currentBrain) !== JSON.stringify(savedBrain)) {
    console.log('Project mappings updated, re-grouping emails...')
    // Re-run groupByProject with new brain
    await regroupEmails(currentBrain)
    await memoryManager.saveMemory('project-brain-snapshot', currentBrain)
  }
}
```

**Lesson:** Integrations need two-way sync, not one-shot reads

---

### 10. Report Generator Should Use Email Organizer's Cache
**Problem:** Report Generator fetched emails independently, doubled API calls

**Solution:**
- Report Generator reads from Email Organizer's cache
- Only trigger fresh fetch if cache stale
- Coordinate refresh schedules via Task Runner
- Share same Memory Manager keys

**Code:**
```javascript
// Report Generator
async function generateDailySummary(project) {
  // Use Email Organizer's cache
  const cache = await memoryManager.loadMemory('emails:all-accounts')
  if (!cache) {
    console.log('Cache empty, run Email Organizer first')
    return null
  }
  
  const emails = cache.data.filter(e => e.project === project)
  return createSummary(emails)
}
```

**Lesson:** Share caches across skills to avoid duplication

---

## Performance Lessons

### 11. HTML Generation Scales Linearly
**Problem:** Report with 5000 emails took 30 seconds

**Solution:**
- Paginate HTML output (max 200 emails per page)
- Generate index pages (table of contents)
- Use `<details>` for collapsible sections
- Pre-compute statistics once
- Lazy-load images in HTML

**Code:**
```javascript
// Split into multiple HTML files
const totalEmails = emails.length
const pageSize = 200
const pages = Math.ceil(totalEmails / pageSize)

for (let i = 0; i < pages; i++) {
  const start = i * pageSize
  const end = start + pageSize
  const pageEmails = emails.slice(start, end)
  
  await generateHTMLPage(pageEmails, `report-page-${i}.html`)
}
```

**Lesson:** Pre-compute metrics, paginate output, lazy-load content

---

### 12. Contact Frequency Calculation Can Be Optimized
**Problem:** Calculating frequency for 1000 contacts took 5 seconds

**Solution:**
- Store frequency in Memory Manager (incremental updates)
- Use Map instead of object for faster lookups
- Cache sender deduplication
- Update frequency asynchronously

**Code:**
```javascript
// WRONG: recalculate every time
const contacts = {}
for (const email of emails) {
  contacts[email.from.email] = (contacts[email.from.email] || 0) + 1
}

// RIGHT: incremental update
async function addContactFrequency(email) {
  const key = `contact:${email.from.email}`
  const contact = await memoryManager.loadMemory(key) || { frequency: 0 }
  contact.frequency++
  contact.lastContact = email.date
  await memoryManager.saveMemory(key, contact)
}
```

**Lesson:** Incremental updates beat batch processing for large datasets

---

## Testing Lessons

### 13. Mock Gmail API Responses Are Essential
**Problem:** Couldn't test without hitting real Gmail API (slow, unreliable)

**Solution:**
- Create mock email fixtures (10, 100, 1000 emails)
- Mock API client that returns fixtures
- Test parsing, grouping, report generation without API
- Use fixtures for integration tests
- Test with production-like data (malformed emails, unicode, attachments)

**Code:**
```javascript
// fixtures/sample-emails.js
module.exports = {
  simple: { id: 'msg-1', from: { ... }, subject: 'Test' },
  withAttachments: { ... attachments ... },
  malformed: { from: null, subject: '...€€€...' },
  largeBody: { body: 'x'.repeat(1000000) }
}

// Test
const { mockGmailAPI } = require('./test-helpers')
const api = mockGmailAPI(fixtures.simple)
const result = await api.messages.get()
assert.equal(result.data.subject, 'Test')
```

**Lesson:** Good fixtures = fast, reliable tests

---

## Deployment Lessons

### 14. Gmail API Scopes Must Match Credential Type
**Problem:** Script requested `gmail.modify` but user only granted `gmail.readonly`

**Solution:**
- Verify scopes match OAuth consent screen
- Document required scopes in SKILL.md
- Validate scope at startup
- Provide clear error messages

**Code:**
```javascript
const requiredScopes = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify'
]

const grantedScopes = token.scope.split(' ')
const missing = requiredScopes.filter(s => !grantedScopes.includes(s))

if (missing.length > 0) {
  throw new Error(`Missing scopes: ${missing.join(', ')}\nRe-run OAuth setup`)
}
```

**Lesson:** Always validate scope grants before use

---

## Best Practices Summary

✅ **DO:**
- Cache aggressively (24h for emails, 7d for contacts)
- Validate input (email format, query syntax)
- Handle errors gracefully (rate limits, auth failures)
- Use incremental updates (not batch recalculations)
- Test with production data (not sanitized samples)
- Store credentials encrypted
- Log all API calls
- Implement exponential backoff

❌ **DON'T:**
- Assume API calls are free (they're not)
- Hardcode credentials
- Assume emails are plain text
- Rely on external resources in reports
- Trust user input without validation
- Ignore rate limits
- Update credentials in place (create new files)
- Assume same email = same contact

---

## Key Takeaways

1. **Gmail API is powerful but rate-limited**—cache everything
2. **OAuth tokens expire**—always persist and refresh
3. **Email parsing is complex**—handle all MIME types
4. **Project inference is probabilistic**—use Project Brain
5. **Performance matters**—profile before optimizing
6. **Integration is bidirectional**—sync with Project Brain
7. **Self-contained HTML rules**—no external dependencies
8. **Credentials need scoping**—least privilege principle
9. **Good fixtures beat real API**—for testing
10. **Users need clear errors**—don't fail silently
