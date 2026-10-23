// ============================================================
//  VirtuLab Kenya — Subscription & Licensing Console Test Suite
// ============================================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_licensing_key_4433';

const app = require('../index');
const pool = require('../db/pool');
const originalQuery = pool.query;

let server;
let port = 0;
let adminToken;
let studentToken;

function url(subpath) {
  return `http://127.0.0.1:${port}${subpath}`;
}

const mockPlans = [
  {
    id: 1,
    plan_code: 'student_pass_30',
    name: 'Candidate 30-Day KCSE Pass',
    target_audience: 'student',
    price_kes: 250.00,
    duration_days: 30,
    max_students: 1,
    description: 'Full simulation access for 1 candidate',
    features: { all_labs: true, ai_tutor: true },
    is_active: true
  },
  {
    id: 2,
    plan_code: 'school_term_license',
    name: 'Institutional CBC Term License',
    target_audience: 'school',
    price_kes: 4500.00,
    duration_days: 90,
    max_students: 250,
    description: 'School institutional license',
    features: { all_labs: true, teacher_portal: true },
    is_active: true
  }
];

const mockSubscriptions = [
  {
    id: 101,
    plan_id: 2,
    subscriber_type: 'school',
    student_id: null,
    school_id: 10,
    status: 'active',
    starts_at: new Date(Date.now() - 10 * 86400000),
    expires_at: new Date(Date.now() + 80 * 86400000),
    auto_renew: false,
    created_at: new Date(),
    plan_name: 'Institutional CBC Term License',
    plan_code: 'school_term_license',
    price_kes: 4500.00,
    duration_days: 90,
    school_name: 'Alliance High School',
    school_county: 'Kiambu',
    student_name: null,
    student_email: null,
    days_remaining: 80
  }
];

const mockTransactions = [
  {
    id: 201,
    subscription_id: 101,
    user_type: 'school',
    user_id: 1,
    school_id: 10,
    gateway: 'manual',
    reference_code: 'RTGS-KCB-99482',
    phone_number: null,
    amount_kes: '4500.00',
    currency: 'KES',
    status: 'success',
    channel: 'manual',
    paid_at: new Date(),
    created_at: new Date(),
    plan_name: 'Institutional CBC Term License',
    school_name: 'Alliance High School',
    student_name: null,
    student_email: null
  }
];

const mockAuditLogs = [];

describe('VirtuLab Kenya — Subscription & Licensing Console Suite', () => {

  before(async () => {
    adminToken = jwt.sign(
      { id: 1, role: 'admin', adminRole: 'superadmin', email: 'admin@virtulab.ke', name: 'Super Admin' },
      process.env.JWT_SECRET
    );
    studentToken = jwt.sign(
      { id: 42, role: 'student', email: 'student42@virtulab.ke', name: 'Wanjiku Student' },
      process.env.JWT_SECRET
    );

    pool.query = async (text, params) => {
      const q = String(text || '');

      // Audit logs
      if (q.includes('INSERT INTO audit_logs')) {
        const entry = {
          id: mockAuditLogs.length + 1,
          admin_email: params[0],
          action: params[1],
          details: params[2],
          ip_address: params[3],
          created_at: new Date()
        };
        mockAuditLogs.push(entry);
        return { rows: [entry], rowCount: 1 };
      }

      // SELECT 1
      if (q.includes('SELECT 1')) {
        return { rows: [{ '?column?': 1 }], rowCount: 1 };
      }

      // Total revenue query
      if (q.includes('SELECT COALESCE(SUM(amount_kes), 0) AS total_revenue_kes')) {
        return {
          rows: [{
            total_revenue_kes: 4500.00,
            total_success_count: mockTransactions.filter(t => t.status === 'success').length
          }],
          rowCount: 1
        };
      }

      // Active subscriptions count
      if (q.includes('SELECT subscriber_type, COUNT(*) AS count') && q.includes('FROM subscriptions')) {
        return {
          rows: [
            { subscriber_type: 'school', count: 1 },
            { subscriber_type: 'student', count: 0 }
          ],
          rowCount: 2
        };
      }

      // Plans count
      if (q.includes('SELECT COUNT(*)::int AS total FROM subscription_plans')) {
        return {
          rows: [{ total: mockPlans.length }],
          rowCount: 1
        };
      }

      // Recent transactions
      if (q.includes('FROM payment_transactions pt')) {
        return {
          rows: mockTransactions,
          rowCount: mockTransactions.length
        };
      }

      // Active subscriptions list
      if (q.includes('FROM subscriptions s') && q.includes('LEFT JOIN subscription_plans sp')) {
        return {
          rows: mockSubscriptions,
          rowCount: mockSubscriptions.length
        };
      }

      // Get single subscription
      if (q.includes('SELECT * FROM subscriptions WHERE id = $1')) {
        const sub = mockSubscriptions.find(s => s.id === params[0]);
        return { rows: sub ? [sub] : [], rowCount: sub ? 1 : 0 };
      }

      // Extend subscription
      if (q.includes('UPDATE subscriptions') && q.includes('SET expires_at = $1')) {
        const sub = mockSubscriptions.find(s => s.id === params[1]);
        if (sub) {
          sub.expires_at = params[0];
          sub.status = 'active';
        }
        return { rows: sub ? [sub] : [], rowCount: sub ? 1 : 0 };
      }

      // Revoke subscription
      if (q.includes('UPDATE subscriptions') && q.includes("SET status = 'cancelled'")) {
        const sub = mockSubscriptions.find(s => s.id === params[0]);
        if (sub) {
          sub.status = 'cancelled';
        }
        return { rows: sub ? [sub] : [], rowCount: sub ? 1 : 0 };
      }

      // All plans admin
      if (q.includes('FROM subscription_plans sp')) {
        return {
          rows: mockPlans.map(p => ({ ...p, active_subscribers_count: 1 })),
          rowCount: mockPlans.length
        };
      }

      // Plan by ID / code
      if (q.includes('SELECT * FROM subscription_plans WHERE id = $1') || q.includes('SELECT * FROM subscription_plans WHERE plan_code = $1')) {
        const plan = mockPlans.find(p => p.id === params[0] || p.plan_code === params[0]);
        return { rows: plan ? [plan] : [], rowCount: plan ? 1 : 0 };
      }

      // Insert new plan
      if (q.includes('INSERT INTO subscription_plans')) {
        const newPlan = {
          id: mockPlans.length + 1,
          plan_code: params[0],
          name: params[1],
          target_audience: params[2],
          price_kes: params[3],
          duration_days: params[4],
          max_students: params[5],
          description: params[6],
          features: params[7],
          is_active: true
        };
        mockPlans.push(newPlan);
        return { rows: [newPlan], rowCount: 1 };
      }

      // Toggle plan
      if (q.includes('UPDATE subscription_plans') && q.includes('SET is_active = NOT is_active')) {
        const plan = mockPlans.find(p => p.id === params[0]);
        if (plan) {
          plan.is_active = !plan.is_active;
        }
        return { rows: plan ? [plan] : [], rowCount: plan ? 1 : 0 };
      }

      // Find student by email
      if (q.includes('SELECT id FROM students WHERE LOWER(email) = LOWER($1)')) {
        if (params[0].toLowerCase().includes('wanjiku') || params[0].toLowerCase().includes('student')) {
          return { rows: [{ id: 42 }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }

      // Insert transaction (manual activation)
      if (q.includes('INSERT INTO payment_transactions')) {
        const newTx = {
          id: mockTransactions.length + 1,
          subscription_id: null,
          user_type: params[0],
          user_id: params[1],
          school_id: params[2],
          gateway: 'manual',
          reference_code: params[3],
          amount_kes: params[4],
          currency: 'KES',
          status: 'success',
          channel: 'manual',
          failure_reason: params[5],
          paid_at: new Date(),
          created_at: new Date()
        };
        mockTransactions.push(newTx);
        return { rows: [{ id: newTx.id }], rowCount: 1 };
      }

      // Pool connect for activateOrExtendSubscription
      return { rows: [], rowCount: 0 };
    };

    // Mock pool.connect for transactions
    pool.connect = async () => ({
      query: async (text, params) => {
        const q = String(text || '');
        if (q === 'BEGIN' || q === 'COMMIT' || q === 'ROLLBACK') return {};
        if (q.includes('SELECT * FROM subscriptions')) return { rows: [], rowCount: 0 };
        if (q.includes('INSERT INTO subscriptions')) {
          const sub = {
            id: mockSubscriptions.length + 101,
            plan_id: params[0],
            subscriber_type: params[1],
            student_id: params[2],
            school_id: params[3],
            status: 'active',
            starts_at: params[4],
            expires_at: params[5],
            metadata: params[8]
          };
          mockSubscriptions.push(sub);
          return { rows: [sub], rowCount: 1 };
        }
        if (q.includes('UPDATE payment_transactions')) return { rowCount: 1 };
        return { rows: [], rowCount: 0 };
      },
      release: () => {}
    });

    server = http.createServer(app);
    await new Promise(resolve => {
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  after(async () => {
    pool.query = originalQuery;
    if (server && server.listening) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  it('1. GET /api/subscriptions/admin/overview rejects non-admin requests', async () => {
    const resNoAuth = await fetch(url('/api/subscriptions/admin/overview'));
    assert.strictEqual(resNoAuth.status, 401);

    const resStudent = await fetch(url('/api/subscriptions/admin/overview'), {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(resStudent.status, 403);
  });

  it('2. GET /api/subscriptions/admin/overview returns complete billing metrics, ledger, and licenses', async () => {
    const res = await fetch(url('/api/subscriptions/admin/overview'), {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.strictEqual(data.success, true);
    assert.ok(data.metrics, 'metrics object required');
    assert.strictEqual(data.metrics.totalRevenueKes, 4500.00);
    assert.strictEqual(data.metrics.activeSchoolSubscriptions, 1);
    assert.ok(Array.isArray(data.recentTransactions));
    assert.ok(Array.isArray(data.activeSubscriptions));
  });

  it('3. GET /api/subscriptions/admin/plans returns plans with subscriber counts', async () => {
    const res = await fetch(url('/api/subscriptions/admin/plans'), {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.plans.length >= 2);
    assert.strictEqual(data.plans[0].plan_code, 'student_pass_30');
  });

  it('4. POST /api/subscriptions/admin/plans creates a new tier plan and logs audit event', async () => {
    const res = await fetch(url('/api/subscriptions/admin/plans'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'County STEM Exam Sprint Pass',
        plan_code: 'county_sprint_60',
        target_audience: 'student',
        price_kes: 400.00,
        duration_days: 60,
        max_students: 1,
        description: '60 days intensive prep pass'
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.plan.plan_code, 'county_sprint_60');

    // Verify audit log
    const audit = mockAuditLogs.find(a => a.action === 'CREATE_SUBSCRIPTION_PLAN');
    assert.ok(audit, 'CREATE_SUBSCRIPTION_PLAN audit log should be recorded');
  });

  it('5. PATCH /api/subscriptions/admin/plans/:id/toggle toggles plan active status', async () => {
    const res = await fetch(url('/api/subscriptions/admin/plans/1/toggle'), {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.plan.is_active, false); // was true, now false

    const audit = mockAuditLogs.find(a => a.action === 'TOGGLE_SUBSCRIPTION_PLAN');
    assert.ok(audit, 'TOGGLE_SUBSCRIPTION_PLAN audit log should be recorded');
  });

  it('6. POST /api/subscriptions/admin/activate issues manual license and logs audit event', async () => {
    const res = await fetch(url('/api/subscriptions/admin/activate'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        subscriberType: 'school',
        schoolId: 10,
        planId: 2,
        referenceCode: 'CHEQUE-NCBA-10029',
        notes: 'MoE subvention grant 2026'
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.subscription);

    const audit = mockAuditLogs.find(a => a.action === 'MANUAL_LICENSE_ACTIVATION');
    assert.ok(audit, 'MANUAL_LICENSE_ACTIVATION audit log recorded');
  });

  it('7. POST /api/subscriptions/admin/extend extends subscription duration', async () => {
    const res = await fetch(url('/api/subscriptions/admin/extend'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        subscriptionId: 101,
        days: 90,
        notes: 'Term III practical extension'
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.subscription);

    const audit = mockAuditLogs.find(a => a.action === 'EXTEND_SUBSCRIPTION');
    assert.ok(audit, 'EXTEND_SUBSCRIPTION audit log recorded');
  });

  it('8. POST /api/subscriptions/admin/revoke revokes an active subscription', async () => {
    const res = await fetch(url('/api/subscriptions/admin/revoke'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        subscriptionId: 101,
        reason: 'Payment reversed by school bursar'
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.subscription.status, 'cancelled');

    const audit = mockAuditLogs.find(a => a.action === 'REVOKE_SUBSCRIPTION');
    assert.ok(audit, 'REVOKE_SUBSCRIPTION audit log recorded');
  });

  it('9. GET /api/admin/export/transactions downloads CSV ledger', async () => {
    const res = await fetch(url('/api/admin/export/transactions'), {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    assert.strictEqual(res.status, 200);
    const contentType = res.headers.get('content-type');
    assert.ok(contentType.includes('text/csv'));
    const text = await res.text();
    assert.ok(text.includes('Transaction ID'));
    assert.ok(text.includes('Reference Code'));
  });

});
