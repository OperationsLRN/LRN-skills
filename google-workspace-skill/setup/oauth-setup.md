# Google Workspace OAuth Setup Guide

This guide walks you through setting up OAuth 2.0 authentication for the Google Workspace Skill, enabling multi-account access to Gmail, Calendar, and Drive.

## Prerequisites

- Node.js 18 or higher
- A Google Cloud account (free tier OK)
- 4+ Gmail accounts to connect

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a Project"** → **"NEW PROJECT"**
3. Enter project name: `google-workspace-skill` (or your choice)
4. Click **Create**
5. Wait for the project to initialize

## Step 2: Enable Required APIs

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for and enable these APIs:
   - **Gmail API**
   - **Google Calendar API**
   - **Google Drive API**
3. For each API:
   - Click on the API name
   - Click **ENABLE**

## Step 3: Configure OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Choose **User Type**: **External**
   - External allows you to add specific test user emails without verification
   - (If your accounts are all in one company domain, you can use Internal instead)
3. Fill in:
   - App name: `Google Workspace Skill` (or your project name)
   - Support email: your@email.com
   - Click **Save and Continue**
4. **Add Test Users** (important step):
   - Click **+ Add users**
   - Add all Gmail addresses you want to test with:
     - lindsey@intelgic.com
     - lindsey@intelgic.com
     - info@intelgic.com
     - (Add any @intelgic.com addresses if needed)
   - Click **Save and Continue**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Desktop application**
4. Name: `google-workspace-skill`
5. Click **CREATE**
6. Download the JSON file:
   - Click **DOWNLOAD** (JSON icon)
   - Save as `client_secret.json`

## Step 5: Configure Redirect URI

1. Go to **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 credential (Desktop app)
3. Add authorized redirect URI:
   - Click **Edit OAuth client**
   - Add: `http://localhost:8888/callback`
   - Save

## Step 6: Run Setup Script

In your terminal, from the skill directory:

```bash
./setup/oauth-setup.sh --credentials-file=/path/to/client_secret.json
```

The script will:
1. Create credentials directory at `~/.claude/workspace-credentials/`
2. Prompt you for each Gmail account (the ones you added as test users)
3. For each account:
   - Open browser to Google login
   - You authorize access (should be quick since you're a test user)
   - Script captures refresh token
4. Save credentials securely (0600 permissions)
5. Create environment configuration

## Step 7: Add Credentials to Claude Code Settings

1. Note the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from setup output
2. Edit `.claude/settings.local.json`:
   ```json
   {
     "mcpServers": {
       "google-workspace-mcp": {
         "env": {
           "GOOGLE_CLIENT_ID": "xxx...apps.googleusercontent.com",
           "GOOGLE_CLIENT_SECRET": "xxx..."
         }
       }
     }
   }
   ```
3. Save file

## Step 8: Verify Setup

```bash
npm run setup:verify
```

Expected output:
```
✅ Credentials directory found: ~/.claude/workspace-credentials
✅ All test user accounts configured
✅ All accounts validated
```

## Step 9: Run Examples

Test the setup with examples:

```bash
npm run example:monitor    # Monitor inbox
npm run example:extract    # Extract emails
npm run example:automate   # Draft emails
```

## Troubleshooting

### Issue: "Invalid email format"
**Solution:** Ensure you're using a valid Gmail address (e.g., `yourname@gmail.com`)

### Issue: "Failed to extract credentials from JSON"
**Solution:** Make sure the JSON file is the actual client_secret from Google Cloud Console, not a different file

### Issue: "Connection validation failed"
**Solution:** 
1. Check that the refresh token is correct
2. Verify Gmail API is enabled in Google Cloud
3. Delete the problematic account and reconfigure

### Issue: "GOOGLE_CLIENT_ID not set"
**Solution:** 
1. Run setup script again: `./setup/oauth-setup.sh`
2. Ensure environment file is created at `~/.claude/workspace-credentials/.env`

### Issue: "Permission denied" on credential files
**Solution:** Reset permissions:
```bash
chmod 700 ~/.claude/workspace-credentials
chmod 600 ~/.claude/workspace-credentials/*.json
```

## Adding More Accounts Later

To add additional Gmail accounts after initial setup:

```bash
./setup/oauth-setup.sh
```

Run the script again and it will prompt to add more accounts to the existing configuration.

## Security Notes

- Credentials are stored in `~/.claude/workspace-credentials/` with 0600 permissions (read/write by user only)
- Never commit credentials to version control
- Refresh tokens don't expire but can be revoked via [Google Account Settings](https://myaccount.google.com/permissions)
- Never share your `client_secret.json` file

## API Rate Limits

Google Workspace APIs have rate limits:
- Gmail API: 250 requests/user/second
- Calendar API: 10,000 requests/second
- Drive API: 1,000 requests/second

The skill respects these limits and implements backoff strategies.

## Next Steps

1. Run tests: `npm test`
2. Try examples: `npm run example:*`
3. Read [README.md](../README.md) for usage guide
4. Check [SKILL.md](../SKILL.md) for available functions
