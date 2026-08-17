// ============================================================
//  VirtuLab Kenya — Student Notifications Routes
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../db/pool');

const router = express.Router();

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

// PUT /api/notifications/:id/read — Mark single notification as read
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

    return res.json({ success: true, notification: result.rows[0] });
  } catch (err) {
    console.error('Mark notification read error:', err.message);
    return res.status(500).json({ error: 'Could not update notification.' });
  }
});

// PUT /api/notifications/read-all — Mark all notifications as read for current student
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
