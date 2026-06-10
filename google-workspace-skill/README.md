# Google Workspace Skill for Claude Code

A portable, fully-featured Claude Code skill for monitoring, extracting, and automating workflows across multiple Gmail accounts using the Google Workspace MCP.

## Quick Start

### 1. Install

```bash
npm install
```

### 2. Configure OAuth

```bash
./setup/oauth-setup.sh --credentials-file=/path/to/client_secret.json
```

See [setup/oauth-setup.md](setup/oauth-setup.md) for detailed instructions.

### 3. Test

```bash
npm test
```

### 4. Run Examples

```bash
npm run example:monitor    # Monitor inbox for emails
npm run example:extract    # Extract invoices to CSV
npm run example:automate   # Draft templated emails
```

## Features

### 📧 Email Monitoring
Watch multiple inboxes for email patterns in real-time:
- Monitor for specific senders, subjects, labels
- Setup continuous monitoring jobs
- Respect Gmail API rate limits
- Multi-account support

### 📊 Data Extraction
Parse and structure email data:
- Extract headers, body, attachments
- Batch export to JSON, CSV, or structured format
- Pattern-based field extraction (regex)
- Download attachments to local disk

### ✉️ Email Automation
Draft, send, and manage emails at scale:
- Create drafts for review (non-destructive)
- Apply pre-built or custom templates
- Variable substitution (`{{variable}}`)
- Create Gmail filters and rules

## Configuration

### Environment Variables

```bash
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-secret"
export CREDENTIALS_PATH="~/.claude/workspace-credentials"
export LOG_LEVEL="info"
```

### Settings File

Update `.claude/settings.local.json`:

```json
{
  "mcpServers": {
    "google-workspace-mcp": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "GOOGLE_CLIENT_ID": "...",
        "GOOGLE_CLIENT_SECRET": "..."
      }
    }
  }
}
```

## Usage Examples

### Monitor Inbox

```javascript
import { emailMonitor, accountManager } from './functions/index.js';

await accountManager.initialize();

const result = await emailMonitor.monitorInbox(
  'lindsey@intelgic.com',
  'from:client@example.com',
  { maxResults: 10 }
);

console.log(`Found ${result.matchCount} emails`);
```

### Extract Data

```javascript
import { emailExtractor } from './functions/index.js';

const result = await emailExtractor.batchExtract(
  'info@intelgic.com',
  'subject:invoice after:2026-05-01',
  {
    outputFormat: 'csv',
    outputPath: './invoices.csv'
  }
);

console.log(`Extracted ${result.messageCount} invoices to ${result.outputPath}`);
```

### Draft Email from Template

```javascript
import { emailAutomate } from './functions/index.js';

const rendered = await emailAutomate.applyTemplate(
  'lindsey@intelgic.com',
  'invoice_reminder',
  {
    invoiceNumber: 'INV-001',
    clientName: 'ACME Corp',
    amount: '$1000',
    dueDate: '2026-06-01'
  }
);

const draft = await emailAutomate.draftEmail(
  'lindsey@intelgic.com',
  'finance@acmecorp.com',
  rendered.subject,
  rendered.body
);

console.log(`Draft created: ${draft.draftId}`);
```

## API Reference

### Account Management

```javascript
accountManager.listAccounts()           // Get all connected accounts
accountManager.addAccount(email, creds) // Connect new account
accountManager.removeAccount(email)     // Disconnect account
accountManager.validateConnection(email) // Test account
```

### Email Monitoring

```javascript
emailMonitor.monitorInbox(email, query, options)        // One-time monitor
emailMonitor.setupMonitoringJob(email, rules, options)  // Continuous job
emailMonitor.getMonitoringStatus(jobId)                 // Check job status
emailMonitor.stopMonitoringJob(jobId)                   // Stop job
```

### Email Extraction

```javascript
emailExtractor.extractEmail(email, messageId)           // Get full email
emailExtractor.batchExtract(email, query, options)      // Extract multiple
emailExtractor.extractAttachments(email, msgId, path)   // Download files
emailExtractor.extractByPattern(email, query, rules)    // Pattern matching
```

### Email Automation

```javascript
emailAutomate.draftEmail(email, to, subject, body, opts)    // Draft only
emailAutomate.sendEmail(email, to, subject, body, opts)     // Draft + send
emailAutomate.applyTemplate(email, templateName, vars)      // Render template
emailAutomate.createRule(email, trigger, action)            // Create filter
emailAutomate.listTemplates()                               // Show templates
emailAutomate.registerTemplate(name, subject, body)         // Add custom template
```

## Memory & State

Persistent state is stored in `memory/`:

- **accounts-memory.json** — Connected accounts, last sync times
- **workflow-history.json** — Execution logs for auditing

These files persist between sessions for continuity.

## Testing

Run the full test suite:

```bash
npm test
npm run test:monitoring   # Monitoring tests only
npm run test:extraction   # Extraction tests only
npm run test:automation   # Automation tests only
```

## Performance

- **Monitoring**: Queries are cached, respects Gmail API limits (250 req/sec)
- **Extraction**: Batch processes up to 100 messages per request
- **Automation**: Draft creation is non-blocking; sending is immediate
- **Multi-account**: Credential isolation prevents cross-account leakage

## Troubleshooting

### Connection Issues
```bash
npm run setup:verify
```

### Debug Logging
```bash
LOG_LEVEL=debug npm run example:monitor
```

### Reset Credentials
```bash
rm -rf ~/.claude/workspace-credentials
./setup/oauth-setup.sh
```

## File Structure

```
google-workspace-skill/
├── functions/
│   ├── account-manager.js   # Multi-account routing
│   ├── email-monitor.js     # Inbox monitoring
│   ├── email-extract.js     # Data extraction
│   ├── email-automate.js    # Email drafting & automation
│   ├── utils.js             # Shared utilities
│   └── index.js             # Module exports
├── setup/
│   ├── oauth-setup.sh       # Interactive OAuth setup
│   └── oauth-setup.md       # Setup documentation
├── tests/
│   ├── test-monitoring.js   # Monitoring tests
│   ├── test-extraction.js   # Extraction tests
│   └── test-automation.js   # Automation tests
├── examples/
│   ├── monitor-intelgic.js # Monitor business inbox
│   ├── extract-invoices.js  # Extract financial data
│   └── draft-templates.js   # Email templates example
├── memory/
│   ├── accounts-memory.json # Connected accounts
│   └── workflow-history.json # Execution logs
├── SKILL.md                 # Skill definition
├── README.md                # This file
├── INSTALL.md               # Installation guide
└── package.json             # Dependencies
```

## Architecture

The skill uses a **modular, multi-account credential routing** architecture:

1. **AccountManager** — Manages OAuth tokens and client lifecycle
2. **EmailMonitor** — Watches inboxes for patterns
3. **EmailExtractor** — Parses email structure and content
4. **EmailAutomate** — Templates, drafts, and filters
5. **Utils** — Logging, memory persistence, helpers

Each module is isolated and can be imported independently.

## Contributing

Contributions are welcome! Areas for enhancement:
- Additional email templates
- Webhook-based real-time notifications
- Scheduled automation workflows
- Calendar and Drive integration
- Advanced search operators

## License

MIT

## Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [setup/oauth-setup.md](setup/oauth-setup.md)
3. Run `npm run setup:verify`
4. Check logs: `LOG_LEVEL=debug npm test`
