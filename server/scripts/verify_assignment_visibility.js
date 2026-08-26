// ============================================================
//  VirtuLab Kenya — Assignment Visibility Unit Verification
// ============================================================

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_1234567890';

const assert = require('assert');
const pool = require('../db/pool');
const originalQuery = pool.query;
const assignmentRepo = require('../repositories/assignmentRepo');

async function runDirectTests() {
  console.log('🧪 Starting Direct Unit Test for Assignment Flow...');

  try {
    // 1. Test assignmentRepo.createAssignment
    console.log('\n[Test 1] Testing assignmentRepo.createAssignment...');
    pool.query = async (text, params) => {
      if (text.includes('SELECT school_id FROM teachers WHERE id')) {
        assert.strictEqual(params[0], 10);
        return { rows: [{ school_id: 3 }] };
      }
      if (text.includes('INSERT INTO assignments')) {
        assert.strictEqual(params[0], 10, 'teacherId should match');
        assert.strictEqual(params[1], 3, 'schoolId should match teacher school_id');
        assert.strictEqual(params[2], 'Titration Lab Q1');
        return {
          rows: [{
            id: 101,
            teacher_id: 10,
            school_id: 3,
            title: 'Titration Lab Q1',
            titration_type: 'acidBase',
            instructions: 'Oxalic acid test',
            created_at: new Date().toISOString()
          }]
        };
      }
      return { rows: [] };
    };

    const created = await assignmentRepo.createAssignment(10, {
      title: 'Titration Lab Q1',
      titrationType: 'acidBase',
      instructions: 'Oxalic acid test'
    });

    assert.ok(created);
    assert.strictEqual(created.id, 101);
    assert.strictEqual(created.teacher_id, 10);
    assert.strictEqual(created.school_id, 3);
    console.log('✅ Test 1 Passed: createAssignment correctly queries teacher school and inserts assignment.');

    // 2. Test assignmentRepo.getStudentAssignments when student is linked to teacher
    console.log('\n[Test 2] Testing assignmentRepo.getStudentAssignments (Linked Student)...');
    pool.query = async (text, params) => {
      if (text.includes('SELECT teacher_id, school_id FROM students WHERE id = $1')) {
        assert.strictEqual(params[0], 42);
        return { rows: [{ teacher_id: 10, school_id: 3 }] };
      }
      if (text.includes('FROM assignments a')) {
        assert.ok(text.includes('WHERE (a.teacher_id = $2 OR a.school_id = $3'));
        assert.strictEqual(params[0], 42, 'studentId');
        assert.strictEqual(params[1], 10, 'teacherId');
        assert.strictEqual(params[2], 3, 'schoolId');
        return {
          rows: [{
            id: 101,
            teacher_id: 10,
            school_id: 3,
            title: 'Titration Lab Q1',
            titration_type: 'acidBase',
            instructions: 'Oxalic acid test',
            teacher_name: 'Verified Teacher',
            teacher_code: 'MWALIMU01',
            submitted: false,
            submission_status: null
          }]
        };
      }
      return { rows: [] };
    };

    const assignments = await assignmentRepo.getStudentAssignments(42);
    assert.strictEqual(assignments.length, 1);
    assert.strictEqual(assignments[0].id, 101);
    assert.strictEqual(assignments[0].teacher_name, 'Verified Teacher');
    assert.strictEqual(assignments[0].teacher_code, 'MWALIMU01');
    console.log('✅ Test 2 Passed: getStudentAssignments returns linked teacher assignments with teacher details.');

    // 3. Test assignmentRepo.getTeacherAssignments
    console.log('\n[Test 3] Testing assignmentRepo.getTeacherAssignments...');
    pool.query = async (text, params) => {
      if (text.includes('FROM assignments a') && text.includes('WHERE a.teacher_id = $1')) {
        assert.strictEqual(params[0], 10);
        return {
          rows: [{
            id: 101,
            teacher_id: 10,
            school_id: 3,
            title: 'Titration Lab Q1',
            submitted_count: 5,
            total_students: 12
          }]
        };
      }
      return { rows: [] };
    };

    const teacherAssignments = await assignmentRepo.getTeacherAssignments(10);
    assert.strictEqual(teacherAssignments.length, 1);
    assert.strictEqual(teacherAssignments[0].submitted_count, 5);
    assert.strictEqual(teacherAssignments[0].total_students, 12);
    console.log('✅ Test 3 Passed: getTeacherAssignments returns teacher assignments with student roster stats.');

    console.log('\n🎉 ALL DIRECT UNIT TESTS PASSED SUCCESSFULLY!');
  } finally {
    pool.query = originalQuery;
    process.exit(0);
  }
}

runDirectTests().catch(err => {
  console.error('\n❌ Direct Tests Failed:', err);
  process.exit(1);
});
