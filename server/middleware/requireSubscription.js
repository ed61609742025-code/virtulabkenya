// ============================================================
//  VirtuLab Kenya — Subscription Entitlement Middleware
// ============================================================
//
// Protects premium KCSE laboratory features, 40-mark composite
// exams, and Walimu AI co-pilot tools by verifying active direct
// student subscription or school-wide institutional licensing.
//
// Usage:
//   router.get('/premium-endpoint', requireAuth, requireSubscription(), handler);
//   router.post('/exam-generate', requireAuth, requireSubscription('teacher_exam_co_pilot'), handler);

const subscriptionService = require('../services/subscriptionService');

/**
 * Middleware factory to enforce active subscription or specific feature flag.
 *
 * @param {string} [requiredFeature] - Optional feature flag to check in plan features
 */
function requireSubscription(requiredFeature) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    try {
      const status = await subscriptionService.getSubscriptionStatus(req.user);

      if (!status.isActive) {
        return res.status(402).json({
          error: 'An active VirtuLab subscription is required to access this feature.',
          code: 'SUBSCRIPTION_REQUIRED',
          subscriptionStatus: status,
          upgradeMessage: 'Upgrade to a Term Pass or ask your school administrator to renew access.'
        });
      }

      // Check specific feature entitlement if specified
      if (requiredFeature && status.features && status.features[requiredFeature] === false) {
        return res.status(403).json({
          error: `Your current plan (${status.planName}) does not include access to ${requiredFeature}.`,
          code: 'FEATURE_NOT_INCLUDED',
          requiredFeature
        });
      }

      // Attach subscription status to request object
      req.subscription = status;

      if (status.isGracePeriod) {
        res.setHeader('X-VirtuLab-Grace-Period', 'true');
        res.setHeader('X-VirtuLab-Grace-Days-Left', String(status.graceDaysLeft || 1));
      }

      next();
    } catch (err) {
      console.error('[requireSubscription Middleware Error]:', err.message);
      return res.status(500).json({ error: 'Failed to verify subscription status.' });
    }
  };
}

module.exports = requireSubscription;
