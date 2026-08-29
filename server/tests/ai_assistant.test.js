// ============================================================
//  VirtuLab Kenya — AI Teacher Exam Assistant Test Suite
// ============================================================

process.env.NODE_ENV = 'test';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const jwt = require('jsonwebtoken');

const app = require('../index');
const aiExamService = require('../services/aiExamAssistantService');

let server;
let port = 0;
let teacherToken;
let studentToken;

function url(path) {
  return `http://127.0.0.1:${port}${path}`;
}

describe('VirtuLab Kenya — AI Teacher Exam Assistant Suite', () => {

  before(async () => {
    process.env.JWT_SECRET = 'test_secret_key_12345';
    teacherToken = jwt.sign({ id: 1, role: 'teacher', name: 'Test Teacher', email: 'teacher@virtulab.ke' }, process.env.JWT_SECRET);
    studentToken = jwt.sign({ id: 2, role: 'student', name: 'Test Student', email: 'student@virtulab.ke' }, process.env.JWT_SECRET);

    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  /* 1. AUTHENTICATION & ACCESS CONTROL */
  it('POST /api/ai-assistant/generate-exam — should reject unauthenticated request with 401', async () => {
    const res = await fetch(url('/api/ai-assistant/generate-exam'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Form 4 Redox Titration' })
    });
    assert.strictEqual(res.status, 401);
  });

  it('POST /api/ai-assistant/generate-exam — should reject student account with 403', async () => {
    const res = await fetch(url('/api/ai-assistant/generate-exam'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ prompt: 'Form 4 Redox Titration' })
    });
    assert.strictEqual(res.status, 403);
  });

  /* 2. VALIDATION */
  it('POST /api/ai-assistant/generate-exam — should reject empty prompt with 400', async () => {
    const res = await fetch(url('/api/ai-assistant/generate-exam'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({ prompt: '   ' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /provide an exam idea/i);
  });

  it('POST /api/ai-assistant/parse-paper — should reject request without file or text with 400', async () => {
    const res = await fetch(url('/api/ai-assistant/parse-paper'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({})
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /file or paste/i);
  });

  /* 3. IDEA-TO-EXAM GENERATION */
  it('POST /api/ai-assistant/generate-exam — should generate a complete exam blueprint with teacher token', async () => {
    const res = await fetch(url('/api/ai-assistant/generate-exam'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({
        prompt: 'Form 4 Mock on Redox titration of KMnO4 and Fe2+, unknown zinc sulfate salt, and an organic alkene test',
        formLevel: 'Form 4',
        moduleType: 'kcseComposite',
        difficulty: 'standard',
        durationMinutes: 135
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.exam);
    assert.strictEqual(body.exam.titrationType, 'kcseComposite');
    assert.strictEqual(body.exam.durationMinutes, 135);

    // Verify Blueprint structure
    const cfg = body.exam.examConfig;
    assert.ok(cfg.q1, 'Should have Q1 Volumetric');
    assert.ok(cfg.q2, 'Should have Q2 Qualitative');
    assert.ok(cfg.q3, 'Should have Q3 Organic');
    assert.ok(body.exam.markingScheme, 'Should generate KNEC marking scheme');
    assert.ok(body.exam.confidentialPrepGuide, 'Should generate lab technician confidential prep guide');
  });

  /* 4. PAPER PARSING */
  it('POST /api/ai-assistant/parse-paper — should parse text/document into exam blueprint', async () => {
    const mockPaperText = `
      KENYA NATIONAL EXAMINATIONS COUNCIL
      CHEMISTRY PRACTICAL PAPER 3 (233/3)
      Question 1: You are provided with 0.100M HCl (Solution A) and NaOH (Solution B).
      Question 2: Solid Y contains one cation and one anion.
      Question 3: Liquid Z is an organic liquid.
    `;

    const res = await fetch(url('/api/ai-assistant/parse-paper'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({
        textContent: mockPaperText,
        teacherNotes: 'Prioritize standard KNEC concentrations'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.exam);
    assert.ok(body.exam.examConfig);
  });

  /* 5. CONVERSATIONAL REFINEMENT */
  it('POST /api/ai-assistant/refine-exam — should modify draft according to teacher instruction', async () => {
    const initialDraft = {
      title: 'KCSE Chemistry Practical Exam',
      formLevel: 'Form 4',
      titrationType: 'kcseComposite',
      instructions: 'Complete all questions.',
      durationMinutes: 135,
      examConfig: {
        presetKey: 'custom',
        q1: { solutionA: '0.1M HCl', solutionB: '0.1M NaOH', pipetteVolume: 25.0, indicator: 'phenolphthalein' },
        q2: { sampleName: 'Solid Y', trueSaltKey: 'Pb(NO3)2', trueCation: 'Pb2+', trueAnion: 'NO3-' },
        q3: { sampleName: 'Liquid Z', trueOrganicKey: 'Ethanol', trueFunctionalGroup: 'Alkanol (-OH)' }
      },
      markingScheme: 'Initial Marking Scheme',
      confidentialPrepGuide: 'Initial Prep Guide'
    };

    const res = await fetch(url('/api/ai-assistant/refine-exam'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({
        currentDraft: initialDraft,
        instruction: 'Change pipette to 20 cm3 and use methyl orange indicator'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.exam);
    assert.strictEqual(body.exam.examConfig.q1.pipetteVolume, 20.0);
    assert.strictEqual(body.exam.examConfig.q1.indicator, 'methylOrange');
  });

  /* 6. SERVICE PRESET INTEGRITY */
  it('aiExamAssistantService — should provide verified fallback presets', () => {
    assert.ok(aiExamService.FALLBACK_PRESETS.redox);
    assert.ok(aiExamService.FALLBACK_PRESETS.classic);
    assert.strictEqual(aiExamService.FALLBACK_PRESETS.redox.examConfig.q1.ratioB, 5);
    assert.strictEqual(aiExamService.FALLBACK_PRESETS.classic.examConfig.q1.pipetteVolume, 25.0);
  });

});
