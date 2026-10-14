---
name: fullstack-node-express-postgres
description: >-
  Backend architecture standards for Node.js, Express, and PostgreSQL. Use when implementing REST API routes, repository patterns, database migrations, connection pooling, JWT authentication, request validation, rate limiting, and security middleware.
---

# Fullstack Node.js, Express & PostgreSQL Architecture

You are a principal backend engineer specializing in robust, maintainable REST APIs, relational database patterns, and security hardening for Node.js and PostgreSQL.

## Core Directives

1. **Strict Repository Pattern**: Never write raw `pool.query()` inside route controller functions. All database operations must be isolated inside repository modules (`server/repositories/`).
2. **Thin Controllers**: Route handlers in `server/routes/` must be pure orchestration functions wrapped with `asyncHandler`. Never place manual nested `try/catch` or DDL statements inside route controllers.
3. **Centralized DDL Migrations**: Database schema creation and alterations must exclusively live in `server/db/migrate.js`.
4. **Resilient Error Propagation**: Throw strongly typed `AppError` subclasses. Centralized error middleware formats errors into standard JSON envelopes.

---

## 1. Architectural Layers & File Boundaries

```text
server/
├── config/             # Environment variables, constants, secrets
├── db/
│   ├── index.js        # Connection pool initialization & health check
│   └── migrate.js      # Idempotent DDL migration runner
├── middleware/
│   ├── auth.js         # JWT verification, role-based access control (RBAC)
│   ├── errorHandler.js # Central operational error capture & logger
│   ├── rateLimiter.js  # Brute-force & DDoS rate limiting
│   ├── security.js     # Helmet, CORS, and sanitization headers
│   └── validators.js   # express-validator schemas
├── repositories/       # Pure SQL data-access methods
├── routes/             # Thin controller route endpoints
├── services/           # Business domain logic (grading, AI assistant, stats)
└── tests/              # Automated unit and integration test suites
```

---

## 2. Standard Implementation Patterns

### Repository Implementation
```javascript
// server/repositories/studentRepository.js
const pool = require('../db');

class StudentRepository {
  static async findById(id) {
    const query = `
      SELECT id, full_name, email, school_id, form_level, created_at
      FROM users
      WHERE id = $1 AND role = 'student'
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  static async recordExperimentScore({ studentId, experimentType, score, maxScore }) {
    const query = `
      INSERT INTO experiment_results (student_id, experiment_type, score, max_score, completed_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, score, max_score, completed_at;
    `;
    const { rows } = await pool.query(query, [studentId, experimentType, score, maxScore]);
    return rows[0];
  }
}

module.exports = StudentRepository;
```

### Thin Controller with `asyncHandler`
```javascript
// server/routes/student.js
const express = require('express');
const router = express.Router();
const StudentRepository = require('../repositories/studentRepository');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { validateExperimentResult } = require('../middleware/validators');
const { NotFoundError } = require('../errors/AppError');

router.post(
  '/experiments/submit',
  requireAuth('student'),
  validateExperimentResult,
  asyncHandler(async (req, res) => {
    const { experimentType, score, maxScore } = req.body;
    const student = await StudentRepository.findById(req.user.id);
    
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    const result = await StudentRepository.recordExperimentScore({
      studentId: req.user.id,
      experimentType,
      score,
      maxScore
    });

    res.status(201).json({
      success: true,
      data: result
    });
  })
);

module.exports = router;
```

---

## 3. Database Migration Standards (`server/db/migrate.js`)

1. **Idempotence**: Always use `IF NOT EXISTS` for tables, extensions, and indices.
2. **Atomic Execution**: Wrap multi-step schema alterations in `BEGIN ... COMMIT` transactions.
3. **Data Types**: Use `TIMESTAMPTZ` for timestamps, `UUID` or `BIGSERIAL` for primary keys, and `NUMERIC(6, 2)` for precision measurements.

---

## 4. Security Hardening Checklist

- [ ] Parameterized Queries: Every query must use `$1, $2, ...` to prevent SQL injection.
- [ ] Authentication: Sign JWTs with strong HMAC-SHA256 secrets; enforce short expiration times.
- [ ] Passwords: Hash with bcrypt (salt rounds >= 10). Never store plaintext passwords.
- [ ] Helmet: Configure Content Security Policy (`CSP`), HSTS, frameguard, and XSS protection.
- [ ] Rate Limiting: Apply strict limits on auth/login routes (`10 requests / 15 minutes`) and balanced limits on API routes.
