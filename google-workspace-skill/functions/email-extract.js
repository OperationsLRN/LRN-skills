import accountManager from './account-manager.js';
import { logInfo, logError, formatDate, sanitizeForFilename } from './utils.js';
import fs from 'fs';
import path from 'path';

class EmailExtractor {
  // Extract single email with full details
  async extractEmail(email, messageId) {
    const client = await accountManager.getClient(email);

    try {
      const response = await client.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const message = response.data;
      const headers = message.payload?.headers || [];
      const parts = message.payload?.parts || [];

      // Extract header fields
      const getHeader = (name) => {
        const header = headers.find(h => h.name === name);
        return header?.value || null;
      };

      // Extract body text
      let body = '';
      let plainText = '';

      if (message.payload?.body?.data) {
        plainText = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      } else if (parts.length > 0) {
        const textPart = parts.find(p => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          plainText = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      }

      // Extract attachments metadata
      const attachments = [];
      if (parts) {
        for (const part of parts) {
          if (part.filename && part.body?.attachmentId) {
            attachments.push({
              filename: part.filename,
              mimeType: part.mimeType,
              size: part.body?.size || 0,
              attachmentId: part.body.attachmentId
            });
          }
        }
      }

      const extracted = {
        messageId,
        threadId: message.threadId,
        from: getHeader('From'),
        to: getHeader('To'),
        cc: getHeader('Cc'),
        bcc: getHeader('Bcc'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        timestamp: parseInt(message.internalDate),
        formattedDate: formatDate(new Date(parseInt(message.internalDate))),
        body: plainText.substring(0, 5000), // First 5000 chars
        snippet: message.snippet || '',
        labels: message.labelIds || [],
        attachments,
        attachmentCount: attachments.length,
        sizeEstimate: message.sizeEstimate,
        historyId: message.historyId
      };

      logInfo(`Extracted email`, { email, messageId });
      return extracted;
    } catch (error) {
      logError(`Failed to extract email`, { email, messageId, error: error.message });
      throw error;
    }
  }

  // Batch extract emails from query results
  async batchExtract(email, query, options = {}) {
    const {
      outputFormat = 'json', // 'json', 'csv', 'structured'
      maxResults = 100,
      outputPath = null
    } = options;

    const client = await accountManager.getClient(email);

    try {
      logInfo(`Batch extracting emails`, { email, query, maxResults });

      // Get message IDs from query
      const listResponse = await client.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: Math.min(maxResults, 100)
      });

      if (!listResponse.data.messages) {
        logInfo(`No messages found for query`, { email, query });
        return {
          email,
          query,
          messageCount: 0,
          messages: [],
          format: outputFormat
        };
      }

      // Extract details for each message
      const messages = [];
      for (const message of listResponse.data.messages) {
        const extracted = await this.extractEmail(email, message.id);
        messages.push(extracted);
      }

      // Format output
      let output = messages;
      if (outputFormat === 'csv') {
        output = this._formatAsCSV(messages);
      } else if (outputFormat === 'structured') {
        output = this._formatAsStructured(messages);
      }

      // Save to file if path provided
      if (outputPath) {
        await this._saveOutput(output, outputPath, outputFormat);
        logInfo(`Saved extraction output`, { email, path: outputPath });
      }

      return {
        email,
        query,
        messageCount: messages.length,
        messages: outputFormat === 'csv' ? output : messages,
        format: outputFormat,
        outputPath: outputPath || null,
        timestamp: formatDate(new Date())
      };
    } catch (error) {
      logError(`Batch extraction failed`, { email, query, error: error.message });
      throw error;
    }
  }

  // Extract attachments from message
  async extractAttachments(email, messageId, downloadPath) {
    const client = await accountManager.getClient(email);

    try {
      const message = await this.extractEmail(email, messageId);

      if (!message.attachments || message.attachments.length === 0) {
        logInfo(`No attachments found`, { email, messageId });
        return {
          messageId,
          attachmentCount: 0,
          files: []
        };
      }

      const files = [];
      for (const attachment of message.attachments) {
        try {
          const attachResponse = await client.users.messages.attachments.get({
            userId: 'me',
            messageId,
            id: attachment.attachmentId
          });

          const fileData = Buffer.from(attachResponse.data.data, 'base64');

          if (downloadPath) {
            const filePath = path.join(downloadPath, attachment.filename);
            fs.writeFileSync(filePath, fileData);
            files.push({
              filename: attachment.filename,
              mimeType: attachment.mimeType,
              size: attachment.size,
              savedPath: filePath,
              downloaded: true
            });
          } else {
            files.push({
              filename: attachment.filename,
              mimeType: attachment.mimeType,
              size: attachment.size,
              data: fileData.toString('base64'),
              downloaded: false
            });
          }
        } catch (error) {
          logError(`Failed to extract attachment`, {
            email,
            messageId,
            filename: attachment.filename,
            error: error.message
          });
        }
      }

      logInfo(`Extracted attachments`, { email, messageId, count: files.length });
      return {
        messageId,
        attachmentCount: files.length,
        files,
        downloadPath
      };
    } catch (error) {
      logError(`Attachment extraction failed`, { email, messageId, error: error.message });
      throw error;
    }
  }

  // Extract fields by regex pattern
  async extractByPattern(email, query, extractionRules) {
    const result = await this.batchExtract(email, query, { maxResults: 100 });

    const extracted = result.messages.map(message => {
      const fields = {};

      for (const [fieldName, pattern] of Object.entries(extractionRules)) {
        const regex = new RegExp(pattern, 'i');
        const match = message.body.match(regex);
        fields[fieldName] = match ? match[0] : null;
      }

      return {
        messageId: message.messageId,
        from: message.from,
        subject: message.subject,
        date: message.formattedDate,
        extractedFields: fields
      };
    });

    logInfo(`Pattern extraction completed`, { email, ruleCount: Object.keys(extractionRules).length });

    return {
      email,
      query,
      messageCount: extracted.length,
      extractionRules: Object.keys(extractionRules),
      messages: extracted
    };
  }

  // Private: format as CSV
  _formatAsCSV(messages) {
    if (!messages || messages.length === 0) {
      return 'messageId,from,to,subject,date,snippet\n';
    }

    const headers = ['messageId', 'from', 'to', 'subject', 'date', 'snippet'];
    const csvRows = [headers.join(',')];

    for (const msg of messages) {
      const row = [
        msg.messageId,
        this._escapeCSV(msg.from || ''),
        this._escapeCSV(msg.to || ''),
        this._escapeCSV(msg.subject || ''),
        msg.formattedDate,
        this._escapeCSV(msg.snippet || '')
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  // Private: format as structured
  _formatAsStructured(messages) {
    return messages.map(msg => ({
      header: {
        from: msg.from,
        to: msg.to,
        subject: msg.subject,
        date: msg.formattedDate
      },
      body: msg.body.substring(0, 1000),
      metadata: {
        attachments: msg.attachmentCount,
        labels: msg.labels
      }
    }));
  }

  // Private: escape CSV values
  _escapeCSV(value) {
    if (!value) return '';
    if (typeof value !== 'string') value = String(value);
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  // Private: save output to file
  async _saveOutput(output, outputPath, format) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (format === 'csv') {
      fs.writeFileSync(outputPath, output, 'utf-8');
    } else {
      fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    }
  }
}

const emailExtractor = new EmailExtractor();

export default emailExtractor;
export { EmailExtractor };
