const crypto = require('crypto');

const TOKEN_LIFETIME_MS = 30 * 60 * 1000; // 30 minutes

function generateContactToken(productId) {
  const expires = Date.now() + TOKEN_LIFETIME_MS;
  const hmac = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(`${productId}.${expires}`)
    .digest('hex');
  return `${expires}.${hmac}`;
}

function verifyContactToken(productId, token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;

  const [expiresStr, hmac] = token.split('.');
  const expires = Number(expiresStr);
  if (!expires || Date.now() > expires) return false;

  const expectedHmac = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(`${productId}.${expires}`)
    .digest('hex');

  const a = Buffer.from(hmac);
  const b = Buffer.from(expectedHmac);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { generateContactToken, verifyContactToken };