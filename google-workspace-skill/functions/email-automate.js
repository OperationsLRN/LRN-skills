import accountManager from './account-manager.js';
import { logInfo, logError, formatDate, generateId } from './utils.js';

const EMAIL_TEMPLATES = {
  'invoice_reminder': {
    subject: 'Invoice Reminder: {{invoiceNumber}}',
    body: 'Hi {{clientName}},\n\nThis is a friendly reminder about invoice {{invoiceNumber}} for {{amount}}, due on {{dueDate}}.\n\nPlease let me know if you have any questions.\n\nBest regards'
  },
  'order_confirmation': {
    subject: 'Order Confirmation: {{orderNumber}}',
    body: 'Thank you for your order {{orderNumber}}.\n\nOrder Total: {{amount}}\nEstimated Delivery: {{deliveryDate}}\n\nYour order is being processed and will ship soon.'
  },
  'follow_up': {
    subject: 'Follow Up: {{subject}}',
    body: 'Hi {{recipientName}},\n\nJust following up on {{topic}}.\n\nLooking forward to hearing from you.\n\nBest regards'
  }
};

class EmailAutomate {
  // Draft email (doesn't send, creates as draft)
  async draftEmail(email, to, subject, body, options = {}) {
    const { cc = null, bcc = null } = options;

    const client = await accountManager.getClient(email);

    try {
      const rawEmail = this._buildRawEmail({
        from: email,
        to,
        cc,
        bcc,
        subject,
        body
      });

      const response = await client.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw: Buffer.from(rawEmail).toString('base64')
          }
        }
      });

      const draftId = response.data.id;

      logInfo(`Created draft email`, {
        email,
        to,
        subject: subject.substring(0, 50),
        draftId
      });

      return {
        draftId,
        threadId: response.data.message.threadId,
        to,
        subject,
        status: 'draft',
        createdAt: formatDate(new Date()),
        url: `https://mail.google.com/mail/u/0/#drafts?compose=${draftId}`
      };
    } catch (error) {
      logError(`Failed to create draft`, { email, to, error: error.message });
      throw error;
    }
  }

  // Send email directly (with confirmation)
  async sendEmail(email, to, subject, body, options = {}) {
    const { cc = null, bcc = null, confirmBefore = true } = options;

    const client = await accountManager.getClient(email);

    try {
      // First create as draft for review
      const draft = await this.draftEmail(email, to, subject, body, { cc, bcc });

      if (confirmBefore) {
        logInfo(`Draft created for review before sending`, {
          email,
          to,
          draftId: draft.draftId
        });

        return {
          ...draft,
          status: 'pending_confirmation',
          message: 'Draft created. Please review in Gmail and send manually to confirm.'
        };
      }

      // Send directly
      const rawEmail = this._buildRawEmail({
        from: email,
        to,
        cc,
        bcc,
        subject,
        body
      });

      const response = await client.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: Buffer.from(rawEmail).toString('base64')
        }
      });

      logInfo(`Sent email`, {
        email,
        to,
        subject: subject.substring(0, 50),
        messageId: response.data.id
      });

      return {
        messageId: response.data.id,
        threadId: response.data.threadId,
        to,
        subject,
        status: 'sent',
        sentAt: formatDate(new Date())
      };
    } catch (error) {
      logError(`Failed to send email`, { email, to, error: error.message });
      throw error;
    }
  }

  // Apply template with variable substitution
  async applyTemplate(email, templateName, variables) {
    const template = EMAIL_TEMPLATES[templateName];
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const subject = this._renderTemplate(template.subject, variables);
    const body = this._renderTemplate(template.body, variables);

    logInfo(`Applied template`, {
      email,
      templateName,
      variables: Object.keys(variables)
    });

    return {
      templateName,
      subject,
      body,
      variables,
      rendered: true
    };
  }

  // Create Gmail filter/rule
  async createRule(email, trigger, action) {
    const client = await accountManager.getClient(email);

    try {
      // Build filter criteria from trigger
      const criteria = {};
      if (trigger.from) criteria.from = trigger.from;
      if (trigger.to) criteria.to = trigger.to;
      if (trigger.subject) criteria.subject = trigger.subject;
      if (trigger.query) criteria.query = trigger.query;

      // Build action from action spec
      const filterAction = {};
      if (action.label) filterAction.addLabelIds = [await this._getLabelId(client, action.label)];
      if (action.skip) filterAction.skipInbox = true;
      if (action.star) filterAction.starIt = true;
      if (action.markRead) filterAction.markAsRead = true;

      const response = await client.users.settings.filters.create({
        userId: 'me',
        requestBody: {
          criteria,
          action: filterAction
        }
      });

      logInfo(`Created filter/rule`, {
        email,
        trigger,
        action: Object.keys(action)
      });

      return {
        filterId: response.data.id,
        criteria,
        action: Object.keys(action),
        created: true,
        createdAt: formatDate(new Date())
      };
    } catch (error) {
      logError(`Failed to create filter`, { email, error: error.message });
      throw error;
    }
  }

  // List available templates
  listTemplates() {
    return {
      templates: Object.keys(EMAIL_TEMPLATES),
      count: Object.keys(EMAIL_TEMPLATES).length,
      templates: Object.entries(EMAIL_TEMPLATES).map(([name, template]) => ({
        name,
        subject: template.subject,
        body: template.body.substring(0, 100) + '...'
      }))
    };
  }

  // Register custom template
  registerTemplate(name, subject, body) {
    if (EMAIL_TEMPLATES[name]) {
      throw new Error(`Template already exists: ${name}`);
    }

    EMAIL_TEMPLATES[name] = { subject, body };

    logInfo(`Registered template`, { name });

    return {
      templateName: name,
      registered: true
    };
  }

  // Private: build raw email
  _buildRawEmail({ from, to, cc, bcc, subject, body }) {
    const lines = [];

    lines.push(`From: ${from}`);
    lines.push(`To: ${to}`);
    if (cc) lines.push(`Cc: ${cc}`);
    if (bcc) lines.push(`Bcc: ${bcc}`);
    lines.push(`Subject: ${subject}`);
    lines.push('Content-Type: text/plain; charset=utf-8');
    lines.push('');
    lines.push(body);

    return lines.join('\r\n');
  }

  // Private: render template with variables
  _renderTemplate(template, variables) {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }

    return result;
  }

  // Private: get label ID by name
  async _getLabelId(client, labelName) {
    try {
      const response = await client.users.labels.list({
        userId: 'me'
      });

      const label = response.data.labels?.find(
        l => l.name.toLowerCase() === labelName.toLowerCase()
      );

      if (label) {
        return label.id;
      }

      // Create new label if not found
      const createResponse = await client.users.labels.create({
        userId: 'me',
        requestBody: {
          name: labelName,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show'
        }
      });

      return createResponse.data.id;
    } catch (error) {
      logError(`Failed to get/create label`, { labelName, error: error.message });
      throw error;
    }
  }
}

const emailAutomate = new EmailAutomate();

export default emailAutomate;
export { EmailAutomate };
