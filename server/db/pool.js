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

const dbUrl = process.env.DATABASE_URL || '';
const isCloudDb = dbUrl.includes('.neon.tech') || dbUrl.includes('.supabase.co') || dbUrl.includes('.pooler.supabase.com') || dbUrl.includes('render.com') || dbUrl.includes('railway.app') || (process.env.NODE_ENV === 'production' && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1'));

// Configurable SSL verification. In production environments where trusted CA certs are provided (via PGSSLROOTCERT or system roots),
// set DB_SSL_REJECT_UNAUTHORIZED=true. Defaults to false for cloud provider internal proxy routing.
let sslConfig = false;
if (isCloudDb) {
  const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true';
  sslConfig = { rejectUnauthorized };
  if (process.env.PGSSLROOTCERT) {
    sslConfig.ca = process.env.PGSSLROOTCERT;
  }
  if (process.env.NODE_ENV === 'production' && !rejectUnauthorized) {
    console.info('[DB Pool] Note: SSL connection established with rejectUnauthorized=false (cloud proxy routing). To enforce strict certificate pinning, set DB_SSL_REJECT_UNAUTHORIZED=true and PGSSLROOTCERT.');
  }
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: sslConfig,
  min: process.env.NODE_ENV === 'test' ? 0 : 1,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});
const originalPoolQuery = pool.query;

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

/**
 * Execute a unit of work inside a managed database transaction.
 * 
 * - In production/standard environments: checks out a client from pool,
 *   executes BEGIN, runs the callback, commits with COMMIT on success,
 *   rolls back with ROLLBACK on error, and always releases the client.
 * - In test environments without a live Postgres server (where pool.query
 *   is monkey-patched): wraps queries in a compatible mock client delegating
 *   to pool.query with BEGIN/COMMIT/ROLLBACK simulation.
 * 
 * @param {Function} callback - async (client) => Promise<any>
 * @returns {Promise<any>} Result of callback
 */
pool.withTransaction = async function withTransaction(callback) {
  // In test environments where tests monkey-patch pool.query, delegate to pool.query
  if (process.env.NODE_ENV === 'test' && pool.query !== originalPoolQuery) {
    const mockClient = {
      query: (text, params) => pool.query(text, params),
      release: () => {}
    };
    await mockClient.query('BEGIN');
    try {
      const result = await callback(mockClient);
      await mockClient.query('COMMIT');
      return result;
    } catch (err) {
      try {
        await mockClient.query('ROLLBACK');
      } catch (rbErr) {
        console.warn('[DB Transaction] Rollback note:', rbErr.message);
      }
      throw err;
    }
  }

  let client;
  try {
    client = await pool.connect();
  } catch (connectErr) {
    if (process.env.NODE_ENV === 'test') {
      const mockClient = {
        query: (text, params) => pool.query(text, params),
        release: () => {}
      };
      await mockClient.query('BEGIN');
      try {
        const result = await callback(mockClient);
        await mockClient.query('COMMIT');
        return result;
      } catch (err) {
        try {
          await mockClient.query('ROLLBACK');
        } catch (rbErr) {
          console.warn('[DB Transaction] Rollback note:', rbErr.message);
        }
        throw err;
      }
    } else {
      throw connectErr;
    }
  }

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rbErr) {
      console.warn('[DB Transaction] Rollback note:', rbErr.message);
    }
    throw err;
  } finally {
    if (client && typeof client.release === 'function') {
      client.release();
    }
  }
};

module.exports = pool;

