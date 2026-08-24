// ============================================================
//  VirtuLab Kenya — Rate Limiting Middleware
//  Feature #23: Rate Limiting to prevent brute-force attacks
// ============================================================

const rateLimit = require('express-rate-limit');

// Strict rate limiter for Auth endpoints (login, register, password change)
// Limits each IP to 100 auth requests per 15 minutes window
const authLimiter = process.env.NODE_ENV === 'test'
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        const ip = req.ip || (req.socket && req.socket.remoteAddress) || '';
        return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
      },
      message: { error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.' }
    });

// General API rate limiter for standard endpoints
// In Kenyan schools and lab environments, dozens of student workstations share a single
// public NAT / sub-county router IP. High ceiling accommodates multi-module dashboard loading.
const apiLimiter = process.env.NODE_ENV === 'test'
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5000,
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        const ip = req.ip || (req.socket && req.socket.remoteAddress) || '';
        return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
      },
      message: { error: 'Too many requests from this IP. Please slow down and try again later.' }
    });

module.exports = {
  authLimiter,
  apiLimiter
};
