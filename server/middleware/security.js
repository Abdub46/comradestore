const rateLimit = require('express-rate-limit');

// Applied to /api/auth/register and /api/auth/login.
// Brute-force protection: 10 attempts per 15 minutes per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
});

// Applied to /api/products/:id/contact, which has no login requirement
// (any visitor can call it) - so it needs its own abuse limit.
// 20 requests per 15 minutes per IP.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again shortly.' },
});

// General fallback limiter applied to all /api routes.
// 300 requests per 15 minutes per IP - generous for normal browsing, but
// blocks scripted flooding/scraping.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP. Please slow down.' },
});

module.exports = { authLimiter, contactLimiter, generalLimiter };
