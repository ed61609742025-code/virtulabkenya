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
const securityHeaders = helmet({
  contentSecurityPolicy: false, // Disabled for inline lab SVG & canvas scripts compatibility
  crossOriginEmbedderPolicy: false
});

module.exports = {
  enforceHttps,
  securityHeaders
};
