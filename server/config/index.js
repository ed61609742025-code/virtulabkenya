module.exports = {
  server: {
    port: process.env.PORT || 3000
  },
  auth: {
    saltRounds: 10,
    tokenExpiry: process.env.JWT_EXPIRES_IN || '7d',
    teacherCodeChars: 'ABCDEFGHJKMNPQRSTUVWXYZ23456789',
    teacherCodeLength: 8,
    tempPasswordPrefix: 'VLK-',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@virtulab.co.ke',
    adminPassword: process.env.ADMIN_PASSWORD || ''
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  },
  rateLimit: {
    authWindowMs: 15 * 60 * 1000,
    authMax: 15,
    apiWindowMs: 15 * 60 * 1000,
    apiMax: 200
  },
  badges: {
    minSessions: 1,
    precisionThreshold: 0.10,
    minTrialsForExplorer: 2,
    minTypesForVersatile: 4,
    streakForConsistency: 3,
    accuracyForMastery: 80
  },
  knec: {
    gradeCutoffs: [
      { min: 80, grade: 'A' },
      { min: 70, grade: 'A-' },
      { min: 60, grade: 'B+' },
      { min: 55, grade: 'B' },
      { min: 50, grade: 'C+' },
      { min: 45, grade: 'C' },
      { min: 40, grade: 'D+' },
      { min: 35, grade: 'D' },
      { min: 0, grade: 'E' }
    ]
  },
  gemini: {
    defaultModel: 'gemini-2.5-flash-lite',
    maxOutputTokens: 3000,
    temperature: 0.6,
    examAssistantMaxTokens: 4000
  },
  errorTracking: {
    maxBufferSize: 50
  },
  email: {
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'VirtuLab Kenya <admin@virtulab.co.ke>',
    platformUrl: process.env.PLATFORM_URL || 'https://virtulab.co.ke'
  }
};
