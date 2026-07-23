// Protects the external cron-trigger endpoint. Since this endpoint has to
// be reachable by an outside scheduler (no login/JWT possible there), it's
// instead locked behind a long random secret that only you and the
// scheduler know - anyone without it gets rejected.
const cronAuth = (req, res, next) => {
  const providedKey = req.query.key || req.headers['x-cron-secret'];

  if (!process.env.CRON_SECRET) {
    return res.status(500).json({ message: 'CRON_SECRET is not configured on the server' });
  }

  if (!providedKey || providedKey !== process.env.CRON_SECRET) {
    return res.status(403).json({ message: 'Invalid or missing cron key' });
  }

  next();
};

module.exports = cronAuth;