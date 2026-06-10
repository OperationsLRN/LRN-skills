import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEMORY_DIR = process.env.MEMORY_DIR || path.join(__dirname, '..', 'memory');

// Structured logging
export function log(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...context
  };
  console.log(JSON.stringify(logEntry));
}

export const logInfo = (msg, ctx) => log('info', msg, ctx);
export const logError = (msg, ctx) => log('error', msg, ctx);
export const logWarn = (msg, ctx) => log('warn', msg, ctx);
export const logDebug = (msg, ctx) => log('debug', msg, ctx);

// Memory persistence
export async function loadMemory(key) {
  const filePath = path.join(MEMORY_DIR, `${key}.json`);
  try {
    if (!fs.existsSync(filePath)) {
      logDebug(`Memory file not found: ${key}`, { filePath });
      return null;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    logDebug(`Loaded memory: ${key}`, { size: data.length });
    return JSON.parse(data);
  } catch (error) {
    logError(`Failed to load memory: ${key}`, { error: error.message });
    return null;
  }
}

export async function saveMemory(key, data) {
  const filePath = path.join(MEMORY_DIR, `${key}.json`);
  try {
    // Ensure directory exists
    if (!fs.existsSync(MEMORY_DIR)) {
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, json, 'utf-8');
    logDebug(`Saved memory: ${key}`, { size: json.length });
    return true;
  } catch (error) {
    logError(`Failed to save memory: ${key}`, { error: error.message });
    return false;
  }
}

// Retry logic with exponential backoff
export async function retryWithBackoff(fn, maxRetries = 3, delayMs = 1000) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = delayMs * Math.pow(2, attempt);
      logWarn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms`, {
        error: error.message
      });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Failed after ${maxRetries} retries: ${lastError.message}`);
}

// Email validation
export function validateEmail(address) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(address);
}

// Filename sanitization
export function sanitizeForFilename(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Date formatting
export function formatDate(date) {
  return date instanceof Date ? date.toISOString() : new Date(date).toISOString();
}

// Parse Gmail query to object
export function parseGmailQuery(query) {
  const conditions = {};
  const patterns = [
    /from:([^\s]+)/,
    /to:([^\s]+)/,
    /subject:"([^"]+)"/,
    /in:([^\s]+)/,
    /is:([^\s]+)/,
    /after:([^\s]+)/,
    /before:([^\s]+)/
  ];

  patterns.forEach(pattern => {
    const match = query.match(pattern);
    if (match) {
      const key = pattern.source.match(/(\w+):/)?.[1];
      if (key) conditions[key] = match[1];
    }
  });

  return conditions;
}

// Wait helper
export async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Merge objects deeply
export function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// Truncate string
export function truncate(str, length = 100) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

// Generate unique ID
export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
