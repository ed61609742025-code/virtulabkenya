// ============================================================
//  VirtuLab Kenya — Server-Side Protected Route Guarding
//  CWE-306 / OWASP A01:2021 — Broken Access Control Remediation
// ============================================================

const path = require('path');
const jwt = require('jsonwebtoken');

/**
 * Express middleware that intercepts navigation requests to protected
 * student, teacher, and admin HTML pages before express.static serves them.
 *
 * Unauthenticated requests are redirected with HTTP 302 to the appropriate login page.
 * Authenticated requests with valid tokens and matching roles proceed via next().
 * Non-HTML static assets (.css, .js, .png, .svg, etc.) bypass the guard to preserve
 * PWA precaching, asset loading, and offline functionality.
 */
function protectedRouteGuard(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }

  const p = req.path.toLowerCase();

  // Root portal directory shortcuts
  if (p === '/student' || p === '/student/') {
    return res.redirect(302, '/student/home.html');
  }
  if (p === '/teacher' || p === '/teacher/') {
    return res.redirect(302, '/teacher/dashboard.html');
  }
  if (p === '/admin' || p === '/admin/') {
    return res.redirect(302, '/admin/dashboard.html');
  }

  const isStudentPortal = p.startsWith('/student/');
  const isTeacherPortal = p.startsWith('/teacher/');
  const isAdminPortal = p.startsWith('/admin/');

  if (!isStudentPortal && !isTeacherPortal && !isAdminPortal) {
    return next();
  }

  // Only protect HTML document templates and extensionless paths
  const ext = path.extname(p);
  const isHtmlDoc = ext === '.html' || !ext;

  if (!isHtmlDoc) {
    return next();
  }

  // Allow public authentication and registration entrypoints
  if (
    p.includes('/login.html') ||
    p.includes('/register.html') ||
    p.endsWith('/login') ||
    p.endsWith('/register')
  ) {
    return next();
  }

  // Read token from HttpOnly cookie first (XSS-safe), then Bearer Authorization header
  let token = null;
  if (req.cookies && req.cookies.vlk_token) {
    token = req.cookies.vlk_token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  const returnUrl = encodeURIComponent(req.originalUrl || req.url);
  const targetLogin = (isTeacherPortal || isAdminPortal) ? '/teacher/login.html' : '/student/login.html';

  if (!token) {
    return res.redirect(302, `${targetLogin}?returnUrl=${returnUrl}`);
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.warn('[RouteGuard] Warning: JWT_SECRET not configured');
      return res.redirect(302, `${targetLogin}?returnUrl=${returnUrl}`);
    }
    const decoded = jwt.verify(token, secret);
    req.user = decoded;

    // Enforce role authorization
    if (isAdminPortal && decoded.role !== 'admin') {
      return res.redirect(302, `${targetLogin}?mismatch=admin&returnUrl=${returnUrl}`);
    }
    if (isTeacherPortal && decoded.role !== 'teacher' && decoded.role !== 'admin') {
      return res.redirect(302, `${targetLogin}?mismatch=teacher&returnUrl=${returnUrl}`);
    }
    if (isStudentPortal && decoded.role !== 'student' && decoded.role !== 'admin') {
      return res.redirect(302, `${targetLogin}?mismatch=student&returnUrl=${returnUrl}`);
    }

    next();
  } catch (err) {
    return res.redirect(302, `${targetLogin}?expired=1&returnUrl=${returnUrl}`);
  }
}

module.exports = {
  protectedRouteGuard
};
