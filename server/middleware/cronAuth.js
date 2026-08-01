const crypto = require('crypto');
const logError = require('../utils/logError');

const cronAuth = (req, res, next) => {
  const providedKey = req.query.key || req.headers['x-cron-secret'];

  if (!process.env.CRON_SECRET) {
    return res.status(500).json({ message: 'CRON_SECRET is not configured on the server' });
  }

  const expected = Buffer.from(process.env.CRON_SECRET);
  const provided = Buffer.from(String(providedKey || ''));

  const isValid =
    expected.length === provided.length && crypto.timingSafeEqual(expected, provided);

  if (!isValid) {
    logError({
      source: 'server',
      severity: 'security',
      message: 'Invalid or missing cron key on a cron-triggered route',
      path: req.originalUrl,
      statusCode: 403,
    });
    return res.status(403).json({ message: 'Invalid or missing cron key' });
  }

  next();
};

module.exports = cronAuth;