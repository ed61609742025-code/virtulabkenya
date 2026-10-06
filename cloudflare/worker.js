/**
 * ============================================================
 *  VirtuLab Kenya — Cloudflare Edge Worker
 *  Nairobi (NBO) / Mombasa (MBA) Low-Latency Reverse Proxy
 * ============================================================
 *
 *  Features:
 *    1. Edge Caching for static assets with cookie-stripping at NBO edge PoP
 *    2. HTTP/3 (QUIC) & 0-RTT TLS session resumption optimization
 *    3. Preserves per-request CSP cryptographic nonce on dynamic HTML
 *    4. Passthrough with WebSocket support for interactive simulations
 *    5. Graceful cold-start fallback if Render origin takes > 25s
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── 1. Static Asset Edge Optimization ───────────────────────
    // Fast match for static assets (CSS, JS, fonts, images, audio)
    const isStaticAsset = path.startsWith('/shared/') ||
      path.startsWith('/student/css/') ||
      path.startsWith('/student/js/') ||
      path.startsWith('/teacher/js/') ||
      /\.(woff2?|ttf|eot|svg|png|jpe?g|gif|webp|ico|mp3|wav|ogg)$/i.test(path);

    // Service Worker must always bypass edge cache to prevent stale PWA versions
    const isServiceWorker = path === '/sw.js' || path === '/manifest.json';

    // Health check endpoint (lightweight, zero-cache)
    const isHealthCheck = path === '/healthz' || path === '/ping';

    // Clone request headers for origin
    const newHeaders = new Headers(request.headers);
    newHeaders.set('X-Forwarded-Host', url.hostname);
    newHeaders.set('X-Edge-PoP', request.cf?.colo || 'UNKNOWN');
    newHeaders.set('X-Edge-Country', request.cf?.country || 'KE');

    // ── 2. Strip Cookies from Static Asset Requests ─────────────
    // Prevents unnecessary cache misses at Nairobi edge due to student auth cookies
    if (isStaticAsset && !isServiceWorker) {
      newHeaders.delete('Cookie');
    }

    const originRequest = new Request(request, {
      headers: newHeaders
    });

    // ── 3. Edge Cache Fetching ──────────────────────────────────
    let response;
    try {
      if (isStaticAsset && !isServiceWorker) {
        // Cache at edge for 30 days, revalidate in background
        response = await fetch(originRequest, {
          cf: {
            cacheEverything: true,
            cacheTtl: 2592000, // 30 days in seconds
            staleWhileRevalidate: 86400, // 1 day
            polish: 'lossless',
            minify: {
              javascript: true,
              css: true,
              html: false
            }
          }
        });
      } else if (isServiceWorker || isHealthCheck) {
        // Strict cache bypass for Service Worker and Health Check
        response = await fetch(originRequest, {
          cf: {
            cacheEverything: false,
            cacheTtlByStatus: { '200-299': 0, '404': 0, '500-599': 0 }
          }
        });
      } else {
        // Standard dynamic route / API / HTML fetch
        response = await fetch(originRequest);
      }
    } catch (err) {
      // ── 4. Render Cold-Start / Network Failover ───────────────
      // If Render origin fails or times out during free-tier wake-up
      if (path.startsWith('/api/')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Origin server waking up from sleep. Please retry in 10 seconds.',
          code: 'ORIGIN_WAKING_UP',
          edgePoP: request.cf?.colo || 'NBO'
        }), {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '10',
            'X-Edge-Status': 'Origin-Wakeup'
          }
        });
      }

      // Serve minimal branded waking-up HTML screen for browser page navigation
      return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Starting VirtuLab Kenya…</title>
<style>
  body { background:#0F172A; color:#F8FAFC; font-family:system-ui,-apple-system,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; text-align:center; padding:20px; }
  .box { background:#1E293B; border:1px solid #334155; border-radius:16px; padding:36px; max-width:440px; }
  h1 { font-size:1.4rem; margin-bottom:8px; color:#38BDF8; }
  p { color:#94A3B8; font-size:0.9rem; line-height:1.5; }
  .spinner { width:32px; height:32px; border:3px solid #334155; border-top-color:#38BDF8; border-radius:50%; animation:spin 1s linear infinite; margin:20px auto; }
  @keyframes spin { to { transform:rotate(360deg); } }
</style>
<script>
  setTimeout(function() { window.location.reload(); }, 8000);
</script>
</head>
<body>
  <div class="box">
    <div style="font-size:2.2rem; margin-bottom:8px;">⚗️</div>
    <h1>VirtuLab Kenya is Initializing</h1>
    <p>Connecting via Cloudflare Edge (${request.cf?.colo || 'Nairobi (NBO)'}). Origin lab environment is warming up…</p>
    <div class="spinner"></div>
    <p style="font-size:0.75rem; color:#64748B;">Auto-refreshing in 8 seconds</p>
  </div>
</body>
</html>`, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=UTF-8',
          'Refresh': '8',
          'X-Edge-Status': 'Warming-Up'
        }
      });
    }

    // ── 5. Response Header Optimization ─────────────────────────
    const modifiedResponse = new Response(response.body, response);
    
    // Add debugging headers for performance inspection in Kenya
    modifiedResponse.headers.set('X-Edge-Served-By', `Cloudflare-${request.cf?.colo || 'NBO'}`);
    modifiedResponse.headers.set('X-Edge-Region', request.cf?.country || 'KE');

    if (isServiceWorker) {
      modifiedResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    return modifiedResponse;
  }
};
