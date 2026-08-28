process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_99999999999999999';
process.env.ADMIN_EMAIL = 'admin@virtulab.co.ke';
process.env.ADMIN_PASSWORD = 'VirtuLabMaster2026!';

const assert = require('assert');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock Pool for testing without live DB connection
const mockAdmins = [];
let nextId = 1;

const mockPool = {
  async query(text, params) {
    const q = text.trim();

    if (q.includes('FROM admins WHERE LOWER(email) = LOWER($1)')) {
      const email = params[0].toLowerCase();
      const admin = mockAdmins.find(a => a.email.toLowerCase() === email);
      return { rows: admin ? [admin] : [] };
    }

    if (q.includes('FROM admins WHERE id = $1')) {
      const id = params[0];
      const admin = mockAdmins.find(a => a.id === id);
      return { rows: admin ? [admin] : [] };
    }

    if (q.includes('INSERT INTO admins')) {
      const [name, email, passwordHash, role, createdBy] = params;
      const newAdmin = {
        id: nextId++,
        name,
        email,
        password_hash: passwordHash,
        role: role || 'admin',
        status: 'active',
        created_by: createdBy || null,
        created_at: new Date(),
        last_login: null
      };
      mockAdmins.push(newAdmin);
      return { rows: [newAdmin] };
    }

    if (q.includes('UPDATE admins') && q.includes('SET status = $1')) {
      const [status, id] = params;
      const admin = mockAdmins.find(a => a.id === id);
      if (admin) admin.status = status;
      return { rows: admin ? [admin] : [] };
    }

    if (q.includes('UPDATE admins') && q.includes('SET password_hash = $1')) {
      const [hash, id] = params;
      const admin = mockAdmins.find(a => a.id === id);
      if (admin) admin.password_hash = hash;
      return { rows: admin ? [admin] : [] };
    }

    if (q.includes('UPDATE admins SET last_login = NOW()')) {
      const id = params[0];
      const admin = mockAdmins.find(a => a.id === id);
      if (admin) admin.last_login = new Date();
      return { rows: [] };
    }

    if (q.includes('SELECT COUNT(*) AS cnt FROM admins WHERE role =')) {
      const activeSuper = mockAdmins.filter(a => a.role === 'superadmin' && a.status === 'active');
      return { rows: [{ cnt: activeSuper.length }] };
    }

    if (q.includes('SELECT COUNT(*) AS cnt FROM admins')) {
      return { rows: [{ cnt: mockAdmins.length }] };
    }

    if (q.includes('FROM admins a')) {
      return { rows: [...mockAdmins] };
    }

    return { rows: [] };
  }
};

// Override pool in adminRepo
const pool = require('../db/pool');
pool.query = mockPool.query;

const adminRepo = require('../repositories/adminRepo');

async function runTests() {
  console.log('\n--- 🧪 Multi-Admin Verification Suite ---\n');

  // Test 1: Auto-create initial Super Admin
  console.log('Test 1: Creating initial Super Admin...');
  const hash1 = await bcrypt.hash('VirtuLabMaster2026!', 10);
  const superAdmin = await adminRepo.createAdmin({
    name: 'Lead Researcher',
    email: 'admin@virtulab.co.ke',
    passwordHash: hash1,
    role: 'superadmin'
  });

  assert.strictEqual(superAdmin.id, 1);
  assert.strictEqual(superAdmin.role, 'superadmin');
  assert.strictEqual(superAdmin.status, 'active');
  console.log('✓ Initial Super Admin created:', superAdmin.email, `(Role: ${superAdmin.role})`);

  // Test 2: Find Admin by email
  console.log('\nTest 2: Lookup Admin by email...');
  const found = await adminRepo.findAdminByEmail('ADMIN@VIRTULAB.CO.KE');
  assert.ok(found);
  assert.strictEqual(found.id, 1);
  console.log('✓ Case-insensitive lookup successful');

  // Test 3: Create secondary Admin (e.g. Regional Coordinator)
  console.log('\nTest 3: Creating secondary Administrator...');
  const hash2 = await bcrypt.hash('Coordinator2026!', 10);
  const secondAdmin = await adminRepo.createAdmin({
    name: 'Dr. Jane Kamau',
    email: 'jkamau@virtulab.co.ke',
    passwordHash: hash2,
    role: 'admin',
    createdBy: superAdmin.id
  });

  assert.strictEqual(secondAdmin.id, 2);
  assert.strictEqual(secondAdmin.role, 'admin');
  assert.strictEqual(secondAdmin.status, 'active');
  console.log('✓ Secondary Administrator created:', secondAdmin.email, `(Role: ${secondAdmin.role})`);

  // Test 4: Verify distinct credentials
  console.log('\nTest 4: Password verification with bcrypt...');
  const match1 = await bcrypt.compare('VirtuLabMaster2026!', superAdmin.password_hash);
  const match2 = await bcrypt.compare('Coordinator2026!', secondAdmin.password_hash);
  const failMatch = await bcrypt.compare('WrongPassword!', secondAdmin.password_hash);

  assert.strictEqual(match1, true);
  assert.strictEqual(match2, true);
  assert.strictEqual(failMatch, false);
  console.log('✓ Bcrypt passwords verified independently');

  // Test 5: Suspend an admin
  console.log('\nTest 5: Suspending secondary administrator...');
  const suspended = await adminRepo.updateAdminStatus(secondAdmin.id, 'suspended');
  assert.strictEqual(suspended.status, 'suspended');

  const checkSuspended = await adminRepo.findAdminById(secondAdmin.id);
  assert.strictEqual(checkSuspended.status, 'suspended');
  console.log('✓ Administrator status changed to suspended');

  // Test 6: Reactivate an admin
  console.log('\nTest 6: Reactivating secondary administrator...');
  const reactivated = await adminRepo.updateAdminStatus(secondAdmin.id, 'active');
  assert.strictEqual(reactivated.status, 'active');
  console.log('✓ Administrator status changed to active');

  // Test 7: Super Admin safeguard check
  console.log('\nTest 7: Super Admin safeguard count...');
  const superCount = await adminRepo.countSuperAdmins();
  assert.strictEqual(superCount, 1);
  console.log(`✓ Active Super Admins count: ${superCount} (Prevents accidental lockout)`);

  // Test 8: Reset Admin Password
  console.log('\nTest 8: Resetting administrator password...');
  const newHash = await bcrypt.hash('NewTempPassword123!', 10);
  const updatedPw = await adminRepo.updateAdminPassword(secondAdmin.id, newHash);
  assert.strictEqual(updatedPw.id, secondAdmin.id);

  const newMatch = await bcrypt.compare('NewTempPassword123!', updatedPw.password_hash);
  assert.strictEqual(newMatch, true);
  console.log('✓ Administrator password reset successful');

  console.log('\n============================================================');
  console.log('  🎉 ALL 8 MULTI-ADMIN ARCHITECTURAL TESTS PASSED!');
  console.log('============================================================\n');

  await pool.end().catch(() => {});
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
