// ============================================================
//  VirtuLab Kenya — Subscription Management Service
// ============================================================
//
// Manages:
// - Subscription plan retrieval
// - Entitlement checks (direct student vs school-inherited)
// - Grace period calculations (3 days for offline PWA learners)
// - Subscription activations, extensions, and renewals

const pool = require('../db/pool');

const GRACE_PERIOD_DAYS = 3;

class SubscriptionService {
  /**
   * Get all active subscription plans.
   * @param {string} [targetAudience] - 'student' | 'school' | undefined
   */
  async getPlans(targetAudience) {
    let query = 'SELECT * FROM subscription_plans WHERE is_active = TRUE';
    const params = [];

    if (targetAudience) {
      query += ' AND target_audience = $1';
      params.push(targetAudience);
    }

    query += ' ORDER BY price_kes ASC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get plan details by ID or code.
   * @param {number|string} planIdentifier
   */
  async getPlan(planIdentifier) {
    let query;
    let params;

    if (typeof planIdentifier === 'number' || /^\d+$/.test(planIdentifier)) {
      query = 'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = TRUE';
      params = [parseInt(planIdentifier, 10)];
    } else {
      query = 'SELECT * FROM subscription_plans WHERE plan_code = $1 AND is_active = TRUE';
      params = [planIdentifier];
    }

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  /**
   * Evaluate complete subscription status and entitlement for a user.
   *
   * @param {Object} user - Decoded JWT user object { id, role, school_id? }
   * @returns {Promise<Object>} Entitlement status object
   */
  async getSubscriptionStatus(user) {
    if (!user) {
      return { isActive: false, reason: 'unauthenticated' };
    }

    // 1. Superadmin and Admin accounts always have unrestricted access
    if (user.role === 'admin' || user.role === 'superadmin') {
      return {
        isActive: true,
        role: user.role,
        tier: 'enterprise',
        planName: 'Administrative License',
        planCode: 'admin_unrestricted',
        expiresAt: null,
        daysRemaining: null,
        isGracePeriod: false,
        features: { all_labs: true, ai_tutor: true, kcse_mocks: true, admin_tools: true }
      };
    }

    const now = new Date();

    // 2. If student: check direct student subscription first
    if (user.role === 'student') {
      const studentSubQuery = `
        SELECT s.*, p.name AS plan_name, p.plan_code, p.features
        FROM subscriptions s
        JOIN subscription_plans p ON s.plan_id = p.id
        WHERE s.subscriber_type = 'student'
          AND s.student_id = $1
          AND s.status IN ('active', 'grace_period')
        ORDER BY s.expires_at DESC
        LIMIT 1
      `;
      const studentSubRes = await pool.query(studentSubQuery, [user.id]);
      const directSub = studentSubRes.rows[0];

      if (directSub) {
        const expiresAt = new Date(directSub.expires_at);
        const msRemaining = expiresAt.getTime() - now.getTime();
        const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

        if (expiresAt > now) {
          return {
            isActive: true,
            source: 'direct',
            planName: directSub.plan_name,
            planCode: directSub.plan_code,
            expiresAt: directSub.expires_at,
            daysRemaining,
            isGracePeriod: false,
            features: directSub.features || {}
          };
        }

        // Within 3-day grace period
        const graceEnd = new Date(expiresAt.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
        if (now <= graceEnd) {
          return {
            isActive: true,
            source: 'direct',
            planName: directSub.plan_name,
            planCode: directSub.plan_code,
            expiresAt: directSub.expires_at,
            daysRemaining: 0,
            isGracePeriod: true,
            graceDaysLeft: Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
            features: directSub.features || {}
          };
        }
      }
    }

    // 3. Check school-inherited institutional subscription
    let schoolId = user.school_id;
    if (!schoolId && user.role === 'student') {
      // Look up school_id if not stored in token
      const stdRes = await pool.query('SELECT school_id FROM students WHERE id = $1', [user.id]);
      schoolId = stdRes.rows[0]?.school_id;
    } else if (!schoolId && user.role === 'teacher') {
      const tchRes = await pool.query('SELECT school_id FROM teachers WHERE id = $1', [user.id]);
      schoolId = tchRes.rows[0]?.school_id;
    }

    if (schoolId) {
      const schoolSubQuery = `
        SELECT s.*, p.name AS plan_name, p.plan_code, p.features
        FROM subscriptions s
        JOIN subscription_plans p ON s.plan_id = p.id
        WHERE s.subscriber_type = 'school'
          AND s.school_id = $1
          AND s.status IN ('active', 'grace_period')
        ORDER BY s.expires_at DESC
        LIMIT 1
      `;
      const schoolSubRes = await pool.query(schoolSubQuery, [schoolId]);
      const schoolSub = schoolSubRes.rows[0];

      if (schoolSub) {
        const expiresAt = new Date(schoolSub.expires_at);
        const msRemaining = expiresAt.getTime() - now.getTime();
        const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

        if (expiresAt > now) {
          return {
            isActive: true,
            source: 'school',
            schoolId,
            planName: schoolSub.plan_name,
            planCode: schoolSub.plan_code,
            expiresAt: schoolSub.expires_at,
            daysRemaining,
            isGracePeriod: false,
            features: schoolSub.features || {}
          };
        }

        const graceEnd = new Date(expiresAt.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
        if (now <= graceEnd) {
          return {
            isActive: true,
            source: 'school',
            schoolId,
            planName: schoolSub.plan_name,
            planCode: schoolSub.plan_code,
            expiresAt: schoolSub.expires_at,
            daysRemaining: 0,
            isGracePeriod: true,
            graceDaysLeft: Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
            features: schoolSub.features || {}
          };
        }
      }
    }

    // No active direct or school subscription
    return {
      isActive: false,
      role: user.role,
      planName: 'Free / Unsubscribed Tier',
      planCode: 'free_tier',
      expiresAt: null,
      daysRemaining: 0,
      isGracePeriod: false,
      features: {
        basic_titration: true,
        limited_ai: true
      }
    };
  }

  /**
   * Activate or extend a subscription atomically upon successful payment.
   *
   * @param {Object} params
   * @param {string} params.subscriberType - 'student' | 'school'
   * @param {number} [params.studentId]
   * @param {number} [params.schoolId]
   * @param {number} params.planId
   * @param {number} [params.transactionId]
   * @param {string} [params.paystackCustomerCode]
   * @param {string} [params.paystackSubscriptionCode]
   * @param {Object} [params.metadata]
   * @returns {Promise<Object>} Created or updated subscription record
   */
  async activateOrExtendSubscription({
    subscriberType,
    studentId,
    schoolId,
    planId,
    transactionId,
    paystackCustomerCode,
    paystackSubscriptionCode,
    metadata = {}
  }) {
    const plan = await this.getPlan(planId);
    if (!plan) throw new Error(`Subscription plan ${planId} not found.`);

    const durationDays = plan.duration_days || 30;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check existing active subscription to extend if still valid
      let existingQuery = '';
      let existingParams = [];
      if (subscriberType === 'student') {
        existingQuery = `
          SELECT * FROM subscriptions
          WHERE subscriber_type = 'student' AND student_id = $1 AND status = 'active'
          ORDER BY expires_at DESC LIMIT 1
        `;
        existingParams = [studentId];
      } else {
        existingQuery = `
          SELECT * FROM subscriptions
          WHERE subscriber_type = 'school' AND school_id = $1 AND status = 'active'
          ORDER BY expires_at DESC LIMIT 1
        `;
        existingParams = [schoolId];
      }

      const existingRes = await client.query(existingQuery, existingParams);
      const existing = existingRes.rows[0];

      const now = new Date();
      let newStartDate = now;
      let newExpiryDate;

      if (existing && new Date(existing.expires_at) > now) {
        // Extend existing subscription duration
        newStartDate = existing.starts_at;
        newExpiryDate = new Date(new Date(existing.expires_at).getTime() + durationDays * 24 * 60 * 60 * 1000);
      } else {
        // Fresh start
        newExpiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
      }

      let subRecord;
      if (existing) {
        const updateSql = `
          UPDATE subscriptions
          SET plan_id = $1,
              expires_at = $2,
              status = 'active',
              paystack_customer_code = COALESCE($3, paystack_customer_code),
              paystack_subscription_code = COALESCE($4, paystack_subscription_code),
              metadata = metadata || $5::jsonb,
              updated_at = NOW()
          WHERE id = $6
          RETURNING *
        `;
        const res = await client.query(updateSql, [
          planId,
          newExpiryDate,
          paystackCustomerCode || null,
          paystackSubscriptionCode || null,
          JSON.stringify(metadata),
          existing.id
        ]);
        subRecord = res.rows[0];
      } else {
        const insertSql = `
          INSERT INTO subscriptions (
            plan_id, subscriber_type, student_id, school_id,
            status, starts_at, expires_at, paystack_customer_code,
            paystack_subscription_code, metadata
          ) VALUES ($1, $2, $3, $4, 'active', $5, $6, $7, $8, $9)
          RETURNING *
        `;
        const res = await client.query(insertSql, [
          planId,
          subscriberType,
          studentId || null,
          schoolId || null,
          newStartDate,
          newExpiryDate,
          paystackCustomerCode || null,
          paystackSubscriptionCode || null,
          JSON.stringify(metadata)
        ]);
        subRecord = res.rows[0];
      }

      // Link subscription ID back to payment transaction if available
      if (transactionId) {
        await client.query(
          `UPDATE payment_transactions
           SET subscription_id = $1, status = 'success', paid_at = NOW(), updated_at = NOW()
           WHERE id = $2`,
          [subRecord.id, transactionId]
        );
      }

      await client.query('COMMIT');
      return subRecord;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Process a successful Paystack webhook event (`charge.success`).
   * Handles idempotency to prevent duplicate subscription extensions.
   *
   * @param {Object} chargeData - Data object from Paystack charge.success event
   */
  async processSuccessfulCharge(chargeData) {
    const reference = chargeData.reference;
    if (!reference) return { skipped: true, reason: 'missing_reference' };

    // 1. Check if transaction is already recorded and succeeded
    const txRes = await pool.query(
      'SELECT * FROM payment_transactions WHERE reference_code = $1 OR paystack_reference = $1',
      [reference]
    );
    const existingTx = txRes.rows[0];

    if (existingTx && existingTx.status === 'success') {
      return { skipped: true, reason: 'already_processed', transactionId: existingTx.id };
    }

    const metadata = chargeData.metadata || {};
    const subscriberType = metadata.subscriber_type || 'student';
    const studentId = metadata.student_id ? parseInt(metadata.student_id, 10) : null;
    const schoolId = metadata.school_id ? parseInt(metadata.school_id, 10) : null;
    const userId = metadata.user_id ? parseInt(metadata.user_id, 10) : (studentId || null);
    const planId = metadata.plan_id ? parseInt(metadata.plan_id, 10) : null;

    if (!planId) {
      throw new Error(`Charge webhook missing plan_id in metadata for ref ${reference}`);
    }

    // Extract M-Pesa receipt number from authorization/customer details if available
    let mpesaReceipt = null;
    let phoneNumber = null;
    if (chargeData.channel === 'mobile_money') {
      mpesaReceipt = chargeData.authorization?.last4 || null;
      phoneNumber = chargeData.customer?.phone || null;
    }

    const amountKes = chargeData.amount ? chargeData.amount / 100 : 0;
    const channel = chargeData.channel || 'unknown';

    let txId = existingTx?.id;

    if (!existingTx) {
      // Record transaction if not pre-created during checkout initialize
      const insTx = await pool.query(
        `INSERT INTO payment_transactions (
           user_type, user_id, school_id, gateway, reference_code,
           paystack_reference, mpesa_receipt_number, phone_number,
           amount_kes, currency, status, channel, raw_payload, paid_at
         ) VALUES ($1, $2, $3, 'paystack', $4, $5, $6, $7, $8, 'KES', 'success', $9, $10, NOW())
         RETURNING id`,
        [
          subscriberType,
          userId,
          schoolId,
          reference,
          chargeData.id ? String(chargeData.id) : reference,
          mpesaReceipt,
          phoneNumber,
          amountKes,
          channel,
          JSON.stringify(chargeData)
        ]
      );
      txId = insTx.rows[0].id;
    } else {
      await pool.query(
        `UPDATE payment_transactions
         SET status = 'success',
             paystack_reference = COALESCE($1, paystack_reference),
             mpesa_receipt_number = COALESCE($2, mpesa_receipt_number),
             channel = $3,
             raw_payload = $4,
             paid_at = NOW(),
             updated_at = NOW()
         WHERE id = $5`,
        [String(chargeData.id || reference), mpesaReceipt, channel, JSON.stringify(chargeData), txId]
      );
    }

    // 2. Activate or extend subscription
    const subRecord = await this.activateOrExtendSubscription({
      subscriberType,
      studentId,
      schoolId,
      planId,
      transactionId: txId,
      paystackCustomerCode: chargeData.customer?.customer_code,
      metadata: {
        paystack_channel: channel,
        paystack_reference: reference
      }
    });

    return { success: true, subscription: subRecord, transactionId: txId };
  }
}

module.exports = new SubscriptionService();
