// ============================================================
//  VirtuLab Kenya — Server Entry Point
//  Phase 1, Week 1: Basic server with health check
// ============================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
const { enforceHttps, securityHeaders } = require('./middleware/security');
const { apiLimiter, getClientIp } = require('./middleware/rateLimiter');

app.use(enforceHttps);
app.use(securityHeaders);
app.use(compression());  // gzip/brotli — critical for slow connections

// Configure CORS
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = [
  'https://virtulab.co.ke',
  'https://virtulab-web.onrender.com',
  'https://virtulab.local',
  'http://virtulab.local',
  'https://appassets.androidplatform.net',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(',').forEach(s => {
    const clean = s.trim();
    if (clean && !allowedOrigins.includes(clean)) allowedOrigins.push(clean);
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile native HTTP clients, OkHttp, Postman, etc.)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      (origin.endsWith('.onrender.com') && origin.includes('virtulab')) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('http://192.168.') ||
      !isProd
    ) {
      return callback(null, true);
    }
    return callback(null, false); // Deny unauthorized origins safely
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(cookieParser());

// ── Server-Side Protected Route Guarding (CWE-306 Remediation) ──
const { protectedRouteGuard } = require('./middleware/routeGuard');
app.use(protectedRouteGuard);

// Allow up to 50mb strictly on AI exam assistant parse-paper endpoint for base64 scanned exam papers
app.use('/api/ai-assistant/parse-paper', express.json({ limit: '50mb' }));
// Standard 1mb payload limit across all general API routes with rawBody captured for HMAC webhook validation
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
const fs = require('fs');
const clientRoot = path.resolve(__dirname, '../client');

const htmlFileCache = new Map();

// Intercept all HTML requests to dynamically inject the per-request CSP cryptographic nonce
// into every <script> tag before serving, enabling strict CSP without 'unsafe-inline'
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  let reqPath = req.path;
  if (reqPath === '/') {
    reqPath = '/index.html';
  } else if (!reqPath.endsWith('.html')) {
    return next();
  }

  const targetFile = path.normalize(path.join(clientRoot, reqPath));
  if (!targetFile.startsWith(clientRoot)) {
    return res.status(403).send('Forbidden');
  }

  const sendWithNonce = (rawHtml) => {
    const nonce = res.locals && res.locals.cspNonce;
    const modifiedHtml = nonce
      ? rawHtml.replace(/<script\b(?![^>]*\bnonce=)([^>]*)>/gi, (match, attrs) => `<script nonce="${nonce}"${attrs}>`)
      : rawHtml;

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.send(modifiedHtml);
  };

  if (isProd && htmlFileCache.has(targetFile)) {
    return sendWithNonce(htmlFileCache.get(targetFile));
  }

  fs.readFile(targetFile, 'utf8', (err, html) => {
    if (err) {
      if (err.code === 'ENOENT') return next();
      return next(err);
    }
    if (isProd) {
      htmlFileCache.set(targetFile, html);
    }
    return sendWithNonce(html);
  });
});

app.use(express.static(path.join(__dirname, '../client'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('sw.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.match(/\.(woff2?|ttf|eot|svg|png|jpe?g|gif|webp|ico)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Cache-Tag', 'virtulab-static, virtulab-assets');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
      res.setHeader('Cache-Tag', 'virtulab-static, virtulab-code');
    }
  }
}));

// Apply general API rate limiter to all /api/ routes
app.use('/api/', apiLimiter);

// ── Crawlability & SEO Routes ─────────────────────────────────
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, '../client/robots.txt'));
});

// ── Favicon Route ─────────────────────────────────────────────
app.get('/favicon.ico', (req, res) => {
  res.type('image/x-icon');
  res.sendFile(path.join(__dirname, '../client/favicon.ico'));
});

// ── Lightweight Health & Ping Routes (Zero DB Overhead for Heartbeats) ──
app.get(['/healthz', '/ping'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.type('text/plain').status(200).send('OK');
});

// ── Health Check ──────────────────────────────────────────────
// Health check endpoint — verifies server liveness and database connectivity
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const pool = require('./db/pool');
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'disconnected';
  }

  res.json({
    status: 'ok',
    db: dbStatus,
    project: 'VirtuLab Kenya',
    version: '1.0.0',
    message: 'Server is running. Welcome to VirtuLab Kenya.',
    timestamp: new Date().toISOString()
  });
});

// ── Cloudflare Edge CDN & PoP Latency Diagnostics ────────────
app.get('/api/edge/status', (req, res) => {
  const cfRay = req.headers['cf-ray'] || null;
  const cfCountry = req.headers['cf-ipcountry'] || null;
  const cfConnectingIp = req.headers['cf-connecting-ip'] || null;
  const clientIp = getClientIp(req);

  // Extract Cloudflare Edge PoP 3-letter IATA airport code (e.g. NBO = Nairobi, MBA = Mombasa)
  let edgePop = null;
  if (cfRay && cfRay.includes('-')) {
    edgePop = cfRay.split('-')[1].toUpperCase();
  }

  const isProxied = Boolean(cfRay || cfConnectingIp);
  const isKenyaEdge = edgePop === 'NBO' || edgePop === 'MBA' || cfCountry === 'KE';

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({
    success: true,
    edge: {
      isProxied,
      edgePop,
      popLocation: edgePop === 'NBO' ? 'Nairobi, Kenya (KIXP)' : (edgePop === 'MBA' ? 'Mombasa, Kenya' : (edgePop ? `${edgePop} Edge` : 'Direct Origin')),
      country: cfCountry || 'Unknown',
      isKenyaEdge,
      clientIpMasked: clientIp ? clientIp.replace(/\.\d+$/, '.xxx') : 'unknown',
      protocol: req.protocol,
      httpVersion: req.httpVersion,
      recommendedEdgeTtlDays: 30
    },
    origin: {
      platform: 'Render PaaS',
      region: process.env.RENDER_REGION || 'frankfurt',
      status: 'operational',
      timestamp: new Date().toISOString()
    }
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

// Web Push Notification routes (PWA Push API & VAPID)
const pushRoutes = require('./routes/push');
app.use('/api/push', pushRoutes);

// AI Teacher Exam Assistant routes (multimodal paper parsing, idea generation & refinement)
const aiAssistantRoutes = require('./routes/ai_assistant');
app.use('/api/ai-assistant', aiAssistantRoutes);

// Written questions for unsimulated exam questions (paper chromatography, electrolysis, food tests, etc.)
const writtenQuestionsRoutes = require('./routes/written_questions');
app.use('/api/written-questions', writtenQuestionsRoutes);

// Announcements routes (public announcements, banner alerts)
const announcementRoutes = require('./routes/announcements');
app.use('/api/announcements', announcementRoutes);

// Subscription & Paystack Payment routes (KCSE passes & school licenses)
const subscriptionRoutes = require('./routes/subscriptions');
app.use('/api/subscriptions', subscriptionRoutes);

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

  (async () => {
    try {
      await runMigrationsAsync();
    } catch (err) {
      console.warn('[Boot Migrate] Note:', err.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
      const localIp = getLocalIp();
      console.log(`VirtuLab Kenya server running on port ${PORT}`);
      console.log(`Local Access:   http://localhost:${PORT}`);
      console.log(`Mobile Access:  http://${localIp}:${PORT}/student/home.html`);
      console.log(`Health Check:   http://localhost:${PORT}/api/health`);
      console.log(`Heartbeat Ping: http://localhost:${PORT}/healthz`);

      // Initialize background keep-alive heartbeat if on Render or in production
      try {
        const { startKeepAlive } = require('./utils/keepAlive');
        startKeepAlive();
      } catch (err) {
        console.warn('[KeepAlive] Note:', err.message);
      }
    });
  })();
}

// Process-level unhandled rejection & exception handlers for diagnostic stability
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process Error] Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

// Dispatches fatal process alerts to monitoring webhook if configured
async function dispatchCrashAlert(type, error) {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const payload = {
      text: `🚨 *VirtuLab Kenya [CRITICAL]*: ${type} at ${new Date().toISOString()}\n` +
            `*Error*: ${error?.message || error}\n` +
            `*PID*: ${process.pid} | *Node*: ${process.version} | *Memory*: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB\n` +
            ```${error?.stack ? error.stack.slice(0, 1000) : 'No stack trace'}```
    };
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (alertErr) {
    console.error('[Crash Alert Failed]:', alertErr.message);
  }
}

process.on('uncaughtException', async (err) => {
  console.error('[Process Error] Uncaught Exception thrown:', {
    timestamp: new Date().toISOString(),
    pid: process.pid,
    error: err?.message,
    stack: err?.stack
  });

  // Attempt alerting before graceful exit
  try {
    await dispatchCrashAlert('Uncaught Exception', err);
  } catch (_) {}

  // Allow pending I/O to flush before exiting
  setTimeout(() => process.exit(1), 1000).unref();
});

module.exports = app;
