require('../server/node_modules/dotenv').config({ path: require('path').resolve(__dirname, '../server/.env') });
const pool = require('../server/db/pool');

async function main() {
  try {
    const students = await pool.query('SELECT id, name, email, form FROM students LIMIT 10');
    console.log('STUDENTS:', JSON.stringify(students.rows, null, 2));

    const assignments = await pool.query('SELECT id, title, titration_type, due_date FROM assignments LIMIT 10');
    console.log('ASSIGNMENTS:', JSON.stringify(assignments.rows, null, 2));

    const sessions = await pool.query('SELECT count(*) FROM sessions');
    console.log('SESSIONS_COUNT:', sessions.rows[0].count);
    
    await pool.end();
  } catch (err) {
    console.error('ERROR:', err);
  }
}

main();
