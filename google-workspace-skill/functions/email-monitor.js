import accountManager from './account-manager.js';
import {
  loadMemory,
  saveMemory,
  logInfo,
  logError,
  wait,
  generateId,
  formatDate
} from './utils.js';

const MONITORING_JOBS_KEY = 'monitoring-jobs';

class EmailMonitor {
  constructor() {
    this.activeJobs = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    logInfo('Initializing EmailMonitor');
    const memory = await loadMemory(MONITORING_JOBS_KEY);

    if (memory && memory.jobs) {
      this.jobs = memory.jobs;
      logInfo(`Loaded ${this.jobs.length} saved monitoring jobs`);
    } else {
      this.jobs = [];
    }

    this.initialized = true;
  }

  // Monitor single inbox for pattern matches
  async monitorInbox(email, query, options = {}) {
    const {
      pollInterval = 60000,
      maxResults = 10,
      timeout = null
    } = options;

    logInfo(`Monitoring inbox`, { email, query, pollInterval, maxResults });

    const client = await accountManager.getClient(email);
    const matches = [];
    const startTime = Date.now();

    try {
      // Perform initial search
      const response = await client.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults
      });

      if (response.data.messages) {
        for (const message of response.data.messages) {
          const details = await this._getMessageDetails(client, message.id);
          matches.push({
            id: message.id,
            threadId: message.threadId,
            from: details.from,
            subject: details.subject,
            snippet: details.snippet,
            internalDate: message.internalDate,
            labels: message.labelIds || []
          });
        }
      }

      const result = {
        email,
        query,
        timestamp: formatDate(new Date()),
        matchCount: matches.length,
        matches,
        pollInterval,
        elapsed: Date.now() - startTime
      };

      logInfo(`Monitor completed`, {
        email,
        matchCount: matches.length,
        elapsed: result.elapsed
      });

      return result;
    } catch (error) {
      logError(`Monitor failed`, { email, error: error.message });
      throw error;
    }
  }

  // Setup continuous monitoring job
  async setupMonitoringJob(email, rules, options = {}) {
    const {
      pollInterval = 60000,
      maxMatches = 100,
      persistent = true
    } = options;

    await this.initialize();

    const jobId = generateId('job');
    const job = {
      id: jobId,
      email,
      rules, // Array of { name, query }
      pollInterval,
      maxMatches,
      persistent,
      createdAt: formatDate(new Date()),
      lastRun: null,
      totalMatches: 0,
      errors: 0,
      active: true
    };

    this.jobs.push(job);
    await this._persistJobs();

    logInfo(`Created monitoring job`, { jobId, email, ruleCount: rules.length });

    return {
      jobId,
      email,
      ruleCount: rules.length,
      status: 'created'
    };
  }

  // Start monitoring job
  async startMonitoringJob(jobId, durationMs = null) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    logInfo(`Starting monitoring job`, { jobId });

    const startTime = Date.now();
    const results = [];

    const runMonitor = async () => {
      try {
        for (const rule of job.rules) {
          const result = await this.monitorInbox(job.email, rule.query, {
            pollInterval: job.pollInterval,
            maxResults: job.maxMatches
          });

          results.push({
            ruleName: rule.name,
            ...result
          });

          job.totalMatches += result.matchCount;
        }

        job.lastRun = formatDate(new Date());
        job.errors = 0;
        await this._persistJobs();
      } catch (error) {
        job.errors = (job.errors || 0) + 1;
        logError(`Job execution failed`, { jobId, error: error.message });
        await this._persistJobs();
      }
    };

    // Initial run
    await runMonitor();

    // Schedule continuous runs if duration specified
    if (durationMs) {
      const pollLoop = async () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < durationMs) {
          await wait(job.pollInterval);
          await runMonitor();
          if (job.active) {
            setImmediate(() => pollLoop());
          }
        }
      };

      setImmediate(() => pollLoop());
    }

    return {
      jobId,
      status: 'running',
      resultsCount: results.length,
      results
    };
  }

  // Stop monitoring job
  async stopMonitoringJob(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    job.active = false;
    await this._persistJobs();

    logInfo(`Stopped monitoring job`, { jobId });

    return {
      jobId,
      status: 'stopped',
      lastRun: job.lastRun,
      totalMatches: job.totalMatches
    };
  }

  // Get job status
  async getMonitoringStatus(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    return {
      jobId: job.id,
      email: job.email,
      ruleCount: job.rules.length,
      active: job.active,
      lastRun: job.lastRun,
      totalMatches: job.totalMatches,
      errors: job.errors,
      createdAt: job.createdAt,
      rules: job.rules.map(r => r.name)
    };
  }

  // List all monitoring jobs
  async listMonitoringJobs() {
    await this.initialize();

    return this.jobs.map(job => ({
      jobId: job.id,
      email: job.email,
      ruleCount: job.rules.length,
      active: job.active,
      lastRun: job.lastRun,
      totalMatches: job.totalMatches
    }));
  }

  // Private: get message details
  async _getMessageDetails(client, messageId) {
    try {
      const response = await client.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date']
      });

      const headers = response.data.payload?.headers || [];
      const fromHeader = headers.find(h => h.name === 'From');
      const subjectHeader = headers.find(h => h.name === 'Subject');

      return {
        from: fromHeader?.value || 'Unknown',
        subject: subjectHeader?.value || '(no subject)',
        snippet: response.data.snippet || ''
      };
    } catch (error) {
      logError(`Failed to get message details`, { messageId, error: error.message });
      return {
        from: 'Unknown',
        subject: '(no subject)',
        snippet: ''
      };
    }
  }

  // Private: persist jobs to memory
  async _persistJobs() {
    const memory = {
      jobs: this.jobs,
      lastUpdated: formatDate(new Date()),
      version: '1.0.0'
    };

    await saveMemory(MONITORING_JOBS_KEY, memory);
  }
}

const emailMonitor = new EmailMonitor();

export default emailMonitor;
export { EmailMonitor };
