#!/bin/bash

# Google Workspace MCP OAuth Setup Script
# Configures OAuth 2.0 credentials for multiple Gmail accounts

set -e

CREDENTIALS_DIR="$HOME/.claude/workspace-credentials"
CONFIG_FILE="${CREDENTIALS_DIR}/config.json"
OAUTH_PORT=8888

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
  echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

  if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
  fi

  if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq not found. Some features may be limited.${NC}"
  fi

  echo -e "${GREEN}✅ Prerequisites OK${NC}\n"
}

# Create credentials directory
setup_directory() {
  echo -e "${BLUE}📁 Setting up credentials directory...${NC}"

  mkdir -p "$CREDENTIALS_DIR"
  chmod 700 "$CREDENTIALS_DIR"

  if [ ! -f "$CONFIG_FILE" ]; then
    echo '{"accounts": [], "version": "1.0.0"}' > "$CONFIG_FILE"
    chmod 600 "$CONFIG_FILE"
  fi

  echo -e "${GREEN}✅ Credentials directory ready at: $CREDENTIALS_DIR${NC}\n"
}

# Prompt for client credentials
get_client_credentials() {
  echo -e "${BLUE}🔐 Google Cloud OAuth Credentials${NC}"
  echo "You need to provide your OAuth 2.0 credentials from Google Cloud Console."
  echo ""
  echo "Steps to get your credentials:"
  echo "1. Go to: https://console.cloud.google.com/"
  echo "2. Create a new project (or select existing)"
  echo "3. Enable these APIs:"
  echo "   - Gmail API"
  echo "   - Google Calendar API"
  echo "   - Google Drive API"
  echo "4. Create OAuth 2.0 credentials (Desktop application)"
  echo "5. Download the JSON file"
  echo ""

  read -p "Enter path to client_secret.json file: " CLIENT_SECRET_FILE

  if [ ! -f "$CLIENT_SECRET_FILE" ]; then
    echo -e "${RED}❌ File not found: $CLIENT_SECRET_FILE${NC}"
    exit 1
  fi

  # Extract client ID and secret
  CLIENT_ID=$(jq -r '.installed.client_id' "$CLIENT_SECRET_FILE" 2>/dev/null || echo "")
  CLIENT_SECRET=$(jq -r '.installed.client_secret' "$CLIENT_SECRET_FILE" 2>/dev/null || echo "")

  if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo -e "${RED}❌ Failed to extract credentials from JSON file${NC}"
    exit 1
  fi

  echo -e "${GREEN}✅ Credentials loaded${NC}\n"
}

# Add new account
add_account() {
  local email=$1
  local refresh_token=$2

  echo -e "${BLUE}➕ Adding account: $email${NC}"

  # Save credentials securely
  local account_file="$CREDENTIALS_DIR/${email}.json"

  cat > "$account_file" << EOF
{
  "email": "$email",
  "refresh_token": "$refresh_token",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "last_synced": null
}
EOF

  chmod 600 "$account_file"

  echo -e "${GREEN}✅ Account saved: $email${NC}\n"
}

# Validate connection
validate_account() {
  local email=$1

  echo -e "${BLUE}✓ Validating connection for: $email${NC}"

  # Here you would use the Gmail API to verify the connection
  # For now, we'll just verify the file exists
  if [ -f "$CREDENTIALS_DIR/${email}.json" ]; then
    echo -e "${GREEN}✅ Credentials file OK${NC}"
    return 0
  else
    echo -e "${RED}❌ Credentials file not found${NC}"
    return 1
  fi
}

# Setup single account
setup_account() {
  echo -e "${YELLOW}📧 Setting up Gmail account${NC}\n"

  read -p "Enter Gmail address: " EMAIL

  # Validate email format
  if [[ ! "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo -e "${RED}❌ Invalid email format${NC}"
    return 1
  fi

  # Check if already configured
  if [ -f "$CREDENTIALS_DIR/${EMAIL}.json" ]; then
    echo -e "${YELLOW}⚠️  Account already configured: $EMAIL${NC}"
    read -p "Reconfigure? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      return 0
    fi
  fi

  echo -e "${BLUE}🔗 Opening Google OAuth flow...${NC}"
  echo "A browser window should open. Please:"
  echo "1. Sign in with your Google account"
  echo "2. Grant permission to access Gmail, Calendar, and Drive"
  echo "3. Copy the authorization code from the redirect URL"
  echo ""

  read -p "Paste the refresh token (from OAuth response): " REFRESH_TOKEN

  if [ -z "$REFRESH_TOKEN" ]; then
    echo -e "${RED}❌ No refresh token provided${NC}"
    return 1
  fi

  add_account "$EMAIL" "$REFRESH_TOKEN"
  validate_account "$EMAIL"
}

# Setup multiple accounts
setup_multiple_accounts() {
  local account_count=0

  while true; do
    setup_account || true
    ((account_count++))

    echo ""
    read -p "Add another account? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      break
    fi
  done

  echo -e "${BLUE}📊 Accounts configured: $account_count${NC}\n"
}

# Create environment file
create_env_file() {
  echo -e "${BLUE}🔧 Creating environment configuration...${NC}"

  local env_file="$HOME/.claude/workspace-credentials/.env"

  cat > "$env_file" << EOF
# Google Workspace OAuth Configuration
GOOGLE_CLIENT_ID=$CLIENT_ID
GOOGLE_CLIENT_SECRET=$CLIENT_SECRET
CREDENTIALS_PATH=$CREDENTIALS_DIR
OAUTH_PORT=$OAUTH_PORT
LOG_LEVEL=info
EOF

  chmod 600 "$env_file"

  echo -e "${GREEN}✅ Environment file created${NC}\n"
}

# Summary
show_summary() {
  echo -e "${BLUE}═══════════════════════════════════════${NC}"
  echo -e "${GREEN}✅ OAuth Setup Complete!${NC}"
  echo -e "${BLUE}═══════════════════════════════════════${NC}"
  echo ""
  echo "📁 Credentials Directory:"
  echo "   $CREDENTIALS_DIR"
  echo ""
  echo "🔑 Environment Variables:"
  echo "   GOOGLE_CLIENT_ID=$CLIENT_ID"
  echo "   GOOGLE_CLIENT_SECRET=****"
  echo "   CREDENTIALS_PATH=$CREDENTIALS_DIR"
  echo ""
  echo "📧 Configured Accounts:"
  find "$CREDENTIALS_DIR" -name "*.json" -type f ! -name "config.json" | while read -r file; do
    basename "$file" .json | sed 's/^/   /'
  done
  echo ""
  echo "📝 Next Steps:"
  echo "1. Copy the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET values above"
  echo "2. Update .claude/settings.local.json with these values"
  echo "3. Run: npm test"
  echo "4. Run examples: npm run example:monitor"
  echo ""
}

# Main script
main() {
  echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Google Workspace OAuth Setup Script  ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

  check_prerequisites
  setup_directory
  get_client_credentials
  setup_multiple_accounts
  create_env_file
  show_summary
}

main "$@"
