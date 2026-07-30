const redis = require('../config/redis');

const DEFAULT_TTL_SECONDS = 60; // product list pages
const PRODUCT_TTL_SECONDS = 300; // single product detail

async function cacheGet(key) {
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Redis GET error:', err.message);
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.error('Redis SET error:', err.message);
  }
}

async function cacheDel(...keys) {
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch (err) {
    console.error('Redis DEL error:', err.message);
  }
}

async function getProductsListVersion() {
  if (!redis) return 0;
  try {
    const v = await redis.get('products:list-version');
    return v ? Number(v) : 0;
  } catch (err) {
    console.error('Redis GET (version) error:', err.message);
    return 0;
  }
}

async function bumpProductsListVersion() {
  if (!redis) return;
  try {
    await redis.incr('products:list-version');
  } catch (err) {
    console.error('Redis INCR error:', err.message);
  }
}

module.exports = {
  cacheGet,
  cacheSet,
  cacheDel,
  getProductsListVersion,
  bumpProductsListVersion,
  DEFAULT_TTL_SECONDS,
  PRODUCT_TTL_SECONDS,
};