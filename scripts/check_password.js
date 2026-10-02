require('../server/node_modules/dotenv').config({ path: require('path').resolve(__dirname, '../server/.env') });
const pool = require('../server/db/pool');
const bcrypt = require('../server/node_modules/bcrypt');

async function main() {
  try {
    const res = await pool.query("SELECT id, name, email, password_hash, school_id, teacher_id FROM students WHERE email = 'student1@test.com'");
    if (res.rows.length === 0) {
      console.log('Student1 not found');
      return;
    }
    const s = res.rows[0];
    console.log('STUDENT:', s.id, s.name, s.email, 'teacher_id:', s.teacher_id, 'school_id:', s.school_id);
    const passwordsToTest = ['password123', 'student123', 'student', '12345678', 'test1234', 'Admin1234!'];
    for (const p of passwordsToTest) {
      const match = await bcrypt.compare(p, s.password_hash);
      if (match) {
        console.log('MATCH FOUND:', p);
        break;
      }
    }
    await pool.end();
  } catch (err) {
    console.error('ERR:', err);
  }
}

main();
