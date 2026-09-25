// ============================================================
//  VirtuLab Kenya — Subscriptions & Paystack Payments Test Suite
// ============================================================

process.env.NODE_ENV = 'test';

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const pool = require('../db/pool');
const originalQuery = pool.query;
const originalConnect = pool.connect;
const app = require('../index');
const paystackService = require('../services/paystackService');
const requireSubscription = require('../middleware/requireSubscription');

let server;
let port = 0;
let studentToken;
let teacherToken;
let adminToken;

function url(path) {
  return `http://127.0.0.1:${port}${path}`;
}

describe('VirtuLab Kenya — Subscription & Payment System', () => {

  before(async () => {
    process.env.JWT_SECRET = 'test_secret_key_12345';
    process.env.ADMIN_EMAIL = 'admin@virtulab.co.ke';
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock_secret_key';

    studentToken = jwt.sign(
      { id: 101, role: 'student', name: 'Amina Mwangi', email: 'amina@example.com', school_id: 1 },
      process.env.JWT_SECRET
    );
    teacherToken = jwt.sign(
      { id: 201, role: 'teacher', name: 'Mr. Otieno', email: 'otieno@example.com', school_id: 1 },
      process.env.JWT_SECRET
    );
    adminToken = jwt.sign(
      { id: 1, role: 'admin', name: 'System Administrator', email: 'admin@virtulab.co.ke' },
      process.env.JWT_SECRET
    );

    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(() => {
    pool.query = originalQuery;
    pool.connect = originalConnect;
  });

  // 1. GET /api/subscriptions/plans
  it('GET /api/subscriptions/plans — should return list of active plans', async () => {
    pool.query = async (text, params) => {
      if (text.includes('FROM subscription_plans')) {
        return {
          rows: [
            { id: 1, plan_code: 'student_term', name: 'Student Term Pass', price_kes: '500.00', duration_days: 120, target_audience: 'student' },
            { id: 2, plan_code: 'kcse_sprint', name: 'KCSE 30-Day Exam Sprint', price_kes: '200.00', duration_days: 30, target_audience: 'student' }
          ]
        };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/subscriptions/plans'));
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.plans.length, 2);
    assert.strictEqual(body.plans[0].plan_code, 'student_term');
  });

  // 2. GET /api/subscriptions/status — Unsubscribed student
  it('GET /api/subscriptions/status — should indicate free tier when student has no active pass', async () => {
    pool.query = async (text, params) => {
      // No active direct subscription and no active school subscription
      return { rows: [] };
    };

    const res = await fetch(url('/api/subscriptions/status'), {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.subscription.isActive, false);
    assert.strictEqual(body.subscription.planCode, 'free_tier');
  });

  // 3. GET /api/subscriptions/status — Active Direct Student Pass
  it('GET /api/subscriptions/status — should return active status for student with direct term pass', async () => {
    const futureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

    pool.query = async (text, params) => {
      if (text.includes('WHERE s.subscriber_type = \'student\'')) {
        return {
          rows: [{
            id: 10,
            subscriber_type: 'student',
            student_id: 101,
            plan_name: 'Student Term Pass',
            plan_code: 'student_term',
            status: 'active',
            expires_at: futureDate,
            features: { all_labs: true, ai_tutor: true }
          }]
        };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/subscriptions/status'), {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.subscription.isActive, true);
    assert.strictEqual(body.subscription.source, 'direct');
    assert.strictEqual(body.subscription.isGracePeriod, false);
    assert.ok(body.subscription.daysRemaining > 50);
  });

  // 4. GET /api/subscriptions/status — 3-Day Grace Period
  it('GET /api/subscriptions/status — should recognize grace period if expired within 3 days', async () => {
    // Expired 1 day ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    pool.query = async (text, params) => {
      if (text.includes('WHERE s.subscriber_type = \'student\'')) {
        return {
          rows: [{
            id: 11,
            subscriber_type: 'student',
            student_id: 101,
            plan_name: 'Student Term Pass',
            plan_code: 'student_term',
            status: 'active',
            expires_at: oneDayAgo,
            features: { all_labs: true }
          }]
        };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/subscriptions/status'), {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.subscription.isActive, true);
    assert.strictEqual(body.subscription.isGracePeriod, true);
    assert.strictEqual(body.subscription.daysRemaining, 0);
    assert.ok(body.subscription.graceDaysLeft >= 1);
  });

  // 5. GET /api/subscriptions/status — School-Inherited Entitlement
  it('GET /api/subscriptions/status — student should inherit active status from school subscription', async () => {
    const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    pool.query = async (text, params) => {
      if (text.includes('WHERE s.subscriber_type = \'student\'')) {
        return { rows: [] }; // No direct student subscription
      }
      if (text.includes('SELECT school_id FROM students')) {
        return { rows: [{ school_id: 1 }] };
      }
      if (text.includes('WHERE s.subscriber_type = \'school\'')) {
        return {
          rows: [{
            id: 20,
            subscriber_type: 'school',
            school_id: 1,
            plan_name: 'School Term Institutional Pass',
            plan_code: 'school_term',
            status: 'active',
            expires_at: futureDate,
            features: { all_labs: true, teacher_exam_co_pilot: true }
          }]
        };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/subscriptions/status'), {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.subscription.isActive, true);
    assert.strictEqual(body.subscription.source, 'school');
    assert.strictEqual(body.subscription.planCode, 'school_term');
  });

  // 6. GET /api/subscriptions/status — Admin Unrestricted
  it('GET /api/subscriptions/status — admin should have full unrestricted enterprise entitlement', async () => {
    const res = await fetch(url('/api/subscriptions/status'), {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.subscription.isActive, true);
    assert.strictEqual(body.subscription.tier, 'enterprise');
  });

  // 7. POST /api/subscriptions/checkout — Initialize checkout
  it('POST /api/subscriptions/checkout — should record pending transaction and return authorization URL', async () => {
    let insertedTx = false;

    pool.query = async (text, params) => {
      if (text.includes('FROM subscription_plans WHERE id = $1')) {
        return {
          rows: [{
            id: 1,
            plan_code: 'student_term',
            name: 'Student Term Pass',
            price_kes: '500.00',
            duration_days: 120
          }]
        };
      }
      if (text.includes('INSERT INTO payment_transactions')) {
        insertedTx = true;
        return { rows: [{ id: 456 }] };
      }
      return { rows: [] };
    };

    const res = await fetch(url('/api/subscriptions/checkout'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        planId: 1,
        phone: '0712345678'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.authorizationUrl);
    assert.ok(body.reference.startsWith('vlk_'));
    assert.strictEqual(insertedTx, true);
  });

  // 8. POST /api/subscriptions/webhook — HMAC-SHA512 verification & atomic processing
  it('POST /api/subscriptions/webhook — should verify HMAC and activate subscription idempotently', async () => {
    const payload = {
      event: 'charge.success',
      data: {
        id: 99887766,
        reference: 'vlk_test_ref_123',
        amount: 50000,
        currency: 'KES',
        channel: 'mobile_money',
        customer: { email: 'amina@example.com', customer_code: 'CUS_mock123' },
        authorization: { last4: 'QK12345' },
        metadata: {
          subscriber_type: 'student',
          student_id: 101,
          plan_id: 1
        }
      }
    };

    const rawBody = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');

    let activatedSub = false;

    // Mock DB queries for webhook
    pool.query = async (text, params) => {
      if (text.includes('SELECT * FROM payment_transactions WHERE reference_code')) {
        return { rows: [] }; // Not processed yet
      }
      if (text.includes('INSERT INTO payment_transactions')) {
        return { rows: [{ id: 789 }] };
      }
      if (text.includes('FROM subscription_plans WHERE id = $1')) {
        return { rows: [{ id: 1, duration_days: 120 }] };
      }
      return { rows: [] };
    };

    pool.connect = async () => {
      return {
        query: async (text, params) => {
          if (text.includes('SELECT * FROM subscriptions')) {
            return { rows: [] }; // No existing subscription
          }
          if (text.includes('INSERT INTO subscriptions')) {
            activatedSub = true;
            return { rows: [{ id: 99, status: 'active', student_id: 101 }] };
          }
          return { rows: [] };
        },
        release: () => {}
      };
    };

    const res = await fetch(url('/api/subscriptions/webhook'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': signature
      },
      body: rawBody
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.received, true);
    assert.strictEqual(activatedSub, true);
  });

  // 9. POST /api/subscriptions/admin/activate — Role Guard & Manual Activation
  it('POST /api/subscriptions/admin/activate — should reject non-admin and allow admin', async () => {
    // Non-admin student should receive 403
    const forbiddenRes = await fetch(url('/api/subscriptions/admin/activate'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subscriberType: 'school', schoolId: 1, planId: 4 })
    });
    assert.strictEqual(forbiddenRes.status, 403);

    // Admin should succeed
    pool.query = async (text, params) => {
      if (text.includes('FROM subscription_plans WHERE id = $1')) {
        return { rows: [{ id: 4, name: 'School Term Institutional Pass', price_kes: '15000.00', duration_days: 120 }] };
      }
      if (text.includes('INSERT INTO payment_transactions')) {
        return { rows: [{ id: 501 }] };
      }
      return { rows: [] };
    };

    pool.connect = async () => {
      return {
        query: async (text, params) => {
          if (text.includes('SELECT * FROM subscriptions')) {
            return { rows: [] };
          }
          if (text.includes('INSERT INTO subscriptions')) {
            return { rows: [{ id: 88, status: 'active', school_id: 1 }] };
          }
          return { rows: [] };
        },
        release: () => {}
      };
    };

    const adminRes = await fetch(url('/api/subscriptions/admin/activate'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscriberType: 'school',
        schoolId: 1,
        planId: 4,
        notes: 'Bank RTGS Ref: KCB-882910'
      })
    });

    assert.strictEqual(adminRes.status, 200);
    const adminBody = await adminRes.json();
    assert.strictEqual(adminBody.success, true);
    assert.strictEqual(adminBody.subscription.school_id, 1);
  });

  // 10. requireSubscription Middleware Unit Check
  it('requireSubscription middleware — should block unsubscribed users with HTTP 402', async () => {
    const middleware = requireSubscription();
    let statusCalled = null;
    let jsonCalled = null;
    let nextCalled = false;

    const mockReq = {
      user: { id: 101, role: 'student', school_id: 1 }
    };
    const mockRes = {
      status: (code) => {
        statusCalled = code;
        return {
          json: (data) => {
            jsonCalled = data;
          }
        };
      },
      setHeader: () => {}
    };

    pool.query = async () => ({ rows: [] }); // Unsubscribed

    await middleware(mockReq, mockRes, () => {
      nextCalled = true;
    });

    assert.strictEqual(statusCalled, 402);
    assert.strictEqual(jsonCalled.code, 'SUBSCRIPTION_REQUIRED');
    assert.strictEqual(nextCalled, false);
  });
});
