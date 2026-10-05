/**
 * VirtuLab Kenya — Priority 4: Low-Bandwidth & Offline PWA Stress-Testing Suite
 * 
 * Rigorously verifies resilience in low-connectivity Kenyan rural schools:
 * 1. High-volume concurrent offline submission queueing (100+ items).
 * 2. FIFO order preservation & idempotent deduplication.
 * 3. Network flake & partial packet loss recovery during background sync.
 * 4. Token expiration protection (zero data loss guarantee for candidate work).
 * 5. ExamDraftManager crash-recovery, debounce resilience & corruption recovery.
 * 6. Service worker precache integrity & 100% local asset coverage.
 * 7. Low-bandwidth payload budget & offline Canvas chart fallback resilience.
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const apiModule = require(path.join(rootDir, 'client/shared/api.js'));
const { OfflineQueue, isOfflineQueueable, LOCAL_STORAGE_QUEUE_KEY, LEGACY_STORAGE_QUEUE_KEY } = apiModule;
const ExamDraftManager = require(path.join(rootDir, 'client/student/js/exam-offline-manager.js'));

describe('Priority 4: Low-Bandwidth & Offline PWA Stress-Testing Suite', () => {

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
      addEventListener: () => {},
      location: { pathname: '/student/home.html' }
    };
  });

  // ────────────────────────────────────────────────────────────
  // 1. High-Volume Concurrent Queueing Stress Test
  // ────────────────────────────────────────────────────────────
  describe('1. High-Volume Concurrent Queueing Stress Test', () => {
    it('should enqueue 100 rapid concurrent practical submissions without data corruption or loss', async () => {
      const benches = [
        { endpoint: '/sessions', body: { practical: 'titration', titre: 21.40 } },
        { endpoint: '/qualitative', body: { practical: 'salt_analysis', cation: 'Zn2+' } },
        { endpoint: '/organic', body: { practical: 'organic', functional: 'alkene' } },
        { endpoint: '/composite', body: { practical: 'kcse2023', score: 38.5 } },
        { endpoint: '/solubility', body: { practical: 'solubility', temp: 45.0 } },
        { endpoint: '/energy', body: { practical: 'thermochemistry', deltaH: -57.2 } },
        { endpoint: '/rates', body: { practical: 'kinetics', rate: 0.045 } },
        { endpoint: '/gas', body: { practical: 'gas_prep', gas: 'SO2' } },
        { endpoint: '/research/cpcat/submit', body: { type: 'pre_test', score: 32 } },
        { endpoint: '/research/sus/submit', body: { score: 87.5 } }
      ];

      const promises = [];
      for (let i = 0; i < 100; i++) {
        const bench = benches[i % benches.length];
        promises.push(OfflineQueue.enqueue(bench.endpoint, 'POST', { ...bench.body, trial: i }, `token_${i}`));
      }

      const enqueuedItems = await Promise.all(promises);
      assert.strictEqual(enqueuedItems.length, 100, 'All 100 items must be successfully enqueued');

      const count = await OfflineQueue.count();
      assert.strictEqual(count, 100, 'Queue count must accurately report 100 items');

      const allItems = await OfflineQueue.getAll();
      assert.strictEqual(allItems.length, 100, 'Queue must retrieve exactly 100 items');

      // Verify all IDs are unique
      const idSet = new Set(allItems.map(it => it.id));
      assert.strictEqual(idSet.size, 100, 'All 100 queued items must possess unique IDs');

      // Verify FIFO ordering
      for (let i = 1; i < allItems.length; i++) {
        assert.ok(
          allItems[i].timestamp >= allItems[i - 1].timestamp,
          `FIFO ordering violated at index ${i}`
        );
      }
    });

    it('should deduplicate items if same item ID is presented in primary and legacy queues', async () => {
      const duplicateId = 'sub_dedup_test_999';
      const itemPrimary = {
        id: duplicateId,
        endpoint: '/composite',
        method: 'POST',
        body: { score: 35 },
        timestamp: 2000
      };
      const itemLegacy = {
        id: duplicateId,
        url: '/composite',
        payload: { score: 35 },
        queuedAt: new Date(1000).toISOString()
      };

      mockStorage[LOCAL_STORAGE_QUEUE_KEY] = JSON.stringify([itemPrimary]);
      mockStorage[LEGACY_STORAGE_QUEUE_KEY] = JSON.stringify([itemLegacy]);

      const merged = await OfflineQueue.getAll();
      assert.strictEqual(merged.length, 1, 'Duplicate ID must be collapsed into exactly 1 item');
      assert.strictEqual(merged[0].id, duplicateId);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 2. Network Intermittency & Partial Packet Loss Simulation
  // ────────────────────────────────────────────────────────────
  describe('2. Network Flake & Partial Packet Loss Sync Simulation', () => {
    it('should sync successful requests and strictly retain failed/dropped requests on flaky network', async () => {
      // Seed 6 queued submissions
      const items = [];
      for (let i = 0; i < 6; i++) {
        items.push({
          id: `sub_flaky_${i}`,
          endpoint: '/sessions',
          method: 'POST',
          body: { attempt: i },
          token: 'valid_token',
          timestamp: 1000 + i
        });
      }
      mockStorage[LOCAL_STORAGE_QUEUE_KEY] = JSON.stringify(items);

      let attemptsCount = 0;
      // Mock network: item 0 succeeds, item 1 succeeds, item 2 suffers network drop (TypeError)
      global.fetch = async (url, opts) => {
        attemptsCount++;
        const parsed = JSON.parse(opts.body);
        if (parsed.attempt < 2) {
          return { ok: true, status: 200, json: async () => ({ success: true }) };
        } else {
          // Packet loss / network drop mid-flight
          throw new TypeError('Failed to fetch (net::ERR_INTERNET_DISCONNECTED)');
        }
      };

      await OfflineQueue.flush();

      // Items 0 and 1 should have been flushed, items 2-5 retained
      const remaining = await OfflineQueue.getAll();
      assert.strictEqual(remaining.length, 4, 'Remaining queue must retain items 2, 3, 4, 5');
      assert.strictEqual(remaining[0].id, 'sub_flaky_2');
      assert.strictEqual(remaining[1].id, 'sub_flaky_3');
      assert.strictEqual(remaining[2].id, 'sub_flaky_4');
      assert.strictEqual(remaining[3].id, 'sub_flaky_5');
    });

    it('should never delete candidate exam work when receiving 401/403 expired token', async () => {
      const examWork = {
        id: 'sub_candidate_knec_exam',
        endpoint: '/composite',
        method: 'POST',
        body: { q1Titration: 14.5, q2Qualitative: 14.0, q3Thermochemistry: 9.5 },
        token: 'expired_jwt_from_morning_session',
        timestamp: 5000
      };
      mockStorage[LOCAL_STORAGE_QUEUE_KEY] = JSON.stringify([examWork]);

      global.fetch = async () => ({
        ok: false,
        status: 401,
        json: async () => ({ error: 'jwt expired' })
      });

      await OfflineQueue.flush();

      const count = await OfflineQueue.count();
      assert.strictEqual(count, 1, 'Critical candidate practical data must NEVER be lost on 401');
      const stored = await OfflineQueue.getAll();
      assert.strictEqual(stored[0].id, 'sub_candidate_knec_exam');
      assert.strictEqual(stored[0].body.q1Titration, 14.5);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 3. ExamDraftManager Crash Recovery & Debouncing Stress Test
  // ────────────────────────────────────────────────────────────
  describe('3. ExamDraftManager Crash Recovery & Debouncing Stress Test', () => {
    it('should debounced-save candidate input and immediately persist on demand', async () => {
      const examKey = 'kcse_2024_p3_candidate_42';
      
      // Rapid typing simulation (10 rapid changes in under 100ms)
      for (let i = 0; i < 10; i++) {
        ExamDraftManager.saveDraft(examKey, { buretteFinal: 21.0 + (i * 0.05), step: i });
      }

      // Immediate load before debounce timeout should still have previous or null
      // Now force immediate save
      ExamDraftManager.saveDraft(examKey, { buretteFinal: 21.45, step: 10, candidateNotes: 'Definitive reading' }, true);

      const restored = ExamDraftManager.loadDraft(examKey);
      assert.ok(restored, 'Draft must exist');
      assert.strictEqual(restored.data.buretteFinal, 21.45);
      assert.strictEqual(restored.data.candidateNotes, 'Definitive reading');
    });

    it('should safely recover from corrupted JSON in draft storage without throwing', () => {
      const examKey = 'corrupt_test_key';
      mockStorage[ExamDraftManager.getStorageKey(examKey)] = '{{INVALID_JSON_CORRUPTED_STRING...';

      const draft = ExamDraftManager.loadDraft(examKey);
      assert.strictEqual(draft, null, 'Corrupted draft must return null instead of throwing unhandled exception');
    });

    it('should accurately report hasDraft and clearDraft', () => {
      const examKey = 'clean_test_key';
      ExamDraftManager.saveDraft(examKey, { test: 123 }, true);
      assert.strictEqual(ExamDraftManager.hasDraft(examKey), true);

      ExamDraftManager.clearDraft(examKey);
      assert.strictEqual(ExamDraftManager.hasDraft(examKey), false);
      assert.strictEqual(ExamDraftManager.loadDraft(examKey), null);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 4. Service Worker Precache Integrity & 100% Asset Verification
  // ────────────────────────────────────────────────────────────
  describe('4. Service Worker Precache & Low-Bandwidth Asset Audit', () => {
    const swPath = path.join(rootDir, 'client/sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');

    it('should verify that all 114 precached assets exist on disk in client/', () => {
      const match = swContent.match(/const PRECACHE_ASSETS = \[([\s\S]*?)\];/);
      assert.ok(match, 'PRECACHE_ASSETS array must be defined in sw.js');
      
      const assets = eval('[' + match[1] + ']');
      assert.ok(assets.length >= 110, `Expected at least 110 precached assets, found ${assets.length}`);

      const missing = [];
      for (const a of assets) {
        if (a.startsWith('http://') || a.startsWith('https://')) continue;
        const localPath = a === '/' ? path.join(rootDir, 'client/index.html') : path.join(rootDir, 'client', a.replace(/^\//, ''));
        if (!fs.existsSync(localPath)) {
          missing.push(a);
        }
      }

      assert.deepStrictEqual(missing, [], 'All local precached assets must physically exist on disk');
    });

    it('should verify PWA manifest contains required offline standalone fields and icons', () => {
      const manifestPath = path.join(rootDir, 'client/manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      assert.strictEqual(manifest.display, 'standalone');
      assert.strictEqual(manifest.start_url, '/student/home.html');
      assert.strictEqual(manifest.scope, '/');
      assert.ok(Array.isArray(manifest.icons), 'Manifest must declare icons array');
      assert.ok(manifest.icons.length >= 3, 'Manifest must have at least 192, 512, and maskable icons');

      // Verify physical existence of declared icon files
      for (const icon of manifest.icons) {
        const iconPath = path.join(rootDir, 'client', icon.src.replace(/^\//, ''));
        assert.ok(fs.existsSync(iconPath), `Manifest icon ${icon.src} must exist on disk`);
      }
    });

    it('should verify all 8 chemistry laboratory workbenches are precached', () => {
      const requiredBenches = [
        '/student/lab.html',
        '/student/qualitative.html',
        '/student/organic.html',
        '/student/solubility.html',
        '/student/energy.html',
        '/student/rates.html',
        '/student/gas_prep.html',
        '/student/composite_exam.html'
      ];
      for (const b of requiredBenches) {
        assert.ok(swContent.includes(b), `sw.js must precache practical bench ${b}`);
      }
    });
  });

  // ────────────────────────────────────────────────────────────
  // 5. Offline Canvas Charting Fallback Stress Test
  // ────────────────────────────────────────────────────────────
  describe('5. Offline Native Canvas Fallback Stress Test', () => {
    it('should confirm native canvas chart rendering fallback functions exist in student-dashboard.js', () => {
      const dashJsPath = path.join(rootDir, 'client/student/js/student-dashboard.js');
      const content = fs.readFileSync(dashJsPath, 'utf8');

      // Verify native fallbacks
      assert.ok(content.includes('drawNativeLineChart'), 'Must provide drawNativeLineChart fallback');
      assert.ok(content.includes('drawNativeDoughnutChart'), 'Must provide drawNativeDoughnutChart fallback');
      assert.ok(content.includes('drawNativeBarChart'), 'Must provide drawNativeBarChart fallback');
    });

    it('should verify student-dashboard safely guards innerRadius and outerRadius against negative values', () => {
      const dashJsPath = path.join(rootDir, 'client/student/js/student-dashboard.js');
      const content = fs.readFileSync(dashJsPath, 'utf8');

      assert.ok(
        content.includes('const outerRadius = Math.max(25,'),
        'outerRadius must be clamped to minimum non-negative value (>= 25)'
      );
      assert.ok(
        content.includes('const innerRadius = Math.max(10,'),
        'innerRadius must be clamped to minimum non-negative value (>= 10)'
      );
      assert.ok(
        content.includes('if (outerRadius <= 0 || isNaN(outerRadius) || innerRadius <= 0 || innerRadius >= outerRadius) return;'),
        'Must guard against invalid/negative radius before arc drawing'
      );
    });
  });

});
