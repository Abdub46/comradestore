const ErrorLog = require('../models/ErrorLog');

async function logError({ source, severity = 'error', message, path, statusCode, stack }) {
  try {
    await ErrorLog.create({
      source,
      severity,
      message: String(message).slice(0, 1000),
      path,
      statusCode,
      stack: stack ? String(stack).slice(0, 4000) : undefined,
    });
  } catch (err) {
    // Logging must never itself crash or block anything
    console.error('Failed to write to ErrorLog:', err.message);
  }
}

module.exports = logError;