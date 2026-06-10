// Email Organizer Skill
// Fetch, parse, and organize Gmail data

const fs = require('fs');
const path = require('path');

// Simulated Gmail API client (in production, use googleapis library)
class EmailClient {
  constructor(email, credentials) {
    this.email = email;
    this.credentials = credentials;
  }

  async fetchEmails(query = 'in:inbox', maxResults = 100) {
    // In production: call Gmail API via MCP
    // For now: return mock data
    return [
      {
        id: 'msg-1',
        from: { email: 'sender@example.com', name: 'Example Sender' },
        to: [this.email],
        subject: 'Test Email',
        body: 'This is a test email',
        date: new Date().toISOString(),
        labels: ['INBOX'],
        attachments: []
      }
    ];
  }

  async getMessage(messageId) {
    // Fetch individual message details
    return {};
  }
}

async function fetchEmails(accounts, query = 'in:inbox', maxResults = 100) {
  const emails = [];

  for (const account of accounts) {
    try {
      const client = new EmailClient(account, {});
      const messages = await client.fetchEmails(query, maxResults);
      emails.push(...messages);
    } catch (err) {
      console.error(`Error fetching from ${account}:`, err.message);
    }
  }

  return emails;
}

function parseEmailMetadata(email) {
  return {
    messageId: email.id,
    sender: email.from.email,
    senderName: email.from.name,
    to: email.to[0],
    subject: email.subject,
    date: email.date,
    timestamp: new Date(email.date).getTime(),
    keywords: extractKeywords(email.subject, email.body),
    hasAttachments: email.attachments.length > 0,
    isUnread: email.labels.includes('UNREAD')
  };
}

function extractKeywords(subject, body) {
  const text = `${subject} ${body}`.toLowerCase();
  const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is']);

  return text
    .split(/\W+/)
    .filter(w => w.length > 3 && !stopwords.has(w))
    .slice(0, 5);
}

function inferProject(email, projectBrain = null) {
  // Try to infer project from email metadata
  const senderDomain = email.from.email.split('@')[1];

  // Check against project brain if available
  if (projectBrain) {
    for (const [projectName, projectData] of Object.entries(projectBrain.projects || {})) {
      if (projectData.domains && projectData.domains.includes(senderDomain)) {
        return projectName;
      }
      if (projectData.contacts && projectData.contacts.includes(email.from.email)) {
        return projectName;
      }
    }
  }

  // Fallback: guess from domain
  return senderDomain.split('.')[0] || 'Uncategorized';
}

async function groupByProject(emails, projectBrain = null) {
  const groups = {};

  for (const email of emails) {
    const metadata = parseEmailMetadata(email);
    const project = inferProject(email, projectBrain);

    if (!groups[project]) {
      groups[project] = [];
    }

    groups[project].push({
      ...metadata,
      bodyPreview: email.body.substring(0, 100)
    });
  }

  // Sort within each project by date descending
  for (const project in groups) {
    groups[project].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return groups;
}

function parseSenderInfo(email) {
  return {
    email: email.from.email,
    name: email.from.name || email.from.email,
    domain: email.from.email.split('@')[1],
    lastContact: email.date,
    frequency: 1 // Would be incremented with real data
  };
}

async function generateHTMLReport(organizationMap, senderMap, outputPath) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    section { margin: 20px 0; }
    h2 { border-bottom: 2px solid #007AFF; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ccc; }
    th { background: #f0f0f0; }
    .badge { background: #007AFF; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
    .snippet { color: #666; font-style: italic; }
  </style>
</head>
<body>
  <h1>Email Organization Report</h1>
  <p>Generated: ${new Date().toISOString()}</p>

  ${Object.entries(organizationMap)
    .map(
      ([project, emails]) => `
    <section id="project-${project.replace(/\s+/g, '-')}">
      <h2>${project} <span class="badge">${emails.length} emails</span></h2>
      <table>
        <tr>
          <th>Date</th>
          <th>From</th>
          <th>Subject</th>
          <th>Preview</th>
        </tr>
        ${emails
          .map(
            e => `
          <tr>
            <td>${new Date(e.date).toLocaleDateString()}</td>
            <td>${e.senderName || e.sender}</td>
            <td>${e.subject}</td>
            <td class="snippet">${e.bodyPreview}</td>
          </tr>
        `
          )
          .join('')}
      </table>
    </section>
  `
    )
    .join('')}

  <section id="contacts">
    <h2>Contact Index</h2>
    <table>
      <tr>
        <th>Name</th>
        <th>Emails</th>
        <th>Last Contact</th>
      </tr>
      ${Object.values(senderMap)
        .map(
          s => `
        <tr>
          <td>${s.name}</td>
          <td>${s.email}</td>
          <td>${new Date(s.lastContact).toLocaleDateString()}</td>
        </tr>
      `
        )
        .join('')}
    </table>
  </section>
</body>
</html>`;

  fs.writeFileSync(outputPath, html);
  return outputPath;
}

async function organizeEmails(accounts, query = 'in:inbox', projectBrain = null) {
  const emails = await fetchEmails(accounts, query);
  const organized = await groupByProject(emails, projectBrain);

  const senders = {};
  for (const email of emails) {
    const senderEmail = email.from.email;
    if (!senders[senderEmail]) {
      senders[senderEmail] = parseSenderInfo(email);
    }
  }

  return {
    emails: organized,
    contacts: senders,
    stats: {
      total: emails.length,
      projects: Object.keys(organized).length,
      uniqueSenders: Object.keys(senders).length
    }
  };
}

module.exports = {
  fetchEmails,
  parseEmailMetadata,
  groupByProject,
  parseSenderInfo,
  generateHTMLReport,
  organizeEmails,
  extractKeywords,
  inferProject
};
