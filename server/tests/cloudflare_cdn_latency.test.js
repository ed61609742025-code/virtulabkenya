// ============================================================
//  VirtuLab Kenya — Cloudflare CDN & Kenya Low-Latency Test Suite
//  Option 3: Nairobi (NBO) / Mombasa (MBA) Production Setup
// ============================================================

process.env.NODE_ENV = 'test';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');

const app = require('../index');
const { getClientIp } = require('../middleware/rateLimiter');

let server;
let port = 0;

function url(path) {
  return `http://127.0.0.1:${port}${path}`;
}

describe('VirtuLab Kenya — Cloudflare CDN & Kenya Low-Latency Production Suite', () => {

  before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // ─────────────────────────────────────────────────────────────
  //  1. Client IP Extraction with Cloudflare Headers
  // ─────────────────────────────────────────────────────────────
  describe('1. Client IP Extraction & Cloudflare Reverse Proxy Priority', () => {

    it('should prioritize CF-Connecting-IP over all other IP headers', () => {
      const mockReq = {
        headers: {
          'cf-connecting-ip': '197.237.100.5', // Safaricom Kenya IP
          'true-client-ip': '102.219.208.1',
          'x-forwarded-for': '10.0.0.1, 10.0.0.2'
        },
        ip: '172.64.0.1' // Cloudflare egress proxy IP
      };

      const ip = getClientIp(mockReq);
      assert.strictEqual(ip, '197.237.100.5');
    });

    it('should prioritize True-Client-IP when CF-Connecting-IP is absent', () => {
      const mockReq = {
        headers: {
          'true-client-ip': '102.219.208.1', // Airtel Kenya IP
          'x-forwarded-for': '10.0.0.1, 10.0.0.2'
        },
        ip: '172.64.0.1'
      };

      const ip = getClientIp(mockReq);
      assert.strictEqual(ip, '102.219.208.1');
    });

    it('should extract leftmost IP from X-Forwarded-For list when Cloudflare headers are absent', () => {
      const mockReq = {
        headers: {
          'x-forwarded-for': '196.201.214.2, 172.64.0.1' // Telkom Kenya IP + proxy
        },
        ip: '172.64.0.1'
      };

      const ip = getClientIp(mockReq);
      assert.strictEqual(ip, '196.201.214.2');
    });

    it('should safely fall back to req.ip when no proxy headers are present', () => {
      const mockReq = {
        headers: {},
        ip: '41.90.64.1'
      };

      const ip = getClientIp(mockReq);
      assert.strictEqual(ip, '41.90.64.1');
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  2. Cloudflare Edge PoP Diagnostics Endpoint (/api/edge/status)
  // ─────────────────────────────────────────────────────────────
  describe('2. Edge Status & PoP Diagnostics Endpoint (/api/edge/status)', () => {

    it('should recognize Nairobi edge PoP (NBO / KIXP) with genuine Safaricom client IP', async () => {
      const res = await fetch(url('/api/edge/status'), {
        headers: {
          'CF-Ray': '8d7543a123-NBO',
          'CF-IPCountry': 'KE',
          'CF-Connecting-IP': '197.237.100.5'
        }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('cache-control'), 'no-cache, no-store, must-revalidate');

      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.edge.isProxied, true);
      assert.strictEqual(data.edge.edgePop, 'NBO');
      assert.strictEqual(data.edge.popLocation, 'Nairobi, Kenya (KIXP)');
      assert.strictEqual(data.edge.country, 'KE');
      assert.strictEqual(data.edge.isKenyaEdge, true);
      assert.strictEqual(data.edge.clientIpMasked, '197.237.100.xxx');
      assert.strictEqual(data.edge.recommendedEdgeTtlDays, 30);
      assert.strictEqual(data.origin.platform, 'Render PaaS');
      assert.strictEqual(data.origin.status, 'operational');
    });

    it('should recognize Mombasa edge PoP (MBA) submarine cable landing station', async () => {
      const res = await fetch(url('/api/edge/status'), {
        headers: {
          'CF-Ray': '8d7543a999-MBA',
          'CF-IPCountry': 'KE',
          'CF-Connecting-IP': '102.219.208.1'
        }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.edge.edgePop, 'MBA');
      assert.strictEqual(data.edge.popLocation, 'Mombasa, Kenya');
      assert.strictEqual(data.edge.isKenyaEdge, true);
      assert.strictEqual(data.edge.clientIpMasked, '102.219.208.xxx');
    });

    it('should gracefully handle direct non-proxied requests with clear status', async () => {
      const res = await fetch(url('/api/edge/status'));
      assert.strictEqual(res.status, 200);

      const data = await res.json();
      assert.strictEqual(data.edge.isProxied, false);
      assert.strictEqual(data.edge.edgePop, null);
      assert.strictEqual(data.edge.popLocation, 'Direct Origin');
      assert.strictEqual(data.edge.isKenyaEdge, false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  3. Edge Caching & Cache-Tag Headers for Cloudflare Purge
  // ─────────────────────────────────────────────────────────────
  describe('3. Static Asset Caching & Cloudflare Cache-Tag Headers', () => {

    it('should serve media and icons with 1-year immutable caching and virtulab-assets Cache-Tag', async () => {
      const res = await fetch(url('/favicon.ico'));
      assert.strictEqual(res.status, 200);

      // Verify static asset headers
      const resIcon = await fetch(url('/shared/logo-192.png'));
      if (resIcon.status === 200) {
        assert.ok(resIcon.headers.get('cache-control').includes('max-age=31536000'));
        assert.ok(resIcon.headers.get('cache-control').includes('immutable'));
        assert.strictEqual(resIcon.headers.get('cache-tag'), 'virtulab-static, virtulab-assets');
      }
    });

    it('should serve JS/CSS with 7-day edge cache, stale-while-revalidate, and virtulab-code Cache-Tag', async () => {
      const res = await fetch(url('/shared/style.css'));
      assert.strictEqual(res.status, 200);

      const cc = res.headers.get('cache-control');
      assert.ok(cc.includes('max-age=604800'), 'Should have 7-day max-age');
      assert.ok(cc.includes('stale-while-revalidate=86400'), 'Should allow 1-day stale-while-revalidate');
      assert.strictEqual(res.headers.get('cache-tag'), 'virtulab-static, virtulab-code');
    });

    it('should strictly bypass edge cache on Service Worker (/sw.js) to guarantee fresh PWA versions', async () => {
      const res = await fetch(url('/sw.js'));
      assert.strictEqual(res.status, 200);

      const cc = res.headers.get('cache-control');
      assert.strictEqual(cc, 'no-cache, no-store, must-revalidate');
      assert.strictEqual(res.headers.get('pragma'), 'no-cache');
      assert.strictEqual(res.headers.get('expires'), '0');
    });

    it('should strictly bypass edge cache on dynamic HTML and inject per-request CSP nonce', async () => {
      const res = await fetch(url('/student/login.html'));
      assert.strictEqual(res.status, 200);

      const cc = res.headers.get('cache-control');
      assert.strictEqual(cc, 'no-cache, no-store, must-revalidate');

      const html = await res.text();
      assert.ok(html.includes('<script nonce='), 'HTML must contain dynamically injected CSP nonce');
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  4. Compression Negotiation & Vary Headers (Brotli / Gzip)
  // ─────────────────────────────────────────────────────────────
  describe('4. Compression Negotiation (Brotli & Gzip)', () => {

    it('should negotiate compression and emit Vary: Accept-Encoding header', async () => {
      const res = await fetch(url('/shared/style.css'), {
        headers: { 'Accept-Encoding': 'gzip, deflate, br' }
      });

      assert.strictEqual(res.status, 200);
      const vary = res.headers.get('vary');
      assert.ok(vary && vary.toLowerCase().includes('accept-encoding'), 'Must send Vary: Accept-Encoding');
    });

    it('should compress JSON API responses to minimize mobile cellular data consumption in Kenya', async () => {
      const res = await fetch(url('/api/edge/status'), {
        headers: { 'Accept-Encoding': 'gzip, deflate, br' }
      });

      assert.strictEqual(res.status, 200);
      assert.ok(res.headers.get('vary').toLowerCase().includes('accept-encoding'));
    });
  });
});
