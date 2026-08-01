// Central error handler - catches anything passed to next(err) or thrown in async routes
const logError = require('../utils/logError');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with that ${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // Only log genuine crashes (500s) to the Health tab - routine 400s (bad
  // input, duplicate email, etc.) are normal traffic, not "the app is
  // breaking," and would just drown out real issues.
  if (statusCode >= 500) {
    logError({
      source: 'server',
      severity: 'error',
      message,
      path: req.originalUrl,
      statusCode,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
