// ============================================================
//  VirtuLab Kenya — Web Push Notification Service (RFC 8292)
// ============================================================

const webpush = require('web-push');
const pool = require('../db/pool');
const config = require('../config');

// Initialize VAPID credentials
let isInitialized = false;

function initVapid() {
  if (isInitialized) return;

  if (!config.push) {
    config.push = {};
  }

  // If keys are not configured in environment, generate ephemeral keys for dev/test
  if (!config.push.vapidPublicKey || !config.push.vapidPrivateKey) {
    try {
      const generated = webpush.generateVAPIDKeys();
      config.push.vapidPublicKey = config.push.vapidPublicKey || generated.publicKey;
      config.push.vapidPrivateKey = config.push.vapidPrivateKey || generated.privateKey;
      console.log('[WebPush] Notice: Generated ephemeral VAPID keys for development/testing.');
    } catch (e) {
      console.warn('[WebPush] Warning: Could not generate ephemeral VAPID keys:', e.message);
    }
  }

  if (config.push.vapidPublicKey && config.push.vapidPrivateKey) {
    try {
      webpush.setVapidDetails(
        config.push.vapidSubject || 'mailto:admin@virtulab.co.ke',
        config.push.vapidPublicKey,
        config.push.vapidPrivateKey
      );
      isInitialized = true;
    } catch (err) {
      console.warn('[WebPush] setVapidDetails error:', err.message);
    }
  }
}

// Auto-initialize on import
initVapid();

/**
 * Get the public VAPID key to send to browsers.
 */
function getPublicKey() {
  initVapid();
  return config.push ? config.push.vapidPublicKey : '';
}

/**
 * Save or update a client push subscription.
 */
async function saveSubscription(userId, userRole, subscription, userAgent = '') {
  if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
    throw new Error('Invalid push subscription format: endpoint and keys (p256dh, auth) are required.');
  }

  const query = `
    INSERT INTO push_subscriptions (user_id, user_role, endpoint, p256dh, auth, user_agent, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (endpoint)
    DO UPDATE SET
      user_id = EXCLUDED.user_id,
      user_role = EXCLUDED.user_role,
      p256dh = EXCLUDED.p256dh,
      auth = EXCLUDED.auth,
      user_agent = EXCLUDED.user_agent,
      updated_at = NOW()
    RETURNING id, user_id, user_role, endpoint, created_at
  `;

  const values = [
    userId,
    userRole,
    subscription.endpoint,
    subscription.keys.p256dh,
    subscription.keys.auth,
    userAgent ? String(userAgent).substring(0, 500) : ''
  ];

  const res = await pool.query(query, values);
  return res.rows[0];
}

/**
 * Remove a subscription by user and endpoint.
 */
async function deleteSubscription(userId, endpoint) {
  if (!endpoint) return false;
  const res = await pool.query(
    `DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2`,
    [userId, endpoint]
  );
  return (res.rowCount || 0) > 0;
}

/**
 * Format notification payload for browser delivery.
 */
function sanitizePayload(payload) {
  const title = payload.title || 'VirtuLab Kenya';
  const body = payload.body || '';
  const icon = payload.icon || '/shared/icon-192.png';
  const badge = payload.badge || '/shared/icon-192.png';
  const data = payload.data || { url: '/' };
  const tag = payload.tag || 'vlk-push-' + Date.now();

  return JSON.stringify({
    title,
    body,
    icon,
    badge,
    data,
    tag,
    actions: payload.actions || [
      { action: 'open', title: 'Open VirtuLab' }
    ]
  });
}

/**
 * Send push notification to a specific user across all their registered devices.
 * Prunes expired or revoked subscriptions automatically.
 */
async function sendToUser(userId, userRole, payload) {
  initVapid();
  if (!config.push.vapidPublicKey || !config.push.vapidPrivateKey) {
    return { sent: 0, failed: 0 };
  }

  const res = await pool.query(
    `SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1 AND user_role = $2`,
    [userId, userRole]
  );

  const subscriptions = res.rows || [];
  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const stringified = sanitizePayload(payload);
  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webpush.sendNotification(pushSub, stringified);
        sent++;
      } catch (err) {
        failed++;
        // If HTTP 404 or 410, subscription is no longer valid
        if (err.statusCode === 404 || err.statusCode === 410) {
          try {
            await pool.query(`DELETE FROM push_subscriptions WHERE id = $1`, [sub.id]);
          } catch (_) {}
        } else {
          console.warn(`[WebPush] Failed sending to sub ${sub.id}:`, err.message);
        }
      }
    })
  );

  return { sent, failed };
}

/**
 * Send push notification to multiple users (e.g. an entire class or unsubmitted students).
 */
async function sendToUsers(userIds, userRole, payload) {
  initVapid();
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const res = await pool.query(
    `SELECT id, endpoint, p256dh, auth FROM push_subscriptions
     WHERE user_role = $1 AND user_id = ANY($2::int[])`,
    [userRole, userIds]
  );

  const subscriptions = res.rows || [];
  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const stringified = sanitizePayload(payload);
  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webpush.sendNotification(pushSub, stringified);
        sent++;
      } catch (err) {
        failed++;
        if (err.statusCode === 404 || err.statusCode === 410) {
          try {
            await pool.query(`DELETE FROM push_subscriptions WHERE id = $1`, [sub.id]);
          } catch (_) {}
        }
      }
    })
  );

  return { sent, failed };
}

/**
 * Broadcast notification to all active subscribers, optionally filtered by role.
 */
async function broadcast(payload, roleFilter = null) {
  initVapid();
  let query = `SELECT id, endpoint, p256dh, auth FROM push_subscriptions`;
  const params = [];
  if (roleFilter) {
    query += ` WHERE user_role = $1`;
    params.push(roleFilter);
  }

  const res = await pool.query(query, params);
  const subscriptions = res.rows || [];
  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const stringified = sanitizePayload(payload);
  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          stringified
        );
        sent++;
      } catch (err) {
        failed++;
        if (err.statusCode === 404 || err.statusCode === 410) {
          try {
            await pool.query(`DELETE FROM push_subscriptions WHERE id = $1`, [sub.id]);
          } catch (_) {}
        }
      }
    })
  );

  return { sent, failed };
}

/**
 * Get subscription count and details for an authenticated user.
 */
async function getUserStatus(userId, userRole) {
  const res = await pool.query(
    `SELECT COUNT(*)::int as count FROM push_subscriptions WHERE user_id = $1 AND user_role = $2`,
    [userId, userRole]
  );
  const count = (res.rows[0] && res.rows[0].count) || 0;
  return {
    subscribed: count > 0,
    deviceCount: count
  };
}

module.exports = {
  initVapid,
  getPublicKey,
  saveSubscription,
  deleteSubscription,
  sendToUser,
  sendToUsers,
  broadcast,
  getUserStatus
};
