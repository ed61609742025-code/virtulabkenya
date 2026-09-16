/**
 * VirtuLab Kenya — Offline Resilience & Low-Bandwidth Suite Tests
 * Tests for Category 4: Accessibility & Performance (Low-Bandwidth Lab Reality)
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Load client api.js exports
const apiModule = require('../../client/shared/api.js');
const { OfflineQueue, isOfflineQueueable, LOCAL_STORAGE_QUEUE_KEY, LEGACY_STORAGE_QUEUE_KEY } = apiModule;

describe('Offline Resilience & Low-Bandwidth Lab Tests', () => {

  describe('Queueable Endpoints Recognition', () => {
    it('should identify all 8 practical benches and research endpoints as offline queueable with POST/PUT', () => {
      const queueablePaths = [
        '/sessions',
        '/sessions/123',
        '/qualitative',
        '/organic',
        '/composite',
        '/solubility',
        '/energy',
        '/rates',
        '/gas',
        '/research/cpcat/submit',
        '/research/sus/submit',
        '/research/tam/submit'
      ];

      for (const p of queueablePaths) {
        assert.strictEqual(isOfflineQueueable(p, 'POST'), true, `POST ${p} should be queueable`);
        assert.strictEqual(isOfflineQueueable(p, 'PUT'), true, `PUT ${p} should be queueable`);
      }
    });

    it('should reject GET, DELETE, and non-queueable endpoints from offline queue', () => {
      assert.strictEqual(isOfflineQueueable('/sessions', 'GET'), false);
      assert.strictEqual(isOfflineQueueable('/composite', 'DELETE'), false);
      assert.strictEqual(isOfflineQueueable('/auth/login', 'POST'), false);
      assert.strictEqual(isOfflineQueueable('/auth/student/register', 'POST'), false);
      assert.strictEqual(isOfflineQueueable('/leaderboard/class', 'GET'), false);
      assert.strictEqual(isOfflineQueueable('/badges/mine', 'GET'), false);
    });
  });

  describe('OfflineQueue Storage & FIFO Lifecycle', () => {
    // In-memory mock localStorage
    let mockStorage = {};

    beforeEach(() => {
      mockStorage = {};
      global.localStorage = {
        getItem: (k) => mockStorage[k] || null,
        setItem: (k, v) => { mockStorage[k] = String(v); },
        removeItem: (k) => { delete mockStorage[k]; },
        clear: () => { mockStorage = {}; }
      };
      global.navigator = { onLine: true };
      global.window = {
        dispatchEvent: () => {},
        addEventListener: () => {}
      };
    });

    it('should enqueue submissions into localStorage with unique ID and timestamp', async () => {
      const samplePayload = {
        titrationKey: 'acidBase',
        studentAnswer: 0.102,
        correct: true
      };

      const item = await OfflineQueue.enqueue('/sessions', 'POST', samplePayload, 'test-jwt-token');

      assert.ok(item.id.startsWith('sub_'));
      assert.strictEqual(item.endpoint, '/sessions');
      assert.strictEqual(item.method, 'POST');
      assert.deepStrictEqual(item.body, samplePayload);
      assert.strictEqual(item.token, 'test-jwt-token');
      assert.ok(item.timestamp > 0);

      const count = await OfflineQueue.count();
      assert.strictEqual(count, 1);

      const items = await OfflineQueue.getAll();
      assert.strictEqual(items.length, 1);
      assert.strictEqual(items[0].id, item.id);
    });

    it('should merge items from primary and legacy exam draft queue keys in FIFO order', async () => {
      // Seed primary queue
      const item1 = {
        id: 'sub_item1',
        endpoint: '/qualitative',
        method: 'POST',
        body: { salt: 'ZnSO4' },
        timestamp: 1000
      };
      mockStorage[LOCAL_STORAGE_QUEUE_KEY] = JSON.stringify([item1]);

      // Seed legacy queue with older timestamp
      const itemLegacy = {
        id: 'sub_item0',
        url: '/composite',
        payload: { examKey: 'kcse2023' },
        queuedAt: new Date(500).toISOString()
      };
      mockStorage[LEGACY_STORAGE_QUEUE_KEY] = JSON.stringify([itemLegacy]);

      const all = await OfflineQueue.getAll();
      assert.strictEqual(all.length, 2);
      // FIFO: item0 (timestamp 500) must come before item1 (timestamp 1000)
      assert.strictEqual(all[0].id, 'sub_item0');
      assert.strictEqual(all[1].id, 'sub_item1');
    });

    it('should remove items by ID from both primary and legacy queues', async () => {
      const item1 = { id: 'sub_del1', endpoint: '/organic', method: 'POST', body: {}, timestamp: 100 };
      const item2 = { id: 'sub_keep2', endpoint: '/energy', method: 'POST', body: {}, timestamp: 200 };
      mockStorage[LOCAL_STORAGE_QUEUE_KEY] = JSON.stringify([item1, item2]);

      await OfflineQueue.remove('sub_del1');

      const remaining = await OfflineQueue.getAll();
      assert.strictEqual(remaining.length, 1);
      assert.strictEqual(remaining[0].id, 'sub_keep2');
    });

    it('should flush successful submissions and de-queue them', async () => {
      const item = {
        id: 'sub_flush1',
        endpoint: '/rates',
        method: 'POST',
        body: { reaction: 'thiosulphate_acid' },
        token: 'valid-token',
        timestamp: 100
      };
      mockStorage[LOCAL_STORAGE_QUEUE_KEY] = JSON.stringify([item]);

      // Mock global fetch to return 200 OK
      let fetchCalledWith = null;
      global.fetch = async (url, opts) => {
        fetchCalledWith = { url, opts };
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true })
        };
      };

      await OfflineQueue.flush();

      assert.ok(fetchCalledWith);
      assert.strictEqual(fetchCalledWith.url, '/api/rates');
      assert.strictEqual(fetchCalledWith.opts.headers.Authorization, 'Bearer valid-token');

      const count = await OfflineQueue.count();
      assert.strictEqual(count, 0, 'Successfully flushed item must be removed from queue');
    });

    it('should PRESERVE submissions in queue if auth token is expired (401/403)', async () => {
      const item = {
        id: 'sub_candidate_exam_work',
        endpoint: '/composite',
        method: 'POST',
        body: { q1Score: 14.5, q2Score: 15.0, q3Score: 10.0 },
        token: 'expired-token',
        timestamp: 100
      };
      mockStorage[LOCAL_STORAGE_QUEUE_KEY] = JSON.stringify([item]);

      // Mock fetch returning 401 Unauthorized
      global.fetch = async () => ({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Token expired' })
      });

      await OfflineQueue.flush();

      const count = await OfflineQueue.count();
      assert.strictEqual(count, 1, 'Student exam work MUST NEVER be deleted when token is expired');
      const all = await OfflineQueue.getAll();
      assert.strictEqual(all[0].id, 'sub_candidate_exam_work');
    });

    it('should halt flushing and retain queue when network fetch throws error', async () => {
      const item = {
        id: 'sub_net_err',
        endpoint: '/gas',
        method: 'POST',
        body: { gas: 'O2' },
        timestamp: 100
      };
      mockStorage[LOCAL_STORAGE_QUEUE_KEY] = JSON.stringify([item]);

      // Mock fetch throwing network error
      global.fetch = async () => {
        throw new TypeError('Failed to fetch (offline)');
      };

      await OfflineQueue.flush();

      const count = await OfflineQueue.count();
      assert.strictEqual(count, 1, 'Queued item must be preserved on network error');
    });
  });

  describe('Service Worker Precache & Cache Integrity', () => {
    const swPath = path.resolve(__dirname, '../../client/sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');

    it('should use updated cache version virtulab-kenya-v110', () => {
      assert.match(swContent, /const CACHE_NAME = 'virtulab-kenya-v110';/);
    });

    it('should precache all 8 student benches, engines, and shared cores', () => {
      const requiredAssets = [
        '/student/lab.html',
        '/student/qualitative.html',
        '/student/organic.html',
        '/student/solubility.html',
        '/student/energy.html',
        '/student/rates.html',
        '/student/gas_prep.html',
        '/student/composite_exam.html',
        '/shared/qualitative-bench-core.js',
        '/shared/organic-bench-core.js',
        '/shared/rates-bench-core.js',
        '/shared/energy-bench-core.js',
        '/shared/solubility-bench-core.js',
        '/shared/gas-prep-bench-core.js',
        '/student/js/titration-workbench.js',
        '/student/js/qualitative-engine.js',
        '/student/js/organic-engine.js',
        '/student/js/solubility-engine.js',
        '/student/js/energy-engine.js',
        '/student/js/rates-engine.js',
        '/student/js/gas-prep-engine.js',
        '/student/js/composite-engine.js',
        '/student/js/exam-offline-manager.js',
        '/shared/api.js',
        '/shared/pwa-installer.js',
        '/shared/pwa-installer.css',
        '/student/css/mobile.css',
        '/teacher/js/ai-exam-assistant.js',
        'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
      ];

      for (const asset of requiredAssets) {
        assert.ok(swContent.includes(asset), `Service worker must precache ${asset}`);
      }
    });

    it('should handle cross-origin CDN Chart.js cache serving during fetch', () => {
      assert.ok(swContent.includes('cdnjs.cloudflare.com'), 'sw.js must explicitly handle Chart.js CDN in fetch');
      assert.ok(swContent.includes('caches.match(event.request)'), 'sw.js must match cached cross-origin assets');
    });
  });

});
