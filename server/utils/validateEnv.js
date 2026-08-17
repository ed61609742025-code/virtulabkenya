function validateEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n=== MISSING REQUIRED ENVIRONMENT VARIABLES ===');
    missing.forEach(key => console.error(`  ✗ ${key}`));
    console.error('\nPlease set these variables in your .env file or environment.');
    console.error('See .env.example for reference.\n');
    process.exit(1);
  }

  const optional = ['GEMINI_API_KEY', 'SENTRY_DSN', 'PORT'];
  const missingOptional = optional.filter(key => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn('[Config] Optional environment variables not set:', missingOptional.join(', '));
  }
}

module.exports = validateEnv;
