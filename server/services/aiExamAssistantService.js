// ============================================================
//  VirtuLab Kenya — AI Teacher Exam Assistant Service
//  Multimodal Exam Paper Parsing & Idea-to-Exam Generation (Gemini)
// ============================================================

const config = require('../config');

const DEFAULT_MODEL = config.gemini?.defaultModel || 'gemini-3.5-flash-lite';
const EXAM_MAX_TOKENS = config.gemini?.examAssistantMaxTokens || 8192;

/**
 * Standard KNEC Paper 3 Presets for Fallback / Offline / Test mode
 */
const FALLBACK_PRESETS = {
  redox: {
    title: 'KCSE Chemistry Paper 3 Mock — Redox Analysis & Transition Metals',
    titrationType: 'kcseComposite',
    instructions: 'You are provided with 0.020 M Potassium Manganate(VII) (Solution A), Ammonium Iron(II) Sulfate (Solution B), Solid Y, and Liquid Z. Follow all KNEC laboratory instructions carefully.',
    durationMinutes: 135,
    examConfig: {
      presetKey: 'series_4',
      q1: {
        calcType: 'redox_stoichiometry',
        solutionA: '0.020 M Potassium Manganate(VII) (KMnO₄)',
        solutionB: 'Ammonium Iron(II) Sulfate [(NH₄)₂Fe(SO₄)₂·6H₂O] ~0.100 M',
        ratioA: 1,
        ratioB: 5,
        pipetteVolume: 25.0,
        indicator: 'none',
        equation: 'MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)',
        trueAcidMolarity: 0.020,
        trueBaseMolarity: 0.100,
        trueTitre: 25.00,
        marks: 15,
        instructions: 'Titrate Solution B with Solution A until the first permanent pale pink coloration persists for at least 30 seconds.'
      },
      q2: {
        sampleName: 'Solid Y',
        sampleDesc: 'A white crystalline inorganic salt containing one cation and one anion.',
        trueSaltKey: 'ZnSO4',
        trueSaltName: 'Zinc Sulfate — ZnSO₄',
        trueCation: 'Zn2+',
        trueAnion: 'SO42-',
        marks: 15,
        tests: [
          {
            id: 'q2_solubility',
            prompt: '(i) Describe the appearance of Solid Y and dissolve it in about 10 cm³ of distilled water.',
            correctObs: 'White crystalline solid dissolves completely to give a clear colorless solution',
            correctInf: 'Soluble salt; absence of colored transition metal ions (Fe²⁺, Fe³⁺, Cu²⁺ absent)'
          },
          {
            id: 'q2_naoh',
            prompt: '(ii) To 2 cm³ of solution Y, add 2M NaOH dropwise until in excess.',
            correctObs: 'White precipitate formed, soluble in excess NaOH to form a colorless solution',
            correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present'
          },
          {
            id: 'q2_nh3',
            prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous NH₃ dropwise until in excess.',
            correctObs: 'White precipitate formed, soluble in excess aqueous NH₃ to form a colorless solution',
            correctInf: 'Zn²⁺ confirmed present (Al³⁺ and Pb²⁺ are insoluble in excess NH₃)'
          },
          {
            id: 'q2_anion',
            prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of dilute HNO₃ followed by 3 drops of Ba(NO₃)₂ solution.',
            correctObs: 'Dense white precipitate formed, insoluble on addition of dilute nitric acid',
            correctInf: 'SO₄²⁻ confirmed present'
          }
        ]
      },
      q3: {
        sampleName: 'Liquid Z',
        sampleDesc: 'A clear, flammable organic liquid with a pleasant scent.',
        trueOrganicKey: 'Cyclohexene',
        trueOrganicName: 'Cyclohexene — C₆H₁₀',
        trueFunctionalGroup: 'Unsaturated Hydrocarbon (Alkene >C=C<)',
        marks: 10,
        tests: [
          {
            id: 'q3_ignition',
            prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite in a non-luminous Bunsen flame.',
            correctObs: 'Burns with a luminous, smoky/sooty yellow flame with black soot deposition',
            correctInf: 'Unsaturated organic compound / high carbon-to-hydrogen ratio (>C=C< or >C≡C<)'
          },
          {
            id: 'q3_litmus',
            prompt: '(ii) To 2 cm³ of Liquid Z, test with moist red and blue litmus papers.',
            correctObs: 'Both red and blue litmus papers retain their color; neutral pH ~ 7',
            correctInf: 'Neutral organic liquid; carboxylic acid (—COOH) and amine absent'
          },
          {
            id: 'q3_kmno4',
            prompt: '(iii) To 2 cm³ of Liquid Z, add 3 drops of acidified KMnO₄ and warm gently.',
            correctObs: 'Purple acidified KMnO₄ solution is rapidly decolorized (turns colorless)',
            correctInf: 'Unsaturated carbon-carbon double bond (>C=C<) or reducing group present'
          },
          {
            id: 'q3_nahco3',
            prompt: '(iv) To 2 cm³ of Liquid Z, add a half spatula-end of solid NaHCO₃.',
            correctObs: 'No effervescence / no gas bubbles observed',
            correctInf: 'Carboxylic acid (—COOH) absent'
          }
        ]
      }
    },
    markingScheme: `### Official KNEC Paper 3 Marking Scheme & Scoring Rubric
- **Question 1: Titration Analysis (15 Marks)**
  - Table of readings: 5.0 Marks (Complete table, decimal point consistency to 2 d.p., accuracy within ±0.20 cm³).
  - Average titre calculation: 1.0 Mark (Concordant values averaged to 2 d.p.).
  - Moles of Solution A ($MnO_4^-$): 2.0 Marks.
  - Moles of Solution B ($Fe^{2+}$): 3.0 Marks ($1:5$ stoichiometry applied).
  - Concentration of $Fe^{2+}$ in $mol/dm^3$: 2.0 Marks.
  - Concentration in $g/dm^3$ or RFM determination: 2.0 Marks.
- **Question 2: Qualitative Salt Analysis (15 Marks)**
  - Appearance & Solubility: 2.0 Marks (1 mk Obs, 1 mk Inf).
  - NaOH dropwise & excess: 3.0 Marks (1 mk Obs, 2 mk Inf: $Zn^{2+}, Al^{3+}, Pb^{2+}$).
  - $NH_3(aq)$ dropwise & excess: 4.0 Marks (2 mk Obs, 2 mk Inf: confirms $Zn^{2+}$).
  - $Ba(NO_3)_2$ + $HNO_3$: 4.0 Marks (2 mk Obs, 2 mk Inf: confirms $SO_4^{2-}$).
  - Final Deduction: 2.0 Marks (Cation: $Zn^{2+}$, Anion: $SO_4^{2-}$).
- **Question 3: Organic Functional Group (10 Marks)**
  - Ignition flame: 2.5 Marks (Sooty flame $\\rightarrow$ high $C:H$ ratio).
  - Litmus test: 2.5 Marks (Neutral $\\rightarrow$ neither acid nor base).
  - Acidified $KMnO_4$: 3.0 Marks (Decolorized $\\rightarrow$ $>C=C<$ confirmed).
  - $NaHCO_3$: 2.0 Marks (No effervescence $\\rightarrow$ $-COOH$ absent).`,
    confidentialPrepGuide: `### Confidential Instructions to School Science Laboratory Technicians
**1. Volumetric Reagents per Candidate:**
- $150\\text{ cm}^3$ of $0.020\\text{ M Potassium Manganate(VII)}$ ($KMnO_4$) labeled **Solution A**.
  - *Preparation:* Dissolve $3.16\\text{ g of } KMnO_4$ in $1\\text{ dm}^3$ of distilled water containing $50\\text{ cm}^3$ of concentrated $H_2SO_4$.
- $150\\text{ cm}^3$ of $0.100\\text{ M Ammonium Iron(II) Sulfate}$ labeled **Solution B**.
  - *Preparation:* Dissolve $39.2\\text{ g of } (NH_4)_2Fe(SO_4)_2\\cdot 6H_2O$ in $1\\text{ dm}^3$ of $1.0\\text{ M } H_2SO_4$.
- $50\\text{ cm}^3$ Burette, $25\\text{ cm}^3$ Pipette, pipette filler, 2 conical flasks ($250\\text{ cm}^3$), white tile, wash bottle with distilled water.

**2. Qualitative Analysis Reagents per Candidate:**
- About $2.0\\text{ g of Zinc Sulfate}$ crystals in a stoppered boiling tube labeled **Solid Y**.
- Access to: $2\\text{ M } NaOH$, $2\\text{ M aqueous } NH_3$, $0.5\\text{ M } Ba(NO_3)_2$, $2\\text{ M } HNO_3$, test tubes (5), test tube rack and holder.

**3. Organic Analysis Reagents per Candidate:**
- About $10\\text{ cm}^3$ of Cyclohexene in a small stoppered vial labeled **Liquid Z**.
- Access to: Metallic spatula, red and blue litmus paper, acidified $KMnO_4$, solid $NaHCO_3$, Bunsen burner.`
  },

  classic: {
    title: 'KCSE Chemistry Paper 3 Mock — Neutralization & Heavy Metal Halides',
    titrationType: 'kcseComposite',
    instructions: 'You are provided with 0.100 M Hydrochloric acid (Solution A), Sodium hydroxide (Solution B), Solid Y, and Liquid Z. Perform the experiments and record your findings.',
    durationMinutes: 135,
    examConfig: {
      presetKey: 'series_1',
      q1: {
        calcType: 'standard_molarity',
        solutionA: '0.100 M Hydrochloric Acid (HCl)',
        solutionB: 'Sodium Hydroxide (NaOH) ~0.100 M',
        ratioA: 1,
        ratioB: 1,
        pipetteVolume: 25.0,
        indicator: 'phenolphthalein',
        equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
        trueAcidMolarity: 0.100,
        trueBaseMolarity: 0.100,
        trueTitre: 25.00,
        marks: 15,
        instructions: 'Titrate Solution B with Solution A using 3 drops of phenolphthalein indicator until the pink color just turns colorless.'
      },
      q2: {
        sampleName: 'Solid Y',
        sampleDesc: 'A pure white inorganic crystalline salt.',
        trueSaltKey: 'Pb(NO3)2',
        trueSaltName: 'Lead(II) Nitrate — Pb(NO₃)₂',
        trueCation: 'Pb2+',
        trueAnion: 'NO3-',
        marks: 15,
        tests: [
          {
            id: 'q2_appearance',
            prompt: '(i) Describe the appearance of Solid Y and test its solubility in 10 cm³ of distilled water.',
            correctObs: 'White crystalline solid; dissolves completely in water to form a colorless solution',
            correctInf: 'Soluble salt; absence of colored transition metal ions (Fe²⁺, Fe³⁺, Cu²⁺ absent)'
          },
          {
            id: 'q2_naoh',
            prompt: '(ii) To 2 cm³ of solution Y, add 2M NaOH dropwise until in excess.',
            correctObs: 'White precipitate formed, dissolves in excess NaOH to form a colorless solution',
            correctInf: 'Pb²⁺, Zn²⁺, or Al³⁺ present'
          },
          {
            id: 'q2_nh3',
            prompt: '(iii) To 2 cm³ of solution Y, add 2M aqueous NH₃ dropwise until in excess.',
            correctObs: 'White precipitate formed, insoluble in excess aqueous NH₃',
            correctInf: 'Pb²⁺ or Al³⁺ present (Zn²⁺ absent)'
          },
          {
            id: 'q2_anion',
            prompt: '(iv) To 2 cm³ of solution Y, add 3 drops of dilute HNO₃ followed by 3 drops of Potassium Iodide (KI) solution.',
            correctObs: 'Bright yellow precipitate formed on addition of potassium iodide',
            correctInf: 'Pb²⁺ confirmed present'
          }
        ]
      },
      q3: {
        sampleName: 'Liquid Z',
        sampleDesc: 'A neutral, miscible organic liquid sample.',
        trueOrganicKey: 'Ethanol',
        trueOrganicName: 'Ethanol — C₂H₅OH',
        trueFunctionalGroup: 'Alkanol (-OH)',
        marks: 10,
        tests: [
          {
            id: 'q3_ignition',
            prompt: '(i) Place 2 drops of Liquid Z on a metallic spatula and ignite in a non-luminous Bunsen flame.',
            correctObs: 'Burns with a clean, non-sooty pale blue flame; leaves no carbon residue',
            correctInf: 'Saturated organic compound / low carbon-to-hydrogen ratio'
          },
          {
            id: 'q3_litmus',
            prompt: '(ii) To 2 cm³ of Liquid Z, test with moist blue and red litmus paper.',
            correctObs: 'Both red and blue litmus papers retain their color (neutral pH ~ 7)',
            correctInf: 'Neutral organic substance; carboxylic acid (—COOH) and amine absent'
          },
          {
            id: 'q3_kmno4',
            prompt: '(iii) To 2 cm³ of Liquid Z in a test tube, add 3 drops of acidified KMnO₄ and warm gently.',
            correctObs: 'Purple acidified KMnO₄ solution turns colorless (decolorized)',
            correctInf: 'Reducing organic compound / Primary or secondary alkanol (—OH) present'
          },
          {
            id: 'q3_nahco3',
            prompt: '(iv) To 2 cm³ of Liquid Z, add a half spatula-end of solid NaHCO₃.',
            correctObs: 'No effervescence / no gas evolved',
            correctInf: 'Carboxylic acid (—COOH) absent'
          }
        ]
      }
    },
    markingScheme: `### Official KNEC Paper 3 Marking Scheme
- **Q1 Volumetric (15M):** Titration table (5M), Concordant average titre (1M), Moles of NaOH (2M), Moles of HCl (2M), Molarity calculation (3M), Accuracy comparison (2M).
- **Q2 Qualitative Analysis (15M):** Solubility (2M), NaOH amphoteric test (3M), NH3 confirmation (4M), KI confirmatory test (4M), Final identification of Pb(NO3)2 (2M).
- **Q3 Organic Tests (10M):** Clean blue flame (2.5M), Neutral litmus (2.5M), Decolorization of KMnO4 on warming (3M), NaHCO3 negative test (2M).`,
    confidentialPrepGuide: `### Confidential Instructions to Laboratory Technicians
- **Solution A:** 0.100 M HCl (prepared from 8.6 cm³ concentrated 36% HCl diluted to 1000 cm³).
- **Solution B:** 0.100 M NaOH (prepared by dissolving 4.00 g NaOH pellets in 1000 cm³ distilled water).
- **Solid Y:** 2.0 g Lead(II) Nitrate per student.
- **Liquid Z:** 10 cm³ Ethanol (95% methylated spirit or absolute alcohol) per student.`
  }
};

/**
 * Supported simulation types for flexible exam paper parsing.
 * 'written' is the catch-all for question types without an existing interactive simulation.
 */
const SUPPORTED_SIMULATION_TYPES = [
  'titration',    // acid-base / redox / back-titration volumetric analysis
  'qualitative',  // inorganic salt identification
  'organic',      // organic functional group identification
  'energy',       // thermochemistry / enthalpy
  'rates',        // reaction kinetics / clock reactions
  'gas',          // gas preparation and collection
  'solubility',   // solubility curve / crystallization
  'written'       // any other question type → structured written response
];

/**
 * Converts legacy q1/q2/q3 examConfig format to new flexible questions[] array,
 * or passes through an existing questions[] array with validation.
 * Maintains full backward compatibility.
 */
function normalizeQuestionsArray(parsed) {
  // If already has questions array, validate and return it
  if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
    return parsed.questions.map((q, i) => {
      const simType = SUPPORTED_SIMULATION_TYPES.includes(q.simulationType) ? q.simulationType : 'written';
      let cfg = q.config ? { ...q.config } : null;

      if (simType === 'titration' && cfg) {
        if (Array.isArray(cfg.procedures) && cfg.procedures.length > 0) {
          cfg.hasMultipleProcedures = true;
          cfg.procedures = cfg.procedures.map((proc, pIdx) => ({
            procedureIndex: proc.procedureIndex || pIdx + 1,
            title: proc.title || `Procedure ${pIdx === 0 ? 'I' : (pIdx === 1 ? 'II' : pIdx + 1)}`,
            instructions: proc.instructions || '',
            solutionA: proc.solutionA || cfg.solutionA || 'Solution A',
            solutionB: proc.solutionB || cfg.solutionB || 'Solution B',
            pipetteVolume: Number(proc.pipetteVolume) || 25.0,
            indicator: proc.indicator || 'Phenolphthalein',
            indicatorStartColor: proc.indicatorStartColor || (proc.indicator && proc.indicator.toLowerCase().includes('methyl') ? '#FBBF24' : '#F472B6'),
            indicatorEndColor: proc.indicatorEndColor || (proc.indicator && proc.indicator.toLowerCase().includes('methyl') ? '#FB7185' : 'transparent'),
            trueTitre: Number(proc.trueTitre) || 25.0,
            tableTitle: proc.tableTitle || `Table ${pIdx + 1}: Titration Results`,
            tableMarks: Number(proc.tableMarks) || 4.0,
            questions: Array.isArray(proc.questions) ? proc.questions : []
          }));

          // Backfill top-level solutionA/solutionB/indicator from Procedure I if omitted at root
          if (!cfg.solutionA && cfg.procedures[0]?.solutionA) cfg.solutionA = cfg.procedures[0].solutionA;
          if (!cfg.solutionB && cfg.procedures[0]?.solutionB) cfg.solutionB = cfg.procedures[0].solutionB;
          if (!cfg.indicator && cfg.procedures[0]?.indicator) cfg.indicator = cfg.procedures[0].indicator;
          if (!cfg.trueTitre && cfg.procedures[0]?.trueTitre) cfg.trueTitre = cfg.procedures[0].trueTitre;
        }
      }

      return {
        number: q.number || i + 1,
        title: q.title || `Question ${i + 1}`,
        simulationType: simType,
        marks: Number(q.marks) || 10,
        config: cfg,
        prompt: q.prompt || '',
        subQuestions: Array.isArray(q.subQuestions) ? q.subQuestions : []
      };
    });
  }

  // Legacy: convert q1/q2/q3 to questions[]
  const questions = [];
  const cfg = parsed.examConfig || {};

  if (cfg.q1) {
    questions.push({
      number: 1,
      title: cfg.q1.title || 'Volumetric Analysis',
      simulationType: (() => {
        const type = parsed.titrationType || '';
        if (type === 'qualitative') return 'qualitative';
        if (type === 'organic') return 'organic';
        if (type === 'energy' || type === 'displacement' || type === 'neutralization') return 'energy';
        if (type === 'rates' || type === 'kinetics') return 'rates';
        if (type === 'gas') return 'gas';
        if (type === 'solubility') return 'solubility';
        return 'titration';
      })(),
      marks: Number(cfg.q1.marks) || 15,
      config: cfg.q1,
      prompt: '',
      subQuestions: []
    });
  }
  if (cfg.q2) {
    questions.push({
      number: 2,
      title: cfg.q2.title || 'Qualitative Salt Analysis',
      simulationType: 'qualitative',
      marks: Number(cfg.q2.marks) || 15,
      config: cfg.q2,
      prompt: '',
      subQuestions: []
    });
  }
  if (cfg.q3) {
    const isQ3Inorganic = Boolean(
      cfg.q3.trueSaltKey ||
      cfg.q3.trueCation ||
      (cfg.q3.sampleName && /solid/i.test(cfg.q3.sampleName)) ||
      (cfg.q3.tests && cfg.q3.tests.some(t => /naoh|ammonia|nh3|precipitation|cation|anion/i.test(t.prompt || '')))
    );
    questions.push({
      number: 3,
      title: cfg.q3.title || (isQ3Inorganic ? 'Inorganic Qualitative Analysis' : 'Organic Functional Group Analysis'),
      simulationType: isQ3Inorganic ? 'qualitative' : 'organic',
      marks: Number(cfg.q3.marks) || 10,
      config: cfg.q3,
      prompt: '',
      subQuestions: []
    });
  }

  return questions;
}

// Pre-populate questions[] array on fallback presets
FALLBACK_PRESETS.classic.questions = normalizeQuestionsArray(FALLBACK_PRESETS.classic);
FALLBACK_PRESETS.redox.questions = normalizeQuestionsArray(FALLBACK_PRESETS.redox);

/**
 * Call Gemini REST API with optional multimodal parts (base64 documents / images).
 */
async function callGeminiAssistant({ prompt, fileData = null, mimeType = null, maxTokens = EXAM_MAX_TOKENS }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const parts = [{ text: prompt }];

  if (fileData && typeof fileData === 'string') {
    // Normalize mimeType: Gemini requires standard MIME types like application/pdf, image/png, image/jpeg, etc.
    let resolvedMime = (mimeType || '').trim().toLowerCase();
    if (!resolvedMime || resolvedMime === 'application/octet-stream' || resolvedMime === 'application/x-pdf') {
      resolvedMime = 'application/pdf';
    }

    // Strip data URL header efficiently without creating multiple multi-megabyte copies in V8
    let cleanBase64 = fileData;
    const commaIdx = fileData.indexOf('base64,');
    if (commaIdx !== -1) {
      cleanBase64 = fileData.substring(commaIdx + 7);
    }
    cleanBase64 = cleanBase64.trim();

    parts.push({
      inlineData: {
        mimeType: resolvedMime,
        data: cleanBase64
      }
    });
  }

  // Timeout configurable via GEMINI_TIMEOUT_MS, default 75s for multimodal PDF exam paper synthesis
  const timeoutMs = parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 75000;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        maxOutputTokens: Math.min(maxTokens || EXAM_MAX_TOKENS, 8192),
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Gemini Exam Assistant Error]:', response.status, errText);
    let detailedMsg = `GEMINI_API_ERROR (${response.status})`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error && errJson.error.message) {
        detailedMsg = errJson.error.message;
      }
    } catch (_) {}
    throw new Error(detailedMsg);
  }

  const data = await response.json();
  const candidate = data.candidates && data.candidates[0];
  const text = candidate && candidate.content && candidate.content.parts
    ? candidate.content.parts.map(p => p.text || '').join('').trim()
    : '';

  if (!text) {
    throw new Error('GEMINI_EMPTY_RESPONSE');
  }

  return text;
}

/**
 * Clean and parse JSON safely from Gemini output with resilient truncation repair.
 */
function cleanAndParseJson(rawText) {
  if (!rawText || typeof rawText !== 'string') return {};
  let cleaned = rawText.trim();

  // 1. Direct parse
  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // 2. Extract from markdown code fences if wrapped
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
    try {
      return JSON.parse(cleaned);
    } catch (_) {}
  } else {
    // If there's leading conversational text before the root object, slice from first '{'
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace > 0) {
      cleaned = cleaned.substring(firstBrace);
      try {
        return JSON.parse(cleaned);
      } catch (_) {}
    }
  }

  // 3. Remove trailing commas before closing braces/brackets
  let sanitized = cleaned.replace(/,\s*([\}\]])/g, '$1');
  try {
    return JSON.parse(sanitized);
  } catch (_) {}

  // 4. Resilient repair for truncated output (e.g. token limits reached)
  let inString = false;
  let escaped = false;
  const stack = [];
  let s = '';

  for (let i = 0; i < sanitized.length; i++) {
    const ch = sanitized[i];
    s += ch;
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
    } else {
      if (ch === '"') {
        inString = true;
      } else if (ch === '{') {
        stack.push('}');
      } else if (ch === '[') {
        stack.push(']');
      } else if (ch === '}' || ch === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === ch) {
          stack.pop();
        }
      }
    }
  }

  // If stopped mid-string, close the string
  if (inString) {
    s += '"';
  }

  // Clean trailing comma or dangling colon before closing containers
  s = s.replace(/,\s*$/, '');
  s = s.replace(/:\s*$/, ': null');

  // Pop all unclosed braces/brackets in LIFO order
  while (stack.length > 0) {
    const closer = stack.pop();
    s = s.replace(/,\s*$/, '');
    s += closer;
  }

  // Clean trailing commas after closing
  s = s.replace(/,\s*([\}\]])/g, '$1');

  try {
    return JSON.parse(s);
  } catch (e2) {
    // 5. Handle unescaped control characters inside strings
    try {
      const fixedControls = s.replace(/[\u0000-\u001F]+/g, (m) => (m === '\n' ? '\\n' : m === '\r' ? '\\r' : m === '\t' ? '\\t' : ''));
      return JSON.parse(fixedControls);
    } catch (_) {
      throw new Error(`Invalid JSON from AI model: ${e2.message}`);
    }
  }
}

/**
 * Normalize and validate exam structure to conform to VirtuLab Kenya standards.
 */
function normalizeExamStructure(parsed, sourceMeta = {}) {
  const isComposite = parsed.titrationType === 'kcseComposite' || (!parsed.titrationType && parsed.examConfig?.q1);

  const normalized = {
    title: parsed.title || 'KCSE Chemistry Practical Examination',
    formLevel: parsed.formLevel || 'Form 4',
    titrationType: isComposite ? 'kcseComposite' : (parsed.titrationType || 'acidBase'),
    instructions: parsed.instructions || 'Follow all KNEC secondary chemistry laboratory instructions carefully.',
    durationMinutes: Number(parsed.durationMinutes) || (isComposite ? 135 : 60),
    examConfig: parsed.examConfig || {},
    markingScheme: parsed.markingScheme || '',
    confidentialPrepGuide: parsed.confidentialPrepGuide || ''
  };

  const metaObj = {
    generatedAt: new Date().toISOString(),
    source: sourceMeta.source || 'ai_generated',
    ...sourceMeta
  };
  normalized.meta = metaObj;
  normalized._meta = metaObj;

  // Ensure examConfig has proper defaults for composite exams
  if (isComposite) {
    normalized.examConfig.presetKey = normalized.examConfig.presetKey || 'custom';
    if (!normalized.examConfig.q1) normalized.examConfig.q1 = FALLBACK_PRESETS.classic.examConfig.q1;
    if (!normalized.examConfig.q2) normalized.examConfig.q2 = FALLBACK_PRESETS.classic.examConfig.q2;
    if (!normalized.examConfig.q3) normalized.examConfig.q3 = FALLBACK_PRESETS.classic.examConfig.q3;

    normalized.examConfig.q1.marks = Number(normalized.examConfig.q1.marks) || 15;
    normalized.examConfig.q2.marks = Number(normalized.examConfig.q2.marks) || 15;
    normalized.examConfig.q3.marks = Number(normalized.examConfig.q3.marks) || 10;

    // Preserve or infer authentic KNEC calcType
    if (!normalized.examConfig.q1.calcType) {
      const q1Title = (normalized.examConfig.q1.title || '').toLowerCase();
      const q1Instr = (normalized.examConfig.q1.instructions || '').toLowerCase();
      const solA = (normalized.examConfig.q1.solutionA || '').toLowerCase();
      if (q1Title.includes('water of crystallization') || q1Instr.includes('water of crystallization') || q1Instr.includes('hydrate')) {
        normalized.examConfig.q1.calcType = 'water_of_crystallization';
      } else if (q1Title.includes('percentage purity') || q1Instr.includes('purity') || q1Instr.includes('impure')) {
        normalized.examConfig.q1.calcType = 'percentage_purity';
      } else if (q1Title.includes('atomic mass') || q1Instr.includes('atomic mass') || q1Instr.includes('relative atomic mass')) {
        normalized.examConfig.q1.calcType = 'ram_metal';
      } else if (solA.includes('kmno4') || q1Instr.includes('redox') || solA.includes('manganate')) {
        normalized.examConfig.q1.calcType = 'redox_stoichiometry';
      } else {
        normalized.examConfig.q1.calcType = 'standard_molarity';
      }
    }
  }

  // Build flexible questions[] array (new format) alongside legacy examConfig (backward compat)
  normalized.questions = normalizeQuestionsArray(parsed);

  // Sync multi-procedure configuration to examConfig.q1 for composite exams
  if (Array.isArray(normalized.questions) && normalized.questions.length > 0) {
    const q1Obj = normalized.questions.find(q => q.number === 1);
    if (q1Obj && q1Obj.config && q1Obj.config.hasMultipleProcedures && Array.isArray(q1Obj.config.procedures)) {
      normalized.examConfig.q1 = {
        ...normalized.examConfig.q1,
        ...q1Obj.config,
        hasMultipleProcedures: true,
        procedures: q1Obj.config.procedures
      };
    }
  }

  return normalized;
}

/**
 * 1. Parse uploaded exam paper (PDF, Image photo, or plain text)
 */
async function parseExamPaper({ fileData = null, mimeType = null, textContent = '', teacherNotes = '' }) {
  // If PDF file data is provided, automatically extract text layer with pdf-parse to provide verbatim paper text
  if (fileData && (mimeType === 'application/pdf' || fileData.startsWith('data:application/pdf') || fileData.includes('JVBERi0'))) {
    try {
      let b64 = fileData;
      const commaIdx = fileData.indexOf('base64,');
      if (commaIdx !== -1) b64 = fileData.substring(commaIdx + 7);
      const pdfBuf = Buffer.from(b64.trim(), 'base64');
      const { PDFParse } = require('pdf-parse');
      const parser = new PDFParse({ data: pdfBuf });
      const extracted = await parser.getText();
      await parser.destroy();
      if (extracted && extracted.text && extracted.text.trim()) {
        const cleanedText = extracted.text.trim();
        textContent = textContent ? `${textContent}\n\n${cleanedText}` : cleanedText;
      }
    } catch (pdfErr) {
      console.warn('[parseExamPaper] pdf-parse text extraction note:', pdfErr.message);
    }
  }

  const prompt = `You are a Senior Kenya National Examinations Council (KNEC) Chief Chemistry Practical Examiner & Curriculum Specialist.
Analyze this uploaded chemistry exam paper document/photo and extract all practical experiments, questions, reagent configurations, and marking rubrics according to authentic KNEC KCSE Paper 3 (233/3) standards.

KNEC Examination Setting Standards to Enforce:
1. Cognitive Taxonomy: Balance questions across Recall (State, Name, Define), Comprehension (Describe, Explain, Account for), Application (Calculate, Determine), and Analysis (Deduce, Compare, Distinguish).
2. Question 1 (Volumetric Analysis - 15 to 20 Marks):
   - Accurately identify the calculation framework ("calcType"): 'standard_molarity', 'water_of_crystallization', 'percentage_purity', 'ram_metal', 'redox_stoichiometry', or 'dibasic_acid'.
   - Generate the sequential sub-questions (a) through (e)/(f) with clear method marks (M) and accuracy marks (A).
   - If Question 1 has TWO titrations (Procedure I and Procedure II with Table 1 and Table 2), configure it as a multi-stage titration (see schema below).
3. Question 2 (Inorganic Qualitative Analysis - 10 to 15 Marks):
   - Structured experimental procedures (e.g. heating solid in dry tube, dissolving, portioning, adding 2M NaOH and 2M aqueous NH3 dropwise until in excess, anion confirmatory tests).
   - Inferences must strictly enforce KNEC grouping notation (e.g. "Pb²⁺, Al³⁺, or Zn²⁺ present" in excess NaOH; "Pb²⁺ or Al³⁺ present" in excess NH3) with correct ionic charges.
4. Question 3 (Organic or Second Inorganic Qualitative Analysis - 10 Marks):
   - If organic: Spatula ignition flame test, litmus test, unsaturation/redox test (acidified KMnO4 or Bromine water), and carbonate/hydrogen carbonate effervescence.
   - If inorganic (like Solid P): identify heating test, dissolving and portions with appropriate cations/anions inference.
5. Marking Scheme:
   - Provide a rigorous marking guide with point-by-point breakdown and explicit instructions on applying Error Carried Forward (e.c.f.) on calculation steps.

Teacher's Additional Instructions: "${teacherNotes || 'None'}"

Strict Requirement: Map the paper into an executable digital simulation structure for the VirtuLab Kenya platform.
Produce a strict JSON object with this exact schema:
{
  "title": "<Exam paper title, e.g. 'KCSE Chemistry Paper 3 Term 2 Joint Mock'>",
  "formLevel": "<'Form 3' or 'Form 4'>",
  "titrationType": "<keep for backward compat: 'kcseComposite' if 3 questions, or specific module like 'acidBase', 'redox', 'qualitative', 'organic', 'energy', 'rates', 'gas'>",
  "instructions": "<General candidate instructions>",
  "durationMinutes": <number, e.g. 135 for composite or 60 for single topic>,
  "questions": [
    {
      "number": <integer starting at 1>,
      "title": "<question title, e.g. 'Volumetric Analysis'>",
      "simulationType": "<one of: titration, qualitative, organic, energy, rates, gas, solubility, written>",
      "marks": <number>,
      "config": {
        <for single titration: { solutionA, solutionB, indicator, pipetteVolume, trueTitre, questions: [...] }>
        <for MULTI-STAGE TITRATION (Procedure I + Procedure II with Table 1 and Table 2):
          "hasMultipleProcedures": true,
          "procedures": [
            {
              "procedureIndex": 1,
              "title": "<e.g. Procedure I: Standardization of Solution B>",
              "instructions": "<instructions text for procedure 1>",
              "solutionA": "<titrant in burette>",
              "solutionB": "<analyte in flask>",
              "pipetteVolume": 25.0,
              "indicator": "<e.g. Phenolphthalein>",
              "trueTitre": 25.00,
              "tableTitle": "Table 1: Titration Results",
              "tableMarks": 4.0,
              "questions": [ { "id": "step_1a", "letter": "a", "label": "...", "marks": 1.0, "unit": "..." } ]
            },
            {
              "procedureIndex": 2,
              "title": "<e.g. Procedure II: Solubility of Solid C in Water>",
              "instructions": "<instructions text for procedure 2>",
              "solutionA": "<titrant in burette>",
              "solutionB": "<analyte in flask>",
              "pipetteVolume": 25.0,
              "indicator": "<e.g. Methyl Orange>",
              "trueTitre": 18.50,
              "tableTitle": "Table 2: Titration Results",
              "tableMarks": 4.0,
              "questions": [ { "id": "step_2a", "letter": "a", "label": "...", "marks": 1.0, "unit": "..." } ]
            }
          ]
        >
        <for qualitative or organic: tests[], sampleName, sampleDesc, etc.>
        <for 'written' type: set config to null>
      },
      "prompt": "<for 'written' type: full question text including all sub-parts; empty string for simulated types>",
      "subQuestions": [
        {
          "id": "<e.g. 'a', 'b', 'i', 'ii'>",
          "text": "<sub-question text>",
          "marks": <number>,
          "modelAnswer": "<detailed model answer a KNEC examiner would accept>"
        }
      ]
    }
  ],
  "examConfig": {
    "presetKey": "custom",
    "q1": { <copy of questions[0].config for backward compat; required if questions[0] is a simulated type> },
    "q2": { <copy of questions[1].config if qualitative> },
    "q3": { <copy of questions[2].config if organic> }
  },
  "markingScheme": "<Concise Markdown formatted teacher marking guide with point-by-point method marks (M), accuracy marks (A), and Error Carried Forward (e.c.f.) notes>",
  "confidentialPrepGuide": "<Concise Markdown formatted instructions for the school laboratory technician detailing reagent preparation recipes, molarities, volumes per candidate, and apparatus checklist>"
}

CRITICAL JSON RULES:
- Output 100% valid RFC 8259 JSON only. Escape all double quotes and newlines inside string properties.
- Keep markingScheme and confidentialPrepGuide concise to guarantee complete JSON generation without hitting length limits.

CRITICAL INSTRUCTIONS FOR simulationType:
- Use 'titration' for any volumetric/burette experiment (acid-base, redox, back-titration, or multi-procedure double titrations)
- Use 'qualitative' for inorganic salt identification with NaOH/NH3 tests
- Use 'organic' for organic functional group identification
- Use 'energy' for thermochemistry/enthalpy/temperature change experiments
- Use 'rates' for reaction rate/kinetics experiments
- Use 'gas' for gas preparation and collection experiments
- Use 'solubility' for solubility curve/crystallization experiments
- Use 'written' for ANYTHING ELSE: paper chromatography, electrolysis, food tests,
  flame tests, plant experiments, graph-reading, data analysis, diagram labelling, etc.
  For 'written' type, set config to null and populate prompt + subQuestions with
  complete question text and detailed model answers.

For simulated types (titration/qualitative/organic/energy/rates/gas/solubility), the config field must contain
the same fields as the old q1/q2/q3 format (calcType, solutionA, trueSaltKey, trueOrganicKey, etc.).

${textContent ? `Extracted Paper Text:\n${textContent}` : ''}`;

  try {
    const rawResult = await callGeminiAssistant({
      prompt,
      fileData,
      mimeType: mimeType || 'application/pdf',
      maxTokens: EXAM_MAX_TOKENS
    });

    const parsed = cleanAndParseJson(rawResult);
    return normalizeExamStructure(parsed, { source: 'document_upload' });
  } catch (err) {
    console.warn('[parseExamPaper] AI parsing failed or not configured, using smart fallback preset:', err.message);
    const fallback = teacherNotes.toLowerCase().includes('redox') || (textContent && textContent.toLowerCase().includes('manganate'))
      ? FALLBACK_PRESETS.redox
      : FALLBACK_PRESETS.classic;

    const isNotConfigured = err.message === 'AI_NOT_CONFIGURED';
    const warning = isNotConfigured
      ? 'Gemini API key is not configured in server/.env (GEMINI_API_KEY). VirtuLab loaded a standard KNEC-aligned examination blueprint.'
      : `AI cloud parsing was unavailable (${err.message}). VirtuLab loaded a standard KNEC-aligned examination blueprint.`;

    return normalizeExamStructure(fallback, {
      source: 'smart_fallback',
      isFallback: true,
      errorReason: err.message,
      warning
    });
  }
}

/**
 * 2. Generate complete exam from an idea / prompt
 */
async function generateExamFromIdea({ prompt, formLevel = 'Form 4', moduleType = 'kcseComposite', difficulty = 'standard', durationMinutes = 135 }) {
  const aiPrompt = `You are a Senior KNEC Chemistry Chief Examiner & Curriculum Specialist designing a secondary school chemistry practical exam for Kenyan learners.

Teacher's Idea / Request:
"${prompt}"

Form Level: ${formLevel}
Exam Module: ${moduleType}
Target Difficulty: ${difficulty}
Allotted Time: ${durationMinutes} minutes

KNEC Setting & Pedagogical Standards to Enforce:
1. Cognitive Taxonomy: Balance across Recall, Comprehension, Application, and Analysis. Use authentic KNEC command words (State, Name, Determine, Calculate, Deduce, Explain).
2. Question 1 (Volumetric Analysis - 15 Marks):
   - Choose or detect the calculation framework ("calcType"): 'standard_molarity', 'water_of_crystallization', 'percentage_purity', 'ram_metal', 'redox_stoichiometry', or 'dibasic_acid'.
   - Include realistic stoichiometric parameters, molar concentrations, and balanced equations with state symbols.
3. Question 2 (Inorganic Qualitative Analysis - 15 Marks):
   - Multi-step experimental sequence (heating dry solid, dissolving, portioning, 2M NaOH & 2M aqueous NH3 dropwise until in excess, anion confirmatory test).
   - Inferences must strictly enforce KNEC grouping notation (e.g. "Pb²⁺, Al³⁺, or Zn²⁺ present" in excess NaOH; "Pb²⁺ or Al³⁺ present" in excess NH3).
4. Question 3 (Organic Qualitative Analysis - 10 Marks):
   - Sequence: Spatula ignition flame test, litmus test, unsaturation/redox test (acidified KMnO4 or Bromine water), and carbonate/hydrogen carbonate effervescence.
5. Marking Scheme:
   - Formatted in Markdown with point-by-point method marks (M) and accuracy marks (A), and explicit Error Carried Forward (e.c.f.) instructions.

Strict Response JSON Schema:
{
  "title": "<Concise official title, e.g. Form 4 Chemistry Paper 3 Term 2 Mock Practical>",
  "formLevel": "${formLevel}",
  "titrationType": "kcseComposite",
  "instructions": "<Standard KNEC examination laboratory instructions>",
  "durationMinutes": ${durationMinutes},
  "questions": [
    {
      "number": <integer starting at 1>,
      "title": "<question title, e.g. 'Volumetric Analysis'>",
      "simulationType": "<one of: titration, qualitative, organic, energy, rates, gas, solubility, written>",
      "marks": <number>,
      "config": { <for simulated types: include calcType, solutionA, solutionB, ratioA, ratioB, pipetteVolume, indicator, equation, trueAcidMolarity, trueBaseMolarity, trueTitre, marks, instructions for titration; trueSaltKey, trueSaltName, trueCation, trueAnion, sampleName, sampleDesc, marks, tests[] for qualitative; trueOrganicKey, trueOrganicName, trueFunctionalGroup, sampleName, sampleDesc, marks, tests[] for organic. For 'written' set to null.> },
      "prompt": "<for 'written' type: full question text; empty string for simulated types>",
      "subQuestions": [
        {
          "id": "<e.g. 'a', 'b', 'i', 'ii'>",
          "text": "<sub-question text>",
          "marks": <number>,
          "modelAnswer": "<detailed model answer>"
        }
      ]
    }
  ],
  "examConfig": {
    "presetKey": "custom",
    "q1": { <copy of questions[0].config — required for backward compat with simulation engine> },
    "q2": { <copy of questions[1].config if qualitative> },
    "q3": { <copy of questions[2].config if organic> }
  },
  "markingScheme": "<Markdown KNEC marking scheme with M and A marks, and e.c.f. instructions>",
  "confidentialPrepGuide": "<Markdown Lab Technician preparation instructions>"
}`;

  try {
    const rawResult = await callGeminiAssistant({ prompt: aiPrompt, maxTokens: EXAM_MAX_TOKENS });
    const parsed = cleanAndParseJson(rawResult);
    return normalizeExamStructure(parsed, { source: 'idea_prompt', promptText: prompt });
  } catch (err) {
    console.warn('[generateExamFromIdea] AI generation failed or not configured, using smart fallback preset:', err.message);
    const fallback = prompt.toLowerCase().includes('redox') || prompt.toLowerCase().includes('manganate') || prompt.toLowerCase().includes('iron')
      ? FALLBACK_PRESETS.redox
      : FALLBACK_PRESETS.classic;

    const modified = JSON.parse(JSON.stringify(fallback));
    modified.formLevel = formLevel;
    modified.durationMinutes = durationMinutes;
    if (prompt) modified.title = `KCSE Chemistry Practical Exam — ${prompt.slice(0, 45)}...`;

    const isNotConfigured = err.message === 'AI_NOT_CONFIGURED';
    const warning = isNotConfigured
      ? 'Gemini API key is not configured in server/.env (GEMINI_API_KEY). VirtuLab generated a standard KNEC-aligned examination blueprint.'
      : `AI cloud synthesis was unavailable (${err.message}). VirtuLab generated a standard KNEC-aligned examination blueprint.`;

    return normalizeExamStructure(modified, {
      source: 'smart_fallback',
      isFallback: true,
      promptText: prompt,
      errorReason: err.message,
      warning
    });
  }
}

/**
 * Diagnostic procedures generator for unknown inorganic salts
 */
function getSaltTestSequence(saltKey) {
  switch (saltKey) {
    case 'ZnSO4':
      return [
        { id: 't1', prompt: '(i) Describe the physical appearance of Solid Y', correctObs: 'White crystalline solid', correctInf: 'Absence of transition metal ions (Cu²⁺, Fe²⁺, Fe³⁺)' },
        { id: 't2', prompt: '(ii) Dissolve 1 spatula of Solid Y in 10 cm³ distilled water, divide into 4 portions. Test portion 1 with litmus paper', correctObs: 'Both blue and red litmus papers remain unchanged / neutral', correctInf: 'Neutral aqueous solution' },
        { id: 't3', prompt: '(iii) To portion 2, add 2M NaOH dropwise until in excess', correctObs: 'White precipitate formed, soluble in excess to form a colourless solution', correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present' },
        { id: 't4', prompt: '(iv) To portion 3, add 2M Aqueous Ammonia (NH₃) dropwise until in excess', correctObs: 'White precipitate formed, soluble in excess aqueous ammonia to form a colourless solution', correctInf: 'Zn²⁺ confirmed' },
        { id: 't5', prompt: '(v) To portion 4, add 3 drops of Ba(NO₃)₂ solution followed by dilute HNO₃', correctObs: 'White precipitate formed, insoluble in dilute HNO₃', correctInf: 'SO₄²⁻ confirmed' }
      ];
    case 'Pb(NO3)2':
      return [
        { id: 't1', prompt: '(i) Describe the physical appearance of Solid Y', correctObs: 'White crystalline solid / powder', correctInf: 'Absence of coloured transition ions' },
        { id: 't2', prompt: '(ii) Dissolve 1 spatula in 10 cm³ water and divide into 4 portions. Test portion 1 with litmus', correctObs: 'Faintly acidic pH 5–6', correctInf: 'Salt of weak base/strong acid' },
        { id: 't3', prompt: '(iii) To portion 2, add 2M NaOH dropwise until in excess', correctObs: 'White precipitate, soluble in excess NaOH to form colourless solution', correctInf: 'Pb²⁺, Al³⁺, or Zn²⁺ present' },
        { id: 't4', prompt: '(iv) To portion 3, add 2M NH₃ dropwise until in excess', correctObs: 'White precipitate, insoluble in excess aqueous ammonia', correctInf: 'Pb²⁺ or Al³⁺ present' },
        { id: 't5', prompt: '(v) To portion 4, add 3 drops of potassium iodide (KI) solution and warm gently', correctObs: 'Bright yellow precipitate of PbI₂ formed, dissolves on boiling and recrystallizes as golden spangles on cooling', correctInf: 'Pb²⁺ confirmed' }
      ];
    case 'CuSO4':
      return [
        { id: 't1', prompt: '(i) Describe the physical appearance of Solid Y', correctObs: 'Blue crystalline solid / powder', correctInf: 'Hydrated Cu²⁺ ion present' },
        { id: 't2', prompt: '(ii) Dissolve 1 spatula in water and divide into 3 portions', correctObs: 'Forms a clear blue solution', correctInf: 'Soluble Cu²⁺ salt' },
        { id: 't3', prompt: '(iii) To portion 1, add 2M NaOH dropwise until in excess', correctObs: 'Pale blue precipitate, insoluble in excess NaOH', correctInf: 'Cu²⁺ present' },
        { id: 't4', prompt: '(iv) To portion 2, add 2M NH₃ dropwise until in excess', correctObs: 'Pale blue precipitate, dissolves in excess to form a deep royal blue solution', correctInf: 'Cu²⁺ confirmed' },
        { id: 't5', prompt: '(v) To portion 3, add Ba(NO₃)₂ followed by dilute HNO₃', correctObs: 'White precipitate, insoluble in dilute HNO₃', correctInf: 'SO₄²⁻ confirmed' }
      ];
    case 'FeSO4':
      return [
        { id: 't1', prompt: '(i) Describe the physical appearance of Solid Y', correctObs: 'Pale green crystalline solid', correctInf: 'Hydrated Fe²⁺ ion present' },
        { id: 't2', prompt: '(ii) To portion 1, add 2M NaOH dropwise until in excess', correctObs: 'Dirty-green gelatinous precipitate, insoluble in excess, turns brown at surface on standing', correctInf: 'Fe²⁺ present' },
        { id: 't3', prompt: '(iii) To portion 2, add 2M NH₃ dropwise until in excess', correctObs: 'Dirty-green precipitate, insoluble in excess', correctInf: 'Fe²⁺ confirmed' },
        { id: 't4', prompt: '(iv) To portion 3, add Ba(NO₃)₂ followed by dilute HNO₃', correctObs: 'White precipitate, insoluble in dilute acid', correctInf: 'SO₄²⁻ confirmed' }
      ];
    case 'FeCl3':
      return [
        { id: 't1', prompt: '(i) Describe physical appearance of Solid Y', correctObs: 'Yellow-brown / reddish crystalline solid', correctInf: 'Fe³⁺ ion present' },
        { id: 't2', prompt: '(ii) Dissolve in water, add 2M NaOH dropwise until in excess', correctObs: 'Red-brown / rust-brown precipitate, insoluble in excess', correctInf: 'Fe³⁺ confirmed' },
        { id: 't3', prompt: '(iii) To portion 2, add 2M NH₃ dropwise until in excess', correctObs: 'Red-brown precipitate, insoluble in excess', correctInf: 'Fe³⁺ confirmed' },
        { id: 't4', prompt: '(iv) To portion 3, add dilute HNO₃ followed by AgNO₃ solution', correctObs: 'White precipitate of AgCl, insoluble in dilute HNO₃, soluble in aqueous ammonia', correctInf: 'Cl⁻ confirmed' }
      ];
    case 'CaCl2':
      return [
        { id: 't1', prompt: '(i) Describe physical appearance of Solid Y', correctObs: 'White deliquescent solid / crystals', correctInf: 'Non-transition metal salt' },
        { id: 't2', prompt: '(ii) Dissolve in water, add 2M NaOH dropwise until in excess', correctObs: 'White precipitate, insoluble in excess NaOH', correctInf: 'Ca²⁺ or Mg²⁺ present' },
        { id: 't3', prompt: '(iii) To portion 2, add 2M NH₃ dropwise until in excess', correctObs: 'No precipitate formed with aqueous ammonia', correctInf: 'Ca²⁺ present (or group 1/2; transition metal ions absent)' },
        { id: 't4', prompt: '(iv) Flame test with clean nichrome wire in non-luminous flame', correctObs: 'Brick-red / orange-red flame', correctInf: 'Ca²⁺ confirmed' },
        { id: 't5', prompt: '(v) To portion 3, add dilute HNO₃ followed by AgNO₃', correctObs: 'White precipitate formed, soluble in aqueous NH₃', correctInf: 'Cl⁻ confirmed' }
      ];
    default:
      return [
        { id: 't1', prompt: '(i) Physical appearance of Solid Y', correctObs: 'White solid', correctInf: 'Non-transition metal compound' },
        { id: 't2', prompt: '(ii) Add 2M NaOH dropwise until in excess', correctObs: 'White precipitate formed, soluble in excess', correctInf: 'Zn²⁺, Al³⁺, or Pb²⁺ present' },
        { id: 't3', prompt: '(iii) Add 2M aqueous ammonia dropwise until in excess', correctObs: 'White precipitate formed', correctInf: 'Cation confirmed' },
        { id: 't4', prompt: '(iv) Add Ba(NO₃)₂ followed by dilute acid', correctObs: 'White precipitate formed', correctInf: 'Anion confirmed' }
      ];
  }
}

/**
 * Organic functional group test sequence generator
 */
function getOrganicTestSequence(organicKey) {
  switch (organicKey) {
    case 'Ethanoic Acid':
      return [
        { id: 'o1', prompt: '(a) Place 2 cm³ of Liquid Z in a test tube and test with both red and blue litmus paper', correctObs: 'Blue litmus paper turns red; red litmus paper remains red', correctInf: 'Liquid Z is acidic / contains H⁺ ions / -COOH group' },
        { id: 'o2', prompt: '(b) To 2 cm³ of Liquid Z, add half a spatula of solid Sodium Hydrogen Carbonate (NaHCO₃)', correctObs: 'Rapid effervescence / bubbling of a colourless gas that turns lime water cloudy', correctInf: '-COOH / Carboxylic acid group confirmed' },
        { id: 'o3', prompt: '(c) To 2 cm³ of Liquid Z, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) and warm gently', correctObs: 'Purple colour of acidified KMnO₄ persists / does not decolourise', correctInf: 'Absence of readily oxidisable -OH group / unsaturation' },
        { id: 'o4', prompt: '(d) Ignite 3 drops of Liquid Z on a clean metallic spatula using a Bunsen burner flame', correctObs: 'Burns with a non-luminous, clear blue flame without smoke', correctInf: 'Short-chain saturated aliphatic compound with low carbon-to-hydrogen ratio' }
      ];
    case 'Cyclohexene':
      return [
        { id: 'o1', prompt: '(a) Test 2 cm³ of Liquid Z with red and blue litmus paper', correctObs: 'Both red and blue litmus papers remain unchanged', correctInf: 'Neutral organic substance' },
        { id: 'o2', prompt: '(b) To 2 cm³ of Liquid Z, add 3 drops of Bromine Water and shake vigorously', correctObs: 'Red-brown / yellow colour of bromine water is rapidly decolourised', correctInf: 'Unsaturated organic compound containing >C=C< or -C≡C- bond' },
        { id: 'o3', prompt: '(c) To 2 cm³ of Liquid Z, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄)', correctObs: 'Purple colour of acidified KMnO₄ is rapidly decolourised to colourless', correctInf: '>C=C< alkene group confirmed' },
        { id: 'o4', prompt: '(d) Ignite 3 drops of Liquid Z on a metallic spatula in a Bunsen flame', correctObs: 'Burns with a smoky, yellow, luminous, sooty flame', correctInf: 'High carbon-to-hydrogen ratio / unsaturated compound' }
      ];
    case 'Hexane':
      return [
        { id: 'o1', prompt: '(a) Test Liquid Z with moist litmus paper', correctObs: 'No colour change on red or blue litmus', correctInf: 'Neutral hydrocarbon' },
        { id: 'o2', prompt: '(b) Add 3 drops of Bromine Water in the absence of direct sunlight', correctObs: 'Red-brown colour of bromine water persists / is not decolourised', correctInf: 'Saturated hydrocarbon / alkane' },
        { id: 'o3', prompt: '(c) Add 3 drops of acidified KMnO₄', correctObs: 'Purple colour persists / no decolourisation', correctInf: 'Resistant to mild oxidation / alkane' },
        { id: 'o4', prompt: '(d) Ignite 3 drops on a spatula', correctObs: 'Burns with a slightly luminous flame with minimal soot', correctInf: 'Saturated alkane' }
      ];
    case 'Ethanol':
    default:
      return [
        { id: 'o1', prompt: '(a) Place 2 cm³ of Liquid Z in a test tube and test with both red and blue litmus paper', correctObs: 'Both red and blue litmus paper remain unchanged / neutral', correctInf: 'Neutral organic substance; absence of -COOH or basic amine' },
        { id: 'o2', prompt: '(b) To 2 cm³ of Liquid Z, add half a spatula of solid Sodium Hydrogen Carbonate (NaHCO₃)', correctObs: 'No effervescence / no bubbles formed', correctInf: 'Absence of -COOH / carboxylic acid' },
        { id: 'o3', prompt: '(c) To 2 cm³ of Liquid Z, add 3 drops of acidified Potassium Manganate(VII) (KMnO₄) and warm gently', correctObs: 'Purple colour of acidified KMnO₄ is decolourised to colourless', correctInf: 'Primary or secondary alkanol (-OH group) present / easily oxidised' },
        { id: 'o4', prompt: '(d) Ignite 3 drops of Liquid Z on a clean metallic spatula using a Bunsen burner flame', correctObs: 'Burns with a clear, non-sooty, pale-blue flame', correctInf: 'Short-chain saturated aliphatic compound with low carbon ratio (Alkanol)' }
      ];
  }
}

/**
 * Synchronize markdown marking scheme with updated exam parameters
 */
function generateSynchronizedMarkingScheme(exam) {
  const cfg = exam.examConfig || {};
  const q1 = cfg.q1 || {};
  const q2 = cfg.q2 || {};
  const q3 = cfg.q3 || {};

  const molesB = (Number(q1.trueBaseMolarity || 0.1) * Number(q1.pipetteVolume || 25.0)) / 1000;
  const molesA = molesB * (Number(q1.ratioA || 1) / Number(q1.ratioB || 1));

  return `# KNEC KCSE CHEMISTRY PRACTICAL MARKING SCHEME (233/3)
**Paper Title:** ${exam.title || 'KCSE Chemistry Practical Mock'}  
**Target Level:** ${exam.formLevel || 'Form 4'} · **Time:** ${exam.durationMinutes || 135} Minutes  

---

### QUESTION 1: VOLUMETRIC ANALYSIS (15 MARKS)
- **Reagents:** ${q1.solutionA || 'Solution A'} (Burette) vs ${q1.solutionB || 'Solution B'} (Conical Flask)
- **Pipette Volume:** ${Number(q1.pipetteVolume || 25.0).toFixed(1)} cm³ · **Indicator:** ${q1.indicator || 'phenolphthalein'}
- **Expected Concordant Titre:** **${Number(q1.trueTitre || 25.0).toFixed(2)} cm³**

#### 1. Table 1 Scoring Criteria (5 Marks):
| Parameter | Mark Breakdown |
|---|---|
| Complete Table | 1 Mark (3 trials completed within realistic volume boundaries) |
| Use of Decimals | 1 Mark (Readings recorded consistently to 1 or 2 decimal places) |
| Accuracy | 1 Mark (Within $\\pm 0.20\\text{ cm}^3$ of teacher / theoretical titre: **${Number(q1.trueTitre || 25.0).toFixed(2)} cm³**) |
| Concordancy | 1 Mark (Student selects concordant readings within $\\pm 0.20\\text{ cm}^3$) |
| Average Titre Calculation | 1 Mark (Correct algebraic average calculation shown) |

#### 2. Calculations (10 Marks):
- **(a) Moles of Solution B pipetted:**
  $$\\text{Moles of B} = \\frac{${Number(q1.trueBaseMolarity || 0.1).toFixed(3)}\\text{ M} \\times ${Number(q1.pipetteVolume || 25.0).toFixed(1)}\\text{ cm}^3}{1000} = ${molesB.toExponential(3)}\\text{ moles}$$  (2 Marks)
- **(b) Reaction Stoichiometry & Balanced Equation:**
  \`${q1.equation || 'Acid + Base -> Salt + Water'}\`
  - Mole ratio Solution A : Solution B = **${q1.ratioA || 1} : ${q1.ratioB || 1}**  (1 Mark)
- **(c) Moles of Solution A used:**
  $$\\text{Moles of A} = \\text{Moles of B} \\times \\frac{${q1.ratioA || 1}}{${q1.ratioB || 1}} = ${molesA.toExponential(3)}\\text{ moles}$$  (2 Marks)
- **(d) Concentration / Molarity of Solution A:**
  $$\\text{Molarity of A} = \\frac{\\text{Moles of A} \\times 1000}{\\text{Average Titre (${Number(q1.trueTitre || 25.0).toFixed(2)} cm³)}} = ${Number(q1.trueAcidMolarity || 0.1).toFixed(3)}\\text{ M}$$  (3 Marks)

---

### QUESTION 2: INORGANIC QUALITATIVE SALT ANALYSIS (15 MARKS)
**Sample:** ${q2.sampleName || 'Solid Y'} (${q2.trueSaltName || 'Unknown Salt'})  
**Confirmed Cation:** \`${q2.trueCation || 'Zn²⁺'}\` · **Confirmed Anion:** \`${q2.trueAnion || 'SO₄²⁻'}\`  

| Step & Procedure | Expected Observation | Deduction / Inference | Marks |
|---|---|---|:---:|
${(q2.tests || []).map(t => `| ${t.prompt} | ${t.correctObs} | ${t.correctInf} | 2-3 Marks |`).join('\n')}

---

### QUESTION 3: ORGANIC CHEMISTRY TESTING (10 MARKS)
**Sample:** ${q3.sampleName || 'Liquid Z'} (${q3.trueOrganicName || 'Ethanol'})  
**Functional Group:** \`${q3.trueFunctionalGroup || 'Alkanol (-OH)'}\`  

| Step & Procedure | Expected Observation | Deduction / Inference | Marks |
|---|---|---|:---:|
${(q3.tests || []).map(t => `| ${t.prompt} | ${t.correctObs} | ${t.correctInf} | 2-3 Marks |`).join('\n')}
`;
}

/**
 * Synchronize laboratory technician confidential instructions with updated exam parameters
 */
function generateSynchronizedPrepGuide(exam) {
  const cfg = exam.examConfig || {};
  const q1 = cfg.q1 || {};
  const q2 = cfg.q2 || {};
  const q3 = cfg.q3 || {};

  return `# CONFIDENTIAL INSTRUCTIONS TO LABORATORY TECHNICIANS
**Paper:** ${exam.title || 'KCSE Chemistry Paper 3 Mock'}  
**Target Level:** ${exam.formLevel || 'Form 4'} · **Time:** ${exam.durationMinutes || 135} Minutes  

> **CONFIDENTIAL:** These instructions must not fall into candidate hands prior to examination commencement.

---

### 1. QUESTION 1 PREPARATIONS (VOLUMETRIC ANALYSIS)
- **Solution A (${q1.solutionA}):**
  - Allocate **150 cm³** per candidate in a clean, dry plastic or glass reagent bottle labelled "SOLUTION A".
  - Prepared at **${Number(q1.trueAcidMolarity || 0.1).toFixed(3)} M**.
- **Solution B (${q1.solutionB}):**
  - Allocate **150 cm³** per candidate in a bottle labelled "SOLUTION B".
  - Prepared at **${Number(q1.trueBaseMolarity || 0.1).toFixed(3)} M**.
- **Indicator:** ${q1.indicator || 'phenolphthalein'} indicator supplied with dropper.
- **Expected Titre Range:** **${(Number(q1.trueTitre || 25.0) - 0.2).toFixed(2)} cm³ to ${(Number(q1.trueTitre || 25.0) + 0.2).toFixed(2)} cm³**.

### 2. QUESTION 2 PREPARATIONS (SALT ANALYSIS)
- **Target Substance:** ${q2.trueSaltName || 'Unknown Salt'} (${q2.trueSaltKey})
- **Quantity per candidate:** **2.0 g** of ${q2.sampleName || 'Solid Y'} in a dry stoppered container.
- **Reagents on bench:** 2M NaOH, 2M Aqueous Ammonia (NH₃), Ba(NO₃)₂ solution, dilute HNO₃, distilled water wash bottle.

### 3. QUESTION 3 PREPARATIONS (ORGANIC ANALYSIS)
- **Target Substance:** ${q3.trueOrganicName || 'Ethanol'} (${q3.trueFunctionalGroup})
- **Quantity per candidate:** **10 cm³** of ${q3.sampleName || 'Liquid Z'} in a small specimen bottle.
- **Reagents on bench:** Red & blue litmus paper, solid NaHCO₃, acidified KMnO₄ (0.01M in 1M H₂SO₄), Bunsen burner, metallic spatula.

### 4. APPARATUS CHECKLIST PER CANDIDATE
- 1 × Burette (50 cm³) with retort stand and clamp
- 1 × Pipette (${Number(q1.pipetteVolume || 25.0).toFixed(0)} cm³) and pipette filler
- 2 × Conical flasks (250 cm³)
- 1 × White tile and 100 cm³ beaker
- 6 × Clean, dry test tubes in a test tube rack
- 1 × Test tube holder and Bunsen burner
`;
}

/**
 * Intelligent Smart Refinement Engine (Offline & Fallback Resilience)
 * Reliably processes all teacher instructions including:
 * - Concentration & molarity (Solution A, Solution B, specific numbers)
 * - Pipette volumes (20, 25, 10 cm³)
 * - Indicator choices
 * - Acid/base types and stoichiometry ratios
 * - Unknown inorganic salts with full diagnostic test sequences
 * - Organic functional groups with testing sequences
 * - Title, duration, form level, and recalculates concordant titre
 */
function applySmartRefinement(currentDraft, instruction) {
  const updated = JSON.parse(JSON.stringify(currentDraft));
  const raw = instruction || '';
  const lower = raw.toLowerCase();

  if (!updated.examConfig) updated.examConfig = {};
  if (!updated.examConfig.q1) updated.examConfig.q1 = {};
  if (!updated.examConfig.q2) updated.examConfig.q2 = {};
  if (!updated.examConfig.q3) updated.examConfig.q3 = {};

  const q1 = updated.examConfig.q1;
  const q2 = updated.examConfig.q2;
  const q3 = updated.examConfig.q3;

  const changes = [];

  // ============================================================
  // 1. CONCENTRATION & MOLARITY ADJUSTMENTS
  // ============================================================
  const solAPattern = /(?:solution\s*a|acid|burette|titrant|hcl|kmno4|h2so4)[^0-9\n]*?(\d+(?:\.\d+)?)\s*(?:m\b|molar|mol\/dm|mol\/l)?/i;
  const solBPattern = /(?:solution\s*b|base|flask|analyte|naoh|alkali|carbonate)[^0-9\n]*?(\d+(?:\.\d+)?)\s*(?:m\b|molar|mol\/dm|mol\/l)?/i;

  let newConcA = null;
  let newConcB = null;

  if (solAPattern.test(lower)) {
    const match = lower.match(solAPattern);
    if (match && match[1]) newConcA = parseFloat(match[1]);
  }
  if (solBPattern.test(lower)) {
    const match = lower.match(solBPattern);
    if (match && match[1]) newConcB = parseFloat(match[1]);
  }

  // General concentration pattern: e.g. "change the concentration to 0.05M", "change concentration to 0.05", "set concentration 0.05"
  if (newConcA === null && newConcB === null) {
    const generalMatch = lower.match(/(?:concentration|conc|molarity|molar|to|make it|is|=|set to)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:m\b|molar|mol\/dm|mol\/l)?/i)
                      || lower.match(/(\d+(?:\.\d+)?)\s*(?:m\b|molar|mol\/dm3|mol\/l)/i);
    if (generalMatch && generalMatch[1]) {
      const val = parseFloat(generalMatch[1]);
      if (lower.includes('solution b') || lower.includes('base') || lower.includes('flask') || lower.includes('naoh')) {
        newConcB = val;
      } else {
        newConcA = val;
      }
    }
  }

  if (newConcA !== null && !isNaN(newConcA) && newConcA > 0) {
    q1.trueAcidMolarity = newConcA;
    const formattedA = newConcA.toFixed(3) + ' M';
    if (q1.solutionA && /\d+(?:\.\d+)?\s*M/i.test(q1.solutionA)) {
      q1.solutionA = q1.solutionA.replace(/\d+(?:\.\d+)?\s*M/i, formattedA);
    } else {
      q1.solutionA = `${formattedA} ${q1.solutionA || 'Hydrochloric Acid (HCl)'}`;
    }
    changes.push(`Solution A concentration updated to ${formattedA}`);
  }

  if (newConcB !== null && !isNaN(newConcB) && newConcB > 0) {
    q1.trueBaseMolarity = newConcB;
    const formattedB = newConcB.toFixed(3) + ' M';
    if (q1.solutionB && /\d+(?:\.\d+)?\s*M/i.test(q1.solutionB)) {
      q1.solutionB = q1.solutionB.replace(/\d+(?:\.\d+)?\s*M/i, formattedB);
    } else {
      q1.solutionB = `${formattedB} ${q1.solutionB || 'Sodium Hydroxide (NaOH)'}`;
    }
    changes.push(`Solution B concentration updated to ${formattedB}`);
  }

  // ============================================================
  // 2. PIPETTE VOLUME
  // ============================================================
  if (lower.includes('20') && (lower.includes('pipette') || lower.includes('cm') || lower.includes('volume') || lower.includes('aliquot'))) {
    q1.pipetteVolume = 20.0;
    changes.push('Pipette volume set to 20.0 cm³');
  } else if (lower.includes('25') && (lower.includes('pipette') || lower.includes('cm') || lower.includes('volume') || lower.includes('aliquot'))) {
    q1.pipetteVolume = 25.0;
    changes.push('Pipette volume set to 25.0 cm³');
  } else if (lower.includes('10') && (lower.includes('pipette') || lower.includes('cm') || lower.includes('volume') || lower.includes('aliquot'))) {
    q1.pipetteVolume = 10.0;
    changes.push('Pipette volume set to 10.0 cm³');
  }

  // ============================================================
  // 3. INDICATOR
  // ============================================================
  if (lower.includes('screened methyl orange')) {
    q1.indicator = 'screenedMethylOrange';
    changes.push('Indicator changed to Screened Methyl Orange');
  } else if (lower.includes('methyl orange')) {
    q1.indicator = 'methylOrange';
    changes.push('Indicator changed to Methyl Orange');
  } else if (lower.includes('phenolphthalein') || lower.includes('pop')) {
    q1.indicator = 'phenolphthalein';
    changes.push('Indicator changed to Phenolphthalein');
  } else if (lower.includes('starch')) {
    q1.indicator = 'starch';
    changes.push('Indicator changed to Starch');
  }

  // ============================================================
  // 4. REAGENT / REACTION TYPE (ACIDS & BASES)
  // ============================================================
  if (lower.includes('sulfuric') || lower.includes('h2so4') || lower.includes('dibasic')) {
    q1.ratioA = 1;
    q1.ratioB = 2;
    q1.acidRfm = 98.0;
    q1.equation = 'H₂SO₄(aq) + 2NaOH(aq) → Na₂SO₄(aq) + 2H₂O(l)';
    const concMatch = (q1.solutionA || '').match(/\d+(?:\.\d+)?\s*M/i);
    const conc = concMatch ? concMatch[0] : `${(q1.trueAcidMolarity || 0.050).toFixed(3)} M`;
    q1.solutionA = `${conc} Sulfuric(VI) Acid (H₂SO₄)`;
    changes.push('Titration configured as dibasic Sulfuric Acid (1:2 mole ratio)');
  } else if (lower.includes('carbonate') || lower.includes('na2co3')) {
    q1.ratioA = 2;
    q1.ratioB = 1;
    q1.baseRfm = 106.0;
    q1.equation = '2HCl(aq) + Na₂CO₃(aq) → 2NaCl(aq) + CO₂(g) + H₂O(l)';
    const concMatch = (q1.solutionB || '').match(/\d+(?:\.\d+)?\s*M/i);
    const conc = concMatch ? concMatch[0] : `${(q1.trueBaseMolarity || 0.050).toFixed(3)} M`;
    q1.solutionB = `${conc} Sodium Carbonate (Na₂CO₃)`;
    changes.push('Titration configured as Sodium Carbonate neutralization (2:1 mole ratio)');
  }

  // Recalculate concordant titre with updated concentrations / stoichiometry / pipette
  const nA = Number(q1.ratioA) || 1;
  const nB = Number(q1.ratioB) || 1;
  const cA = Number(q1.trueAcidMolarity) || 0.100;
  const cB = Number(q1.trueBaseMolarity) || 0.100;
  const vB = Number(q1.pipetteVolume) || 25.0;
  if (nB > 0 && cA > 0) {
    q1.trueTitre = Number(((nA * cB * vB) / (nB * cA)).toFixed(2));
  } else {
    q1.trueTitre = 25.00;
  }
  if (newConcA !== null || newConcB !== null) {
    changes.push(`Target concordant titre recalculated: ${q1.trueTitre.toFixed(2)} cm³`);
  }

  // ============================================================
  // 5. UNKNOWN INORGANIC SALT (QUESTION 2)
  // ============================================================
  let matchedSaltKey = null;
  if (lower.includes('zinc') || lower.includes('zn')) {
    matchedSaltKey = 'ZnSO4';
    q2.trueSaltKey = 'ZnSO4';
    q2.trueSaltName = 'Zinc Sulfate — ZnSO₄';
    q2.trueCation = 'Zn2+';
    q2.trueAnion = 'SO42-';
    q2.sampleDesc = 'Pure white inorganic crystalline salt';
  } else if (lower.includes('lead') || lower.includes('pb')) {
    matchedSaltKey = 'Pb(NO3)2';
    q2.trueSaltKey = 'Pb(NO3)2';
    q2.trueSaltName = 'Lead(II) Nitrate — Pb(NO₃)₂';
    q2.trueCation = 'Pb2+';
    q2.trueAnion = 'NO3-';
    q2.sampleDesc = 'White crystalline solid, soluble in cold water';
  } else if (lower.includes('copper') || lower.includes('cu')) {
    matchedSaltKey = 'CuSO4';
    q2.trueSaltKey = 'CuSO4';
    q2.trueSaltName = 'Copper(II) Sulfate — CuSO₄';
    q2.trueCation = 'Cu2+';
    q2.trueAnion = 'SO42-';
    q2.sampleDesc = 'Blue crystalline solid / powder';
  } else if (lower.includes('iron(ii)') || lower.includes('iron 2') || lower.includes('feso4') || (lower.includes('iron') && lower.includes('green'))) {
    matchedSaltKey = 'FeSO4';
    q2.trueSaltKey = 'FeSO4';
    q2.trueSaltName = 'Iron(II) Sulfate — FeSO₄';
    q2.trueCation = 'Fe2+';
    q2.trueAnion = 'SO42-';
    q2.sampleDesc = 'Pale green crystalline solid';
  } else if (lower.includes('iron(iii)') || lower.includes('iron 3') || lower.includes('fecl3') || (lower.includes('iron') && lower.includes('brown'))) {
    matchedSaltKey = 'FeCl3';
    q2.trueSaltKey = 'FeCl3';
    q2.trueSaltName = 'Iron(III) Chloride — FeCl₃';
    q2.trueCation = 'Fe3+';
    q2.trueAnion = 'Cl-';
    q2.sampleDesc = 'Reddish-brown crystalline deliquescent solid';
  } else if (lower.includes('calcium') || lower.includes('cacl2')) {
    matchedSaltKey = 'CaCl2';
    q2.trueSaltKey = 'CaCl2';
    q2.trueSaltName = 'Calcium Chloride — CaCl₂';
    q2.trueCation = 'Ca2+';
    q2.trueAnion = 'Cl-';
    q2.sampleDesc = 'White deliquescent crystals';
  }

  if (matchedSaltKey) {
    q2.tests = getSaltTestSequence(matchedSaltKey);
    changes.push(`Unknown salt set to ${q2.trueSaltName} with updated KNEC test procedures`);
  }

  // ============================================================
  // 6. ORGANIC COMPOUND (QUESTION 3)
  // ============================================================
  let matchedOrganicKey = null;
  if (lower.includes('ethanoic') || lower.includes('acetic') || lower.includes('carboxylic')) {
    matchedOrganicKey = 'Ethanoic Acid';
    q3.trueOrganicKey = 'Ethanoic Acid';
    q3.trueOrganicName = 'Ethanoic Acid — CH₃COOH';
    q3.trueFunctionalGroup = 'Carboxylic Acid (-COOH)';
    q3.sampleDesc = 'Colourless liquid with sharp pungent vinegar odour';
  } else if (lower.includes('cyclohexene') || lower.includes('alkene') || lower.includes('unsaturated') || lower.includes('double bond')) {
    matchedOrganicKey = 'Cyclohexene';
    q3.trueOrganicKey = 'Cyclohexene';
    q3.trueOrganicName = 'Cyclohexene — C₆H₁₀';
    q3.trueFunctionalGroup = 'Alkene (>C=C<)';
    q3.sampleDesc = 'Clear volatile organic liquid with hydrocarbon odour';
  } else if (lower.includes('hexane') || lower.includes('alkane') || lower.includes('saturated')) {
    matchedOrganicKey = 'Hexane';
    q3.trueOrganicKey = 'Hexane';
    q3.trueOrganicName = 'Hexane — C₆H₁₄';
    q3.trueFunctionalGroup = 'Saturated Alkane';
    q3.sampleDesc = 'Colourless neutral liquid, immiscible with water';
  } else if (lower.includes('ethanol') || lower.includes('alcohol') || lower.includes('alkanol')) {
    matchedOrganicKey = 'Ethanol';
    q3.trueOrganicKey = 'Ethanol';
    q3.trueOrganicName = 'Ethanol — C₂H₅OH';
    q3.trueFunctionalGroup = 'Alkanol (-OH)';
    q3.sampleDesc = 'Clear neutral volatile liquid with characteristic sweet odour';
  }

  if (matchedOrganicKey) {
    q3.tests = getOrganicTestSequence(matchedOrganicKey);
    changes.push(`Organic sample set to ${q3.trueOrganicName} with updated functional group tests`);
  }

  // ============================================================
  // 7. EXAM TITLE, FORM LEVEL, DURATION
  // ============================================================
  const titleMatch = raw.match(/(?:title to|rename to|call it)\s*[:=]?\s*["']?([^"'\n,]+)["']?/i);
  if (titleMatch && titleMatch[1]) {
    updated.title = titleMatch[1].trim();
    changes.push(`Title updated to "${updated.title}"`);
  }

  if (lower.includes('form 3')) updated.formLevel = 'Form 3';
  if (lower.includes('form 4')) updated.formLevel = 'Form 4';
  if (lower.includes('form 2')) updated.formLevel = 'Form 2';
  if (lower.includes('form 1')) updated.formLevel = 'Form 1';

  const durationMatch = lower.match(/(?:duration|time|mins?|minutes?)\s*[:=]?\s*(\d+)/i);
  if (durationMatch && durationMatch[1]) {
    updated.durationMinutes = parseInt(durationMatch[1], 10);
    changes.push(`Duration set to ${updated.durationMinutes} minutes`);
  }

  // ============================================================
  // 8. SYNCHRONIZE MARKING SCHEME & TECHNICIAN GUIDE
  // ============================================================
  q1.instructions = `You are provided with ${q1.solutionA} and ${q1.solutionB}. Pipette ${Number(q1.pipetteVolume || 25.0).toFixed(1)} cm³ of Solution B into a conical flask and titrate with Solution A using ${q1.indicator} indicator.`;
  updated.markingScheme = generateSynchronizedMarkingScheme(updated);
  updated.confidentialPrepGuide = generateSynchronizedPrepGuide(updated);

  // ============================================================
  // 9. REBUILD questions[] ARRAY (keeps both formats in sync)
  // Patch the questions[] array to reflect any examConfig changes
  // so the flexible format stays consistent with legacy examConfig.
  // ============================================================
  if (Array.isArray(updated.questions) && updated.questions.length > 0) {
    updated.questions = updated.questions.map(q => {
      // For simulated type questions, sync config from examConfig
      const legacyKey = q.number === 1 ? 'q1' : q.number === 2 ? 'q2' : q.number === 3 ? 'q3' : null;
      if (legacyKey && updated.examConfig[legacyKey] && q.simulationType !== 'written') {
        return { ...q, config: updated.examConfig[legacyKey] };
      }
      return q;
    });
  } else {
    // No questions[] yet — build it now from the updated examConfig
    updated.questions = normalizeQuestionsArray(updated);
  }

  return { updated, changes };
}

/**
 * 3. Conversational Refinement of an existing exam draft
 */
async function refineExamDraft({ currentDraft, instruction }) {
  if (!currentDraft || typeof currentDraft !== 'object') {
    throw new Error('CURRENT_DRAFT_REQUIRED');
  }

  const prompt = `You are a Senior KNEC Chemistry Practical Examiner assisting a secondary school teacher who wants to adjust an existing exam draft.

Teacher's Instruction / Change Request:
"${instruction}"

Current Exam Draft:
${JSON.stringify(currentDraft, null, 2)}

STRICT REQUIREMENTS FOR ADJUSTMENTS:
1. Carefully inspect the teacher's instruction and update all affected fields in the exam JSON.
2. CONCENTRATION & MOLARITY:
   If the teacher asks to change concentration (e.g. "change the concentration to 0.05M", "make Solution A 0.2M", "change molarity"):
   - Update q1.solutionA and/or q1.solutionB with the exact new concentration string (e.g. "0.050 M Hydrochloric Acid (HCl)").
   - Update q1.trueAcidMolarity and/or q1.trueBaseMolarity to the numeric value.
   - Recalculate trueTitre accurately based on stoichiometry: trueTitre = (ratioA * trueBaseMolarity * pipetteVolume) / (ratioB * trueAcidMolarity).
   - Update the markingScheme calculation steps and confidentialPrepGuide with the new concentration!
3. PIPETTE, INDICATOR, UNKNOWN SALTS, ORGANIC SAMPLES, TITLE, DURATION:
   Update all corresponding fields in examConfig, markingScheme, and confidentialPrepGuide.
4. Respond with ONLY the updated valid JSON object matching the exact schema:
{
  "title": "<updated or preserved title>",
  "formLevel": "<form level>",
  "titrationType": "<titration type>",
  "instructions": "<updated or preserved instructions>",
  "durationMinutes": <number>,
  "examConfig": { ... updated simulation config ... },
  "markingScheme": "<updated markdown marking scheme>",
  "confidentialPrepGuide": "<updated markdown lab technician guide>"
}`;

  try {
    const rawResult = await callGeminiAssistant({ prompt, maxTokens: EXAM_MAX_TOKENS });
    const parsed = cleanAndParseJson(rawResult);
    
    // Double-check if the instruction requested a concentration/salt change that Gemini might have omitted
    const smartCheck = applySmartRefinement(parsed, instruction);
    const finalDraft = smartCheck.changes.length > 0 ? smartCheck.updated : parsed;
    const appliedChanges = smartCheck.changes;

    return normalizeExamStructure(finalDraft, {
      source: 'ai_refinement',
      lastInstruction: instruction,
      appliedChanges
    });
  } catch (err) {
    console.warn('[refineExamDraft] AI refinement failed or not configured, applying smart heuristic engine:', err.message);
    const { updated, changes } = applySmartRefinement(currentDraft, instruction);
    return normalizeExamStructure(updated, {
      source: 'smart_fallback',
      lastInstruction: instruction,
      appliedChanges: changes,
      errorReason: err.message
    });
  }
}

function isAiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
}

function getAiStatus() {
  const configured = isAiConfigured();
  return {
    configured,
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    message: configured
      ? 'Google Gemini AI engine is ready for multimodal paper parsing and exam synthesis.'
      : 'GEMINI_API_KEY is not configured in server/.env. Add your Gemini API key to enable live AI multimodal paper parsing.'
  };
}

module.exports = {
  parseExamPaper,
  generateExamFromIdea,
  refineExamDraft,
  normalizeExamStructure,
  normalizeQuestionsArray,
  SUPPORTED_SIMULATION_TYPES,
  isAiConfigured,
  getAiStatus,
  cleanAndParseJson,
  FALLBACK_PRESETS
};
