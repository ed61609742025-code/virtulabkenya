// ============================================================
//  VirtuLab Kenya — Database Transaction Helper
// ============================================================

const pool = require('./pool');

/**
 * Delegates to pool.withTransaction to avoid circular module dependencies.
 */
async function withTransaction(callback) {
  return pool.withTransaction(callback);
}

module.exports = {
  withTransaction
};
