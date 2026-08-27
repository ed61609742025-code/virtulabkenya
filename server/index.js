// ============================================================
//  VirtuLab Kenya — Server Entry Point
//  Phase 1, Week 1: Basic server with health check
// ============================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
const { enforceHttps, securityHeaders } = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimiter');

app.use(enforceHttps);
app.use(securityHeaders);
app.use(compression());  // gzip/brotli — critical for slow connections

// Configure CORS
const corsOptions = process.env.CORS_ORIGIN
  ? { origin: process.env.CORS_ORIGIN.split(',').map(s => s.trim()), credentials: true }
  : { origin: true, credentials: true };
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('sw.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// Apply general API rate limiter to all /api/ routes
app.use('/api/', apiLimiter);

// ── Favicon Route ─────────────────────────────────────────────
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/shared/icon-192.png'));
});

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

// KCSE Gas Preparation & Collection Module (Paper 3 Inorganic Practical)
const gasRoutes = require('./routes/gas');
app.use('/api/gas', gasRoutes);

// Academic Research & Evaluation Suite (CPCAT Pre/Post, SUS, TAM & Statistics)
const researchRoutes = require('./routes/research');
app.use('/api/research', researchRoutes);

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
const asyncHandler = require('./utils/asyncHandler');
app.get('/api/announcements/active', asyncHandler(async (req, res) => {
  const announcements = await announcementRepo.getActiveAnnouncements('all');
  res.json({ success: true, announcements });
}));

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

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
