// ============================================================
//  VirtuLab Kenya — HTTPS Redirect & Security Headers
//  Feature #25: Helmet HTTP headers & HTTPS enforcement middleware
// ============================================================

const crypto = require('crypto');
const helmet = require('helmet');

// HTTPS Enforcer Middleware for Production deployments (e.g., Railway, Heroku)
function enforceHttps(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    // Standard x-forwarded-proto check from reverse proxies (Railway/Cloudflare)
    const proto = req.headers['x-forwarded-proto'];
    if (proto && proto !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
  }
  next();
}

// Configured Helmet security headers
const isProd = process.env.NODE_ENV === 'production';

// Dynamic cryptographic nonce policy:
// Eliminates 'unsafe-inline' from scriptSrc by generating a per-request cryptographically secure nonce
// (res.locals.cspNonce), which is dynamically injected into all <script> tags across HTML responses.
const helmetHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        (req, res) => `'nonce-${res.locals.cspNonce}'`,
        "https://cdnjs.cloudflare.com",
        "https://accounts.google.com"
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      styleSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https://lh3.googleusercontent.com"],
      connectSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://accounts.google.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      mediaSrc: ["'self'", "data:", "blob:"],
      workerSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: isProd ? [] : null
    }
  },
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
  crossOriginEmbedderPolicy: false
});

function securityHeaders(req, res, next) {
  if (!res.locals) res.locals = {};
  if (!res.locals.cspNonce) {
    res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  }
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  return helmetHeaders(req, res, next);
}

module.exports = {
  enforceHttps,
  securityHeaders
};
