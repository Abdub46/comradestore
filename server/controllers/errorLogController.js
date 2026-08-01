const ErrorLog = require('../models/ErrorLog');
const logError = require('../utils/logError');

// @desc    Get all error logs, newest first
// @route   GET /api/errors
// @access  Private/Admin
const getErrorLogs = async (req, res, next) => {
  try {
    const logs = await ErrorLog.find().sort('-createdAt').limit(200);
    res.json({ logs, count: logs.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete one error log entry (mark as "settled")
// @route   DELETE /api/errors/:id
// @access  Private/Admin
const deleteErrorLog = async (req, res, next) => {
  try {
    await ErrorLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Error log entry removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear every error log entry
// @route   DELETE /api/errors
// @access  Private/Admin
const clearErrorLogs = async (req, res, next) => {
  try {
    await ErrorLog.deleteMany({});
    res.json({ message: 'All error logs cleared' });
  } catch (error) {
    next(error);
  }
};

// @desc    Report an uncaught error from the browser (React ErrorBoundary /
//          window.onerror). Public, since logged-out visitors can hit bugs
//          too - kept tightly rate-limited (see security.js) to prevent abuse.
// @route   POST /api/errors/client
// @access  Public
const reportClientError = async (req, res, next) => {
  try {
    const { message, stack, path } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Missing error message' });
    }

    await logError({
      source: 'client',
      severity: 'error',
      message,
      stack,
      path: typeof path === 'string' ? path : undefined,
    });

    res.status(201).json({ message: 'Logged' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getErrorLogs, deleteErrorLog, clearErrorLogs, reportClientError };