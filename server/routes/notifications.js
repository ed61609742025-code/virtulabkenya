// ============================================================
//  VirtuLab Kenya — Cross-Device Student & Teacher Notifications Routes
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../db/pool');

const router = express.Router();

let readsTableReady = false;
async function ensureReadsTable() {
  if (readsTableReady) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_notification_reads (
        user_id INTEGER NOT NULL,
        user_role VARCHAR(20) NOT NULL,
        notif_id VARCHAR(100) NOT NULL,
        read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (user_id, user_role, notif_id)
      );
      CREATE INDEX IF NOT EXISTS idx_unr_user ON user_notification_reads(user_id, user_role);
    `);
    readsTableReady = true;
  } catch (err) {
    // Graceful continuation when DB is offline or in mock test mode
  }
}

// In-memory fallback cache for cross-device sync resilience (keyed by `${role}_${userId}`)
const memReadsMap = new Map();
function getMemMap(role, userId) {
  const key = `${role}_${userId}`;
  if (!memReadsMap.has(key)) {
    memReadsMap.set(key, new Map());
  }
  return memReadsMap.get(key);
}

// GET /api/notifications/mine — Get notifications for authenticated student
router.get('/mine', authMiddleware, authMiddleware.requireRole('student'), async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await pool.query(
      `SELECT id, title, message, type, link, is_read, created_at
       FROM student_notifications
       WHERE student_id = $1
       ORDER BY created_at DESC
       LIMIT 30`,
      [studentId]
    );

    const unreadCount = result.rows.filter(n => !n.is_read).length;

    return res.json({
      success: true,
      unreadCount,
      notifications: result.rows
    });
  } catch (err) {
    console.error('Fetch student notifications error:', err.message);
    return res.status(500).json({ error: 'Could not load notifications.' });
  }
});

// GET /api/notifications/reads — Retrieve persistent read timestamps map for cross-device sync
router.get('/reads', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role || 'student';
    await ensureReadsTable();

    const readMap = {};
    const memMap = getMemMap(role, userId);
    for (const [nId, ts] of memMap.entries()) {
      readMap[nId] = ts;
    }

    try {
      // Query persistent user_notification_reads
      const resDb = await pool.query(
        `SELECT notif_id, read_at
         FROM user_notification_reads
         WHERE user_id = $1 AND user_role = $2`,
        [userId, role]
      );
      if (resDb && Array.isArray(resDb.rows)) {
        for (const row of resDb.rows) {
          const ts = new Date(row.read_at).getTime();
          readMap[row.notif_id] = ts;
          memMap.set(row.notif_id, ts);
        }
      }

      // If student, also include any rows marked read in student_notifications
      if (role === 'student') {
        const sNotifs = await pool.query(
          `SELECT id, created_at
           FROM student_notifications
           WHERE student_id = $1 AND is_read = TRUE`,
          [userId]
        );
        if (sNotifs && Array.isArray(sNotifs.rows)) {
          for (const row of sNotifs.rows) {
            const ts = new Date(row.created_at).getTime();
            readMap[String(row.id)] = ts;
            readMap['notif_db_' + row.id] = ts;
            memMap.set(String(row.id), ts);
            memMap.set('notif_db_' + row.id, ts);
          }
        }
      }
    } catch (dbErr) {
      // Safe fallback to in-memory map
    }

    return res.json({
      success: true,
      reads: readMap,
      count: Object.keys(readMap).length
    });
  } catch (err) {
    console.error('Fetch read notifications error:', err.message);
    return res.status(500).json({ error: 'Could not fetch read notifications.' });
  }
});

// POST /api/notifications/mark-read — Mark a single notification as read across all devices
router.post('/mark-read', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role || 'student';
    const notifId = req.body && req.body.notifId != null ? String(req.body.notifId).trim() : null;

    if (!notifId) {
      return res.status(400).json({ error: 'notifId is required.' });
    }

    await ensureReadsTable();
    const nowMs = Date.now();
    const memMap = getMemMap(role, userId);
    memMap.set(notifId, nowMs);

    let readAtMs = nowMs;
    try {
      const insRes = await pool.query(
        `INSERT INTO user_notification_reads (user_id, user_role, notif_id, read_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, user_role, notif_id)
         DO UPDATE SET read_at = EXCLUDED.read_at
         RETURNING read_at`,
        [userId, role, notifId]
      );

      if (insRes && insRes.rows && insRes.rows[0] && insRes.rows[0].read_at) {
        readAtMs = new Date(insRes.rows[0].read_at).getTime();
        memMap.set(notifId, readAtMs);
      }

      // If student and notifId references a student_notification record
      if (role === 'student') {
        const numId = parseInt(notifId.replace(/^notif_db_/, ''), 10);
        if (!isNaN(numId)) {
          await pool.query(
            `UPDATE student_notifications
             SET is_read = TRUE
             WHERE id = $1 AND student_id = $2`,
            [numId, userId]
          );
        } else if (notifId.startsWith('asgn_')) {
          const asgnNum = parseInt(notifId.replace(/^asgn_(pending|marked)_/, ''), 10);
          if (!isNaN(asgnNum)) {
            await pool.query(
              `UPDATE student_notifications
               SET is_read = TRUE
               WHERE student_id = $1 AND link LIKE '%' || $2 || '%'`,
              [userId, String(asgnNum)]
            );
          }
        }
      }
    } catch (dbErr) {
      // Memory map saved above
    }

    return res.json({
      success: true,
      notifId,
      readAt: readAtMs
    });
  } catch (err) {
    console.error('Mark notification read error:', err.message);
    return res.status(500).json({ error: 'Could not mark notification as read.' });
  }
});

// POST /api/notifications/mark-all-read — Mark all notifications as read across all devices
router.post('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role || 'student';
    const notifIds = Array.isArray(req.body?.notifIds) ? req.body.notifIds.map(String) : [];

    await ensureReadsTable();
    const nowMs = Date.now();
    const memMap = getMemMap(role, userId);

    notifIds.forEach(id => {
      if (id) memMap.set(id, nowMs);
    });

    try {
      if (notifIds.length > 0) {
        for (const notifId of notifIds) {
          if (!notifId) continue;
          await pool.query(
            `INSERT INTO user_notification_reads (user_id, user_role, notif_id, read_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (user_id, user_role, notif_id)
             DO UPDATE SET read_at = EXCLUDED.read_at`,
            [userId, role, notifId]
          );
        }
      }

      if (role === 'student') {
        await pool.query(
          `UPDATE student_notifications
           SET is_read = TRUE
           WHERE student_id = $1 AND is_read = FALSE`,
          [userId]
        );
      }
    } catch (dbErr) {
      // Memory map saved
    }

    return res.json({
      success: true,
      count: notifIds.length,
      readAt: nowMs
    });
  } catch (err) {
    console.error('Mark all notifications read error:', err.message);
    return res.status(500).json({ error: 'Could not mark all notifications as read.' });
  }
});

// PUT /api/notifications/:id/read — Mark single notification as read (legacy support)
router.put('/:id/read', authMiddleware, authMiddleware.requireRole('student'), async (req, res) => {
  try {
    const studentId = req.user.id;
    const notificationId = req.params.id;

    const result = await pool.query(
      `UPDATE student_notifications
       SET is_read = TRUE
       WHERE id = $1 AND student_id = $2
       RETURNING *`,
      [notificationId, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    const notifIdStr = String(notificationId);
    const nowMs = Date.now();
    const memMap = getMemMap('student', studentId);
    memMap.set(notifIdStr, nowMs);
    memMap.set('notif_db_' + notifIdStr, nowMs);

    ensureReadsTable().then(() => {
      pool.query(
        `INSERT INTO user_notification_reads (user_id, user_role, notif_id, read_at)
         VALUES ($1, 'student', $2, NOW())
         ON CONFLICT (user_id, user_role, notif_id)
         DO UPDATE SET read_at = EXCLUDED.read_at`,
        [studentId, notifIdStr]
      ).catch(() => {});
    }).catch(() => {});

    return res.json({ success: true, notification: result.rows[0] });
  } catch (err) {
    console.error('Mark notification read error:', err.message);
    return res.status(500).json({ error: 'Could not update notification.' });
  }
});

// PUT /api/notifications/read-all — Mark all notifications as read for current student (legacy support)
router.put('/read-all', authMiddleware, authMiddleware.requireRole('student'), async (req, res) => {
  try {
    const studentId = req.user.id;

    await pool.query(
      `UPDATE student_notifications
       SET is_read = TRUE
       WHERE student_id = $1 AND is_read = FALSE`,
      [studentId]
    );

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Mark all notifications read error:', err.message);
    return res.status(500).json({ error: 'Could not update notifications.' });
  }
});

module.exports = router;
