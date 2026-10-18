// ============================================================
//  VirtuLab Kenya — Comprehensive End-to-End User Journey Test Suite
//  Standard: KNEC KCSE Chemistry Paper 3 (233/3) & CBC STEM Guidelines
// ============================================================
//
// Validates the full multi-role academic pipeline:
//  Phase 1: Institutional Provisioning & Multi-Role Onboarding
//  Phase 2: Teacher Prescribes KNEC KCSE Practical Assignment
//  Phase 3: Candidate Executes Virtual Bench Manipulations
//  Phase 4: Automated KNEC Marking & Rubric Scoring Engine
//  Phase 5: Teacher Gradebook Review & Telemetry Synchronization
// ============================================================

process.env.NODE_ENV = 'test';

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');

const pool = require('../db/pool');
const originalQuery = pool.query;
const app = require('../index');
const KnecGrading = require('../../client/shared/knec-grading.js');

let server;
let port = 0;
let adminToken;
let teacherToken;
let studentToken;

function url(path) {
  return `http://127.0.0.1:${port}${path}`;
}

describe('VirtuLab Kenya — Full End-to-End User Journey Test Suite', () => {

  before(async () => {
    process.env.JWT_SECRET = 'vlk_e2e_super_secure_jwt_secret_2026';
    process.env.ADMIN_EMAIL = 'admin@virtulab.co.ke';
    process.env.ADMIN_PASSWORD = 'VirtuLabAdmin2025!';

    adminToken = jwt.sign(
      { id: 0, role: 'admin', name: 'Ministry System Admin', email: 'admin@virtulab.co.ke' },
      process.env.JWT_SECRET
    );

    teacherToken = jwt.sign(
      { id: 201, role: 'teacher', name: 'Mr. Otieno J.', email: 'otieno@alliance.ac.ke', school_id: 101 },
      process.env.JWT_SECRET
    );

    studentToken = jwt.sign(
      { id: 1001, role: 'student', name: 'Kiprono Koech', email: 'kiprono@alliance.ac.ke', form: 'Form 4', school_id: 101 },
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
    await pool.end().catch(() => {});
  });

  beforeEach(() => {
    pool.query = originalQuery;
  });

  // ============================================================
  //  PHASE 1: Institutional Provisioning & Multi-Role Onboarding
  // ============================================================
  describe('Phase 1: Institutional Provisioning & Multi-Role Onboarding', () => {

    it('1.1 Admin provisions new secondary school institution', async () => {
      pool.query = async (text, params) => {
        if (text.includes('INSERT INTO schools')) {
          return {
            rows: [{
              id: 101,
              name: 'Alliance High School',
              county: 'Kiambu',
              admin_code: 'ALL-2026-STEM',
              created_at: new Date().toISOString()
            }]
          };
        }
        if (text.includes('INSERT INTO audit_logs')) {
          return { rows: [{ id: 1 }] };
        }
        return { rows: [] };
      };

      const res = await fetch(url('/api/admin/schools'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: 'Alliance High School',
          county: 'Kiambu',
          adminCode: 'ALL-2026-STEM'
        })
      });

      const body = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.school.name, 'Alliance High School');
      assert.strictEqual(body.school.county, 'Kiambu');
    });

    it('1.2 Chemistry teacher registers under institutional school code', async () => {
      pool.query = async (text, params) => {
        if (text.includes('SELECT id FROM schools WHERE admin_code')) {
          return { rows: [{ id: 101 }] };
        }
        if (text.includes('SELECT id FROM teachers WHERE email')) {
          return { rows: [] };
        }
        if (text.includes('INSERT INTO teachers')) {
          return {
            rows: [{
              id: 201,
              name: 'Mr. Otieno J.',
              email: 'otieno@alliance.ac.ke',
              school_id: 101,
              teacher_code: 'TCH-ALL-01'
            }]
          };
        }
        return { rows: [] };
      };

      const res = await fetch(url('/api/auth/teacher/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Mr. Otieno J.',
          email: 'otieno@alliance.ac.ke',
          password: 'SecureTeacherPassword2026!',
          schoolCode: 'ALL-2026-STEM'
        })
      });

      const body = await res.json();
      assert.strictEqual(res.status, 201);
      assert.ok(body.token);
      assert.strictEqual(body.user.role, 'teacher');
      assert.strictEqual(body.user.name, 'Mr. Otieno J.');
    });

    it('1.3 Form 4 candidate registers, binds teacher code, and enrolls in class', async () => {
      pool.query = async (text, params) => {
        if (text.includes('SELECT id FROM schools WHERE admin_code')) {
          return { rows: [{ id: 101 }] };
        }
        if (text.includes('SELECT id, school_id FROM teachers WHERE UPPER(teacher_code)')) {
          return { rows: [{ id: 201, school_id: 101 }] };
        }
        if (text.includes('SELECT id FROM students WHERE email')) {
          return { rows: [] };
        }
        if (text.includes('INSERT INTO students')) {
          return {
            rows: [{
              id: 1001,
              name: 'Kiprono Koech',
              email: 'kiprono@alliance.ac.ke',
              form: 'Form 4',
              school_id: 101,
              teacher_id: 201
            }]
          };
        }
        return { rows: [] };
      };

      const res = await fetch(url('/api/auth/student/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Kiprono Koech',
          email: 'kiprono@alliance.ac.ke',
          password: 'CandidatePassword2026!',
          form: 'Form 4',
          schoolCode: 'ALL-2026-STEM',
          teacherCode: 'TCH-ALL-01'
        })
      });

      const body = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(body.user.name, 'Kiprono Koech');
      assert.strictEqual(body.user.form, 'Form 4');
    });

    it('1.4 Verified student profile returns institutional affiliation and linked teacher', async () => {
      pool.query = async (text, params) => {
        if (text.includes('FROM students') && text.includes('LEFT JOIN teachers')) {
          return {
            rows: [{
              id: 1001,
              name: 'Kiprono Koech',
              email: 'kiprono@alliance.ac.ke',
              form: 'Form 4',
              school_id: 101,
              school_name: 'Alliance High School',
              county: 'Kiambu',
              teacher_id: 201,
              teacher_name: 'Mr. Otieno J.',
              teacher_code: 'TCH-ALL-01',
              experiments_completed: 0,
              avg_score: 0
            }]
          };
        }
        return { rows: [] };
      };

      const res = await fetch(url('/api/students/profile'), {
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });

      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.student.school_name, 'Alliance High School');
      assert.strictEqual(body.student.teacher_name, 'Mr. Otieno J.');
      assert.strictEqual(body.student.form, 'Form 4');
    });

  });

  // ============================================================
  //  PHASE 2: Teacher Prescribes KNEC KCSE Practical Assignment
  // ============================================================
  describe('Phase 2: Teacher Prescribes KNEC KCSE Practical Assignment', () => {

    it('2.1 Teacher creates KNEC Paper 3 trial practical assignment', async () => {
      pool.query = async (text, params) => {
        if (text.includes('SELECT school_id FROM teachers WHERE id')) {
          return { rows: [{ school_id: 101 }] };
        }
        if (text.includes('INSERT INTO assignments')) {
          return {
            rows: [{
              id: 501,
              teacher_id: 201,
              school_id: 101,
              title: 'KCSE 2026 National Practical Mock Exam (233/3)',
              instructions: 'Complete Question 1 (Volumetric), Question 2 (Qualitative Solid P), and Question 3 (Organic Liquid F).',
              due_date: new Date(Date.now() + 86400000).toISOString(),
              created_at: new Date().toISOString()
            }]
          };
        }
        if (text.includes('SELECT id FROM students WHERE teacher_id')) {
          return { rows: [{ id: 1001 }] };
        }
        if (text.includes('INSERT INTO notifications')) {
          return { rows: [{ id: 1 }] };
        }
        return { rows: [] };
      };

      const res = await fetch(url('/api/assignments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherToken}`
        },
        body: JSON.stringify({
          title: 'KCSE 2026 National Practical Mock Exam (233/3)',
          instructions: 'Complete Question 1 (Volumetric), Question 2 (Qualitative Solid P), and Question 3 (Organic Liquid F).',
          dueDate: new Date(Date.now() + 86400000).toISOString()
        })
      });

      const body = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(body.assignment.id, 501);
      assert.strictEqual(body.assignment.title, 'KCSE 2026 National Practical Mock Exam (233/3)');
    });

    it('2.2 Candidate queries active assignments and retrieves assigned practical', async () => {
      pool.query = async (text, params) => {
        if (text.includes('SELECT teacher_id, school_id FROM students WHERE id')) {
          return { rows: [{ teacher_id: 201, school_id: 101 }] };
        }
        if (text.includes('FROM assignments')) {
          return {
            rows: [{
              id: 501,
              title: 'KCSE 2026 National Practical Mock Exam (233/3)',
              instructions: 'Complete Question 1 (Volumetric), Question 2 (Qualitative Solid P), and Question 3 (Organic Liquid F).',
              due_date: new Date(Date.now() + 86400000).toISOString(),
              teacher_name: 'Mr. Otieno J.',
              submitted: false
            }]
          };
        }
        return { rows: [] };
      };

      const res = await fetch(url('/api/assignments/mine'), {
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });

      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.assignments.length, 1);
      assert.strictEqual(body.assignments[0].id, 501);
      assert.strictEqual(body.assignments[0].submitted, false);
    });

  });

  // ============================================================
  //  PHASE 3: Candidate Executes Virtual Bench Manipulations
  // ============================================================
  describe('Phase 3: Candidate Executes Virtual Bench Manipulations', () => {

    it('3.1 Q1 Volumetric Titration: computes concordant titres, average titre, and stoichiometry', () => {
      // Authentic KNEC KCSE Titration Data (Standardized HCl vs 0.100 M Na2CO3)
      const trial1 = { initial: 0.00, final: 21.40, titre: 21.40 };
      const trial2 = { initial: 0.00, final: 21.50, titre: 21.50 };
      const trial3 = { initial: 0.00, final: 21.40, titre: 21.40 };

      // Titre calculations
      assert.strictEqual(trial1.final - trial1.initial, 21.40);
      assert.strictEqual(trial2.final - trial2.initial, 21.50);
      assert.strictEqual(trial3.final - trial3.initial, 21.40);

      // Concordancy check (all within ±0.20 cm³, here strictly ±0.10 cm³)
      const titres = [trial1.titre, trial2.titre, trial3.titre];
      const maxTitre = Math.max(...titres);
      const minTitre = Math.min(...titres);
      const isConcordant = (maxTitre - minTitre) <= 0.20;
      assert.strictEqual(isConcordant, true);

      // Average titre calculation
      const avgTitre = parseFloat((titres.reduce((a, b) => a + b, 0) / titres.length).toFixed(2));
      assert.strictEqual(avgTitre, 21.43);

      // Stoichiometric calculations:
      // Na2CO3(aq) + 2HCl(aq) -> 2NaCl(aq) + CO2(g) + H2O(l)
      // Pipette volume = 25.0 cm³, Na2CO3 Molarity = 0.100 M
      const molesNa2CO3 = (0.100 * 25.0) / 1000.0; // 0.00250 mol
      assert.strictEqual(molesNa2CO3, 0.00250);

      const molesHCl = molesNa2CO3 * 2; // 0.00500 mol
      assert.strictEqual(molesHCl, 0.00500);

      const molarityHCl = parseFloat(((molesHCl * 1000.0) / avgTitre).toFixed(4));
      assert.strictEqual(molarityHCl, 0.2333); // 0.005 / 0.02143 = 0.2333 M
    });

    it('3.2 Q2 Qualitative Analysis: records exact KNEC observations and inferences for Solid P (ZnSO4)', async () => {
      pool.query = async (text, params) => {
        if (text.includes('INSERT INTO qualitative_sessions')) {
          return {
            rows: [{
              id: 901,
              student_id: 1001,
              salt_key: 'zincSulfate',
              salt_name: 'Zinc Sulfate',
              student_cation: 'Zn²⁺',
              student_anion: 'SO₄²⁻',
              cation_correct: true,
              anion_correct: true,
              correct: true
            }]
          };
        }
        return { rows: [] };
      };

      const qualitativePayload = {
        saltKey: 'zincSulfate',
        saltName: 'Zinc Sulfate',
        studentCation: 'Zn²⁺',
        studentAnion: 'SO₄²⁻',
        testsPerformed: 4,
        testsCorrect: 4,
        observations: [
          {
            test: 'Water dissolution',
            observation: 'Dissolves completely to form a colourless solution',
            inference: 'Soluble salt; Absence of colored transition metal ions (Fe²⁺, Fe³⁺, Cu²⁺)'
          },
          {
            test: 'Aqueous NaOH dropwise and in excess',
            observation: 'White precipitate formed, soluble in excess NaOH to form a colourless solution',
            inference: 'Al³⁺, Pb²⁺, or Zn²⁺ present'
          },
          {
            test: 'Aqueous NH3 dropwise and in excess',
            observation: 'White precipitate formed, soluble in excess aqueous ammonia to form a colourless solution',
            inference: 'Zn²⁺ confirmed'
          },
          {
            test: 'Barium nitrate followed by dilute HNO3',
            observation: 'White precipitate formed, insoluble in dilute nitric acid (HNO₃)',
            inference: 'SO₄²⁻ confirmed'
          }
        ]
      };

      const res = await fetch(url('/api/qualitative'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify(qualitativePayload)
      });

      const body = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(body.session.cation_correct, true);
      assert.strictEqual(body.session.anion_correct, true);
      assert.strictEqual(body.session.correct, true);
    });

    it('3.3 Q3 Organic Analysis: records diagnostic observations for Liquid F (Ethanoic Acid)', async () => {
      pool.query = async (text, params) => {
        if (text.includes('INSERT INTO organic_sessions')) {
          return {
            rows: [{
              id: 902,
              student_id: 1001,
              compound_key: 'org_acid',
              compound_name: 'Ethanoic Acid',
              student_functional_group: 'Carboxylic Acid',
              functional_group_correct: true,
              score_pct: 100,
              correct: true,
              created_at: new Date().toISOString()
            }]
          };
        }
        return { rows: [] };
      };

      const organicPayload = {
        compound_key: 'org_acid',
        compound_name: 'Ethanoic Acid',
        student_functional_group: 'Carboxylic Acid',
        tests_performed: 4,
        tests_correct: 4,
        observations: [
          { test: 'Flame Ignition', observation: 'Burns with a non-luminous blue flame without soot' },
          { test: 'Litmus Paper', observation: 'Blue litmus paper turns red; red litmus paper remains red' },
          { test: 'Sodium Hydrogen Carbonate', observation: 'Vigorous effervescence of a colourless gas which forms a white precipitate with limewater' },
          { test: 'Acidified KMnO4', observation: 'Purple acidified potassium manganate(VII) solution does not decolorize' }
        ]
      };

      const res = await fetch(url('/api/organic'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify(organicPayload)
      });

      const body = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(body.session.functional_group_correct, true);
      assert.strictEqual(body.session.correct, true);
    });

  });

  // ============================================================
  //  PHASE 4: Automated KNEC Marking & Rubric Evaluation Engine
  // ============================================================
  describe('Phase 4: Automated KNEC Marking & Rubric Evaluation Engine', () => {

    it('4.1 Server evaluates complete 40-mark Paper 3 examination booklet submission', async () => {
      pool.query = async (text, params) => {
        if (text.includes('INSERT INTO composite_sessions')) {
          return {
            rows: [{
              id: 701,
              student_id: 1001,
              exam_title: 'KCSE Chemistry Paper 3 Practical Exam',
              q1_score: 14.5,
              q2_score: 14.0,
              q3_score: 10.0,
              total_score: 38.5,
              grade: 'A',
              created_at: new Date().toISOString()
            }]
          };
        }
        return { rows: [] };
      };

      const examSubmission = {
        assignment_id: 501,
        exam_title: 'KCSE Chemistry Paper 3 Practical Exam',
        q1_score: 14.5,
        q2_score: 14.0,
        q3_score: 10.0,
        duration_seconds: 4800,
        details: {
          q1: { titre: 21.43, teacherReference: 21.40, maxScore: 15 },
          q2: { salt: 'Zinc Sulfate', cation: 'Zn²⁺', anion: 'SO₄²⁻', maxScore: 15 },
          q3: { functionalGroup: 'Carboxylic Acid', compound: 'Ethanoic Acid', maxScore: 10 }
        }
      };

      const res = await fetch(url('/api/composite'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify(examSubmission)
      });

      const body = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(body.total_score, 38.5);
      assert.strictEqual(body.knec_grade, 'A');
      assert.strictEqual(body.breakdown.q1, 14.5);
      assert.strictEqual(body.breakdown.q2, 14.0);
      assert.strictEqual(body.breakdown.q3, 10.0);
    });

    it('4.2 Strictly enforces KNEC technical penalty rules (accuracy and concordance deductions)', () => {
      // KNEC Titre Accuracy Penalty Table:
      // |Candidate - Teacher| <= 0.10 cm³ -> 0 penalty (Full 5 marks)
      // 0.10 < Error <= 0.20 cm³ -> 1 mark penalty
      // Error > 0.20 cm³ -> 2 marks penalty
      const teacherTitre = 21.40;

      function calculateAccuracyMarks(candTitre, refTitre) {
        const diff = Math.abs(candTitre - refTitre);
        if (diff <= 0.10) return 5.0;
        if (diff <= 0.20) return 4.0;
        return 3.0;
      }

      assert.strictEqual(calculateAccuracyMarks(21.45, teacherTitre), 5.0); // diff = 0.05
      assert.strictEqual(calculateAccuracyMarks(21.55, teacherTitre), 4.0); // diff = 0.15
      assert.strictEqual(calculateAccuracyMarks(21.80, teacherTitre), 3.0); // diff = 0.40

      // Official KNEC 12-point grading scale verification
      assert.strictEqual(KnecGrading.calculateKnecGrade(38.5, 40.0), 'A');   // 96.25%
      assert.strictEqual(KnecGrading.calculateKnecGrade(31.0, 40.0), 'A-');  // 77.5%
      assert.strictEqual(KnecGrading.calculateKnecGrade(28.0, 40.0), 'B+');  // 70.0%
      assert.strictEqual(KnecGrading.calculateKnecGrade(26.0, 40.0), 'B');   // 65.0%
      assert.strictEqual(KnecGrading.calculateKnecGrade(20.0, 40.0), 'C');   // 50.0%
      assert.strictEqual(KnecGrading.calculateKnecGrade(10.0, 40.0), 'E');   // 25.0%
    });

  });

  // ============================================================
  //  PHASE 5: Teacher Gradebook Review & Telemetry Synchronization
  // ============================================================
  describe('Phase 5: Teacher Gradebook Review & Telemetry Synchronization', () => {

    it('5.1 Teacher accesses classroom submissions and retrieves marked student paper', async () => {
      pool.query = async (text, params) => {
        if (text.includes('FROM assignment_submissions') || text.includes('FROM composite_sessions')) {
          return {
            rows: [{
              id: 801,
              assignment_id: 501,
              student_id: 1001,
              student_name: 'Kiprono Koech',
              student_email: 'kiprono@alliance.ac.ke',
              student_form: 'Form 4',
              score: 38.5,
              max_score: 40.0,
              knec_grade: 'A',
              knec_points: 12,
              submitted_at: new Date().toISOString(),
              feedback: 'Outstanding experimental technique. Precise meniscus readings and accurate cation confirmation.'
            }]
          };
        }
        return { rows: [] };
      };

      const res = await fetch(url('/api/assignments/submissions/all'), {
        headers: { 'Authorization': `Bearer ${teacherToken}` }
      });

      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.submissions.length, 1);
      assert.strictEqual(body.submissions[0].student_name, 'Kiprono Koech');
      assert.strictEqual(body.submissions[0].score, 38.5);
      assert.strictEqual(body.submissions[0].knec_grade, 'A');
    });

    it('5.2 Teacher enters pedagogical endorsement and confirms marks', async () => {
      pool.query = async (text, params) => {
        if (text.includes('UPDATE assignment_submissions') || text.includes('UPDATE composite_sessions')) {
          return {
            rows: [{
              id: 801,
              score: 39.0,
              teacher_feedback: 'Mark verified. Well-executed organic functional group sequence.'
            }]
          };
        }
        return { rows: [] };
      };

      const res = await fetch(url('/api/assignments/submissions/801/mark'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherToken}`
        },
        body: JSON.stringify({
          score: 39.0,
          feedback: 'Mark verified. Well-executed organic functional group sequence.'
        })
      });

      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.success, true);
    });

    it('5.3 Candidate history records completed exam with Grade A and updated telemetry', async () => {
      pool.query = async (text, params) => {
        if (text.includes('CREATE TABLE')) {
          return { rows: [] };
        }
        if (text.includes('composite_sessions') && text.includes('WHERE student_id')) {
          return {
            rows: [{
              id: 701,
              student_id: 1001,
              exam_title: 'KCSE Chemistry Paper 3 Practical Exam',
              total_score: 39.0,
              grade: 'A',
              created_at: new Date().toISOString()
            }]
          };
        }
        return { rows: [] };
      };

      const res = await fetch(url('/api/composite/mine'), {
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });

      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.sessions.length, 1);
      assert.strictEqual(body.sessions[0].grade, 'A');
      assert.strictEqual(body.sessions[0].total_score, 39.0);
    });

    it('5.4 Student profile analytics reflect cumulative exam mastery and STEM readiness', async () => {
      pool.query = async (text, params) => {
        if (text.includes('FROM students') && text.includes('LEFT JOIN teachers')) {
          return {
            rows: [{
              id: 1001,
              name: 'Kiprono Koech',
              form: 'Form 4',
              school_name: 'Alliance High School',
              county: 'Kiambu',
              experiments_completed: 1,
              avg_score: 97.5,
              latest_grade: 'A'
            }]
          };
        }
        return { rows: [] };
      };

      const res = await fetch(url('/api/students/profile'), {
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });

      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.student.experiments_completed, 1);
      assert.strictEqual(body.student.avg_score, 97.5);
      assert.strictEqual(body.student.latest_grade, 'A');
    });

  });

});
