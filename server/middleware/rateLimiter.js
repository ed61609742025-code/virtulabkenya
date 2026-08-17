// ============================================================
//  VirtuLab Kenya — Rate Limiting Middleware
//  Feature #23: Rate Limiting to prevent brute-force attacks
// ============================================================

const rateLimit = require('express-rate-limit');

// Strict rate limiter for Auth endpoints (login, register, password change)
// Limits each IP to 15 auth requests per 15 minutes window
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.' }
});

// General API rate limiter for standard endpoints
// Limits each IP to 200 requests per 15 minutes window
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please slow down and try again later.' }
});

module.exports = {
  authLimiter,
  apiLimiter
};
