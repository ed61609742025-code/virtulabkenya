// ============================================================
//  VirtuLab Kenya — Web Push Notification Routes
// ============================================================

const express = require('express');
const authMiddleware = require('../middleware/auth');
const pushService = require('../services/pushNotificationService');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/**
 * GET /api/push/vapid-public-key
 * Returns the VAPID public key so client service workers can subscribe.
 */
router.get('/vapid-public-key', (req, res) => {
  const publicKey = pushService.getPublicKey();
  if (!publicKey) {
    return res.status(503).json({
      success: false,
      error: 'Web Push notifications are not configured on this server.'
    });
  }
  return res.json({
    success: true,
    publicKey
  });
});

/**
 * POST /api/push/subscribe
 * Register or update a browser push subscription for the authenticated user.
 */
router.post('/subscribe', authMiddleware, asyncHandler(async (req, res) => {
  const { subscription } = req.body;
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({
      success: false,
      error: 'Missing required push subscription object with endpoint and keys.'
    });
  }

  const userAgent = req.headers['user-agent'] || '';
  const saved = await pushService.saveSubscription(
    req.user.id,
    req.user.role,
    subscription,
    userAgent
  );

  return res.json({
    success: true,
    message: 'Push subscription successfully registered.',
    id: saved.id
  });
}));

/**
 * POST /api/push/unsubscribe
 * Revoke a browser push subscription for the authenticated user.
 */
router.post('/unsubscribe', authMiddleware, asyncHandler(async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({
      success: false,
      error: 'Endpoint is required to unsubscribe.'
    });
  }

  await pushService.deleteSubscription(req.user.id, endpoint);

  return res.json({
    success: true,
    message: 'Subscription successfully removed.'
  });
}));

/**
 * POST /api/push/test
 * Sends an immediate diagnostic push alert to the current user's registered devices.
 */
router.post('/test', authMiddleware, asyncHandler(async (req, res) => {
  const payload = {
    title: '🧪 VirtuLab Kenya Alert',
    body: `Hello ${req.user.name || 'User'}! Web push notifications are active and working on this device.`,
    data: {
      url: req.user.role === 'teacher' ? '/teacher/dashboard.html' : '/student/home.html'
    },
    tag: 'vlk-test-' + Date.now()
  };

  const result = await pushService.sendToUser(req.user.id, req.user.role, payload);

  return res.json({
    success: true,
    message: result.sent > 0
      ? `Test notification dispatched to ${result.sent} device(s).`
      : 'No active device subscriptions found for your account.',
    sent: result.sent,
    failed: result.failed
  });
}));

/**
 * GET /api/push/status
 * Check if current user has active push subscriptions.
 */
router.get('/status', authMiddleware, asyncHandler(async (req, res) => {
  const status = await pushService.getUserStatus(req.user.id, req.user.role);
  return res.json({
    success: true,
    ...status
  });
}));

module.exports = router;
