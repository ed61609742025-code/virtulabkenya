// ============================================================
//  VirtuLab Kenya — Seed Script
// ============================================================
//
// Creates one school and one teacher account so registration
// and login can actually be tested end to end. Nothing in the
// app can create a school on its own — school rows are meant
// to be set up by an admin, not by self-registration.
//
// Usage:
//   node db/seed.js
//
// Safe to re-run: skips creating rows that already exist instead
// of erroring or duplicating them.

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./pool');

const SCHOOL_NAME = 'VirtuLab Demo School';
const SCHOOL_COUNTY = 'Nairobi';
const SCHOOL_CODE = 'DEMO001';

const TEACHER_NAME = 'Demo Teacher';
const TEACHER_EMAIL = 'teacher@demo.ac.ke';
const TEACHER_PASSWORD = 'password123'; // change after first login
const TEACHER_CODE = 'MWALIMU01';

async function seed() {
  try {
    // ── School ──────────────────────────────────────────────
    let schoolResult = await pool.query(
      'SELECT id FROM schools WHERE admin_code = $1',
      [SCHOOL_CODE]
    );

    let schoolId;
    if (schoolResult.rows.length > 0) {
      schoolId = schoolResult.rows[0].id;
      console.log(`School already exists (id ${schoolId}), skipping.`);
    } else {
      const insertSchool = await pool.query(
        `INSERT INTO schools (name, county, admin_code)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [SCHOOL_NAME, SCHOOL_COUNTY, SCHOOL_CODE]
      );
      schoolId = insertSchool.rows[0].id;
      console.log(`Created school "${SCHOOL_NAME}" (id ${schoolId}).`);
    }

    // ── Teacher ─────────────────────────────────────────────
    const existingTeacher = await pool.query(
      'SELECT id FROM teachers WHERE email = $1',
      [TEACHER_EMAIL]
    );

    if (existingTeacher.rows.length > 0) {
      console.log('Teacher already exists, skipping.');
    } else {
      const passwordHash = await bcrypt.hash(TEACHER_PASSWORD, 10);
      await pool.query(
        `INSERT INTO teachers (school_id, name, email, password_hash, teacher_code)
         VALUES ($1, $2, $3, $4, $5)`,
        [schoolId, TEACHER_NAME, TEACHER_EMAIL, passwordHash, TEACHER_CODE]
      );
      console.log(`Created teacher account: ${TEACHER_EMAIL}`);
    }

    console.log('\nSeed complete. Test credentials:');
    console.log(`  School registration code: ${SCHOOL_CODE}`);
    console.log(`  Teacher login: ${TEACHER_EMAIL} / ${TEACHER_PASSWORD}`);
    console.log(`  Teacher code (give this to students): ${TEACHER_CODE}`);
    console.log('\nUse the school code and teacher code above to register a student account.');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
