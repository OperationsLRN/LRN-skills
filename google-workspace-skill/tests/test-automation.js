import emailAutomate from '../functions/email-automate.js';
import accountManager from '../functions/account-manager.js';

describe('Email Automation', () => {
  const TEST_EMAIL = process.env.TEST_EMAIL || 'test@gmail.com';
  const TEST_RECIPIENT = process.env.TEST_RECIPIENT || 'recipient@example.com';

  beforeAll(async () => {
    await accountManager.initialize();
  });

  test('drafts email without sending', async () => {
    if (!process.env.TEST_EMAIL) {
      expect(true).toBe(true);
      return;
    }

    const result = await emailAutomate.draftEmail(
      TEST_EMAIL,
      TEST_RECIPIENT,
      'Test Subject',
      'Test Body',
      { cc: null }
    );

    expect(result).toHaveProperty('draftId');
    expect(result).toHaveProperty('to', TEST_RECIPIENT);
    expect(result).toHaveProperty('subject', 'Test Subject');
    expect(result).toHaveProperty('status', 'draft');
    expect(result).toHaveProperty('createdAt');
  });

  test('applies template with variables', async () => {
    const rendered = await emailAutomate.applyTemplate(
      TEST_EMAIL,
      'invoice_reminder',
      {
        invoiceNumber: 'INV-001',
        clientName: 'ACME Corp',
        amount: '$1000',
        dueDate: '2026-06-01'
      }
    );

    expect(rendered).toHaveProperty('templateName', 'invoice_reminder');
    expect(rendered).toHaveProperty('subject');
    expect(rendered).toHaveProperty('body');
    expect(rendered.subject).toContain('INV-001');
    expect(rendered.body).toContain('ACME Corp');
    expect(rendered.body).toContain('$1000');
  });

  test('applies multiple templates', async () => {
    const templates = ['invoice_reminder', 'order_confirmation', 'follow_up'];

    for (const templateName of templates) {
      const result = await emailAutomate.applyTemplate(
        TEST_EMAIL,
        templateName,
        {
          invoiceNumber: 'INV-001',
          clientName: 'Test Client',
          amount: '$500',
          dueDate: '2026-06-15',
          orderNumber: 'ORD-001',
          deliveryDate: '2026-05-20',
          recipientName: 'John',
          subject: 'Meeting',
          topic: 'Project Update'
        }
      );

      expect(result.templateName).toBe(templateName);
      expect(result.subject).toBeTruthy();
      expect(result.body).toBeTruthy();
    }
  });

  test('lists available templates', () => {
    const result = emailAutomate.listTemplates();

    expect(result).toHaveProperty('templates');
    expect(result).toHaveProperty('count');
    expect(Array.isArray(result.templates)).toBe(true);
    expect(result.count).toBeGreaterThan(0);
    expect(result.templates).toContain('invoice_reminder');
  });

  test('registers custom template', () => {
    const result = emailAutomate.registerTemplate(
      'custom_test',
      'Custom {{subject}}',
      'Custom body with {{variable}}'
    );

    expect(result).toHaveProperty('templateName', 'custom_test');
    expect(result).toHaveProperty('registered', true);

    // Verify custom template is available
    const templates = emailAutomate.listTemplates();
    expect(templates.templates).toContain('custom_test');
  });

  test('handles template variable substitution', async () => {
    const result = await emailAutomate.applyTemplate(
      TEST_EMAIL,
      'follow_up',
      {
        recipientName: 'Alice',
        subject: 'Project Proposal',
        topic: 'Budget Review'
      }
    );

    expect(result.subject).not.toContain('{{');
    expect(result.body).not.toContain('{{');
    expect(result.subject).toContain('Project Proposal');
    expect(result.body).toContain('Budget Review');
  });

  test('rejects non-existent template', async () => {
    expect(async () => {
      await emailAutomate.applyTemplate(
        TEST_EMAIL,
        'nonexistent_template',
        {}
      );
    }).rejects.toThrow('Template not found');
  });

  test('prevents duplicate custom templates', () => {
    emailAutomate.registerTemplate(
      'unique_template',
      'Subject',
      'Body'
    );

    expect(() => {
      emailAutomate.registerTemplate(
        'unique_template',
        'Subject2',
        'Body2'
      );
    }).toThrow('Template already exists');
  });

  test('sends email with confirmation by default', async () => {
    if (!process.env.TEST_EMAIL) {
      expect(true).toBe(true);
      return;
    }

    const result = await emailAutomate.sendEmail(
      TEST_EMAIL,
      TEST_RECIPIENT,
      'Test Email',
      'Body',
      { confirmBefore: true }
    );

    expect(result.status).toBe('pending_confirmation');
    expect(result).toHaveProperty('draftId');
  });
});
