// ============================================================
//  VirtuLab Kenya — Keep-Alive Heartbeat Engine
//  Prevents Render.com free instances from spinning down after 15m
// ============================================================

const https = require('https');
const http = require('http');

function startKeepAlive() {
  const isProd = process.env.NODE_ENV === 'production';
  const isRender = !!process.env.RENDER;
  const isExplicit = process.env.ENABLE_KEEP_ALIVE === 'true';

  // Only run in production, on Render, or when explicitly enabled
  if (!isProd && !isRender && !isExplicit) {
    return;
  }

  const baseUrl = process.env.RENDER_EXTERNAL_URL ||
                  process.env.SERVER_URL ||
                  'https://virtulab-web.onrender.com';

  const pingUrl = `${baseUrl.replace(/\/+$/, '')}/healthz`;
  const PING_INTERVAL_MS = 13 * 60 * 1000; // 13 minutes (Render free tier timeout is 15m)

  console.log(`[KeepAlive] Background heartbeat initialized for: ${pingUrl} (every 13 min)`);

  const doPing = () => {
    try {
      const client = pingUrl.startsWith('https') ? https : http;
      const req = client.get(pingUrl, { timeout: 15000 }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`[KeepAlive] Heartbeat ping successful (HTTP ${res.statusCode}) at ${new Date().toISOString()}`);
        } else {
          console.warn(`[KeepAlive] Heartbeat ping returned HTTP ${res.statusCode}`);
        }
        res.resume(); // Drain stream to prevent memory leak
      });

      req.on('timeout', () => {
        req.destroy();
        console.warn('[KeepAlive] Heartbeat ping timed out (15s limit reached)');
      });

      req.on('error', (err) => {
        console.warn('[KeepAlive] Heartbeat request warning:', err.message);
      });
    } catch (err) {
      console.warn('[KeepAlive] Error executing heartbeat ping:', err.message);
    }
  };

  // Schedule initial ping after 3 minutes, then repeat every 13 minutes
  const initialTimer = setTimeout(() => {
    doPing();
    const intervalTimer = setInterval(doPing, PING_INTERVAL_MS);
    if (intervalTimer.unref) intervalTimer.unref();
  }, 3 * 60 * 1000);

  if (initialTimer.unref) initialTimer.unref();
}

module.exports = { startKeepAlive };
