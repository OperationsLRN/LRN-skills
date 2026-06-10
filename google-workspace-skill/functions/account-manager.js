import { google } from 'googleapis';
import {
  loadMemory,
  saveMemory,
  logInfo,
  logError,
  validateEmail,
  formatDate,
  wait
} from './utils.js';

const ACCOUNTS_MEMORY_KEY = 'accounts-memory';

class AccountManager {
  constructor() {
    this.clients = new Map();
    this.initialized = false;
  }

  // Initialize from persisted memory
  async initialize() {
    if (this.initialized) return;

    logInfo('Initializing AccountManager');
    const memory = await loadMemory(ACCOUNTS_MEMORY_KEY);

    if (memory && memory.accounts) {
      this.accounts = memory.accounts;
      logInfo(`Loaded ${this.accounts.length} accounts from memory`);
    } else {
      this.accounts = [];
    }

    this.initialized = true;
  }

  // List all connected accounts
  async listAccounts() {
    await this.initialize();
    return this.accounts.map(acc => ({
      email: acc.email,
      displayName: acc.displayName,
      connected: acc.connected,
      lastSync: acc.lastSync,
      createdAt: acc.createdAt
    }));
  }

  // Add new account via OAuth
  async addAccount(email, credentials) {
    if (!validateEmail(email)) {
      throw new Error(`Invalid email: ${email}`);
    }

    await this.initialize();

    // Check if already exists
    if (this.accounts.find(acc => acc.email === email)) {
      throw new Error(`Account already connected: ${email}`);
    }

    const newAccount = {
      email,
      credentials,
      connected: true,
      createdAt: formatDate(new Date()),
      lastSync: null,
      displayName: email.split('@')[0],
      syncErrors: 0
    };

    this.accounts.push(newAccount);
    await this._persistAccounts();

    logInfo(`Added account: ${email}`);
    return newAccount;
  }

  // Remove account
  async removeAccount(email) {
    await this.initialize();

    const index = this.accounts.findIndex(acc => acc.email === email);
    if (index === -1) {
      throw new Error(`Account not found: ${email}`);
    }

    this.accounts.splice(index, 1);
    this.clients.delete(email);
    await this._persistAccounts();

    logInfo(`Removed account: ${email}`);
  }

  // Get authenticated Gmail client for specific account
  async getClient(email) {
    await this.initialize();

    const account = this.accounts.find(acc => acc.email === email);
    if (!account) {
      throw new Error(`Account not found: ${email}`);
    }

    if (!account.connected) {
      throw new Error(`Account not connected: ${email}`);
    }

    // Return cached client if available
    if (this.clients.has(email)) {
      return this.clients.get(email);
    }

    // Create new client
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:8888/callback'
      );

      // Set credentials from stored tokens
      if (account.credentials && account.credentials.refresh_token) {
        oauth2Client.setCredentials({
          refresh_token: account.credentials.refresh_token
        });
      }

      const client = google.gmail({ version: 'v1', auth: oauth2Client });
      this.clients.set(email, client);

      return client;
    } catch (error) {
      logError(`Failed to create client for ${email}`, { error: error.message });
      throw error;
    }
  }

  // Validate account connection
  async validateConnection(email) {
    try {
      const client = await this.getClient(email);

      // Try to list inbox to verify connection
      const response = await client.users.messages.list({
        userId: 'me',
        maxResults: 1,
        q: 'in:inbox'
      });

      const account = this.accounts.find(acc => acc.email === email);
      if (account) {
        account.lastSync = formatDate(new Date());
        account.syncErrors = 0;
        account.connected = true;
        await this._persistAccounts();
      }

      logInfo(`Validated connection for ${email}`, {
        messageCount: response.data.resultSizeEstimate
      });

      return {
        email,
        connected: true,
        lastSync: account?.lastSync,
        messageCount: response.data.resultSizeEstimate
      };
    } catch (error) {
      logError(`Validation failed for ${email}`, { error: error.message });

      const account = this.accounts.find(acc => acc.email === email);
      if (account) {
        account.syncErrors = (account.syncErrors || 0) + 1;
        account.connected = false;
        await this._persistAccounts();
      }

      return {
        email,
        connected: false,
        error: error.message
      };
    }
  }

  // Validate all accounts
  async validateAllConnections() {
    await this.initialize();
    const results = [];

    for (const account of this.accounts) {
      const result = await this.validateConnection(account.email);
      results.push(result);
      await wait(500); // Throttle API calls
    }

    return results;
  }

  // Update account metadata
  async updateAccount(email, updates) {
    await this.initialize();

    const account = this.accounts.find(acc => acc.email === email);
    if (!account) {
      throw new Error(`Account not found: ${email}`);
    }

    // Only allow safe updates
    const safeKeys = ['displayName', 'syncErrors'];
    safeKeys.forEach(key => {
      if (key in updates) {
        account[key] = updates[key];
      }
    });

    await this._persistAccounts();
    logInfo(`Updated account: ${email}`, updates);
  }

  // Get account stats
  async getAccountStats() {
    await this.initialize();

    const stats = {
      total: this.accounts.length,
      connected: this.accounts.filter(a => a.connected).length,
      disconnected: this.accounts.filter(a => !a.connected).length,
      accounts: this.accounts.map(a => ({
        email: a.email,
        connected: a.connected,
        lastSync: a.lastSync,
        syncErrors: a.syncErrors
      }))
    };

    return stats;
  }

  // Private: persist accounts to memory
  async _persistAccounts() {
    const memory = {
      accounts: this.accounts,
      lastUpdated: formatDate(new Date()),
      version: '1.0.0'
    };

    await saveMemory(ACCOUNTS_MEMORY_KEY, memory);
  }
}

// Singleton instance
const accountManager = new AccountManager();

export default accountManager;
export { AccountManager };
