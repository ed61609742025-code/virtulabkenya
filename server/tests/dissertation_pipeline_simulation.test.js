// ============================================================
//  VirtuLab Kenya — Dissertation Research Pipeline Simulation Suite
//  Master's in Learning Design & Technology (Chapter 4 Validation)
// ============================================================
//
//  Validates the end-to-end empirical research pipeline:
//    CPCAT Pre-Test -> Virtual Chemistry Labs -> CPCAT Post-Test -> SUS -> TAM 3
//
//  Tests:
//    1. Cohort simulation of N = 40 Form 4 candidates across 4 Kenyan secondary schools
//    2. Paired Student's t-test (exact p-value via incomplete beta function, df = 39)
//    3. Hake's normalized learning gain (individual gi and group g)
//    4. Repeated-measures Cohen's dz and independent pooled d
//    5. System Usability Scale (SUS) 10-item Brooke scoring & Sauro-Lewis percentiles
//    6. Technology Acceptance Model (TAM 3) construct aggregation (PU, PEOU, FC, BI)
//    7. Cronbach's alpha internal consistency reliability (α >= 0.80)
//    8. Teacher Research Portal API endpoints (auth guard, summary, export)
//    9. SPSS / R / Python RFC 4180 CSV export compliance & parser round-trip
// ============================================================

process.env.NODE_ENV = 'test';

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');

const pool = require('../db/pool');
const originalQuery = pool.query;
const originalConnect = pool.connect;
const app = require('../index');
const stats = require('../utils/statistics');
const researchRepo = require('../repositories/researchRepo');

let server;
let port = 0;
let studentTokens = {};
let teacherToken;
let adminToken;

function url(path) {
  return `http://127.0.0.1:${port}${path}`;
}

// ─────────────────────────────────────────────────────────────
//  Cohort Dataset: 40 Form 4 Kenyan Secondary School Candidates
// ─────────────────────────────────────────────────────────────
const COHORT = [
  // Alliance High School (Kiambu County) — 10 candidates
  { id: 1001, name: 'Kiprono Koech', school_id: 1, school_name: 'Alliance High School', form: 'Form 4', pre: 19.5, post: 33.0, sus: [5,1,5,2,4,1,5,1,4,2], tam: { PU:[5,5,4], PEOU:[4,5,4], FC:[4,5,4], BI:[5,5,5] } },
  { id: 1002, name: 'Brian Ochieng', school_id: 1, school_name: 'Alliance High School', form: 'Form 4', pre: 16.0, post: 30.5, sus: [4,2,5,1,4,2,4,1,5,1], tam: { PU:[4,5,5], PEOU:[4,4,5], FC:[4,4,4], BI:[5,4,5] } },
  { id: 1003, name: 'Daniel Njoroge', school_id: 1, school_name: 'Alliance High School', form: 'Form 4', pre: 22.0, post: 35.5, sus: [5,1,5,1,5,1,4,2,5,1], tam: { PU:[5,5,5], PEOU:[5,5,4], FC:[5,4,5], BI:[5,5,5] } },
  { id: 1004, name: 'Emmanuel Mutua', school_id: 1, school_name: 'Alliance High School', form: 'Form 4', pre: 14.5, post: 29.0, sus: [4,2,4,2,5,1,4,2,4,2], tam: { PU:[4,4,5], PEOU:[4,4,4], FC:[4,4,4], BI:[4,5,4] } },
  { id: 1005, name: 'Kevin Kiprop', school_id: 1, school_name: 'Alliance High School', form: 'Form 4', pre: 21.0, post: 34.0, sus: [5,1,4,1,5,2,5,1,5,1], tam: { PU:[5,5,4], PEOU:[4,5,5], FC:[4,4,5], BI:[5,5,5] } },
  { id: 1006, name: 'Samuel Kimani', school_id: 1, school_name: 'Alliance High School', form: 'Form 4', pre: 18.0, post: 31.5, sus: [4,2,5,2,4,1,4,1,4,2], tam: { PU:[4,5,4], PEOU:[4,4,4], FC:[4,5,4], BI:[5,4,4] } },
  { id: 1007, name: 'Victor Wambua', school_id: 1, school_name: 'Alliance High School', form: 'Form 4', pre: 17.5, post: 31.0, sus: [5,2,4,1,5,2,4,2,5,1], tam: { PU:[5,4,4], PEOU:[4,5,4], FC:[4,4,4], BI:[4,5,5] } },
  { id: 1008, name: 'Dennis Cheruiyot', school_id: 1, school_name: 'Alliance High School', form: 'Form 4', pre: 15.0, post: 28.5, sus: [4,1,4,2,4,2,5,1,4,2], tam: { PU:[4,4,4], PEOU:[4,4,4], FC:[4,4,4], BI:[4,4,5] } },
  { id: 1009, name: 'Collins Otieno', school_id: 1, school_name: 'Alliance High School', form: 'Form 4', pre: 23.5, post: 36.0, sus: [5,1,5,1,5,1,5,1,5,1], tam: { PU:[5,5,5], PEOU:[5,5,5], FC:[5,5,4], BI:[5,5,5] } },
  { id: 1010, name: 'Geoffrey Maina', school_id: 1, school_name: 'Alliance High School', form: 'Form 4', pre: 19.0, post: 32.5, sus: [4,2,5,1,4,1,4,2,5,1], tam: { PU:[5,4,5], PEOU:[4,5,4], FC:[4,4,5], BI:[5,5,4] } },

  // Kenya High School (Nairobi County) — 10 candidates
  { id: 1011, name: 'Amina Mwangi', school_id: 2, school_name: 'Kenya High School', form: 'Form 4', pre: 20.0, post: 34.5, sus: [5,1,5,1,4,1,5,1,5,2], tam: { PU:[5,5,5], PEOU:[5,5,4], FC:[5,4,5], BI:[5,5,5] } },
  { id: 1012, name: 'Faith Chebet', school_id: 2, school_name: 'Kenya High School', form: 'Form 4', pre: 17.0, post: 31.0, sus: [4,2,4,2,5,1,4,2,4,1], tam: { PU:[4,5,4], PEOU:[4,4,4], FC:[4,4,4], BI:[5,4,5] } },
  { id: 1013, name: 'Mercy Wanjiku', school_id: 2, school_name: 'Kenya High School', form: 'Form 4', pre: 22.5, post: 36.0, sus: [5,1,5,1,5,2,5,1,4,1], tam: { PU:[5,5,5], PEOU:[5,5,5], FC:[5,4,4], BI:[5,5,5] } },
  { id: 1014, name: 'Grace Kerubo', school_id: 2, school_name: 'Kenya High School', form: 'Form 4', pre: 18.5, post: 32.0, sus: [4,1,5,2,4,1,4,2,5,2], tam: { PU:[4,4,5], PEOU:[4,5,4], FC:[4,5,4], BI:[4,5,5] } },
  { id: 1015, name: 'Joyce Atieno', school_id: 2, school_name: 'Kenya High School', form: 'Form 4', pre: 16.5, post: 30.0, sus: [4,2,4,1,4,2,5,1,4,1], tam: { PU:[4,5,4], PEOU:[4,4,4], FC:[4,4,4], BI:[5,4,4] } },
  { id: 1016, name: 'Sharon Jelagat', school_id: 2, school_name: 'Kenya High School', form: 'Form 4', pre: 21.0, post: 34.5, sus: [5,1,5,2,5,1,4,1,5,1], tam: { PU:[5,5,4], PEOU:[5,4,5], FC:[4,5,5], BI:[5,5,5] } },
  { id: 1017, name: 'Brenda Achieng', school_id: 2, school_name: 'Kenya High School', form: 'Form 4', pre: 15.5, post: 29.5, sus: [4,2,4,2,4,1,4,2,4,1], tam: { PU:[4,4,4], PEOU:[4,4,4], FC:[4,4,4], BI:[4,5,4] } },
  { id: 1018, name: 'Lydia Muthoni', school_id: 2, school_name: 'Kenya High School', form: 'Form 4', pre: 23.0, post: 36.5, sus: [5,1,5,1,5,1,5,2,5,1], tam: { PU:[5,5,5], PEOU:[5,5,4], FC:[5,5,5], BI:[5,5,5] } },
  { id: 1019, name: 'Cynthia Nekesa', school_id: 2, school_name: 'Kenya High School', form: 'Form 4', pre: 19.5, post: 33.0, sus: [4,1,5,1,4,2,4,1,5,2], tam: { PU:[5,4,5], PEOU:[4,5,4], FC:[4,4,4], BI:[5,4,5] } },
  { id: 1020, name: 'Esther Moraa', school_id: 2, school_name: 'Kenya High School', form: 'Form 4', pre: 17.5, post: 31.5, sus: [5,2,4,2,4,1,5,1,4,1], tam: { PU:[4,5,4], PEOU:[4,4,5], FC:[4,4,5], BI:[5,5,4] } },

  // Lenana School (Nairobi County) — 10 candidates
  { id: 1021, name: 'Moses Kamau', school_id: 3, school_name: 'Lenana School', form: 'Form 4', pre: 18.0, post: 32.0, sus: [4,2,5,1,5,2,4,1,5,1], tam: { PU:[5,4,5], PEOU:[4,5,4], FC:[4,4,5], BI:[5,5,5] } },
  { id: 1022, name: 'Ian Kibet', school_id: 3, school_name: 'Lenana School', form: 'Form 4', pre: 16.0, post: 29.5, sus: [4,1,4,2,4,2,4,2,4,1], tam: { PU:[4,4,4], PEOU:[4,4,4], FC:[4,4,4], BI:[4,4,4] } },
  { id: 1023, name: 'Felix Onyango', school_id: 3, school_name: 'Lenana School', form: 'Form 4', pre: 20.5, post: 34.0, sus: [5,1,4,1,5,1,5,2,5,1], tam: { PU:[5,5,4], PEOU:[5,4,5], FC:[5,4,4], BI:[5,5,5] } },
  { id: 1024, name: 'George Mwangi', school_id: 3, school_name: 'Lenana School', form: 'Form 4', pre: 14.0, post: 28.0, sus: [4,2,4,2,4,2,4,1,4,2], tam: { PU:[4,4,4], PEOU:[4,4,4], FC:[4,4,4], BI:[4,4,4] } },
  { id: 1025, name: 'Kelvin Mutiso', school_id: 3, school_name: 'Lenana School', form: 'Form 4', pre: 21.5, post: 35.0, sus: [5,1,5,1,4,1,5,1,5,2], tam: { PU:[5,5,5], PEOU:[4,5,5], FC:[4,5,4], BI:[5,5,5] } },
  { id: 1026, name: 'Paul Kiptoo', school_id: 3, school_name: 'Lenana School', form: 'Form 4', pre: 17.0, post: 30.5, sus: [4,2,5,2,4,1,4,2,4,1], tam: { PU:[4,5,4], PEOU:[4,4,4], FC:[4,4,4], BI:[4,5,4] } },
  { id: 1027, name: 'Alex Barasa', school_id: 3, school_name: 'Lenana School', form: 'Form 4', pre: 19.0, post: 32.5, sus: [5,1,4,1,5,2,4,1,5,1], tam: { PU:[5,4,5], PEOU:[5,4,4], FC:[4,4,5], BI:[5,5,5] } },
  { id: 1028, name: 'David Kariuki', school_id: 3, school_name: 'Lenana School', form: 'Form 4', pre: 15.0, post: 29.0, sus: [4,2,4,2,4,1,4,2,4,2], tam: { PU:[4,4,4], PEOU:[4,4,4], FC:[4,4,4], BI:[4,4,5] } },
  { id: 1029, name: 'Allan Odhiambo', school_id: 3, school_name: 'Lenana School', form: 'Form 4', pre: 22.0, post: 35.5, sus: [5,1,5,1,5,1,5,1,4,1], tam: { PU:[5,5,5], PEOU:[5,5,4], FC:[5,4,5], BI:[5,5,5] } },
  { id: 1030, name: 'Stephen Wafula', school_id: 3, school_name: 'Lenana School', form: 'Form 4', pre: 18.5, post: 32.0, sus: [4,1,4,2,5,2,4,1,5,2], tam: { PU:[4,5,4], PEOU:[4,4,5], FC:[4,4,4], BI:[5,4,5] } },

  // Nairobi School (Nairobi County) — 10 candidates
  { id: 1031, name: "Antony Ndung'u", school_id: 4, school_name: 'Nairobi School', form: 'Form 4', pre: 19.0, post: 33.0, sus: [5,1,5,1,4,1,5,2,5,1], tam: { PU:[5,5,4], PEOU:[4,5,4], FC:[4,5,4], BI:[5,5,5] } },
  { id: 1032, name: 'Simon Rotich', school_id: 4, school_name: 'Nairobi School', form: 'Form 4', pre: 16.5, post: 30.0, sus: [4,2,4,2,4,2,4,1,4,1], tam: { PU:[4,4,4], PEOU:[4,4,4], FC:[4,4,4], BI:[4,5,4] } },
  { id: 1033, name: 'Joshua Omondi', school_id: 4, school_name: 'Nairobi School', form: 'Form 4', pre: 21.0, post: 34.5, sus: [5,1,5,1,5,2,5,1,5,1], tam: { PU:[5,5,5], PEOU:[5,4,5], FC:[5,4,5], BI:[5,5,5] } },
  { id: 1034, name: 'Erick Kiplagat', school_id: 4, school_name: 'Nairobi School', form: 'Form 4', pre: 15.5, post: 29.5, sus: [4,2,4,1,4,2,4,2,4,2], tam: { PU:[4,4,4], PEOU:[4,4,4], FC:[4,4,4], BI:[4,4,4] } },
  { id: 1035, name: 'Titus Mutuku', school_id: 4, school_name: 'Nairobi School', form: 'Form 4', pre: 20.0, post: 33.5, sus: [5,1,4,1,5,1,4,1,5,2], tam: { PU:[5,5,4], PEOU:[4,5,4], FC:[4,4,5], BI:[5,5,5] } },
  { id: 1036, name: 'Hassan Abdi', school_id: 4, school_name: 'Nairobi School', form: 'Form 4', pre: 17.5, post: 31.0, sus: [4,1,5,2,4,2,5,1,4,1], tam: { PU:[4,5,4], PEOU:[4,4,4], FC:[4,5,4], BI:[5,4,5] } },
  { id: 1037, name: 'Mark Wanjala', school_id: 4, school_name: 'Nairobi School', form: 'Form 4', pre: 22.5, post: 36.0, sus: [5,1,5,1,5,1,5,1,5,1], tam: { PU:[5,5,5], PEOU:[5,5,5], FC:[5,5,4], BI:[5,5,5] } },
  { id: 1038, name: 'Robert Kipkemboi', school_id: 4, school_name: 'Nairobi School', form: 'Form 4', pre: 14.5, post: 28.5, sus: [4,2,4,2,4,1,4,2,4,1], tam: { PU:[4,4,4], PEOU:[4,4,4], FC:[4,4,4], BI:[4,4,5] } },
  { id: 1039, name: 'Martin Githinji', school_id: 4, school_name: 'Nairobi School', form: 'Form 4', pre: 21.5, post: 35.0, sus: [5,1,5,2,4,1,5,1,5,1], tam: { PU:[5,5,5], PEOU:[5,4,4], FC:[4,5,5], BI:[5,5,5] } },
  { id: 1040, name: 'Jackson Mumo', school_id: 4, school_name: 'Nairobi School', form: 'Form 4', pre: 18.0, post: 32.0, sus: [4,2,4,1,5,2,4,2,5,2], tam: { PU:[4,5,4], PEOU:[4,5,4], FC:[4,4,4], BI:[5,5,4] } }
];

// Helper to generate section scores summing to total score
function generateSections(total) {
  // 40 max marks: Section A (14), Section B (12), Section C (8), Section D (6)
  const ratio = total / 40.0;
  const sA = parseFloat((14.0 * ratio).toFixed(1));
  const sB = parseFloat((12.0 * ratio).toFixed(1));
  const sC = parseFloat((8.0 * ratio).toFixed(1));
  const sD = parseFloat((total - (sA + sB + sC)).toFixed(1));
  return { sA, sB, sC, sD };
}

// In-memory research storage for mock database queries
let mockAssessments = [];
let mockSurveys = [];

function setupMockDatabase() {
  pool.query = async (text, params) => {
    // 1. Insert into research_assessments
    if (text.includes('INSERT INTO research_assessments')) {
      const row = {
        id: mockAssessments.length + 1,
        student_id: params[0],
        assessment_type: params[1],
        title: params[2],
        section_a_score: params[3],
        section_b_score: params[4],
        section_c_score: params[5],
        section_d_score: params[6],
        total_score: params[7],
        max_score: params[8],
        percentage: params[9],
        answers: params[10],
        rubric_breakdown: params[11],
        duration_seconds: params[12],
        created_at: new Date().toISOString()
      };
      mockAssessments.push(row);
      return { rows: [row] };
    }

    // 2. Select from research_assessments for student
    if (text.includes('SELECT * FROM research_assessments') && text.includes('WHERE student_id = $1')) {
      const studentId = params[0];
      const rows = mockAssessments.filter(a => a.student_id === studentId);
      return { rows };
    }

    // 3. Paired assessments query (JOIN students, schools, pre, post)
    if (text.includes('JOIN research_assessments pre') && text.includes('JOIN research_assessments post')) {
      const pairedRows = [];
      for (const student of COHORT) {
        const pre = mockAssessments.find(a => a.student_id === student.id && a.assessment_type === 'pre_test');
        const post = mockAssessments.find(a => a.student_id === student.id && a.assessment_type === 'post_test');
        if (pre && post) {
          pairedRows.push({
            student_id: student.id,
            student_name: student.name,
            student_form: student.form,
            school_name: student.school_name,
            pre_score: pre.total_score,
            pre_percentage: pre.percentage,
            pre_date: pre.created_at,
            post_score: post.total_score,
            post_percentage: post.percentage,
            post_date: post.created_at
          });
        }
      }
      return { rows: pairedRows };
    }

    // 4. Insert into research_surveys
    if (text.includes('INSERT INTO research_surveys')) {
      const row = {
        id: mockSurveys.length + 1,
        user_id: params[0],
        user_role: params[1],
        school_id: params[2],
        survey_type: params[3],
        responses: params[4],
        score: params[5],
        construct_scores: params[6],
        feedback_text: params[7],
        created_at: new Date().toISOString()
      };
      mockSurveys.push(row);
      return { rows: [row] };
    }

    // 5. Select from research_surveys by survey_type
    if (text.includes('SELECT * FROM research_surveys WHERE survey_type = $1')) {
      const surveyType = params[0];
      const rows = mockSurveys.filter(s => s.survey_type === surveyType);
      return { rows };
    }

    // Default empty
    return { rows: [] };
  };
}

describe('VirtuLab Kenya — Dissertation Research Pipeline Simulation', () => {

  before(async () => {
    process.env.JWT_SECRET = 'dissertation_research_secret_key_40_cohort_test';
    process.env.ADMIN_EMAIL = 'admin@virtulab.co.ke';

    // Sign student JWTs for cohort
    for (const student of COHORT) {
      studentTokens[student.id] = jwt.sign(
        { id: student.id, role: 'student', name: student.name, school_id: student.school_id },
        process.env.JWT_SECRET
      );
    }

    // Sign teacher and admin tokens
    teacherToken = jwt.sign(
      { id: 9001, role: 'teacher', name: 'Dr. Omwamba', email: 'omwamba@alliance.sc.ke', school_id: 1 },
      process.env.JWT_SECRET
    );
    adminToken = jwt.sign(
      { id: 1, role: 'admin', name: 'Lead Researcher', email: 'admin@virtulab.co.ke' },
      process.env.JWT_SECRET
    );

    // Setup HTTP test server
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        resolve();
      });
    });

    // Populate mock DB with students 1002 through 1040 (39 candidates)
    // Student 1001 will complete their journey through the API endpoints in Suite 1,
    // bringing the total paired cohort to exactly N = 40.
    mockAssessments = [];
    mockSurveys = [];
    setupMockDatabase();

    for (let i = 1; i < COHORT.length; i++) {
      const student = COHORT[i];
      const preSec = generateSections(student.pre);
      const postSec = generateSections(student.post);

      // Pre-Test
      await researchRepo.saveAssessment({
        studentId: student.id,
        assessment_type: 'pre_test',
        title: 'Chemistry Practical Competency Achievement Test (CPCAT Pre-Test)',
        section_a_score: preSec.sA,
        section_b_score: preSec.sB,
        section_c_score: preSec.sC,
        section_d_score: preSec.sD,
        total_score: student.pre,
        max_score: 40.0,
        percentage: parseFloat(((student.pre / 40.0) * 100).toFixed(2)),
        duration_seconds: 2400
      });

      // Post-Test
      await researchRepo.saveAssessment({
        studentId: student.id,
        assessment_type: 'post_test',
        title: 'Chemistry Practical Competency Achievement Test (CPCAT Post-Test)',
        section_a_score: postSec.sA,
        section_b_score: postSec.sB,
        section_c_score: postSec.sC,
        section_d_score: postSec.sD,
        total_score: student.post,
        max_score: 40.0,
        percentage: parseFloat(((student.post / 40.0) * 100).toFixed(2)),
        duration_seconds: 1950
      });

      // SUS Survey
      const susResult = stats.computeSUSScore(student.sus);
      await researchRepo.saveSurvey({
        userId: student.id,
        userRole: 'student',
        schoolId: student.school_id,
        survey_type: 'SUS',
        responses: student.sus,
        score: susResult.score,
        construct_scores: { grade: susResult.grade, adjective: susResult.adjective }
      });

      // TAM Survey
      const tamResult = stats.computeTAMConstructs(student.tam);
      await researchRepo.saveSurvey({
        userId: student.id,
        userRole: 'student',
        schoolId: student.school_id,
        survey_type: 'TAM',
        responses: student.tam,
        score: tamResult.compositeMean,
        construct_scores: tamResult
      });
    }
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    pool.query = originalQuery;
    pool.connect = originalConnect;
  });

  // ─────────────────────────────────────────────────────────────
  //  1. Cohort Ingestion & End-to-End API Route Flow (Candidate 1001)
  // ─────────────────────────────────────────────────────────────
  describe('1. Research API End-to-End Route Lifecycles', () => {

    it('POST /api/research/cpcat/submit — student 1001 records completed pre-test', async () => {
      const testStudent = COHORT[0];
      const token = studentTokens[testStudent.id];
      const preSec = generateSections(testStudent.pre);

      const res = await fetch(url('/api/research/cpcat/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assessment_type: 'pre_test',
          section_a_score: preSec.sA,
          section_b_score: preSec.sB,
          section_c_score: preSec.sC,
          section_d_score: preSec.sD,
          total_score: testStudent.pre,
          max_score: 40.0,
          duration_seconds: 2400
        })
      });

      assert.strictEqual(res.status, 201);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.assessment.assessment_type, 'pre_test');
      assert.strictEqual(parseFloat(body.assessment.total_score), testStudent.pre);
    });

    it('GET /api/research/cpcat/status — verifies pre-test recorded and post-test pending', async () => {
      const testStudent = COHORT[0];
      const token = studentTokens[testStudent.id];
      const res = await fetch(url('/api/research/cpcat/status'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.hasPreTest, true);
      assert.strictEqual(body.hasPostTest, false);
      assert.strictEqual(body.hakesGain, null);
    });

    it('POST /api/research/cpcat/submit — student 1001 records completed post-test', async () => {
      const testStudent = COHORT[0];
      const token = studentTokens[testStudent.id];
      const postSec = generateSections(testStudent.post);

      const res = await fetch(url('/api/research/cpcat/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assessment_type: 'post_test',
          section_a_score: postSec.sA,
          section_b_score: postSec.sB,
          section_c_score: postSec.sC,
          section_d_score: postSec.sD,
          total_score: testStudent.post,
          max_score: 40.0,
          duration_seconds: 1950
        })
      });

      assert.strictEqual(res.status, 201);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.assessment.assessment_type, 'post_test');
      assert.strictEqual(parseFloat(body.assessment.total_score), testStudent.post);
    });

    it('GET /api/research/cpcat/status — verifies status and individual Hake gain calculation', async () => {
      const testStudent = COHORT[0];
      const token = studentTokens[testStudent.id];
      const res = await fetch(url('/api/research/cpcat/status'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.hasPreTest, true);
      assert.strictEqual(body.hasPostTest, true);
      assert.ok(body.hakesGain);
      assert.strictEqual(typeof body.hakesGain.g, 'number');
      assert.ok(body.hakesGain.g > 0.50, 'Individual gain should exceed 0.50');
    });

    it('POST /api/research/sus/submit — records 10-item SUS response and calculates Brooke score', async () => {
      const testStudent = COHORT[0];
      const token = studentTokens[testStudent.id];
      const res = await fetch(url('/api/research/sus/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          responses: testStudent.sus,
          feedback_text: 'The titration simulation made endpoint detection very clear and realistic.'
        })
      });

      assert.strictEqual(res.status, 201);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.ok(body.susScore.score >= 75.0, 'SUS score should indicate high usability');
      assert.ok(body.susScore.grade.startsWith('A') || body.susScore.grade.startsWith('B'));
    });

    it('POST /api/research/tam/submit — records TAM 3 construct ratings and calculates composite mean', async () => {
      const testStudent = COHORT[0];
      const token = studentTokens[testStudent.id];
      const res = await fetch(url('/api/research/tam/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          responses: testStudent.tam,
          feedback_text: 'Virtual lab helped me understand qualitative analysis test tubes.'
        })
      });

      assert.strictEqual(res.status, 201);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.ok(body.constructScores.PU >= 4.0);
      assert.ok(body.constructScores.PEOU >= 4.0);
      assert.ok(body.constructScores.FC >= 4.0);
      assert.ok(body.constructScores.BI >= 4.0);
      assert.strictEqual(body.constructScores.acceptanceLevel, 'High Acceptance (≥ 4.0 / 5.0)');
    });

    it('GET /api/research/analytics/summary — enforces role-based access control (blocks student, permits teacher)', async () => {
      const studentToken = studentTokens[COHORT[0].id];
      
      // Student attempt -> 403 Forbidden
      const studentRes = await fetch(url('/api/research/analytics/summary'), {
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });
      assert.strictEqual(studentRes.status, 403);

      // Teacher attempt -> 200 OK
      const teacherRes = await fetch(url('/api/research/analytics/summary'), {
        headers: { 'Authorization': `Bearer ${teacherToken}` }
      });
      assert.strictEqual(teacherRes.status, 200);
      const body = await teacherRes.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.summary.pairedCount, 40);
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  2. Mathematical Triangulation & Statistical Synthesis
  // ─────────────────────────────────────────────────────────────
  describe('2. Mathematical Triangulation & Statistical Synthesis (N = 40 Cohort)', () => {

    let summary;

    before(async () => {
      summary = await researchRepo.getResearchSummary();
    });

    it('should verify sample size N = 40 across all matched pairs', () => {
      assert.strictEqual(summary.pairedCount, 40);
      assert.strictEqual(summary.preTest.count, 40);
      assert.strictEqual(summary.postTest.count, 40);
    });

    it('should calculate baseline pre-test and post-test descriptive statistics', () => {
      // Pre-test mean should be ~18.5 / 40 (~46%)
      assert.ok(summary.preTest.mean >= 17.0 && summary.preTest.mean <= 20.0, `Pre-test mean ${summary.preTest.mean} out of bounds`);
      assert.ok(summary.preTest.stdDev > 2.0 && summary.preTest.stdDev < 5.0, `Pre-test SD ${summary.preTest.stdDev} out of bounds`);

      // Post-test mean should be ~32.0 / 40 (~80%)
      assert.ok(summary.postTest.mean >= 30.0 && summary.postTest.mean <= 34.0, `Post-test mean ${summary.postTest.mean} out of bounds`);
      assert.ok(summary.postTest.stdDev > 1.5 && summary.postTest.stdDev < 4.0, `Post-test SD ${summary.postTest.stdDev} out of bounds`);

      // Significant mean improvement (> 12 marks out of 40)
      const diff = summary.postTest.mean - summary.preTest.mean;
      assert.ok(diff >= 12.0, `Mean score gain ${diff} is lower than expected`);
    });

    it('should calculate Hake\'s normalized learning gain (individual and group)', () => {
      // Group Hake's gain g = (%post - %pre) / (100% - %pre)
      const gGroup = summary.groupGain.g;
      assert.ok(gGroup >= 0.55 && gGroup <= 0.75, `Group Hake gain g = ${gGroup} not in expected range [0.55, 0.75]`);
      assert.ok(
        summary.groupGain.category.includes('Medium Gain') || summary.groupGain.category.includes('High Gain'),
        `Unexpected Hake category: ${summary.groupGain.category}`
      );

      // Mean of individual gains should closely triangulate group gain
      const gIndMean = summary.meanIndividualGain;
      assert.ok(gIndMean >= 0.55 && gIndMean <= 0.75, `Individual Hake gain mean ${gIndMean} out of bounds`);
      const discrepancy = Math.abs(gGroup - gIndMean);
      assert.ok(discrepancy < 0.05, `Discrepancy between group g (${gGroup}) and mean individual g (${gIndMean}) exceeds 0.05`);
    });

    it('should compute exact Paired Student\'s t-test with df = 39 and p < 0.001', () => {
      const tTest = summary.pairedTTest;
      assert.strictEqual(tTest.n, 40);
      assert.strictEqual(tTest.df, 39, 'Degrees of freedom must be exactly N - 1 = 39');
      
      // Extremely high t-value due to uniform learning gains across all 40 students
      assert.ok(tTest.t > 15.0, `Paired t-statistic ${tTest.t} must be > 15.0`);
      assert.strictEqual(tTest.isSignificant, true, 't-test must reject null hypothesis');
      assert.strictEqual(tTest.significanceLevel, 'p < 0.001');
      assert.ok(tTest.pValue < 0.0001, `Exact p-value ${tTest.pValue} must be < 0.0001`);
    });

    it('should compute Cohen\'s d effect sizes (repeated-measures dz and pooled d)', () => {
      const cohensD = summary.cohensD;
      assert.ok(cohensD.d >= 1.20, `Repeated-measures Cohen's dz = ${cohensD.d} must be >= 1.20 (Large Effect)`);
      assert.strictEqual(cohensD.interpretation, 'Large Effect (d ≥ 0.80)');
      assert.ok(cohensD.d_pooled >= 1.20, `Independent pooled d = ${cohensD.d_pooled} must be >= 1.20`);
    });

    it('should aggregate System Usability Scale (SUS) scores with benchmark metrics', () => {
      const sus = summary.sus;
      assert.strictEqual(sus.count, 40);
      assert.ok(sus.meanScore >= 80.0 && sus.meanScore <= 90.0, `SUS mean ${sus.meanScore} out of expected [80, 90]`);
      assert.ok(sus.stdDev < 8.0, `SUS SD ${sus.stdDev} indicates too high dispersion`);
      assert.ok(sus.interpretation.grade.startsWith('A'), `SUS Grade ${sus.interpretation.grade} should be Grade A`);
    });

    it('should aggregate Technology Acceptance Model (TAM 3) construct ratings', () => {
      const tam = summary.tam;
      assert.strictEqual(tam.totalRespondents, 40);
      assert.ok(tam.PU >= 4.2, `PU rating ${tam.PU} must be >= 4.2`);
      assert.ok(tam.PEOU >= 4.2, `PEOU rating ${tam.PEOU} must be >= 4.2`);
      assert.ok(tam.FC >= 4.0, `FC rating ${tam.FC} must be >= 4.0`);
      assert.ok(tam.BI >= 4.4, `BI rating ${tam.BI} must be >= 4.4`);
    });

    it('should verify high psychometric reliability (Cronbach\'s alpha >= 0.80) on research instruments', () => {
      // TAM Instrument 12-item reliability
      const tamCronbach = summary.tam.cronbachAlpha;
      assert.ok(tamCronbach, 'TAM Cronbach alpha object must be defined');
      assert.ok(tamCronbach.alpha >= 0.80, `TAM Cronbach alpha ${tamCronbach.alpha} must be >= 0.80 (High Reliability)`);
      assert.strictEqual(tamCronbach.items, 12, 'TAM scale must evaluate exactly 12 items');
      assert.strictEqual(tamCronbach.respondents, 40, 'TAM respondents must be 40');

      // SUS Instrument 10-item reliability
      const susCronbach = summary.sus.cronbachAlpha;
      assert.ok(susCronbach, 'SUS Cronbach alpha object must be defined');
      assert.ok(susCronbach.alpha >= 0.70, `SUS Cronbach alpha ${susCronbach.alpha} must be >= 0.70 (Acceptable Reliability)`);
      assert.strictEqual(susCronbach.items, 10, 'SUS scale must evaluate exactly 10 items');
    });
  });

  // ─────────────────────────────────────────────────────────────
  //  3. SPSS / R / Python RFC 4180 CSV Export Dataset Audit
  // ─────────────────────────────────────────────────────────────
  describe('3. SPSS / R / Python RFC 4180 CSV Export Compliance', () => {

    let csvContent;
    let lines;
    let headers;

    // Standard RFC 4180 CSV Parser
    function parseCSVLine(line) {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          result.push(cur);
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur);
      return result;
    }

    before(async () => {
      const res = await fetch(url('/api/research/export/csv'), {
        headers: { 'Authorization': `Bearer ${teacherToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.headers.get('content-type').includes('text/csv'), 'Content-Type must be text/csv');
      assert.ok(res.headers.get('content-disposition').includes('virtulab_kenya_research_dataset.csv'));

      csvContent = await res.text();
      lines = csvContent.trim().split('\n');
      headers = parseCSVLine(lines[0]);
    });

    it('should output strictly 41 rows (1 header + 40 candidate records)', () => {
      assert.strictEqual(lines.length, 41, `CSV contains ${lines.length} lines, expected 41`);
    });

    it('should have the exact 15 required research columns in standard dissertation order', () => {
      const expectedHeaders = [
        'Student_ID',
        'School_Name',
        'Form_Level',
        'PreTest_Raw_Score_40',
        'PreTest_Pct',
        'PostTest_Raw_Score_40',
        'PostTest_Pct',
        'Gain_Pct',
        'Hakes_Normalized_Gain_g',
        'Gain_Category',
        'SUS_Usability_Score_100',
        'TAM_Perceived_Usefulness_PU',
        'TAM_Ease_Of_Use_PEOU',
        'TAM_Facilitating_Conditions_FC',
        'TAM_Behavioral_Intention_BI'
      ];

      assert.deepStrictEqual(headers, expectedHeaders, 'CSV headers do not match dissertation specifications');
    });

    it('should strictly conform to RFC 4180 quoting and formatting rules', () => {
      for (let i = 1; i <= 40; i++) {
        const line = lines[i];
        const fields = parseCSVLine(line);
        assert.strictEqual(fields.length, 15, `Row ${i} does not have exactly 15 fields: ${line}`);

        const [
          studentId,
          schoolName,
          formLevel,
          preScore,
          prePct,
          postScore,
          postPct,
          gainPct,
          hakeG,
          gainCategory,
          susScore,
          pu,
          peou,
          fc,
          bi
        ] = fields;

        // Validate types
        assert.match(studentId, /^STU-\d{4}$/, `Invalid Student_ID format: ${studentId}`);
        assert.ok(schoolName.length > 0, 'School name must not be empty');
        assert.strictEqual(formLevel, 'Form 4');
        assert.ok(!isNaN(parseFloat(preScore)), `Pre score ${preScore} is not a valid number`);
        assert.ok(!isNaN(parseFloat(postScore)), `Post score ${postScore} is not a valid number`);
        assert.ok(!isNaN(parseFloat(hakeG)), `Hake's g ${hakeG} is not a valid number`);
        assert.ok(gainCategory.length > 0, 'Gain category must not be empty');
        assert.ok(!isNaN(parseFloat(susScore)), `SUS score ${susScore} is not a valid number`);
        assert.ok(!isNaN(parseFloat(pu)), `PU ${pu} is not a valid number`);
        assert.ok(!isNaN(parseFloat(peou)), `PEOU ${peou} is not a valid number`);
        assert.ok(!isNaN(parseFloat(fc)), `FC ${fc} is not a valid number`);
        assert.ok(!isNaN(parseFloat(bi)), `BI ${bi} is not a valid number`);
      }
    });

    it('should emulate seamless R and SPSS import without data loss or type errors', () => {
      // Parse CSV into an array of objects as R read.csv(..., header=TRUE) does
      const parsedRecords = lines.slice(1).map(line => {
        const fields = parseCSVLine(line);
        return {
          id: fields[0],
          school: fields[1],
          form: fields[2],
          pre: parseFloat(fields[3]),
          prePct: parseFloat(fields[4]),
          post: parseFloat(fields[5]),
          postPct: parseFloat(fields[6]),
          gainPct: parseFloat(fields[7]),
          hakeG: parseFloat(fields[8]),
          category: fields[9],
          sus: parseFloat(fields[10]),
          pu: parseFloat(fields[11]),
          peou: parseFloat(fields[12]),
          fc: parseFloat(fields[13]),
          bi: parseFloat(fields[14])
        };
      });

      assert.strictEqual(parsedRecords.length, 40);

      // Verify that recalculating statistics from parsed records matches server calculations exactly
      const parsedPreMean = parsedRecords.reduce((s, r) => s + r.pre, 0) / 40;
      const parsedPostMean = parsedRecords.reduce((s, r) => s + r.post, 0) / 40;
      const parsedHakeMean = parsedRecords.reduce((s, r) => s + r.hakeG, 0) / 40;
      const parsedSusMean = parsedRecords.reduce((s, r) => s + r.sus, 0) / 40;
      const expectedCohortPreMean = COHORT.reduce((s, c) => s + c.pre, 0) / 40;
      const expectedCohortPostMean = COHORT.reduce((s, c) => s + c.post, 0) / 40;

      assert.ok(Math.abs(parsedPreMean - expectedCohortPreMean) < 0.001, `Parsed pre mean ${parsedPreMean} does not match expected ${expectedCohortPreMean}`);
      assert.ok(Math.abs(parsedPostMean - expectedCohortPostMean) < 0.001, `Parsed post mean ${parsedPostMean} does not match expected ${expectedCohortPostMean}`);
      assert.ok(parsedHakeMean >= 0.55 && parsedHakeMean <= 0.75, `Parsed Hake mean ${parsedHakeMean} out of bounds`);
      assert.ok(parsedSusMean >= 80.0 && parsedSusMean <= 90.0, `Parsed SUS mean ${parsedSusMean} out of bounds`);
    });
  });
});
