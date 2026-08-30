// ============================================================
//  VirtuLab Kenya — Mailer Unit Tests
// ============================================================

const { describe, it } = require('node:test');
const assert = require('node:assert');
const mailer = require('../utils/mailer');

describe('Mailer Utility Unit Tests', () => {
  it('should safely handle unconfigured SMTP without throwing errors', async () => {
    const result = await mailer.sendAdminWelcomeEmail({
      to: 'jkamau@virtulab.co.ke',
      name: 'Dr. Jane Kamau',
      temporaryPassword: 'VLK!TempPass123',
      role: 'admin'
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.emailSent, false);
    assert.strictEqual(result.reason, 'SMTP not configured');
  });

  it('should safely handle password reset email with unconfigured SMTP', async () => {
    const result = await mailer.sendAdminPasswordResetEmail({
      to: 'jkamau@virtulab.co.ke',
      name: 'Dr. Jane Kamau',
      temporaryPassword: 'VLK-ADM-987654'
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.emailSent, false);
    assert.strictEqual(result.reason, 'SMTP not configured');
  });
});
