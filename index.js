// ============================================================
//  VirtuLab Kenya — Server Entry Point
//  Phase 1, Week 1: Basic server with health check
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static('../client'));

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
// const authRoutes = require('./routes/auth');
// app.use('/api/auth', authRoutes);

// Phase 2, Week 9: Sessions routes
// const sessionRoutes = require('./routes/sessions');
// app.use('/api/sessions', sessionRoutes);

// Phase 4, Week 25: Assignment routes
// const assignmentRoutes = require('./routes/assignments');
// app.use('/api/assignments', assignmentRoutes);

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

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
