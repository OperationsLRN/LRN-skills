# Email Organizer - Function Reference

## Core Functions

### fetchEmails(accounts, query, maxResults)
Fetch emails from one or more Gmail accounts

**Parameters:**
- `accounts` (string[]): Array of email addresses to fetch from
- `query` (string): Gmail search query (e.g., "in:inbox", "from:client@", "subject:invoice")
- `maxResults` (number): Max emails to fetch (default: 100, max: 500)

**Returns:**
```javascript
{
  emails: [
    {
      id: "message-id",
      from: { email: "sender@example.com", name: "Sender Name" },
      to: ["lindsey@intelgic.com"],
      subject: "Email subject",
      body: "Full email body",
      plainText: "Plain text version",
      date: "2026-05-04T10:30:00Z",
      labels: ["INBOX", "IMPORTANT"],
      attachments: [
        { filename: "file.pdf", mimeType: "application/pdf", size: 1024 }
      ]
    }
  ],
  totalResults: 1234,
  nextPageToken: "abc123"
}
```

**Examples:**
```javascript
// Fetch recent inbox emails
await fetchEmails(['lindsey@intelgic.com'], 'in:inbox', 50)

// Fetch invoices from specific sender
await fetchEmails(['lindsey@intelgic.com'], 'from:finance@client.com subject:invoice', 20)

// Fetch across multiple accounts
await fetchEmails([
  'lindsey@intelgic.com',
  'lindsey@intelgic.com'
], 'in:inbox', 100)
```

---

### parseEmailMetadata(email)
Extract structured metadata from an email object

**Parameters:**
- `email` (object): Email object from fetchEmails()

**Returns:**
```javascript
{
  messageId: "message-id",
  sender: "sender@example.com",
  senderName: "Sender Name",
  to: "lindsey@intelgic.com",
  subject: "Email subject",
  date: "2026-05-04T10:30:00Z",
  timestamp: 1714829400000,
  keywords: ["invoice", "amount", "payment"],
  hasAttachments: true,
  isUnread: true,
  bodyLength: 1234
}
```

---

### groupByProject(emails, projectBrain)
Group emails by inferred project

**Parameters:**
- `emails` (object[]): Array of email objects
- `projectBrain` (object, optional): Project Brain data for better matching

**Returns:**
```javascript
{
  "AdminPanel": [
    { ...email metadata },
    { ...email metadata }
  ],
  "PrevenDebt": [
    { ...email metadata }
  ],
  "Uncategorized": [
    { ...email metadata }
  ]
}
```

**Inference Logic:**
1. Check Project Brain domain mappings
2. Check Project Brain contact mappings
3. Parse subject for project names
4. Check recipient patterns
5. Default to "Uncategorized"

---

### generateHTMLReport(organizationMap, senderMap, outputPath)
Generate self-contained HTML dashboard from organized emails

**Parameters:**
- `organizationMap` (object): Result from groupByProject()
- `senderMap` (object): Contact information by sender
- `outputPath` (string): Where to save HTML file

**Returns:**
```javascript
{
  status: "success",
  path: "/path/to/report.html",
  projects: 3,
  emails: 45,
  contacts: 12,
  size: "245 KB"
}
```

**Output Features:**
- Collapsible project sections
- Email tables with sender, date, subject
- Search/filter via browser JavaScript
- Contact index with frequency
- Responsive design (mobile-friendly)
- Inline CSS (no external dependencies)

---

### organizeEmails(accounts, query, projectBrain)
All-in-one workflow: fetch → parse → organize → return

**Parameters:**
- `accounts` (string[]): Gmail accounts
- `query` (string): Search query
- `projectBrain` (object, optional): For project inference

**Returns:**
```javascript
{
  emails: {
    "ProjectName": [emails]
  },
  contacts: {
    "email@example.com": {
      email: "email@example.com",
      name: "Person Name",
      frequency: 5,
      lastContact: "2026-05-04T10:30:00Z"
    }
  },
  stats: {
    total: 45,
    projects: 3,
    uniqueSenders: 12
  }
}
```

---

### extractKeywords(subject, body)
Find important keywords in email text

**Parameters:**
- `subject` (string): Email subject
- `body` (string): Email body

**Returns:**
```javascript
["invoice", "amount", "payment", "deadline"]  // Top 5 keywords
```

**Algorithm:**
- Split text into words
- Remove stop words (the, a, and, etc.)
- Filter by length (>3 chars)
- Rank by frequency
- Return top 5

---

### inferProject(email, projectBrain)
Guess which project an email belongs to

**Parameters:**
- `email` (object): Email object
- `projectBrain` (object, optional): Project Brain data

**Returns:**
```javascript
{
  project: "AdminPanel",
  confidence: 0.95,
  reason: "contact_match"  // "contact_match" | "domain_match" | "keyword_match" | "unknown"
}
```

---

### parseSenderInfo(email)
Extract and normalize sender information

**Parameters:**
- `email` (object): Email object

**Returns:**
```javascript
{
  email: "sender@example.com",
  name: "Sender Name",
  domain: "example.com",
  lastContact: "2026-05-04T10:30:00Z",
  frequency: 5,
  title: "VP Engineering",  // If found in signature
  company: "Example Corp"   // If found in signature
}
```

---

## Advanced Functions

### batchExtract(accounts, query, format)
Extract and export emails in batch

**Parameters:**
- `accounts` (string[]): Gmail accounts
- `query` (string): Search query
- `format` (string): "json" | "csv" | "html"

**Returns:**
- JSON: Full structured data
- CSV: Spreadsheet-compatible format
- HTML: Self-contained report

---

### extractByPattern(accounts, query, extractionRules)
Extract specific data patterns from emails

**Parameters:**
```javascript
const rules = {
  invoice_number: /Invoice #(\d+)/,
  amount: /\$(\d+\.?\d*)/,
  date: /Date:\s*(\d{1,2}\/\d{1,2}\/\d{4})/
}

await extractByPattern(
  ['lindsey@intelgic.com'],
  'subject:invoice',
  rules
)
```

**Returns:**
```javascript
[
  {
    messageId: "...",
    sender: "...",
    extracted: {
      invoice_number: "2024-001",
      amount: "5000.00",
      date: "05/04/2026"
    }
  }
]
```

---

### compareToProjectBrain(emailGuesses, projectBrain)
Refine project guesses using Project Brain

**Returns:**
```javascript
{
  improvements: 5,
  correctGuesses: 12,
  refinements: [
    {
      email: "msg-123",
      originalGuess: "Uncategorized",
      refinedGuess: "AdminPanel",
      confidence: 0.9
    }
  ]
}
```

---

## Usage Examples

### Simple: List recent emails
```javascript
const emails = await fetchEmails(
  ['lindsey@intelgic.com'],
  'in:inbox',
  20
)
console.log(`Found ${emails.emails.length} emails`)
```

### Intermediate: Organize by project
```javascript
const organized = await organizeEmails(
  ['lindsey@intelgic.com'],
  'in:inbox',
  projectBrainData
)

for (const [project, emails] of Object.entries(organized.emails)) {
  console.log(`${project}: ${emails.length} emails`)
}
```

### Advanced: Generate HTML dashboard
```javascript
const result = await organizeEmails(
  ['lindsey@intelgic.com'],
  'in:inbox',
  projectBrainData
)

await generateHTMLReport(
  result.emails,
  result.contacts,
  './email-dashboard.html'
)

console.log(`Dashboard saved to ${result.emails}`)
```

### Expert: Extract invoice data
```javascript
const invoices = await extractByPattern(
  ['lindsey@intelgic.com'],
  'subject:invoice',
  {
    invoiceNum: /Invoice #(\d+)/,
    amount: /Amount:\s*\$(\d+\.?\d*)/,
    dueDate: /Due:\s*(\d{1,2}\/\d{1,2}\/\d{4})/
  }
)

invoices.forEach(inv => {
  console.log(`Invoice ${inv.extracted.invoiceNum}: $${inv.extracted.amount}`)
})
```

---

## Error Handling

### Common Errors

**"No credentials found"**
```javascript
try {
  const emails = await fetchEmails(['lindsey@intelgic.com'], 'in:inbox')
} catch (err) {
  if (err.code === 'NO_CREDENTIALS') {
    console.log('Run OAuth setup first: oauth-setup-auto.ps1')
  }
}
```

**"Rate limit exceeded"**
- Gmail API: 1000 requests/sec
- Solution: Implement exponential backoff (handled automatically)

**"Invalid query syntax"**
- Use Gmail's search syntax
- Examples: `in:inbox`, `from:`, `subject:`, `after:2026-05-01`

---

## Performance Notes

- **Caching**: Results cached in Memory Manager (1 hour TTL)
- **Batch Size**: Recommend max 500 emails per call
- **Contacts**: Extracting 1000 emails takes ~30 seconds
- **HTML Output**: Self-contained, works offline

---

## Testing

```javascript
// Test with mock data
const testEmails = [
  {
    id: 'test-1',
    from: { email: 'test@example.com', name: 'Test User' },
    subject: 'Test Email',
    body: 'This is a test',
    date: new Date().toISOString(),
    labels: ['INBOX'],
    attachments: []
  }
]

const metadata = parseEmailMetadata(testEmails[0])
console.log(metadata)
```

---

## See Also
- **Project Brain** — For project context and inference improvements
- **Memory Manager** — For caching email data
- **Report Generator** — For creating summaries
- **Caveman** — For simple CLI access
