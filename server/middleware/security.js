// ============================================================
//  VirtuLab Kenya — HTTPS Redirect & Security Headers
//  Feature #25: Helmet HTTP headers & HTTPS enforcement middleware
// ============================================================

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

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      styleSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      mediaSrc: ["'self'", "data:", "blob:"],
      workerSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: isProd ? [] : null
    }
  },
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
  crossOriginEmbedderPolicy: false
});

module.exports = {
  enforceHttps,
  securityHeaders
};
