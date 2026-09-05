// ============================================================
//  VirtuLab Kenya — AI Practical Tutor Service (Gemini 2.5)
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
 * Generate a Socratic, hint-based response during practice experiments.
 * Never gives direct answers — coaches with guiding questions based on KNEC syllabus.
 */
async function generateSocraticHint({ experimentType, context, studentQuery }) {
  const prompt = `You are a supportive KCSE Chemistry Paper 3 (Practical) lab tutor helping a Kenyan secondary school student during a ${experimentType || 'chemistry'} practice lab.

Strict Instruction: DO NOT give direct answers or write out the exact conclusion. Guide the student using 2 short, conversational Socratic questions/hints based on the KNEC KCSE syllabus.

Experiment Context:
- Type: ${experimentType}
- Current State/Reagents: ${context?.reagents || context?.titrationTitle || 'Standard setup'}
- Current Reaction/Observation: ${context?.observation || 'In progress'}
- Student Question/Issue: ${studentQuery || 'How do I proceed?'}

Provide a 2-sentence guiding hint to help them deduce the next step themselves.`;

  return callGemini(prompt, 1500);
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
