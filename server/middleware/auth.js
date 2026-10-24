// ============================================================
//  VirtuLab Kenya — JWT Authentication & RBAC Middleware
// ============================================================

const jwt = require('jsonwebtoken');
const rbac = require('../config/rbac');

module.exports = (req, res, next) => {
  let token = null;

  // 1. Check HttpOnly cookie first (XSS-safe storage)
  if (req.cookies && req.cookies.vlk_token) {
    token = req.cookies.vlk_token;
  } else {
    // 2. Fall back to Authorization: Bearer <token> header (localStorage / mobile clients)
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, adminRole, permissions, name, email, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token. Please log in again.' });
  }
};

// ── Role-restricted guard ──────────────────────────────────────
module.exports.requireRole = function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(req.user.role)) {
      const roleStr = roles.join(' or ');
      return res.status(403).json({ error: `This action requires a ${roleStr} account.` });
    }
    next();
  };
};

// ── Granular Admin RBAC Permission guard ───────────────────────
module.exports.requireAdminPermission = function requireAdminPermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'This action requires an administrative account.' });
    }

    const adminRole = req.user.adminRole || 'admin';
    const permissions = req.user.permissions || [];

    if (rbac.hasPermission({ adminRole, permissions }, permission)) {
      return next();
    }

    const permMeta = rbac.PERMISSION_METADATA.find(p => p.id === permission);
    const permLabel = permMeta ? permMeta.label : permission;

    return res.status(403).json({
      success: false,
      error: `Access Denied: Your administrative role (${adminRole}) lacks the '${permLabel}' permission.`,
      requiredPermission: permission,
      currentRole: adminRole
    });
  };
};
