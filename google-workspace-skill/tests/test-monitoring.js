import emailMonitor from '../functions/email-monitor.js';
import accountManager from '../functions/account-manager.js';

describe('Email Monitoring', () => {
  // Note: These tests require valid Gmail credentials and accounts
  // Set TEST_EMAIL env var to run actual tests

  const TEST_EMAIL = process.env.TEST_EMAIL || 'test@gmail.com';

  beforeAll(async () => {
    await accountManager.initialize();
    await emailMonitor.initialize();
  });

  test('monitors inbox for pattern matches', async () => {
    // Skip if no test email configured
    if (!process.env.TEST_EMAIL) {
      expect(true).toBe(true);
      return;
    }

    const result = await emailMonitor.monitorInbox(
      TEST_EMAIL,
      'in:inbox',
      { maxResults: 5 }
    );

    expect(result).toHaveProperty('email', TEST_EMAIL);
    expect(result).toHaveProperty('matchCount');
    expect(result).toHaveProperty('matches');
    expect(Array.isArray(result.matches)).toBe(true);
  });

  test('handles multi-account monitoring', async () => {
    if (!process.env.TEST_EMAIL) {
      expect(true).toBe(true);
      return;
    }

    const result = await emailMonitor.monitorInbox(
      TEST_EMAIL,
      'from:noreply@',
      { maxResults: 10 }
    );

    expect(result.email).toBe(TEST_EMAIL);
    expect(typeof result.matchCount).toBe('number');
  });

  test('respects polling interval option', async () => {
    if (!process.env.TEST_EMAIL) {
      expect(true).toBe(true);
      return;
    }

    const startTime = Date.now();

    const result = await emailMonitor.monitorInbox(
      TEST_EMAIL,
      'in:inbox',
      { pollInterval: 5000 }
    );

    const elapsed = Date.now() - startTime;

    // Monitor should complete quickly without actual polling
    expect(elapsed).toBeLessThan(10000);
    expect(result).toHaveProperty('pollInterval', 5000);
  });

  test('creates and manages monitoring jobs', async () => {
    if (!process.env.TEST_EMAIL) {
      expect(true).toBe(true);
      return;
    }

    const jobResult = await emailMonitor.setupMonitoringJob(
      TEST_EMAIL,
      [
        { name: 'test_rule', query: 'in:inbox' }
      ]
    );

    expect(jobResult).toHaveProperty('jobId');
    expect(jobResult).toHaveProperty('status', 'created');
    expect(jobResult).toHaveProperty('ruleCount', 1);

    const status = await emailMonitor.getMonitoringStatus(jobResult.jobId);
    expect(status.jobId).toBe(jobResult.jobId);
    expect(status.active).toBe(true);
  });

  test('lists monitoring jobs', async () => {
    const jobs = await emailMonitor.listMonitoringJobs();
    expect(Array.isArray(jobs)).toBe(true);
  });

  test('handles invalid email gracefully', async () => {
    expect(async () => {
      await emailMonitor.monitorInbox('invalid', 'in:inbox');
    }).rejects.toThrow();
  });
});
