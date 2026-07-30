const Redis = require('ioredis');

// Caching is optional. If REDIS_URL isn't set (e.g. running locally without
// Redis installed), `redis` stays null and every cache helper in
// utils/cache.js quietly no-ops - the app just reads MongoDB directly on
// every request instead of crashing.
let redis = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 2,
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err.message);
  });

  redis.on('connect', () => {
    console.log('Redis connected - product cache-aside enabled');
  });
} else {
  console.log('REDIS_URL not set - caching disabled, reading directly from MongoDB');
}

module.exports = redis;