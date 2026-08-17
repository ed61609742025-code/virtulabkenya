// ============================================================
//  VirtuLab Kenya — Error Tracker & Monitoring System
//  Phase 5 / Feature #27: Centralized Production Error Tracking
// ============================================================
//
// Features:
// 1. In-memory rolling error log buffer (stores last 50 production errors)
// 2. Structured JSON error formatting with request context (method, url, user, timestamp)
// 3. Sentry SDK hook support (if SENTRY_DSN environment variable is provided)
// 4. Express middleware for automatic backend error capture

const fs = require('fs');
const path = require('path');

const MAX_BUFFER_SIZE = 50;
const errorBuffer = [];

// Optional Sentry Initialization
let sentryClient = null;
if (process.env.SENTRY_DSN) {
  try {
    const Sentry = require('@sentry/node');
    Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV || 'development' });
    sentryClient = Sentry;
    console.log('✅ Sentry Error Tracker initialized with DSN.');
  } catch (err) {
    console.warn('⚠️ Sentry DSN provided, but @sentry/node is not installed. Using internal error logger.');
  }
}

/**
 * Capture an error with context
 */
function captureError(err, req = null, extraContext = {}) {
  const errorEvent = {
    id: 'err_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    message: err.message || String(err),
    stack: err.stack || null,
    name: err.name || 'Error',
    url: req ? req.originalUrl || req.url : null,
    method: req ? req.method : null,
    ip: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null,
    user: req && req.user ? { id: req.user.id, role: req.user.role } : null,
    context: extraContext
  };

  // Add to internal rolling buffer
  errorBuffer.unshift(errorEvent);
  if (errorBuffer.length > MAX_BUFFER_SIZE) {
    errorBuffer.pop();
  }

  // Forward to Sentry if available
  if (sentryClient) {
    sentryClient.withScope(scope => {
      if (req) {
        scope.setTag('url', req.originalUrl || req.url);
        scope.setTag('method', req.method);
        if (req.user) scope.setUser({ id: req.user.id, role: req.user.role });
      }
      scope.setExtras(extraContext);
      sentryClient.captureException(err);
    });
  }

  return errorEvent;
}

/**
 * Express error handler middleware
 */
function errorMiddleware(err, req, res, next) {
  const errorEvent = captureError(err, req);
  console.error(`[ErrorTracker] [${errorEvent.timestamp}] ${req.method} ${req.url} — ${err.message}`);
  
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err.isOperational || statusCode < 500;

  res.status(statusCode).json({
    error: isOperational || process.env.NODE_ENV !== 'production'
      ? err.message
      : 'An unexpected error occurred. Our team has been notified.',
    code: err.code || (statusCode >= 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST'),
    eventId: errorEvent.id
  });
}

/**
 * Retrieve recent errors (for admin/monitoring endpoints)
 */
function getRecentErrors() {
  return [...errorBuffer];
}

module.exports = {
  captureError,
  errorMiddleware,
  getRecentErrors
};
