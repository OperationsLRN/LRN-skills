# Installation Guide

Complete step-by-step instructions for installing and configuring Google Workspace Skill.

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Google Cloud Project**: With OAuth 2.0 credentials
- **4+ Gmail accounts**: To test multi-account setup

Check your versions:
```bash
node --version  # Should be v18+
npm --version   # Should be v8+
```

## Installation Steps

### Step 1: Clone or Download Skill

```bash
cd /path/to/skills
git clone <repo-url> google-workspace-skill
cd google-workspace-skill
```

Or if you received a ZIP file:
```bash
unzip google-workspace-skill-v1.0.0.zip
cd google-workspace-skill
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `googleapis` — Google API client library
- `google-auth-library` — OAuth 2.0 handling
- `jest` — Testing framework (dev only)
- `dotenv` — Environment variable loading (dev only)

### Step 3: Get Google Cloud Credentials

Follow [setup/oauth-setup.md](setup/oauth-setup.md) to:
1. Use existing Google Cloud project (or create new one)
2. Enable Gmail, Calendar, Drive APIs (if not already enabled)
3. Configure OAuth consent screen as **External**
4. Add your test user emails to the consent screen
5. Generate OAuth 2.0 credentials
6. Download `client_secret.json`

**Estimated time: 5-10 minutes** (faster if using existing project)

### Step 4: Run OAuth Setup

```bash
chmod +x setup/oauth-setup.sh
./setup/oauth-setup.sh --credentials-file=/path/to/client_secret.json
```

The script will:
- Create `~/.claude/workspace-credentials/` directory
- Prompt for each test user email (the ones you added to consent screen)
- For each account, open browser for OAuth consent
- Save refresh tokens securely (quick since you're pre-authorized as test user)
- Create `.env` file with credentials

**Estimated time: 2-3 minutes per account** (faster than external verification since you're pre-authorized as test user)

### Step 5: Verify Setup

```bash
npm run setup:verify
```

Expected output:
```
✅ Credentials directory found
✅ 4 accounts configured
✅ OAuth tokens validated
✅ Gmail API connection working
```

### Step 6: Update Claude Code Settings

Copy your OAuth credentials to `.claude/settings.local.json`:

```json
{
  "mcpServers": {
    "google-workspace-mcp": {
      "command": "node",
      "args": ["path/to/google-workspace-mcp/server.js"],
      "env": {
        "GOOGLE_CLIENT_ID": "your-client-id-here.apps.googleusercontent.com",
        "GOOGLE_CLIENT_SECRET": "your-client-secret-here",
        "CREDENTIALS_PATH": "~/.claude/workspace-credentials"
      }
    }
  }
}
```

### Step 7: Run Tests

```bash
npm test
```

This runs all unit tests. Expected output:
```
PASS tests/test-monitoring.js
PASS tests/test-extraction.js
PASS tests/test-automation.js

Test Suites: 3 passed
Tests: 45 passed
```

### Step 8: Try Examples

```bash
npm run example:monitor    # Monitor business inbox
npm run example:extract    # Extract invoices
npm run example:automate   # Draft emails from templates
```

You should see output like:
```
🚀 Starting inbox monitor for: lindsey@intelgic.com
✅ Found 12 emails in inbox
📋 Available templates...
```

## Installation Complete!

Your skill is now ready to use. Next:

1. **Read the README**: `cat README.md`
2. **Learn the API**: `cat SKILL.md`
3. **Explore examples**: `ls examples/`
4. **Integrate with Claude Code**: See `.claude/settings.local.json`

## Troubleshooting Installation

### Issue: "npm: command not found"
**Solution**: Install Node.js from https://nodejs.org/

### Issue: "Permission denied" on setup script
**Solution**: Make script executable:
```bash
chmod +x setup/oauth-setup.sh
```

### Issue: "client_secret.json not found"
**Solution**: Download from Google Cloud Console:
1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Click your OAuth 2.0 credential
4. Click DOWNLOAD (JSON icon)

### Issue: "Failed to extract credentials from JSON"
**Solution**: Ensure JSON is from Google Cloud Console, not Firebase or other source

### Issue: "CREDENTIALS_PATH not found"
**Solution**: Check directory permissions:
```bash
ls -la ~/.claude/workspace-credentials/
chmod 700 ~/.claude/workspace-credentials/
```

### Issue: "npm install fails"
**Solution**: Try:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tests fail with "Account not connected"
**Solution**: Run setup again:
```bash
./setup/oauth-setup.sh
```

## Manual Installation (Advanced)

If automated setup fails, you can configure manually:

1. **Create credentials directory:**
   ```bash
   mkdir -p ~/.claude/workspace-credentials
   chmod 700 ~/.claude/workspace-credentials
   ```

2. **Manually get refresh tokens:**
   Use Google OAuth 2.0 Playground: https://developers.google.com/oauthplayground/

3. **Create account file:**
   ```bash
   cat > ~/.claude/workspace-credentials/yourname@gmail.com.json << EOF
   {
     "email": "yourname@gmail.com",
     "refresh_token": "your-refresh-token-here",
     "created_at": "2026-05-04T00:00:00Z",
     "last_synced": null
   }
   EOF
   chmod 600 ~/.claude/workspace-credentials/yourname@gmail.com.json
   ```

4. **Create .env file:**
   ```bash
   cat > ~/.claude/workspace-credentials/.env << EOF
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-secret
   CREDENTIALS_PATH=~/.claude/workspace-credentials
   EOF
   chmod 600 ~/.claude/workspace-credentials/.env
   ```

## Post-Installation

### Add More Accounts

To add additional Gmail accounts:
```bash
./setup/oauth-setup.sh
```

Run the script again. It will ask to add more accounts.

### Change Polling Interval

Edit `.claude/settings.local.json`:
```json
{
  "env": {
    "POLL_INTERVAL_MS": "120000"  // 2 minutes
  }
}
```

### Enable Debug Logging

```bash
LOG_LEVEL=debug npm run example:monitor
```

### Restart Claude Code

After updating `.claude/settings.local.json`, restart Claude Code to apply changes.

## Next Steps

1. **Configure Claude Code** — Add MCP server definition to settings
2. **Run the examples** — Try monitoring, extraction, automation
3. **Create custom templates** — Add email templates for your workflows
4. **Setup monitoring jobs** — Watch inboxes continuously
5. **Integrate with other tools** — Use extracted data in other systems

## Getting Help

- **Setup issues**: See [setup/oauth-setup.md](setup/oauth-setup.md)
- **API reference**: See [SKILL.md](SKILL.md)
- **Examples**: See [examples/](examples/)
- **Tests**: See [tests/](tests/)
- **Troubleshooting**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## Support

For detailed troubleshooting, run:
```bash
npm run setup:verify
LOG_LEVEL=debug npm test 2>&1 | tee setup.log
```

Then review the `setup.log` file for error messages.
