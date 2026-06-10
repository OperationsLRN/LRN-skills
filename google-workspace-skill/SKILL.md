# Google Workspace Skill

A portable Claude Code skill for monitoring, extracting, and automating workflows across multiple Gmail accounts using the Google Workspace MCP server.

## Description

This skill enables:
- **Email Monitoring**: Watch inboxes for specific patterns and get notified when matches arrive
- **Data Extraction**: Parse structured data from emails (headers, body, attachments)
- **Email Automation**: Draft templated emails, create filters, and manage workflows across 4+ Gmail accounts simultaneously

Multi-account credential routing ensures secure, isolated access to each Gmail account.

## Capabilities

### monitor-inbox
Monitor one or more inboxes for email patterns. Returns matched messages with metadata.

**Usage:**
```javascript
await monitorInbox("lindsey@intelgic.com", "from:client@example.com", { 
  pollInterval: 60000,
  maxResults: 10 
})
```

### extract-emails
Parse and structure email data from one or more messages.

**Usage:**
```javascript
await batchExtract("lindsey@intelgic.com", "in:inbox after:2026-05-01", "json")
```

### draft-email
Create a draft email (no send) for manual review before sending.

**Usage:**
```javascript
await draftEmail("lindsey@intelgic.com", "recipient@example.com", "Subject", "Body text")
```

### apply-template
Render a templated email with variable substitution.

**Usage:**
```javascript
await applyTemplate("lindsey@intelgic.com", "invoice_reminder", { 
  client: "ACME Corp", 
  amount: "$1000" 
})
```

### list-accounts
Show all connected Gmail accounts.

**Usage:**
```javascript
await listAccounts()
```

### add-account
Connect a new Gmail account via OAuth.

**Usage:**
```javascript
await addAccount("new.email@gmail.com")
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Google Cloud OAuth:**
   ```bash
   ./setup/oauth-setup.sh --credentials-file=/path/to/client_secret.json
   ```

3. **Verify setup:**
   ```bash
   npm run setup:verify
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

## Configuration

Update `.claude/settings.local.json` to configure:
- Google OAuth client ID/secret
- Credentials storage path
- Polling intervals
- MCP server command and args

See `setup/config-template.json` for template.

## Testing

Run the test suite:
```bash
npm test                    # All tests
npm run test:monitoring     # Monitoring tests
npm run test:extraction     # Extraction tests
npm run test:automation     # Automation tests
```

## Examples

```bash
npm run example:monitor     # Monitor business inbox
npm run example:extract     # Extract invoices to CSV
npm run example:automate    # Draft templated emails
```

## Memory

Persistent state stored in `memory/`:
- `accounts-memory.json` — Connected accounts + metadata
- `workflow-history.json` — Execution logs for auditing

## Performance Notes

- Monitoring: Respects Gmail API rate limits (queries/100 seconds)
- Extraction: Batch operations process up to 100 messages per request
- Polling intervals: Configurable (default 60 seconds)
- Multi-account: Isolated credential routing prevents cross-account leakage

## License

MIT
