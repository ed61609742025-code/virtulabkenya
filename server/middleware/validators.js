// ============================================================
//  VirtuLab Kenya — Input Validation & Sanitization Middleware
//  Feature #24: express-validator schemas for all POST/PUT routes
// ============================================================

const { body, validationResult } = require('express-validator');

// Helper to check validation results and return 400 with formatted error
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

// Student Registration Rules
const validateStudentRegister = [
  body('name').trim().notEmpty().withMessage('All fields are required.').escape(),
  body('email').trim().notEmpty().withMessage('All fields are required.').isEmail().withMessage('Invalid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('All fields are required.').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('form').trim().notEmpty().withMessage('All fields are required.').escape(),
  body('schoolCode').trim().notEmpty().withMessage('All fields are required.').escape(),
  body('teacherCode').optional({ checkFalsy: true }).trim().escape(),
  handleValidationErrors
];

// Student & Teacher Login Rules
const validateLogin = [
  body('email').trim().notEmpty().withMessage('Email and password are required.').isEmail().withMessage('Invalid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Email and password are required.'),
  handleValidationErrors
];

// Session Save Rules
const validateSessionSave = [
  body('titrationKey').trim().notEmpty().withMessage('titrationKey is required.').escape(),
  body('titrationTitle').optional().trim().escape(),
  body('indicatorLabel').optional().trim().escape(),
  body('mode').optional().trim().escape(),
  handleValidationErrors
];

// Qualitative Session Save Rules
const validateQualitativeSave = [
  body('saltKey').trim().notEmpty().withMessage('saltKey, studentCation, and studentAnion are required.').escape(),
  body('studentCation').trim().notEmpty().withMessage('saltKey, studentCation, and studentAnion are required.').escape(),
  body('studentAnion').trim().notEmpty().withMessage('saltKey, studentCation, and studentAnion are required.').escape(),
  handleValidationErrors
];

// Teacher Registration Rules
const validateTeacherRegister = [
  body('name').trim().notEmpty().withMessage('All fields are required.').escape(),
  body('email').trim().notEmpty().withMessage('All fields are required.').isEmail().withMessage('Invalid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('All fields are required.').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('schoolCode').trim().notEmpty().withMessage('All fields are required.').escape(),
  handleValidationErrors
];

// Assignment Creation Rules
const validateAssignmentCreate = [
  body('title').trim().notEmpty().withMessage('Assignment title is required.').escape(),
  body('dueDate').optional().trim().escape(),
  handleValidationErrors
];

// Organic Session Save Rules
const validateOrganicSave = [
  body('compound_key').trim().notEmpty().withMessage('compound_key and student_functional_group are required fields.').escape(),
  body('student_functional_group').trim().notEmpty().withMessage('compound_key and student_functional_group are required fields.').escape(),
  handleValidationErrors
];

// Composite Session Save Rules
const validateCompositeSave = [
  body('q1_score').optional().isNumeric().withMessage('q1_score must be a number.'),
  body('q2_score').optional().isNumeric().withMessage('q2_score must be a number.'),
  body('q3_score').optional().isNumeric().withMessage('q3_score must be a number.'),
  handleValidationErrors
];

// School Creation Rules
const validateSchoolCreate = [
  body('name').trim().notEmpty().withMessage('School name and admin code are required.').escape(),
  body('adminCode').trim().notEmpty().withMessage('School name and admin code are required.').escape(),
  body('county').optional().trim().escape(),
  handleValidationErrors
];

// AI Tutor Hint Rules
const validateTutorHint = [
  body('experimentType').optional().trim().escape(),
  body('studentQuery').optional().trim().escape(),
  handleValidationErrors
];

// Grade KCSE Observation Rules
const validateGradeKcse = [
  body('studentObservation').trim().notEmpty().withMessage('studentObservation is required.').escape(),
  handleValidationErrors
];

module.exports = {
  validateStudentRegister,
  validateTeacherRegister,
  validateLogin,
  validateSessionSave,
  validateQualitativeSave,
  validateAssignmentCreate,
  validateOrganicSave,
  validateCompositeSave,
  validateSchoolCreate,
  validateTutorHint,
  validateGradeKcse,
  handleValidationErrors
};
