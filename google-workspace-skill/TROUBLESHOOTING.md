# Troubleshooting Guide

Common issues and solutions for Google Workspace Skill.

## Installation & Setup

### npm install fails
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Permission denied on setup script
```bash
chmod +x setup/oauth-setup.sh
./setup/oauth-setup.sh
```

### client_secret.json not found
1. Go to Google Cloud Console
2. APIs & Services → Credentials
3. Find your OAuth 2.0 credential (Desktop app type)
4. Click DOWNLOAD (JSON icon)
5. Save as client_secret.json

### "Failed to extract credentials from JSON"
- Verify the JSON is from Google Cloud Console (not Firebase)
- Check JSON is in `{installed: {...}}` format
- Validate with: `jq '.installed' client_secret.json`

## OAuth & Authentication

### "Account already configured"
The email already exists. Options:
1. Keep existing configuration (press N)
2. Reconfigure account (press Y)
3. Manually delete and re-add:
   ```bash
   rm ~/.claude/workspace-credentials/email@gmail.com.json
   ./setup/oauth-setup.sh
   ```

### "Invalid email format"
- Ensure email is valid: `user@gmail.com`
- Not: `user@gmail` or `@gmail.com`

### "Refresh token expired"
1. Delete the account credentials:
   ```bash
   rm ~/.claude/workspace-credentials/email@gmail.com.json
   ```
2. Re-add the account:
   ```bash
   ./setup/oauth-setup.sh
   ```

### "Permission denied: insufficient permissions"
The OAuth scopes may be insufficient. Re-run setup:
```bash
./setup/oauth-setup.sh
```

Ensure you grant these permissions:
- Gmail: Read, Compose, Send, Modify
- Calendar: Create, Modify, Read
- Drive: Read, Create, Modify

## Connection & Validation

### `npm run setup:verify` fails
**Issue**: One or more accounts can't connect

**Solution**:
1. Check internet connection
2. Verify Gmail API is enabled in Google Cloud
3. Re-validate individual account:
   ```bash
   node -e "import('./functions/account-manager.js').then(m => m.default.validateConnection('your@email.com'))"
   ```
4. Delete and re-add account if still failing

### "Error: Account not found"
The account hasn't been configured yet:
```bash
./setup/oauth-setup.sh
```

## Monitoring

### Monitor returns 0 emails but inbox isn't empty
Gmail search may be too restrictive. Try simpler query:
```javascript
await emailMonitor.monitorInbox('email@gmail.com', 'in:inbox')
```

### Monitoring job never completes
- Check polling interval (default 60 seconds)
- Increase timeout:
  ```javascript
  await emailMonitor.monitorInbox(email, query, { 
    timeout: 120000 // 2 minutes
  })
  ```

### "Rate limit exceeded"
Gmail API limit: 250 requests/second per account
- Increase polling interval (default is 60s)
- Reduce `maxResults` per request
- Add delay between accounts

## Extraction

### extractAttachments returns empty
- Message may not have attachments
- Check message first:
  ```javascript
  const email = await emailExtractor.extractEmail(addr, msgId);
  console.log(email.attachmentCount);
  ```

### CSV export has encoding issues
- File may be in UTF-16. Convert:
  ```bash
  iconv -f UTF-16 -t UTF-8 invoices.csv > invoices-utf8.csv
  ```

### Pattern extraction returns no matches
- Regex may be too strict
- Test regex first: https://regex101.com/
- Use `(?i)` for case-insensitive: `(?i)amount: \\$(\\d+)`

### "Memory limit exceeded" on large batches
Extract in smaller batches:
```javascript
const result1 = await emailExtractor.batchExtract(
  email, 
  'in:inbox after:2026-05-01 before:2026-05-05',
  { maxResults: 50 }
);

const result2 = await emailExtractor.batchExtract(
  email,
  'in:inbox after:2026-05-05 before:2026-05-10',
  { maxResults: 50 }
);
```

## Automation

### Draft email shows "Failed to create draft"
- Verify email address is valid
- Check sender account has Gmail enabled
- Try again with simpler content

### sendEmail creates draft instead of sending
- Default behavior requires confirmation
- Use `{ confirmBefore: false }` to send immediately
- Review draft in Gmail first for safety

### Template variable not substituting
- Variable name in template must match exactly
- Check spelling: `{{invoiceNumber}}` not `{{invoice_number}}`
- Variables are case-sensitive

### Custom template not found
- Register template first:
  ```javascript
  emailAutomate.registerTemplate('name', 'subject', 'body')
  ```
- Template names are case-sensitive
- Use `listTemplates()` to verify registration

### "Label not found" when creating rule
- Gmail label may not exist yet
- Script will auto-create if missing
- Verify label exists in Gmail after creation

## Testing

### Tests fail with "TEST_EMAIL not set"
Set test email and message ID:
```bash
export TEST_EMAIL="your@gmail.com"
export TEST_MESSAGE_ID="message-id-from-gmail"
npm test
```

Or skip email-dependent tests:
```bash
npm test -- --testNamePattern="accounts"
```

### "Cannot find module" error
Ensure dependencies are installed:
```bash
npm install
```

### Test timeout
Tests can take 30+ seconds. To increase:
```bash
npm test -- --testTimeout=60000
```

## Memory & Performance

### Large memory usage with many accounts
Monitoring jobs keep some state in memory. Clear periodically:
```javascript
await emailMonitor.stopMonitoringJob(jobId);
```

### Slow extraction on large inboxes
Batch extraction processes one message at a time. To speed up:
- Reduce `maxResults` and make multiple calls
- Use date-based queries: `after:2026-05-01 before:2026-05-02`
- Create multiple monitoring jobs instead of batch extract

## Logging & Debugging

### Enable debug logs
```bash
LOG_LEVEL=debug npm run example:monitor
```

Output includes:
- All API calls
- Credential lookups
- Memory operations
- Timestamps

### Save logs to file
```bash
LOG_LEVEL=debug npm test 2>&1 | tee test-debug.log
```

Then review `test-debug.log`

### Check memory files
```bash
cat memory/accounts-memory.json | jq .
cat memory/workflow-history.json | jq '.workflows[] | {id, status, errors}'
```

## Multi-Account Issues

### Cross-account credential leakage
Shouldn't happen with current design. If suspected:
```bash
npm test -- --testNamePattern="multi-account"
```

### Different permissions for different accounts
Each account may have different permissions. Check individually:
```javascript
const stats = await accountManager.getAccountStats();
stats.accounts.forEach(acc => console.log(acc));
```

## Performance Tuning

### Slow monitoring
- Increase polling interval:
  ```javascript
  { pollInterval: 120000 } // 2 minutes
  ```
- Use more specific queries: `from:sender@example.com`

### Timeout on extraction
- Reduce `maxResults`: `{ maxResults: 25 }`
- Split by date: `after:2026-05-01 before:2026-05-05`

### Memory bloat
- Clear workflow history monthly:
  ```bash
  echo '{"workflows": [], "version": "1.0.0"}' > memory/workflow-history.json
  ```

## Still Not Working?

1. **Check logs**: `LOG_LEVEL=debug npm test`
2. **Validate setup**: `npm run setup:verify`
3. **Reset credentials**: `rm -rf ~/.claude/workspace-credentials`
4. **Reinstall**: `rm -rf node_modules && npm install`
5. **Check permissions**: `chmod 700 ~/.claude/workspace-credentials`

If stuck, enable full debug output and save to file:
```bash
LOG_LEVEL=debug npm run setup:verify 2>&1 | tee debug.log
```

Share the log (remove sensitive data) for support.
