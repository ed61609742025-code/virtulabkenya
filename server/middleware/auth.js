// ============================================================
//  VirtuLab Kenya — JWT Authentication Middleware
//  Phase 1, Week 3
// ============================================================
//
// Reads the Authorization header, verifies the JWT, and attaches
// the decoded payload to req.user as { id, role, name, email }.
//
// Tokens are issued at login (see routes/auth.js) and carry a
// "role" field of either "student" or "teacher", since those
// live in separate database tables but share this one middleware.

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, name, email, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token. Please log in again.' });
  }
};

// ── Optional: role-restricted guard ────────────────────────────
// Use after the middleware above on routes that are teacher-only,
// student-only, or admin-only, e.g.:
//   router.get('/class', requireAuth, requireRole('teacher'), handler)
//   router.get('/admin', requireAuth, requireRole('admin'), handler)
//   router.get('/shared', requireAuth, requireRole(['teacher', 'admin']), handler)
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

