/**
 * Validates essential environment variables and security posture on startup.
 * Enforces strict cryptographic entropy and credentials safety in production environments.
 */
function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n=== MISSING REQUIRED ENVIRONMENT VARIABLES ===');
    missing.forEach(key => console.error(`  ✗ ${key}`));
    console.error('\nPlease set these variables in your .env file or environment.');
    console.error('See .env.example for reference.\n');
    process.exit(1);
  }

  // Production-grade security audits
  if (isProd) {
    const securityErrors = [];
    const jwtSecret = process.env.JWT_SECRET || '';

    if (jwtSecret.length < 32) {
      securityErrors.push('JWT_SECRET must be at least 32 characters long in production.');
    }
    if (/dev_|change_in_production|default|password/i.test(jwtSecret)) {
      securityErrors.push('JWT_SECRET contains insecure development placeholder keywords. Generate a random 64-char secret.');
    }

    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl.includes(':test1234@') || dbUrl.includes(':postgres@localhost')) {
      securityErrors.push('DATABASE_URL appears to contain default development password. Please use production credentials.');
    }

    if (process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD_HASH) {
      securityErrors.push('Plaintext ADMIN_PASSWORD is set without ADMIN_PASSWORD_HASH in production.');
    }

    if (securityErrors.length > 0) {
      console.error('\n=== CRITICAL SECURITY CONFIGURATION ERRORS (PRODUCTION) ===');
      securityErrors.forEach(err => console.error(`  ✗ ${err}`));
      console.error('\nAborting server boot to prevent deployment with compromised secrets.\n');
      process.exit(1);
    }
  } else if (!isTest) {
    // Helpful advisory notices for developers in development mode
    const jwtSecret = process.env.JWT_SECRET || '';
    if (jwtSecret.includes('change_in_production')) {
      console.warn('[Security Advisory] Using default development JWT_SECRET. Rotate before deploying to production.');
    }
  }

  const optional = ['GEMINI_API_KEY', 'SENTRY_DSN', 'PORT'];
  const missingOptional = optional.filter(key => !process.env[key]);
  if (missingOptional.length > 0 && !isTest) {
    console.warn('[Config] Optional environment variables not set:', missingOptional.join(', '));
  }
}

module.exports = validateEnv;
