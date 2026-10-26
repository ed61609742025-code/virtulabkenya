// ============================================================
//  VirtuLab Kenya — AI Practical Tutor Service (Gemini 2.5 Flash / Flash-Lite)
// ============================================================

const config = require('../config');

const DEFAULT_MODEL = config.gemini?.defaultModel || 'gemini-3.8-flash';

/**
 * Context-aware pedagogical rule engine for KNEC Paper 3.
 * Serves as a 100% reliable fallback when LLM APIs are throttled, rate-limited, offline, or experiencing network downtime.
 */
function generatePedagogicalFallback({ experimentType = '', context = {}, studentQuery = '' }) {
  const qLower = (studentQuery || '').toLowerCase().trim();
  const labType = (context.labType || experimentType || '').toLowerCase();

  // 1. Common greetings
  if (/^(hi|hello|hey|habari|sasa|good\s*(morning|afternoon|evening)|hallo|mambo)$/i.test(qLower)) {
    const labTitle = context.practicalTitle || context.labType || 'Chemistry Practical';
    return `👋 Habari! I am Mwalimu AI, your KCSE Practical Tutor. I am actively monitoring your ${labTitle} bench. What observation, calculation, or next step can I help you deduce?`;
  }

  // 2. Error / Warning Alert Explanations
  if (context.lastErrorOrFeedback && (qLower.includes('error') || qLower.includes('wrong') || qLower.includes('mistake') || qLower.includes('why') || qLower.includes('fix'))) {
    const err = context.lastErrorOrFeedback.toLowerCase();
    if (err.includes('concordant') || err.includes('titre') || err.includes('±0.10')) {
      return `In KNEC KCSE Paper 3, titres are only concordant if they fall within ±0.10 cm³ of each other. Check your initial and final meniscus readings to eliminate parallax errors, and reject any non-concordant outlier trial.`;
    }
    if (err.includes('drying') || (err.includes('ammonia') && (err.includes('gas') || err.includes('dry'))) || err.includes('h2so4')) {
      return `Remember that ammonia is a basic alkaline gas (NH₃). It chemically reacts with concentrated sulfuric acid to form ammonium sulfate, so it cannot be dried with H₂SO₄. Quicklime (CaO) must be used instead.`;
    }
    if (err.includes('precipitate') || err.includes('excess') || err.includes('insoluble')) {
      return `Review the KNEC solubility rules: Zn²⁺, Al³⁺, and Pb²⁺ form white precipitates soluble in excess NaOH to give colorless solutions, but only Zn²⁺ forms a soluble complex ammine in excess aqueous ammonia. Al³⁺ and Pb²⁺ remain insoluble in excess NH₃(aq).`;
    }
    if (err.includes('indicator') || err.includes('color')) {
      return `Check that you added 2–3 drops of the correct indicator before titrating. Phenolphthalein turns pink in base and colorless in acid, while methyl orange turns pink/red in acid and yellow in base.`;
    }
    return `Let's analyze this observation: "${context.lastErrorOrFeedback}". Review your reagent concentrations and procedure steps to identify the discrepancy according to the KNEC Paper 3 rubric.`;
  }

  // 3. Bench-Specific Socratic Logic
  if (labType.includes('titration') || labType.includes('volumetric')) {
    if (qLower.includes('mole') || qLower.includes('calculat') || qLower.includes('molar') || qLower.includes('formula')) {
      return `To find moles, first determine your average concordant titre volume within ±0.10 cm³. Then calculate moles of titrant using Moles = (Molarity × Volume in cm³) ÷ 1000. How does the stoichiometric ratio from the balanced equation connect this to the analyte?`;
    }
    if (qLower.includes('ratio') || qLower.includes('equation')) {
      return `Look at the stoichiometric coefficients in your balanced chemical equation. The mole ratio of acid to base tells you how many moles of analyte react completely with one mole of titrant.`;
    }
    if (qLower.includes('indicator') || qLower.includes('end-point') || qLower.includes('color')) {
      return `The end-point is reached when a single drop of titrant causes a permanent color change persisting for at least 30 seconds. For phenolphthalein, it changes from pink to colorless (or colorless to pale pink).`;
    }
    return `In volumetric analysis, ensure your burette is clamped vertically and read at the bottom of the meniscus at eye level. Record all titres consistently to 2 decimal places with the second digit being 0 or 5. What is your current burette reading?`;
  }

  if (labType.includes('qualitative') || labType.includes('salt')) {
    if (qLower.includes('cation') || qLower.includes('naoh') || qLower.includes('ammonia') || qLower.includes('nh3') || qLower.includes('precipitate')) {
      return `To identify your cation, observe the initial precipitate color and its solubility in excess reagent: white precipitate soluble in excess NaOH indicates Zn²⁺, Al³⁺, or Pb²⁺. Then test with excess aqueous ammonia — which cation forms a soluble tetrammine complex [Zn(NH₃)₄]²⁺?`;
    }
    if (qLower.includes('flame') || qLower.includes('color') || qLower.includes('colour')) {
      return `A clean glass rod flame test is the signature KNEC test: Ca²⁺ gives a brick-red flame, Na⁺ gives an intense golden yellow flame, K⁺ gives a lilac flame, and Cu²⁺ gives a green/blue flame. Did your specimen impart a persistent color to the non-luminous flame?`;
    }
    if (qLower.includes('anion') || qLower.includes('gas') || qLower.includes('carbonate') || qLower.includes('sulfate') || qLower.includes('chloride')) {
      return `For anions: effervescence with dilute HNO₃ producing a gas that forms a white precipitate with lime water confirms CO₃²⁻. Formation of a white precipitate with Ba(NO₃)₂ insoluble in dilute acid confirms SO₄²⁻. White precipitate with AgNO₃ insoluble in dilute HNO₃ confirms Cl⁻.`;
    }
    return `Start by describing the physical appearance and crystalline nature of your specimen. Then dissolve a portion in distilled water to determine solubility before conducting confirmatory cation and anion tests. What did your first test show?`;
  }

  if (labType.includes('gas')) {
    if (qLower.includes('dry') || qLower.includes('agent')) {
      return `Remember the rule of thumb for drying gases: acidic gases (like Cl₂, SO₂, CO₂) use concentrated H₂SO₄; basic gases (like NH₃) use quicklime (CaO); neutral gases (like H₂, O₂) can use anhydrous CaCl₂. Which gas are you generating?`;
    }
    if (qLower.includes('collect') || qLower.includes('delivery')) {
      return `Gases less dense than air are collected by upward delivery (downward displacement of air); gases denser than air are collected by downward delivery; insoluble gases are collected over water. Compare your gas's molar mass (relative to air ≈ 28.8 g/mol) and its solubility.`;
    }
    return `Ensure your reaction vessel is properly clamped and all rubber bungs are tightly sealed. When heating is required, warm gently across the base of the boiling tube before concentrating the flame on the reactants. What observation confirmed gas evolution?`;
  }

  if (labType.includes('organic')) {
    if (qLower.includes('bromine') || qLower.includes('unsaturat') || qLower.includes('double')) {
      return `Immediate decolourization of reddish-brown bromine water in the dark confirms unsaturation (a carbon-carbon double or triple bond, >C=C< or -C≡C-). Saturated compounds do not decolourize bromine water in the dark.`;
    }
    if (qLower.includes('flame') || qLower.includes('smok') || qLower.includes('soot')) {
      return `A luminous yellow sooty (smoky) flame indicates a high carbon-to-hydrogen ratio characteristic of unsaturated hydrocarbons or aromatic compounds. A clean, non-luminous pale blue flame indicates a low carbon-to-hydrogen ratio or an alkanol.`;
    }
    if (qLower.includes('acid') || qLower.includes('carbonate') || qLower.includes('effervescence')) {
      return `Effervescence with solid sodium carbonate or sodium hydrogen carbonate releasing a colorless gas that forms a white precipitate in lime water confirms an alkanoic acid (-COOH group). Alkanols do not react with carbonates.`;
    }
    return `In organic qualitative analysis, carefully observe the physical state, burning characteristics on a clean metallic spatula, and reactions with bromine water, acidified KMnO₄/K₂Cr₂O₇, and sodium carbonate. What was your flame test observation?`;
  }

  if (labType.includes('rate') || labType.includes('kinetic')) {
    if (qLower.includes('cross') || qLower.includes('thio') || qLower.includes('disappear')) {
      return `For the disappearing cross experiment, sodium thiosulfate reacts with hydrochloric acid to precipitate colloidal sulfur: Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl(aq) + SO₂(g) + S(s) + H₂O(l). The rate of reaction is inversely proportional to time (Rate ∝ 1/t).`;
    }
    if (qLower.includes('tangent') || qLower.includes('gradient') || qLower.includes('slope')) {
      return `To find the rate at a specific time, draw a smooth tangent to the curve at that exact time point. Construct a large right-angled triangle and calculate gradient = Δ(Volume of Gas) ÷ Δ(Time). Ensure the units are cm³/s.`;
    }
    return `Reaction rates depend on collision frequency and kinetic energy. Increasing concentration, temperature, or surface area increases the frequency of successful collisions exceeding activation energy (Ea). What variable are you testing in this trial?`;
  }

  if (labType.includes('energy') || labType.includes('thermo')) {
    if (qLower.includes('mc') || qLower.includes('formula') || qLower.includes('delta') || qLower.includes('heat') || qLower.includes('joule')) {
      return `Use the heat equation Q = m·c·ΔT, where m is the total mass of solution in grams (assuming density = 1.0 g/cm³), c = 4.2 J/g·°C, and ΔT is the temperature change (T₂ - T₁). Then calculate molar enthalpy ΔH = Q ÷ (moles of limiting reagent × 1000) in kJ/mol.`;
    }
    if (qLower.includes('extrapolat') || qLower.includes('graph') || qLower.includes('cooling')) {
      return `In KNEC thermochemistry cooling curves, extrapolate both the pre-mixing temperature line and the post-mixing cooling line back to the exact time of mixing. The vertical distance between these two extrapolated lines gives the theoretical maximum temperature change (ΔT) without heat loss.`;
    }
    return `Remember that a rise in temperature indicates an exothermic reaction with a negative enthalpy change (-ΔH), while a fall in temperature indicates an endothermic reaction (+ΔH). What was your initial and maximum recorded temperature?`;
  }

  if (labType.includes('solubil') || labType.includes('crystal')) {
    if (qLower.includes('calculat') || qLower.includes('100g') || qLower.includes('formula')) {
      return `Solubility is defined as the maximum mass of solute in grams that dissolves in 100g of water at a given temperature. Calculate it using: Solubility = (Mass of Salt in g ÷ Volume of Water in cm³) × 100. For example, 5.0g in 10.0 cm³ water gives 50.0 g/100g H₂O.`;
    }
    if (qLower.includes('crystal') || qLower.includes('temp') || qLower.includes('cool')) {
      return `Watch the boiling tube carefully under gentle, continuous stirring with the thermometer as it cools. The crystallization temperature is the exact reading when the first tiny sparkling crystals appear in the bulk of the solution.`;
    }
    return `In solubility practicals, adding successive portions of distilled water (serial dilution) dilutes the solution, so crystallization occurs at lower temperatures. Plot solubility on the y-axis and crystallization temperature on the x-axis to obtain the characteristic solubility curve.`;
  }

  // Universal Socratic guidance
  return `To make progress on this practical, refer to your recorded observations and identify the relevant KNEC Paper 3 criteria. What specific measurement, observation, or calculation step are you currently working through?`;
}

/**
 * Helper to execute a prompt call against the Gemini API with automatic model fallback.
 * @param {string} prompt 
 * @param {number} maxTokens 
 * @returns {Promise<string>}
 */
async function callGemini(prompt, maxTokens = 2048) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  const primaryModel = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const candidateModels = [primaryModel, 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];
  const models = [...new Set(candidateModels.filter(Boolean))];

  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: Math.max(maxTokens, 2048),
            temperature: 0.6
          }
        })
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[Gemini API Warning] Model ${model} returned ${response.status}:`, errText.slice(0, 160));
        lastError = new Error(`GEMINI_API_ERROR_${response.status}`);
        continue;
      }

      const data = await response.json();
      const candidate = data.candidates && data.candidates[0];
      const text = candidate && candidate.content && candidate.content.parts
        ? candidate.content.parts.map(p => p.text || '').join('').trim()
        : '';

      if (text) {
        return text;
      }
    } catch (err) {
      console.warn(`[Gemini Request Warning] Model ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('GEMINI_API_ERROR');
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
  if (context.activeExperiment) lines.push(`- Active Kinetics Experiment: ${context.activeExperiment}`);
  if (context.reactionConditions) lines.push(`- Reaction Conditions: ${context.reactionConditions}`);
  if (context.reactionProgress) lines.push(`- Reaction Progress: ${context.reactionProgress}`);
  if (context.elapsedTime) lines.push(`- Elapsed Timer: ${context.elapsedTime}`);
  if (context.category) lines.push(`- Practical Category: ${context.category}`);
  if (context.initialTemp) lines.push(`- Initial Temperature: ${context.initialTemp}`);
  if (context.currentTemp) lines.push(`- Current Temperature: ${context.currentTemp}`);
  if (context.tempChange) lines.push(`- Temperature Change (ΔT): ${context.tempChange}`);
  if (context.thermalStatus) lines.push(`- Thermal Apparatus State: ${context.thermalStatus}`);
  if (context.solute) lines.push(`- Solute Salt: ${context.solute}`);
  if (context.saltMass) lines.push(`- Solute Mass: ${context.saltMass}`);
  if (context.waterVolume) lines.push(`- Water Volume: ${context.waterVolume}`);
  if (context.solutionTemp) lines.push(`- Solution Temperature: ${context.solutionTemp}`);
  if (context.burnerMode) lines.push(`- Burner State: ${context.burnerMode}`);
  if (context.coolingMode) lines.push(`- Cooling State: ${context.coolingMode}`);
  if (context.crystTemp) lines.push(`- Crystallization Temperature: ${context.crystTemp}`);
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
  const qLower = (studentQuery || '').trim().toLowerCase();

  // 1. Instant pedagogical greeting
  if (/^(hi|hello|hey|habari|sasa|good\s*(morning|afternoon|evening)|hallo|mambo)$/i.test(qLower)) {
    const labTitle = context.practicalTitle || context.labType || experimentType || 'Chemistry Practical';
    return `👋 Habari! I am Mwalimu AI, your KCSE Practical Tutor. I am actively monitoring your ${labTitle} bench. What observation, calculation, or next step can I help you deduce?`;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  try {
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

    return await callGemini(prompt, 2048);
  } catch (err) {
    console.warn('[AI Tutor Warning] Gemini call failed, falling back to curriculum rule engine:', err.message);
    return generatePedagogicalFallback({ experimentType, context, studentQuery });
  }
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

  try {
    const rawResult = await callGemini(prompt, 2048);
    const cleaned = rawResult.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('[Grade KCSE Warning] Gemini unavailable, using rule-based evaluation:', err.message);
    const obsLower = (studentObservation || '').toLowerCase();
    const expLower = (expectedObservation || '').toLowerCase();
    
    // Check keywords overlap
    const keywords = expLower.split(/[\s,;.]+/).filter(w => w.length > 3);
    const matched = keywords.filter(w => obsLower.includes(w));
    const ratio = keywords.length > 0 ? (matched.length / keywords.length) : 0.8;
    const score = Math.min(10, Math.max(4, Math.round(ratio * 10)));

    return {
      score,
      isAccurate: score >= 6,
      missingKeywords: keywords.filter(w => !obsLower.includes(w)).slice(0, 3),
      feedback: score >= 7
        ? 'Good observation! Ensure you state precipitate solubility in excess reagent clearly to earn full KNEC marks.'
        : 'Ensure your description mentions both initial precipitate color and whether it dissolves in excess reagent.'
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

  try {
    return await callGemini(prompt, 3000);
  } catch (err) {
    console.warn('[Worked Solution Warning] Gemini unavailable, using procedural solution:', err.message);
    const avg = Number(correctAverage || 24.50).toFixed(2);
    const conc = Number(sessionTitrantConc || 0.1).toFixed(4);
    const volAna = Number(sessionAnalyteVolume || 25).toFixed(1);
    const molesTitrant = ((avg * conc) / 1000).toExponential(3);
    return `1) Balanced Equation: ${equation || 'Provided in KCSE Paper 3 booklet'}
2) Average Titre = ${avg} cm³ (from concordant titres within ±0.10 cm³)
3) Moles of Titrant = (${conc} M × ${avg} cm³) ÷ 1000 = ${molesTitrant} moles
4) Stoichiometric Mole Ratio = ${ratio}
5) Moles of Analyte in ${volAna} cm³ = calculated via mole ratio
6) Molarity of Analyte = (Moles of Analyte ÷ ${volAna}) × 1000 = ${expectedAnswer} mol/dm³`;
  }
}

module.exports = {
  callGemini,
  generateSocraticHint,
  generatePedagogicalFallback,
  gradeKcseObservation,
  generateWorkedSolution
};
