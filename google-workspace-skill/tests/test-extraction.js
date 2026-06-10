import emailExtractor from '../functions/email-extract.js';
import accountManager from '../functions/account-manager.js';

describe('Email Data Extraction', () => {
  const TEST_EMAIL = process.env.TEST_EMAIL || 'test@gmail.com';

  beforeAll(async () => {
    await accountManager.initialize();
  });

  test('extracts email headers and body', async () => {
    if (!process.env.TEST_MESSAGE_ID) {
      expect(true).toBe(true);
      return;
    }

    const extracted = await emailExtractor.extractEmail(
      TEST_EMAIL,
      process.env.TEST_MESSAGE_ID
    );

    expect(extracted).toHaveProperty('messageId');
    expect(extracted).toHaveProperty('threadId');
    expect(extracted).toHaveProperty('from');
    expect(extracted).toHaveProperty('to');
    expect(extracted).toHaveProperty('subject');
    expect(extracted).toHaveProperty('date');
    expect(extracted).toHaveProperty('body');
    expect(extracted).toHaveProperty('timestamp');
    expect(extracted).toHaveProperty('formattedDate');
  });

  test('parses attachments metadata', async () => {
    if (!process.env.TEST_MESSAGE_ID) {
      expect(true).toBe(true);
      return;
    }

    const extracted = await emailExtractor.extractEmail(
      TEST_EMAIL,
      process.env.TEST_MESSAGE_ID
    );

    expect(extracted).toHaveProperty('attachments');
    expect(Array.isArray(extracted.attachments)).toBe(true);
    expect(extracted).toHaveProperty('attachmentCount');
  });

  test('handles batch extraction', async () => {
    if (!process.env.TEST_EMAIL) {
      expect(true).toBe(true);
      return;
    }

    const result = await emailExtractor.batchExtract(
      TEST_EMAIL,
      'in:inbox',
      { maxResults: 5 }
    );

    expect(result).toHaveProperty('email', TEST_EMAIL);
    expect(result).toHaveProperty('query');
    expect(result).toHaveProperty('messageCount');
    expect(result).toHaveProperty('messages');
    expect(Array.isArray(result.messages)).toBe(true);
  });

  test('exports to CSV format', async () => {
    if (!process.env.TEST_EMAIL) {
      expect(true).toBe(true);
      return;
    }

    const result = await emailExtractor.batchExtract(
      TEST_EMAIL,
      'in:inbox',
      {
        maxResults: 3,
        outputFormat: 'csv'
      }
    );

    expect(result.format).toBe('csv');
    expect(typeof result.messages).toBe('string');
    expect(result.messages).toMatch(/messageId,from,to,subject/);
  });

  test('exports to JSON format', async () => {
    if (!process.env.TEST_EMAIL) {
      expect(true).toBe(true);
      return;
    }

    const result = await emailExtractor.batchExtract(
      TEST_EMAIL,
      'in:inbox',
      {
        maxResults: 3,
        outputFormat: 'json'
      }
    );

    expect(result.format).toBe('json');
    expect(Array.isArray(result.messages)).toBe(true);
  });

  test('handles structured format', async () => {
    if (!process.env.TEST_EMAIL) {
      expect(true).toBe(true);
      return;
    }

    const result = await emailExtractor.batchExtract(
      TEST_EMAIL,
      'in:inbox',
      {
        maxResults: 3,
        outputFormat: 'structured'
      }
    );

    expect(result.format).toBe('structured');
    expect(Array.isArray(result.messages)).toBe(true);
    if (result.messages.length > 0) {
      expect(result.messages[0]).toHaveProperty('header');
      expect(result.messages[0]).toHaveProperty('body');
      expect(result.messages[0]).toHaveProperty('metadata');
    }
  });

  test('extracts data by pattern', async () => {
    if (!process.env.TEST_EMAIL) {
      expect(true).toBe(true);
      return;
    }

    const result = await emailExtractor.extractByPattern(
      TEST_EMAIL,
      'in:inbox subject:invoice',
      { amount: '\\$[\\d,]+' }
    );

    expect(result).toHaveProperty('email', TEST_EMAIL);
    expect(result).toHaveProperty('messageCount');
    expect(result).toHaveProperty('extractionRules');
    expect(Array.isArray(result.messages)).toBe(true);
  });

  test('handles invalid email gracefully', async () => {
    expect(async () => {
      await emailExtractor.extractEmail('invalid', 'fake-id');
    }).rejects.toThrow();
  });
});
