# VirtuLab Kenya — Codebase Architecture & Clean Code Rules

## 1. Server Architecture Rules
- **Repository Pattern Enforcement**: ALL database access MUST go through repository modules in `server/repositories/`. Never write raw `pool.query()` inside route controllers.
- **Thin Controllers**: Route handlers in `server/routes/` MUST be thin controller functions wrapped with `asyncHandler`. Never write manual `try/catch` blocks or inline table creation (`CREATE TABLE`) inside routes.
- **Centralized DDL**: Database schema changes MUST be placed exclusively in `server/db/migrate.js`.
- **Validation**: All incoming API requests MUST be validated via `express-validator` schemas defined in `server/middleware/validators.js`.
- **Configuration**: Avoid magic numbers or hardcoded URLs. Reference constants from `server/config/index.js`.
- **Error Handling**: Throw operational errors using `AppError` subclasses (`NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`).

## 2. Client Architecture Rules
- **No Inline Code**: HTML files in `client/` MUST NOT contain inline `<style>` blocks or large inline `<script>` blocks.
- **Client Script Location**: Page JS MUST be located in `client/student/js/` or `client/teacher/js/`.
- **Client CSS Location**: Page CSS MUST be located in `client/student/css/`, `client/teacher/css/`, or `client/shared/`.
- **Shared Utilities**: Reusable UI components or logic MUST use `client/shared/` modules (`api.js`, `theme.js`, `timer.js`, `modal.js`, `audio-synth.js`, `knec-grading.js`).
- **Resilient API Calls**: All backend communication MUST go through `apiRequest()` in `client/shared/api.js`.

## 3. Automated Verification
- Run `npm test` in `server/` before submitting changes to verify API contracts remain intact.
