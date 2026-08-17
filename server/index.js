// ============================================================
//  VirtuLab Kenya — Server Entry Point
//  Phase 1, Week 1: Basic server with health check
// ============================================================

<<<<<<< HEAD
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
=======
require('dotenv').config();
const express = require('express');
const cors = require('cors');
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
<<<<<<< HEAD
const { enforceHttps, securityHeaders } = require('./middleware/security');
app.use(enforceHttps);
app.use(securityHeaders);
app.use(compression());  // gzip/brotli — critical for slow connections
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
=======
app.use(cors());
app.use(express.json());
app.use(express.static('../client'));
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8

// ── Health Check ──────────────────────────────────────────────
// This is the first endpoint — visit it to confirm the server is live
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'VirtuLab Kenya',
    version: '1.0.0',
    message: 'Server is running. Welcome to VirtuLab Kenya.',
    timestamp: new Date().toISOString()
  });
});

// ── Routes (added phase by phase) ────────────────────────────
// Phase 1, Week 3: Authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Phase 2, Week 9: Sessions routes
const sessionRoutes = require('./routes/sessions');
app.use('/api/sessions', sessionRoutes);

// Phase 4, Week 25: Assignment routes
const assignmentRoutes = require('./routes/assignments');
app.use('/api/assignments', assignmentRoutes);

// Gamification: badges (computed live from session history)
const badgeRoutes = require('./routes/badges');
app.use('/api/badges', badgeRoutes);

// Gamification: leaderboard (accuracy-ranked, class-scoped)
const leaderboardRoutes = require('./routes/leaderboard');
app.use('/api/leaderboard', leaderboardRoutes);

// Teacher's linked students (dashboard listing, password resets)
const studentRoutes = require('./routes/students');
app.use('/api/students', studentRoutes);

// Dashboard analytics (aggregated trend data for charts)
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

// AI-generated personalized feedback on incorrect answers
const feedbackRoutes = require('./routes/feedback');
app.use('/api/feedback', feedbackRoutes);

<<<<<<< HEAD
// Qualitative analysis sessions
const qualitativeRoutes = require('./routes/qualitative');
app.use('/api/qualitative', qualitativeRoutes);

// Organic chemistry analysis sessions (Feature #20)
const organicRoutes = require('./routes/organic');
app.use('/api/organic', organicRoutes);

// KCSE Composite practical exams (40 Marks total)
const compositeRoutes = require('./routes/composite_exams');
app.use('/api/composite', compositeRoutes);

// KCSE Solubility Curves & Crystallization Module
const solubilityRoutes = require('./routes/solubility');
app.use('/api/solubility', solubilityRoutes);

// KCSE Thermochemistry & Energy Changes Module
const energyRoutes = require('./routes/energy');
app.use('/api/energy', energyRoutes);

// KCSE Reaction Rates & Chemical Kinetics Module
const ratesRoutes = require('./routes/rates');
app.use('/api/rates', ratesRoutes);

// Admin portal routes (System Administration & Analytics)
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Error logging & telemetry routes
const errorRoutes = require('./routes/errors');
app.use('/api/errors', errorRoutes);

// Student notifications & assignment reminders
const notificationsRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationsRoutes);

// Public announcements endpoint
const announcementRepo = require('./repositories/announcementRepo');
app.get('/api/announcements/active', async (req, res) => {
  try {
    const announcements = await announcementRepo.getActiveAnnouncements('all');
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch announcements' });
  }
});

=======
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8
// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

<<<<<<< HEAD
// ── Error Tracker Handler ──────────────────────────────────────
const { errorMiddleware } = require('./middleware/errorTracker');
app.use(errorMiddleware);

// ── Start ─────────────────────────────────────────────────────
if (require.main === module) {
  const { runMigrationsAsync } = require('./db/migrate');
  runMigrationsAsync().catch(err => console.warn('[Boot Migrate] Note:', err.message));

  const os = require('os');
  function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return 'localhost';
  }

  app.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIp();
    console.log(`VirtuLab Kenya server running on port ${PORT}`);
    console.log(`Local Access:   http://localhost:${PORT}`);
    console.log(`Mobile Access:  http://${localIp}:${PORT}/student/home.html`);
    console.log(`Health Check:   http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
=======
// ── Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`VirtuLab Kenya server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
>>>>>>> 74e471700462c14fcb25509826ece705e831d8d8
