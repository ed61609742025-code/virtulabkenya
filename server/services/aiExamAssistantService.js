// ============================================================
//  VirtuLab Kenya — AI Teacher Exam Assistant Service
//  Multimodal Exam Paper Parsing & Idea-to-Exam Generation (Gemini)
// ============================================================

const config = require('../config');

const DEFAULT_MODEL = config.gemini?.defaultModel || 'gemini-2.5-flash-lite';
const EXAM_MAX_TOKENS = config.gemini?.examAssistantMaxTokens || 4000;

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
      presetKey: 'series_3',
      q1: {
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
            correctInf: 'Pb²⁺ confirmed; NO₃⁻ inferred present'
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
            correctInf: 'Saturated organic compound / low carbon-to-hydrogen ratio; alkanol present'
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
 * Call Gemini REST API with optional multimodal parts (base64 documents / images).
 */
async function callGeminiAssistant({ prompt, fileData = null, mimeType = null, maxTokens = EXAM_MAX_TOKENS }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const parts = [{ text: prompt }];

  if (fileData && mimeType) {
    // Strip data URL header if present (e.g. data:image/png;base64,...)
    const cleanBase64 = fileData.includes('base64,')
      ? fileData.split('base64,')[1]
      : fileData;

    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64
      }
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.4,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Gemini Exam Assistant Error]:', response.status, errText);
    throw new Error('GEMINI_API_ERROR');
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
 * Clean and parse JSON safely from Gemini output.
 */
function cleanAndParseJson(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  }
  return JSON.parse(cleaned);
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
    confidentialPrepGuide: parsed.confidentialPrepGuide || '',
    meta: {
      generatedAt: new Date().toISOString(),
      source: sourceMeta.source || 'ai_generated',
      ...sourceMeta
    }
  };

  // Ensure examConfig has proper defaults for composite exams
  if (isComposite) {
    normalized.examConfig.presetKey = normalized.examConfig.presetKey || 'custom';
    if (!normalized.examConfig.q1) normalized.examConfig.q1 = FALLBACK_PRESETS.classic.examConfig.q1;
    if (!normalized.examConfig.q2) normalized.examConfig.q2 = FALLBACK_PRESETS.classic.examConfig.q2;
    if (!normalized.examConfig.q3) normalized.examConfig.q3 = FALLBACK_PRESETS.classic.examConfig.q3;

    normalized.examConfig.q1.marks = Number(normalized.examConfig.q1.marks) || 15;
    normalized.examConfig.q2.marks = Number(normalized.examConfig.q2.marks) || 15;
    normalized.examConfig.q3.marks = Number(normalized.examConfig.q3.marks) || 10;
  }

  return normalized;
}

/**
 * 1. Parse uploaded exam paper (PDF, Image photo, or plain text)
 */
async function parseExamPaper({ fileData = null, mimeType = null, textContent = '', teacherNotes = '' }) {
  const prompt = `You are a Senior Kenya National Examinations Council (KNEC) Chief Chemistry Practical Examiner & Curriculum Specialist.
Analyze this uploaded chemistry exam paper document/photo and extract all practical experiments, questions, reagent configurations, and marking rubrics.

Teacher's Additional Instructions: "${teacherNotes || 'None'}"

Strict Requirement: Map the paper into an executable digital simulation structure for the VirtuLab Kenya platform.
Produce a strict JSON object with this exact schema:
{
  "title": "<Exam paper title, e.g. 'KCSE Chemistry Paper 3 Term 2 Joint Mock'>",
  "formLevel": "<'Form 3' or 'Form 4'>",
  "titrationType": "<'kcseComposite' if it contains 3 questions, or specific module like 'acidBase', 'redox', 'qualitative', 'organic', 'energy', 'rates', 'gas'>",
  "instructions": "<General candidate instructions>",
  "durationMinutes": <number, e.g. 135 for composite or 60 for single topic>,
  "examConfig": {
    "presetKey": "custom",
    "q1": {
      "solutionA": "<e.g. '0.100 M Hydrochloric Acid (HCl)'>",
      "solutionB": "<e.g. 'Sodium Hydroxide (NaOH) approx 0.100 M'>",
      "ratioA": <integer mole ratio of A, e.g. 1>,
      "ratioB": <integer mole ratio of B, e.g. 1>,
      "pipetteVolume": <25.0 or 20.0>,
      "indicator": "<'phenolphthalein', 'methylOrange', 'screenedMethylOrange', 'starch', or 'none'>",
      "equation": "<balanced chemical equation>",
      "trueAcidMolarity": <decimal number>,
      "trueBaseMolarity": <decimal number>,
      "trueTitre": <expected concordant titre in cm3, e.g. 25.00>,
      "marks": 15,
      "instructions": "<Specific Question 1 instructions>"
    },
    "q2": {
      "sampleName": "<e.g. 'Solid Y' or 'Salt Z'>",
      "sampleDesc": "<physical description, e.g. 'A pure white inorganic crystalline salt'>",
      "trueSaltKey": "<one of 'Pb(NO3)2', 'FeSO4', 'CuSO4', 'FeCl3', 'ZnSO4', 'Al(NO3)3', 'CaCl2', 'NH4Cl', 'Na2CO3', or chemical formula>",
      "trueSaltName": "<Full name with formula, e.g. 'Zinc Sulfate — ZnSO₄'>",
      "trueCation": "<cation formula, e.g. 'Zn2+'>",
      "trueAnion": "<anion formula, e.g. 'SO42-'>",
      "marks": 15,
      "tests": [
        {
          "id": "<test id string>",
          "prompt": "<procedure text, e.g. '(i) To 2 cm3 of solution Y, add 2M NaOH dropwise until in excess'>",
          "correctObs": "<accurate KNEC observation keywords>",
          "correctInf": "<accurate KNEC deduction / inference>"
        }
      ]
    },
    "q3": {
      "sampleName": "<e.g. 'Liquid Z' or 'Solid W'>",
      "sampleDesc": "<description>",
      "trueOrganicKey": "<one of 'Ethanol', 'Ethanoic Acid', 'Cyclohexene', 'Ethyne', 'Ethyl Ethanoate', 'Hexane'>",
      "trueOrganicName": "<full organic name>",
      "trueFunctionalGroup": "<functional group name, e.g. 'Carboxylic Acid (-COOH)' or 'Alkene (>C=C<)'>",
      "marks": 10,
      "tests": [
        {
          "id": "<test id string>",
          "prompt": "<procedure text>",
          "correctObs": "<KNEC observation>",
          "correctInf": "<KNEC inference>"
        }
      ]
    }
  },
  "markingScheme": "<Detailed Markdown formatted teacher marking guide with point-by-point marks breakdown>",
  "confidentialPrepGuide": "<Detailed Markdown formatted instructions for the school laboratory technician detailing reagent preparation recipes, molarities, volumes per candidate, and apparatus checklist>"
}

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

    return normalizeExamStructure(fallback, { source: 'smart_fallback', errorReason: err.message });
  }
}

/**
 * 2. Generate complete exam from an idea / prompt
 */
async function generateExamFromIdea({ prompt, formLevel = 'Form 4', moduleType = 'kcseComposite', difficulty = 'standard', durationMinutes = 135 }) {
  const aiPrompt = `You are a Senior KNEC Chemistry Examiner & Curriculum Specialist designing a secondary school chemistry practical exam for Kenyan learners.

Teacher's Idea / Request:
"${prompt}"

Exam Specifications:
- Form Level: ${formLevel}
- Target Format: ${moduleType}
- Difficulty Level: ${difficulty} (standard KNEC, foundational revision, or merit challenge)
- Allocated Time: ${durationMinutes} minutes

Requirements:
1. Ensure all chemical equations are 100% balanced.
2. Ensure titration stoichiometry and expected titre volumes are realistic (between 15.00 cm³ and 30.00 cm³).
3. Select valid KNEC secondary syllabus qualitative ions (Cations: Pb²⁺, Cu²⁺, Fe²⁺, Fe³⁺, Al³⁺, Zn²⁺, Ca²⁺, NH₄⁺; Anions: SO₄²⁻, Cl⁻, CO₃²⁻, NO₃⁻).
4. Select valid organic substances (Ethanol, Ethanoic acid, Cyclohexene, Hexane, Ethyl Ethanoate).
5. Provide a comprehensive KNEC scoring scheme and a laboratory technician confidential prep guide.

Respond in exact valid JSON matching this schema:
{
  "title": "<Exam Title>",
  "formLevel": "${formLevel}",
  "titrationType": "${moduleType}",
  "instructions": "<General candidate instructions>",
  "durationMinutes": ${durationMinutes},
  "examConfig": {
    "presetKey": "custom",
    "q1": {
      "solutionA": "<Solution A name & conc>",
      "solutionB": "<Solution B name & conc>",
      "ratioA": <integer>,
      "ratioB": <integer>,
      "pipetteVolume": <25.0 or 20.0>,
      "indicator": "<'phenolphthalein', 'methylOrange', 'screenedMethylOrange', or 'starch'>",
      "equation": "<balanced equation>",
      "trueAcidMolarity": <number>,
      "trueBaseMolarity": <number>,
      "trueTitre": <number>,
      "marks": 15,
      "instructions": "<Q1 instructions>"
    },
    "q2": {
      "sampleName": "<e.g. 'Solid Y'>",
      "sampleDesc": "<description>",
      "trueSaltKey": "<chemical key>",
      "trueSaltName": "<full salt name>",
      "trueCation": "<cation>",
      "trueAnion": "<anion>",
      "marks": 15,
      "tests": [
        { "id": "q2_t1", "prompt": "<procedure>", "correctObs": "<obs>", "correctInf": "<inf>" },
        { "id": "q2_t2", "prompt": "<procedure>", "correctObs": "<obs>", "correctInf": "<inf>" },
        { "id": "q2_t3", "prompt": "<procedure>", "correctObs": "<obs>", "correctInf": "<inf>" },
        { "id": "q2_t4", "prompt": "<procedure>", "correctObs": "<obs>", "correctInf": "<inf>" }
      ]
    },
    "q3": {
      "sampleName": "<e.g. 'Liquid Z'>",
      "sampleDesc": "<description>",
      "trueOrganicKey": "<organic key>",
      "trueOrganicName": "<full name>",
      "trueFunctionalGroup": "<functional group>",
      "marks": 10,
      "tests": [
        { "id": "q3_t1", "prompt": "<procedure>", "correctObs": "<obs>", "correctInf": "<inf>" },
        { "id": "q3_t2", "prompt": "<procedure>", "correctObs": "<obs>", "correctInf": "<inf>" },
        { "id": "q3_t3", "prompt": "<procedure>", "correctObs": "<obs>", "correctInf": "<inf>" },
        { "id": "q3_t4", "prompt": "<procedure>", "correctObs": "<obs>", "correctInf": "<inf>" }
      ]
    }
  },
  "markingScheme": "<Markdown KNEC marking scheme>",
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

    return normalizeExamStructure(modified, { source: 'smart_fallback', promptText: prompt, errorReason: err.message });
  }
}

/**
 * 3. Conversational Refinement of an existing exam draft
 */
async function refineExamDraft({ currentDraft, instruction }) {
  if (!currentDraft || typeof currentDraft !== 'object') {
    throw new Error('CURRENT_DRAFT_REQUIRED');
  }

  const prompt = `You are a KNEC Chemistry Practical Examiner assisting a secondary school teacher who wants to adjust an existing exam draft.

Teacher's Instruction / Change Request:
"${instruction}"

Current Exam Draft:
${JSON.stringify(currentDraft, null, 2)}

Task:
Apply the teacher's modifications faithfully while preserving the valid chemical stoichiometry, equations, and KNEC marking rubric.
Respond with the updated exam JSON with the EXACT SAME structure:
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
    return normalizeExamStructure(parsed, { source: 'ai_refinement', lastInstruction: instruction });
  } catch (err) {
    console.warn('[refineExamDraft] AI refinement failed or not configured, applying heuristic patch:', err.message);
    // Graceful offline heuristic modification
    const updated = JSON.parse(JSON.stringify(currentDraft));
    const lower = (instruction || '').toLowerCase();

    if (lower.includes('20') && lower.includes('pipette')) {
      if (updated.examConfig?.q1) updated.examConfig.q1.pipetteVolume = 20.0;
    } else if (lower.includes('25') && lower.includes('pipette')) {
      if (updated.examConfig?.q1) updated.examConfig.q1.pipetteVolume = 25.0;
    }

    if (lower.includes('methyl orange')) {
      if (updated.examConfig?.q1) updated.examConfig.q1.indicator = 'methylOrange';
    } else if (lower.includes('phenolphthalein')) {
      if (updated.examConfig?.q1) updated.examConfig.q1.indicator = 'phenolphthalein';
    }

    if (lower.includes('lead') || lower.includes('pb')) {
      if (updated.examConfig?.q2) {
        updated.examConfig.q2.trueSaltKey = 'Pb(NO3)2';
        updated.examConfig.q2.trueSaltName = 'Lead(II) Nitrate — Pb(NO₃)₂';
        updated.examConfig.q2.trueCation = 'Pb2+';
        updated.examConfig.q2.trueAnion = 'NO3-';
      }
    } else if (lower.includes('zinc') || lower.includes('zn')) {
      if (updated.examConfig?.q2) {
        updated.examConfig.q2.trueSaltKey = 'ZnSO4';
        updated.examConfig.q2.trueSaltName = 'Zinc Sulfate — ZnSO₄';
        updated.examConfig.q2.trueCation = 'Zn2+';
        updated.examConfig.q2.trueAnion = 'SO42-';
      }
    } else if (lower.includes('iron') || lower.includes('fe')) {
      if (updated.examConfig?.q2) {
        updated.examConfig.q2.trueSaltKey = 'FeSO4';
        updated.examConfig.q2.trueSaltName = 'Iron(II) Sulfate — FeSO₄';
        updated.examConfig.q2.trueCation = 'Fe2+';
        updated.examConfig.q2.trueAnion = 'SO42-';
      }
    }

    return normalizeExamStructure(updated, { source: 'smart_fallback', lastInstruction: instruction, errorReason: err.message });
  }
}

module.exports = {
  parseExamPaper,
  generateExamFromIdea,
  refineExamDraft,
  FALLBACK_PRESETS
};
