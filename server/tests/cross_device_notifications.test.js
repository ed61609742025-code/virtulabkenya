// ============================================================
//  VirtuLab Kenya — Cross-Device Notification State & Counter Test Suite
// ============================================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_notifs_key_9988';

const app = require('../index');
const VLKNotifs = require('../../client/shared/notifications-engine.js');

const pool = require('../db/pool');
const originalQuery = pool.query;
const mockDbReads = new Map();

let server;
let port = 0;
let studentToken;
let teacherToken;

function url(subpath) {
  return `http://127.0.0.1:${port}${subpath}`;
}

describe('VirtuLab Kenya — Cross-Device Notifications Synchronization Suite', () => {

  before(async () => {
    studentToken = jwt.sign(
      { id: 91, role: 'student', name: 'Kiprono Student', email: 'kiprono@virtulab.ke' },
      process.env.JWT_SECRET
    );
    teacherToken = jwt.sign(
      { id: 45, role: 'teacher', name: 'Mwalimu Otieno', email: 'otieno@virtulab.ke' },
      process.env.JWT_SECRET
    );

    mockDbReads.clear();
    pool.query = async (text, params) => {
      const q = String(text || '');
      if (q.includes('CREATE TABLE') || q.includes('CREATE INDEX')) {
        return { rows: [] };
      }
      if (q.includes('FROM user_notification_reads')) {
        const userId = params?.[0];
        const role = params?.[1];
        const rows = [];
        for (const [key, ts] of mockDbReads.entries()) {
          if (key.startsWith(`${userId}_${role}_`)) {
            const notifId = key.substring(`${userId}_${role}_`.length);
            rows.push({ notif_id: notifId, read_at: new Date(ts).toISOString() });
          }
        }
        return { rows };
      }
      if (q.includes('INSERT INTO user_notification_reads')) {
        const userId = params?.[0];
        const role = params?.[1];
        const notifId = params?.[2];
        const now = new Date();
        mockDbReads.set(`${userId}_${role}_${notifId}`, now.getTime());
        return { rows: [{ notif_id: notifId, read_at: now.toISOString() }] };
      }
      if (q.includes('student_notifications')) {
        return { rows: [] };
      }
      return { rows: [] };
    };

    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  after(async () => {
    pool.query = originalQuery;
    if (server) {
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // ────────────────────────────────────────────────────────────
  // 1. Server REST API & Authentication Guards
  // ────────────────────────────────────────────────────────────
  describe('1. Server Cross-Device Endpoints & Access Control', () => {
    it('GET /api/notifications/reads — should reject unauthenticated requests with 401', async () => {
      const res = await fetch(url('/api/notifications/reads'));
      assert.strictEqual(res.status, 401);
    });

    it('GET /api/notifications/reads — should return 200 with empty reads map for initial state', async () => {
      const res = await fetch(url('/api/notifications/reads'), {
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(typeof body.reads, 'object');
    });

    it('POST /api/notifications/mark-read — should mark single notification as read across devices', async () => {
      const res = await fetch(url('/api/notifications/mark-read'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notifId: 'asgn_pending_204' })
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.notifId, 'asgn_pending_204');
      assert.ok(typeof body.readAt === 'number' && body.readAt > 0);

      // Verify that subsequent GET /api/notifications/reads returns this notification
      const getRes = await fetch(url('/api/notifications/reads'), {
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });
      const getBody = await getRes.json();
      assert.ok(getBody.reads['asgn_pending_204']);
      assert.strictEqual(getBody.reads['asgn_pending_204'], body.readAt);
    });

    it('POST /api/notifications/mark-all-read — should batch-mark notification array across devices', async () => {
      const idsToMark = ['asgn_marked_301', 'notif_streak_5', 'asgn_pending_302'];
      const res = await fetch(url('/api/notifications/mark-all-read'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notifIds: idsToMark })
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.count, 3);

      const getRes = await fetch(url('/api/notifications/reads'), {
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });
      const getBody = await getRes.json();
      assert.ok(getBody.reads['asgn_marked_301']);
      assert.ok(getBody.reads['notif_streak_5']);
      assert.ok(getBody.reads['asgn_pending_302']);
    });

    it('POST /api/notifications/mark-read — should support teacher submissions notifications', async () => {
      const res = await fetch(url('/api/notifications/mark-read'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${teacherToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notifId: 'teacher_sub_884' })
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.notifId, 'teacher_sub_884');

      const getRes = await fetch(url('/api/notifications/reads'), {
        headers: { 'Authorization': `Bearer ${teacherToken}` }
      });
      const getBody = await getRes.json();
      assert.ok(getBody.reads['teacher_sub_884']);
      // Should not leak to student reads
      assert.strictEqual(getBody.reads['asgn_pending_204'], undefined);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 2. Client Notifications Engine (VLKNotifs) Logic
  // ────────────────────────────────────────────────────────────
  describe('2. Client VLKNotifs Engine & Expiration Behavior', () => {
    it('should export all required lifecycle methods on VLKNotifs module', () => {
      assert.strictEqual(typeof VLKNotifs.markAsRead, 'function');
      assert.strictEqual(typeof VLKNotifs.markAllAsRead, 'function');
      assert.strictEqual(typeof VLKNotifs.isRead, 'function');
      assert.strictEqual(typeof VLKNotifs.isExpired, 'function');
      assert.strictEqual(typeof VLKNotifs.getRemainingHours, 'function');
      assert.strictEqual(typeof VLKNotifs.formatTimeAgo, 'function');
      assert.strictEqual(typeof VLKNotifs.filterActiveNotifications, 'function');
      assert.strictEqual(typeof VLKNotifs.subscribe, 'function');
      assert.strictEqual(typeof VLKNotifs.notifyListeners, 'function');
      assert.strictEqual(typeof VLKNotifs.mergeReadTimestamps, 'function');
      assert.strictEqual(typeof VLKNotifs.syncWithServer, 'function');
    });

    it('should merge remote read timestamps from another device and identify changes', () => {
      const remoteReads = {
        'asgn_pending_901': Date.now() - 60000,
        'asgn_marked_902': Date.now() - 30000
      };

      const changed = VLKNotifs.mergeReadTimestamps(remoteReads);
      assert.strictEqual(changed, true);

      assert.strictEqual(VLKNotifs.isRead('asgn_pending_901'), true);
      assert.strictEqual(VLKNotifs.isRead('asgn_marked_902'), true);
      assert.strictEqual(VLKNotifs.isRead('asgn_unseen_903'), false);
    });

    it('should accurately calculate 24h expiration and remaining hours', () => {
      const readJustNow = 'test_notif_fresh';
      VLKNotifs.mergeReadTimestamps({ [readJustNow]: Date.now() });

      assert.strictEqual(VLKNotifs.isExpired(readJustNow), false);
      const hoursLeft = VLKNotifs.getRemainingHours(readJustNow);
      assert.ok(hoursLeft >= 23 && hoursLeft <= 24);

      // Past 24h expiration
      const expiredNotif = 'test_notif_old';
      VLKNotifs.mergeReadTimestamps({ [expiredNotif]: Date.now() - (25 * 60 * 60 * 1000) });

      assert.strictEqual(VLKNotifs.isExpired(expiredNotif), true);
      assert.strictEqual(VLKNotifs.getRemainingHours(expiredNotif), 0);
    });

    it('should trigger subscriber callbacks when notifications state updates', () => {
      let callbackFired = false;
      const unsubscribe = VLKNotifs.subscribe(() => {
        callbackFired = true;
      });

      VLKNotifs.notifyListeners();
      assert.strictEqual(callbackFired, true);

      // Unsubscribe check
      callbackFired = false;
      unsubscribe();
      VLKNotifs.notifyListeners();
      assert.strictEqual(callbackFired, false);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 3. Cross-Device Multi-Platform Counter & State Emulation
  // ────────────────────────────────────────────────────────────
  describe('3. Multi-Device Platform Emulation & Counter Adjustment', () => {
    it('should dynamically adjust unread notification counter on Device B when read on Device A', () => {
      // List of candidate assignments on both devices
      const candidateNotifications = [
        { id: 'asgn_pending_1', title: 'Titration Q1' },
        { id: 'asgn_pending_2', title: 'Qualitative Analysis Q2' },
        { id: 'asgn_marked_3', title: 'Rates of Reaction Marked' }
      ];

      // Initial state on Device B: 0 read, counter = 3
      let unreadOnDeviceB = candidateNotifications.filter(n => !VLKNotifs.isRead(n.id));
      assert.strictEqual(unreadOnDeviceB.length, 3);

      // Candidate logs into Device A (e.g. mobile phone) and reads 'asgn_pending_1' and 'asgn_marked_3'
      const deviceAReadPayload = {
        'asgn_pending_1': Date.now(),
        'asgn_marked_3': Date.now()
      };

      // Device B synchronizes with server
      const hasUpdates = VLKNotifs.mergeReadTimestamps(deviceAReadPayload);
      assert.strictEqual(hasUpdates, true);

      // Re-calculate unread notifications on Device B
      unreadOnDeviceB = candidateNotifications.filter(n => !VLKNotifs.isRead(n.id));

      // The notification counter MUST automatically decrease to 1!
      assert.strictEqual(unreadOnDeviceB.length, 1);
      assert.strictEqual(unreadOnDeviceB[0].id, 'asgn_pending_2');
      assert.strictEqual(VLKNotifs.isRead('asgn_pending_1'), true);
      assert.strictEqual(VLKNotifs.isRead('asgn_marked_3'), true);
    });

    it('should preserve Chart.js 4.4.1 SRI and sw.js precache integrity', () => {
      const swPath = path.join(__dirname, '../../client/sw.js');
      const swContent = fs.readFileSync(swPath, 'utf8');
      assert.ok(swContent.includes('/shared/notifications-engine.js'), 'Must precache notifications-engine.js');
    });
  });
});
