// ============================================================
//  VirtuLab Kenya — AI Practical Tutor Service (Gemini 3.5 Flash-Lite)
// ============================================================

const config = require('../config');

const DEFAULT_MODEL = config.gemini?.defaultModel || 'gemini-3.5-flash-lite';

/**
 * Helper to execute a prompt call against the Gemini API.
 * @param {string} prompt 
 * @param {number} maxTokens 
 * @returns {Promise<string>}
 */
async function callGemini(prompt, maxTokens = 2048) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('AI_NOT_CONFIGURED');
  }
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.6
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Gemini API Error]:', response.status, errText);
    throw new Error('GEMINI_API_ERROR');
  }

  const data = await response.json();
  const candidate = data.candidates && data.candidates[0];
  const text = candidate && candidate.content && candidate.content.parts
    ? candidate.content.parts.map(p => p.text || '').join('').trim()
    : '';

  if (!text || (candidate && candidate.finishReason === 'MAX_TOKENS')) {
    throw new Error('GEMINI_RESPONSE_TRUNCATED');
  }

  return text;
}

/**
 * Formats structured lab context for Socratic AI tutoring.
 */
function formatLabContext(context = {}) {
  const lines = [];
  if (context.labType) lines.push(`- Laboratory Module: ${context.labType}`);
  if (context.practicalTitle) lines.push(`- Practical / Title: ${context.practicalTitle}`);
  if (context.gasName) lines.push(`- Target Gas: ${context.gasName}`);
  if (context.reactants) lines.push(`- Active Reactants: ${context.reactants}`);
  if (context.analyte) lines.push(`- Analyte (Solution A): ${context.analyte}`);
  if (context.titrant) lines.push(`- Titrant (Solution B): ${context.titrant}`);
  if (context.indicator) lines.push(`- Indicator: ${context.indicator}`);
  if (context.analyteVolume) lines.push(`- Pipette Aliquot Volume: ${context.analyteVolume}`);
  if (context.buretteVolume) lines.push(`- Current Burette Volume: ${context.buretteVolume}`);
  if (Array.isArray(context.recordedTrials) && context.recordedTrials.length > 0) {
    lines.push(`- Recorded Titres: ${context.recordedTrials.join(', ')}`);
  }
  if (context.sampleAppearance) lines.push(`- Specimen Appearance: ${context.sampleAppearance}`);
  if (context.sampleSolubility) lines.push(`- Specimen Solubility: ${context.sampleSolubility}`);
  if (Array.isArray(context.testsCompletedList) && context.testsCompletedList.length > 0) {
    lines.push(`- Tests Completed: ${context.testsCompletedList.join('; ')}`);
  }
  if (context.selectedCation) lines.push(`- Candidate Cation: ${context.selectedCation}`);
  if (context.selectedAnion) lines.push(`- Candidate Anion: ${context.selectedAnion}`);
  if (context.selectedDrying) lines.push(`- Selected Drying Agent: ${context.selectedDrying}`);
  if (context.selectedCollection) lines.push(`- Selected Collection Method: ${context.selectedCollection}`);
  if (context.heatingEnabled) lines.push(`- Thermal State: ${context.heatingEnabled}`);
  if (context.gasGenerated) lines.push(`- Reaction Evolution: ${context.gasGenerated}`);
  if (Array.isArray(context.testsPerformed) && context.testsPerformed.length > 0) {
    lines.push(`- Confirmatory Tests: ${context.testsPerformed.join('; ')}`);
  }
  if (context.selectedFunctionalGroup) lines.push(`- Deduced Functional Group: ${context.selectedFunctionalGroup}`);
  if (context.activeStep || context.stage) {
    lines.push(`- Current Step / Stage: ${context.activeStep || context.stage}`);
  }
  if (context.lastErrorOrFeedback) {
    lines.push(`- Recent Observation / Feedback / Alert: "${context.lastErrorOrFeedback}"`);
  }
  if (context.additionalNotes) {
    lines.push(`- Additional Lab Context: ${context.additionalNotes}`);
  }

  // Fallbacks for legacy callers
  if (lines.length === 0) {
    if (context.reagents) lines.push(`- Reagents: ${context.reagents}`);
    if (context.observation) lines.push(`- Observation: ${context.observation}`);
    if (context.titrationTitle) lines.push(`- Titration: ${context.titrationTitle}`);
    if (context.studentAverage) lines.push(`- Student Average: ${context.studentAverage}`);
    if (context.studentAnswer) lines.push(`- Student Answer: ${context.studentAnswer}`);
  }

  return lines.length > 0 ? lines.join('\n') : '- General laboratory workbench mode';
}

/**
 * Generate a Socratic, hint-based response during practice experiments.
 * Never gives direct answers — coaches with guiding questions based on KNEC syllabus.
 */
async function generateSocraticHint({ experimentType, context = {}, studentQuery, history = [] }) {
  const formattedContext = formatLabContext(context);

  let conversationHistoryText = '';
  if (Array.isArray(history) && history.length > 0) {
    const recent = history.slice(-6);
    conversationHistoryText = '\nRecent Discussion:\n' + recent.map(h => `${h.role === 'user' ? 'Student' : 'Mwalimu AI'}: ${h.text}`).join('\n') + '\n';
  }

  const prompt = `You are "Mwalimu AI", a dedicated, supportive KCSE Chemistry Paper 3 (233/3 Practical) tutor at VirtuLab Kenya.
You are assisting a Kenyan secondary school student who is actively performing a virtual chemistry laboratory experiment.

Strict Pedagogical Directives:
1. DO NOT give away the final numerical value, unknown chemical identity, or final answer directly.
2. Provide 2 to 3 concise, friendly Socratic sentences that guide the student to deduce the correct next step, identify their error, or apply the relevant KCSE concept.
3. Explicitly reference their live lab context (their specific reagents, recorded readings, tests run, or recent feedback) so the coaching feels completely immediate and situated.
4. Uphold official KNEC KCSE practical standards (e.g., concordant titres within ±0.10 cm³, white precipitate soluble in excess NH₃(aq), dense white fumes with conc. HCl, downward delivery for dense gases, over water for insoluble gases).

Current Laboratory Context:
- Module: ${experimentType || 'Chemistry Practical'}
${formattedContext}
${conversationHistoryText}
Student's Question / Issue:
"${studentQuery || 'What should I observe or do next?'}"

Provide your Socratic guidance (2-3 sentences max) to help the student think through and solve the problem themselves:`;

  return callGemini(prompt, 1000);
}

/**
 * Automatically evaluates student qualitative/organic free-text observations against KNEC scheme.
 */
async function gradeKcseObservation({ testTitle, studentObservation, expectedObservation, expectedInference }) {
  const prompt = `You are an official KNEC KCSE Chemistry Paper 233/3 examiner marking a student's practical observation.

Test Name: ${testTitle || 'Practical Test'}
Student's Recorded Observation: "${studentObservation}"
Correct KNEC Marking Scheme Observation: "${expectedObservation}"
Expected Inferences: "${expectedInference}"

Task:
1. Rate the student's observation accuracy out of 10.
2. Identify missing mandatory KCSE keywords (e.g. "precipitate", "soluble in excess", "effervescence", "colorless gas").
3. Provide a brief 2-sentence feedback explaining what marks they earned and how to write it perfectly according to KNEC standards.

Respond in exact valid JSON format with NO markdown wrapping:
{
  "score": <number 0-10>,
  "isAccurate": <boolean>,
  "missingKeywords": [<string array of missing key terms>],
  "feedback": "<2-sentence explanation for student>"
}`;

  const rawResult = await callGemini(prompt, 1500);
  try {
    const cleaned = rawResult.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    return {
      score: 7,
      isAccurate: true,
      missingKeywords: [],
      feedback: rawResult
    };
  }
}

/**
 * Generate a worked solution for titration calculation using student numbers.
 */
async function generateWorkedSolution({ titrationTitle, equation, trials, sessionTitrantConc, sessionAnalyteVolume, ratio, correctAverage, expectedAnswer, answerSymbol }) {
  const prompt = `You are a KCSE Chemistry Paper 3 tutor showing a Kenyan secondary school student the full worked solution to their titration calculation, using their own actual numbers. Write it as short, clearly numbered plain-text lines (e.g. "1) ...", "2) ..."), one calculation step per line. Keep each numbered line under 20 words. Do not use markdown formatting.

Practical: ${titrationTitle || 'Titration'}
Balanced equation: ${equation || '(provided in question)'}
Their recorded titre readings (cm³): ${trials ? trials.map(t => Number(t).toFixed(2)).join(', ') : 'N/A'}
Titrant: ${sessionTitrantConc} M titrant
Analyte volume: ${sessionAnalyteVolume} cm³
Stoichiometric ratio: ${ratio}

Show these steps using the actual numbers above:
1. State the balanced chemical equation.
2. Identify concordant titre readings and calculate average (${correctAverage} cm³).
3. State mole ratio.
4. Calculate moles of titrant used.
5. Use mole ratio to find moles of ${answerSymbol || 'analyte'}.
6. Divide by analyte volume (in dm³) to get concentration (${expectedAnswer} mol/dm³).`;

  return callGemini(prompt, 3000);
}

module.exports = {
  callGemini,
  generateSocraticHint,
  gradeKcseObservation,
  generateWorkedSolution
};
