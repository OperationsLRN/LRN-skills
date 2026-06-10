// Main entry point for google-workspace-skill
import accountManager from './account-manager.js';
import emailMonitor from './email-monitor.js';
import emailExtractor from './email-extract.js';
import emailAutomate from './email-automate.js';

export {
  accountManager,
  emailMonitor,
  emailExtractor,
  emailAutomate
};

// Combined API for convenience
export const GoogleWorkspaceSkill = {
  accounts: {
    list: () => accountManager.listAccounts(),
    add: (email, credentials) => accountManager.addAccount(email, credentials),
    remove: (email) => accountManager.removeAccount(email),
    validate: (email) => accountManager.validateConnection(email),
    validateAll: () => accountManager.validateAllConnections(),
    stats: () => accountManager.getAccountStats()
  },

  monitoring: {
    monitor: (email, query, options) => emailMonitor.monitorInbox(email, query, options),
    setup: (email, rules, options) => emailMonitor.setupMonitoringJob(email, rules, options),
    start: (jobId, duration) => emailMonitor.startMonitoringJob(jobId, duration),
    stop: (jobId) => emailMonitor.stopMonitoringJob(jobId),
    status: (jobId) => emailMonitor.getMonitoringStatus(jobId),
    list: () => emailMonitor.listMonitoringJobs()
  },

  extraction: {
    extract: (email, messageId) => emailExtractor.extractEmail(email, messageId),
    batch: (email, query, options) => emailExtractor.batchExtract(email, query, options),
    attachments: (email, messageId, path) => emailExtractor.extractAttachments(email, messageId, path),
    pattern: (email, query, rules) => emailExtractor.extractByPattern(email, query, rules)
  },

  automation: {
    draft: (email, to, subject, body, options) => emailAutomate.draftEmail(email, to, subject, body, options),
    send: (email, to, subject, body, options) => emailAutomate.sendEmail(email, to, subject, body, options),
    template: (email, templateName, variables) => emailAutomate.applyTemplate(email, templateName, variables),
    createRule: (email, trigger, action) => emailAutomate.createRule(email, trigger, action),
    listTemplates: () => emailAutomate.listTemplates(),
    registerTemplate: (name, subject, body) => emailAutomate.registerTemplate(name, subject, body)
  }
};

export default GoogleWorkspaceSkill;
