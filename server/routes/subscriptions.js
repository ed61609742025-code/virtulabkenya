// ============================================================
//  VirtuLab Kenya — Subscription & Payment Routes
// ============================================================
//
// Endpoints:
//   GET  /api/subscriptions/plans             — Public: List available plans
//   GET  /api/subscriptions/status            — Auth: Get user's subscription entitlement
//   POST /api/subscriptions/checkout          — Auth: Initialize Paystack payment
//   POST /api/subscriptions/webhook           — Public: Paystack webhook handler
//   GET  /api/subscriptions/verify/:reference — Auth: Manual status check after payment
//   POST /api/subscriptions/admin/activate    — Admin: Manually activate school license

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const pool = require('../db/pool');
const requireAuth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');
const paystackService = require('../services/paystackService');
const subscriptionService = require('../services/subscriptionService');

/**
 * GET /api/subscriptions/plans
 * Returns active subscription plans (filtered optionally by ?target=student|school)
 */
router.get('/plans', async (req, res) => {
  try {
    const { target } = req.query;
    const plans = await subscriptionService.getPlans(target);
    res.json({ success: true, plans });
  } catch (err) {
    console.error('[Subscriptions Route Error]:', err.message);
    res.status(500).json({ error: 'Failed to retrieve subscription plans.' });
  }
});

/**
 * GET /api/subscriptions/status
 * Returns current entitlement status for authenticated user
 */
router.get('/status', requireAuth, async (req, res) => {
  try {
    const status = await subscriptionService.getSubscriptionStatus(req.user);
    res.json({ success: true, subscription: status });
  } catch (err) {
    console.error('[Subscription Status Error]:', err.message);
    res.status(500).json({ error: 'Failed to evaluate subscription status.' });
  }
});

/**
 * POST /api/subscriptions/checkout
 * Initiates a Paystack transaction (STK Push or Card) for a given plan
 */
router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const { planId, callbackUrl, phone } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'planId is required.' });
    }

    const plan = await subscriptionService.getPlan(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Selected plan not found or inactive.' });
    }

    // Determine subscriber context
    const isSchool = req.user.role === 'teacher' || req.user.role === 'admin';
    const subscriberType = isSchool ? 'school' : 'student';

    let schoolId = null;
    let studentId = null;

    if (subscriberType === 'student') {
      studentId = req.user.id;
      schoolId = req.user.school_id || null;
    } else {
      schoolId = req.user.school_id || null;
      if (!schoolId && req.body.schoolId) {
        schoolId = parseInt(req.body.schoolId, 10);
      }
      if (!schoolId && req.user.role === 'teacher') {
        const tchRes = await pool.query('SELECT school_id FROM teachers WHERE id = $1', [req.user.id]);
        schoolId = tchRes.rows[0]?.school_id || null;
      }
      if (!schoolId) {
        return res.status(400).json({ error: 'Your account is not linked to a school institution. Please specify schoolId or link your school.' });
      }
    }

    // Unique reference code
    const uniqueHash = crypto.randomBytes(4).toString('hex');
    const reference = `vlk_${Date.now()}_${uniqueHash}`;

    // Record pending transaction in database (user_id captures initiating student/teacher)
    const txInsert = await pool.query(
      `INSERT INTO payment_transactions (
         user_type, user_id, school_id, gateway, reference_code,
         phone_number, amount_kes, currency, status, channel
       ) VALUES ($1, $2, $3, 'paystack', $4, $5, $6, 'KES', 'pending', 'mobile_money')
       RETURNING id`,
      [
        subscriberType,
        req.user.id,
        schoolId,
        reference,
        phone || null,
        plan.price_kes
      ]
    );

    const txId = txInsert.rows[0].id;

    // Call Paystack API
    const paystackInit = await paystackService.initializeTransaction({
      email: req.user.email,
      amountKes: Number(plan.price_kes),
      reference,
      callbackUrl: callbackUrl || `${process.env.PLATFORM_URL || 'https://virtulab.co.ke'}/student/dashboard.html?payment=complete`,
      metadata: {
        plan_id: plan.id,
        plan_code: plan.plan_code,
        subscriber_type: subscriberType,
        student_id: studentId,
        school_id: schoolId,
        user_id: req.user.id,
        transaction_id: txId,
        phone: phone || null
      }
    });

    res.json({
      success: true,
      authorizationUrl: paystackInit.authorization_url,
      accessCode: paystackInit.access_code,
      reference: paystackInit.reference,
      plan: {
        id: plan.id,
        name: plan.name,
        priceKes: plan.price_kes,
        durationDays: plan.duration_days
      }
    });
  } catch (err) {
    console.error('[Subscription Checkout Error]:', err.message);
    res.status(500).json({ error: err.message || 'Payment initialization failed.' });
  }
});

/**
 * POST /api/subscriptions/webhook
 * Paystack Webhook Handler (Charge Success, Subscription Events)
 * Protected by HMAC SHA512 signature verification
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    // Verify authenticity
    const isValid = paystackService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      if (process.env.SKIP_WEBHOOK_VERIFY === 'true') {
        console.warn('[Paystack Webhook] Signature verification SKIPPED via SKIP_WEBHOOK_VERIFY flag.');
      } else {
        console.warn('[Paystack Webhook] Invalid signature rejected.');
        return res.status(401).send('Invalid webhook signature');
      }
    }

    const event = req.body;

    if (event && event.event === 'charge.success') {
      const chargeData = event.data;
      console.log(`[Paystack Webhook] Processing charge.success for ref: ${chargeData.reference}`);
      await subscriptionService.processSuccessfulCharge(chargeData);
    }

    // Always acknowledge 200 OK quickly to Paystack
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Paystack Webhook Error]:', err.message);
    // Still return 200 to prevent Paystack webhook delivery loops on internal bugs
    res.status(200).json({ received: true, error: err.message });
  }
});

/**
 * GET /api/subscriptions/verify/:reference
 * Verifies transaction completion after client redirect from Paystack
 * Protected by authentication and caller ownership validation
 */
router.get('/verify/:reference', requireAuth, async (req, res) => {
  try {
    const { reference } = req.params;

    // 1. Check local DB record
    const txRes = await pool.query(
      'SELECT * FROM payment_transactions WHERE reference_code = $1',
      [reference]
    );
    const tx = txRes.rows[0];

    if (!tx) {
      return res.status(404).json({ error: 'Transaction reference not found.' });
    }

    // 2. Ownership verification
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (!isAdmin) {
      if (tx.user_type === 'student') {
        if (tx.user_id && tx.user_id !== req.user.id) {
          return res.status(403).json({ error: 'Unauthorized: You do not own this transaction.' });
        }
      } else if (tx.user_type === 'school') {
        let userSchoolId = req.user.school_id;
        if (!userSchoolId && req.user.role === 'teacher') {
          const tch = await pool.query('SELECT school_id FROM teachers WHERE id = $1', [req.user.id]);
          userSchoolId = tch.rows[0]?.school_id;
        } else if (!userSchoolId && req.user.role === 'student') {
          const std = await pool.query('SELECT school_id FROM students WHERE id = $1', [req.user.id]);
          userSchoolId = std.rows[0]?.school_id;
        }
        const matchesSchool = tx.school_id && userSchoolId && tx.school_id === userSchoolId;
        const matchesUser = tx.user_id && tx.user_id === req.user.id;
        if (!matchesSchool && !matchesUser) {
          return res.status(403).json({ error: 'Unauthorized: You do not have access to this transaction.' });
        }
      }
    }

    if (tx.status === 'success') {
      const status = await subscriptionService.getSubscriptionStatus(req.user);
      return res.json({ success: true, status: 'success', subscription: status });
    }

    // 3. Query Paystack directly if still pending locally
    const paystackData = await paystackService.verifyTransaction(reference);

    if (paystackData.status === 'success') {
      await subscriptionService.processSuccessfulCharge(paystackData);
      const updatedStatus = await subscriptionService.getSubscriptionStatus(req.user);
      return res.json({ success: true, status: 'success', subscription: updatedStatus });
    }

    res.json({
      success: false,
      status: paystackData.status,
      message: 'Payment is pending or was not completed.'
    });
  } catch (err) {
    console.error('[Subscription Verify Error]:', err.message);
    res.status(500).json({ error: 'Failed to verify transaction.' });
  }
});

/**
 * POST /api/subscriptions/admin/activate
 * Admin-only: Manually activate an institutional or student license
 * (e.g. for Bank Transfer / RTGS / School Cheque payments)
 */
router.post('/admin/activate', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { subscriberType, studentId, schoolId, planId, notes, referenceCode } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'planId is required.' });
    }

    if (subscriberType === 'student' && !studentId) {
      return res.status(400).json({ error: 'studentId is required for student activation.' });
    }

    if (subscriberType === 'school' && !schoolId) {
      return res.status(400).json({ error: 'schoolId is required for school activation.' });
    }

    const plan = await subscriptionService.getPlan(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found.' });
    }

    const ref = referenceCode || `manual_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    // Record manual payment transaction
    const txRes = await pool.query(
      `INSERT INTO payment_transactions (
         user_type, user_id, school_id, gateway, reference_code,
         amount_kes, currency, status, channel, failure_reason, paid_at
       ) VALUES ($1, $2, $3, 'manual', $4, $5, 'KES', 'success', 'manual', $6, NOW())
       RETURNING id`,
      [subscriberType, studentId || null, schoolId || null, ref, plan.price_kes, notes || 'Admin manual activation']
    );

    const txId = txRes.rows[0].id;

    // Activate subscription
    const subRecord = await subscriptionService.activateOrExtendSubscription({
      subscriberType,
      studentId: studentId ? parseInt(studentId, 10) : null,
      schoolId: schoolId ? parseInt(schoolId, 10) : null,
      planId: plan.id,
      transactionId: txId,
      metadata: {
        activated_by: req.user.email,
        notes: notes || 'Manual administrative activation'
      }
    });

    res.json({
      success: true,
      message: `Successfully activated ${plan.name} for ${subscriberType}.`,
      subscription: subRecord
    });
  } catch (err) {
    console.error('[Admin Subscription Activation Error]:', err.message);
    res.status(500).json({ error: err.message || 'Failed to activate subscription.' });
  }
});

/**
 * GET /api/subscriptions/admin/overview
 * Admin-only: Overview of subscription metrics, revenue, and recent transactions
 */
router.get('/admin/overview', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    // 1. Total revenue
    const revRes = await pool.query(
      `SELECT COALESCE(SUM(amount_kes), 0) AS total_revenue_kes,
              COUNT(*) AS total_success_count
       FROM payment_transactions
       WHERE status = 'success'`
    );

    // 2. Active subscriptions count
    const subsCountRes = await pool.query(
      `SELECT subscriber_type, COUNT(*) AS count
       FROM subscriptions
       WHERE status IN ('active', 'grace_period') AND expires_at > NOW()
       GROUP BY subscriber_type`
    );

    let activeStudents = 0;
    let activeSchools = 0;
    (subsCountRes.rows || []).forEach(r => {
      if (r.subscriber_type === 'student') activeStudents = parseInt(r.count, 10);
      if (r.subscriber_type === 'school') activeSchools = parseInt(r.count, 10);
    });

    // 3. Recent transactions
    const txRes = await pool.query(
      `SELECT pt.id, pt.reference_code, pt.user_type, pt.user_id, pt.school_id,
              pt.amount_kes, pt.status, pt.channel, pt.gateway, pt.paid_at, pt.created_at,
              sp.name AS plan_name,
              s.name AS school_name
       FROM payment_transactions pt
       LEFT JOIN subscriptions sub ON pt.subscription_id = sub.id
       LEFT JOIN subscription_plans sp ON sub.plan_id = sp.id
       LEFT JOIN schools s ON pt.school_id = s.id
       ORDER BY pt.created_at DESC
       LIMIT 50`
    );

    res.json({
      success: true,
      metrics: {
        totalRevenueKes: parseFloat(revRes.rows[0]?.total_revenue_kes || 0),
        totalSuccessTransactions: parseInt(revRes.rows[0]?.total_success_count || 0, 10),
        activeStudentSubscriptions: activeStudents,
        activeSchoolSubscriptions: activeSchools
      },
      recentTransactions: txRes.rows
    });
  } catch (err) {
    console.error('[Admin Subscription Overview Error]:', err.message);
    res.status(500).json({ error: 'Failed to retrieve administrative billing overview.' });
  }
});

module.exports = router;
