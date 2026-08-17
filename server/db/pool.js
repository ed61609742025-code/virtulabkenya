// ============================================================
//  VirtuLab Kenya — Shared Database Pool
// ============================================================
//
// One pg Pool for the whole server. Route files require this
// instead of each creating their own — avoids opening multiple
// separate connection pools against the same database.
//
// Usage in a route file:
//   const pool = require('../db/pool');
//   const result = await pool.query('SELECT ...', [values]);

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  min: 1,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

pool.on('error', (err) => {
  console.error('[DB Pool] Unexpected error on idle client:', err.message);
});

/**
 * Perform a health check query on the pool.
 * @returns {Promise<boolean>}
 */
pool.checkHealth = async function checkHealth() {
  try {
    const res = await pool.query('SELECT 1 AS healthy');
    return res.rows[0]?.healthy === 1;
  } catch (err) {
    console.error('[DB Pool Health Check Failed]:', err.message);
    return false;
  }
};

/**
 * Gracefully close pool connections.
 */
pool.shutdown = async function shutdown() {
  console.log('[DB Pool] Closing database pool connections...');
  try {
    await pool.end();
    console.log('[DB Pool] Database pool closed successfully.');
  } catch (err) {
    console.error('[DB Pool Error closing pool]:', err.message);
  }
};

// Listen for process termination signals
process.on('SIGTERM', async () => {
  await pool.shutdown();
});
process.on('SIGINT', async () => {
  await pool.shutdown();
});

module.exports = pool;

