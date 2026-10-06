// ============================================================
//  VirtuLab Kenya — KNEC Competency Remediation Drill Engine (Client)
//  Offline-First 5-Minute Micro-Drills for KCSE Chemistry Practical
// ============================================================

(function() {
  'use strict';

  const DRILL_CATALOG = {
    'D': [
      {
        id: 'drill_d_01',
        competencyCode: 'D',
        title: 'KNEC 2-Decimal Precision & Zero/Five Rule Mastery',
        durationSeconds: 300,
        knecMarkWeight: 1.0,
        examinerRule: 'All initial, final, and titre readings in Table 1 must be recorded to two decimal places, with the second decimal digit strictly being either "0" or "5". Readings with 1 d.p. (e.g. 21.4) or non-0/5 terminations (e.g. 21.42) attract a full 1-mark deduction under KNEC Condition (D).',
        objective: 'Eliminate decimal formatting penalties and master eye-level half-millimeter interpolation.',
        questions: [
          {
            id: 'q1',
            type: 'multi_select',
            prompt: 'A candidate entered the following burette values in Table 1. Select ALL entries that violate the KNEC 2-decimal rule:',
            options: [
              { id: 'A', text: '0.0 cm³', isViolation: true },
              { id: 'B', text: '16.50 cm³', isViolation: false },
              { id: 'C', text: '23.4 cm³', isViolation: true },
              { id: 'D', text: '18.25 cm³', isViolation: false },
              { id: 'E', text: '22.32 cm³', isViolation: true }
            ],
            correctOptionIds: ['A', 'C', 'E'],
            explanation: '0.0 has only 1 d.p. (must be 0.00). 23.4 has only 1 d.p. (must be 23.40). 22.32 does not end in .0 or .5 (must be 22.30 or 22.35).'
          },
          {
            id: 'q2',
            type: 'text_input',
            prompt: 'A student recorded an initial reading of "0.0" and a final reading of "24.6". Type the corrected values in valid KNEC format separated by a comma (Initial, Final):',
            placeholder: 'e.g. 0.00, 24.60',
            correctAnswer: '0.00, 24.60',
            acceptableAnswers: ['0.00, 24.60', '0.00,24.60', '0.00 and 24.60', '0.00 cm3, 24.60 cm3', '0.00 cm³, 24.60 cm³'],
            explanation: 'KNEC demands all burette readings strictly to 2 decimal places terminating in .00 or .50/.05.'
          },
          {
            id: 'q3',
            type: 'single_choice',
            prompt: 'When reading a burette calibrated in 0.1 cm³ graduations, the meniscus curve falls exactly halfway between 21.30 cm³ and 21.40 cm³. What must the candidate record?',
            options: [
              { id: 'A', text: '21.3 cm³' },
              { id: 'B', text: '21.35 cm³' },
              { id: 'C', text: '21.4 cm³' },
              { id: 'D', text: '21.350 cm³' }
            ],
            correctOptionId: 'B',
            explanation: 'The halfway point between 21.30 and 21.40 cm³ is 21.35 cm³. It satisfies both 2 decimal places and the .05 termination rule.'
          }
        ]
      }
    ],

    'PA': [
      {
        id: 'drill_pa_01',
        competencyCode: 'PA',
        title: 'Concordancy Selection & Principle of Averaging (PA)',
        durationSeconds: 300,
        knecMarkWeight: 1.0,
        examinerRule: 'Only titre readings within ±0.20 cm³ of each other are concordant and eligible for averaging. The candidate must explicitly state the arithmetic expression (e.g. (T1 + T2)/2) and evaluate to 2 decimal places.',
        objective: 'Avoid averaging discordant outliers and master KNEC arithmetic working formatting.',
        questions: [
          {
            id: 'q1',
            type: 'multi_select',
            prompt: 'A candidate obtained the following 4 titres: Trial 1 = 23.90 cm³, Trial 2 = 23.40 cm³, Trial 3 = 23.45 cm³, Trial 4 = 23.50 cm³. Which trials MUST be selected for averaging?',
            options: [
              { id: '1', text: 'Trial 1 (23.90 cm³)', isConcordant: false },
              { id: '2', text: 'Trial 2 (23.40 cm³)', isConcordant: true },
              { id: '3', text: 'Trial 3 (23.45 cm³)', isConcordant: true },
              { id: '4', text: 'Trial 4 (23.50 cm³)', isConcordant: true }
            ],
            correctOptionIds: ['2', '3', '4'],
            explanation: 'Trials 2, 3, and 4 lie within a 0.10 cm³ range (23.40 to 23.50 cm³), which is within ±0.20 cm³. Trial 1 (23.90 cm³) is a discordant outlier (+0.40 cm³ away) and must be discarded.'
          },
          {
            id: 'q2',
            type: 'text_input',
            prompt: 'Calculate the average titre for Trials 2, 3, and 4 (23.40, 23.45, 23.50 cm³). State the final numerical value in cm³ to 2 decimal places:',
            placeholder: 'e.g. 23.45',
            correctAnswer: '23.45',
            acceptableAnswers: ['23.45', '23.45 cm3', '23.45 cm³'],
            explanation: '(23.40 + 23.45 + 23.50) / 3 = 70.35 / 3 = 23.45 cm³.'
          },
          {
            id: 'q3',
            type: 'single_choice',
            prompt: 'A candidate averaged two concordant titres of 19.80 cm³ and 20.00 cm³ but wrote only "Average = 19.9 cm³" without showing the addition step. What penalty does KNEC apply?',
            options: [
              { id: 'A', text: 'Full marks awarded since the value is mathematically correct' },
              { id: 'B', text: 'Penalty for missing working expression and 1 d.p. answer (0 marks awarded for PA)' },
              { id: 'C', text: 'Only a 0.5 mark deduction' },
              { id: 'D', text: 'The entire Question 1 is cancelled' }
            ],
            correctOptionId: 'B',
            explanation: 'Under KNEC rubric, candidate loses the averaging mark if the working expression is omitted, or if the answer is truncated to 1 d.p. (19.9 instead of 19.90).'
          }
        ]
      }
    ],

    'AC/FA': [
      {
        id: 'drill_ac_01',
        competencyCode: 'AC/FA',
        title: 'Optical Meniscus Alignment & Titrimetric Accuracy',
        durationSeconds: 300,
        knecMarkWeight: 2.0,
        examinerRule: 'Candidate average titre is compared directly against the teacher/supervisor standard value. Full marks (1.0 or 2.0) are awarded if within ±0.10 cm³; 0.5 or 1.0 mark if within ±0.20 cm³; 0 marks if deviation exceeds ±0.20 cm³.',
        objective: 'Eliminate parallax error, jet bubble air gaps, and endpoint over-shooting.',
        questions: [
          {
            id: 'q1',
            type: 'single_choice',
            prompt: 'When reading a colorless liquid in a 50 cm³ burette, how must the observer line of sight be oriented?',
            options: [
              { id: 'A', text: 'Level with the top edge of the liquid meniscus' },
              { id: 'B', text: 'Strictly horizontal and tangent to the bottom of the curved concave meniscus' },
              { id: 'C', text: 'Looking from slightly above to see the graduation line clearly' },
              { id: 'D', text: 'Looking from below to magnify the line' }
            ],
            correctOptionId: 'B',
            explanation: 'Eye level must be strictly tangent to the bottom of the concave meniscus. Viewing from above or below causes parallax error, distorting the volume.'
          },
          {
            id: 'q2',
            type: 'single_choice',
            prompt: 'Before starting a titration, an air bubble is trapped in the burette jet tip below the stopcock. During titration, the bubble is expelled into the conical flask. How does this affect the recorded titre?',
            options: [
              { id: 'A', text: 'The recorded titre will be erroneously larger than the true consumed volume' },
              { id: 'B', text: 'The recorded titre will be erroneously smaller than the true volume' },
              { id: 'C', text: 'No effect on recorded titre' },
              { id: 'D', text: 'The indicator will change color prematurely' }
            ],
            correctOptionId: 'A',
            explanation: 'The volume occupied by the expelled air bubble is registered on the burette scale as delivered liquid, artificially inflating the titre and spoiling accuracy.'
          },
          {
            id: 'q3',
            type: 'single_choice',
            prompt: 'When titrating hydrochloric acid against sodium hydroxide using phenolphthalein (acid in burette, base in flask), what signifies the correct KNEC endpoint?',
            options: [
              { id: 'A', text: 'Liquid turns deep intense magenta' },
              { id: 'B', text: 'First permanent discharge of pink to colorless that persists for at least 30 seconds' },
              { id: 'C', text: 'Pink color flashes temporarily for 2 seconds upon swirling' },
              { id: 'D', text: 'Solution becomes cloudy white' }
            ],
            correctOptionId: 'B',
            explanation: 'The endpoint is the transition from pink to colorless that remains stable for 30 seconds upon continuous swirling.'
          }
        ]
      }
    ],

    'INORG': [
      {
        id: 'drill_inorg_01',
        competencyCode: 'INORG',
        title: 'Inorganic Cation & Anion Qualitative Diagnostics',
        durationSeconds: 300,
        knecMarkWeight: 15.0,
        examinerRule: 'Observations must state both precipitate color and solubility in excess reagent. Inferences must include correct ionic formulae (e.g. Al³⁺, Pb²⁺, Zn²⁺). Penalties apply for incomplete observations (e.g. omitting "to form a colorless solution").',
        objective: 'Master differential solubility in excess NaOH vs NH₃ and confirmatory anion tests.',
        questions: [
          {
            id: 'q1',
            type: 'single_choice',
            prompt: 'A solution of salt X gives a white precipitate with NaOH(aq) dropwise that DISSOLVES in excess to form a colourless solution. With NH₃(aq), it gives a white precipitate that remains INSOLUBLE in excess. Which cations are inferred?',
            options: [
              { id: 'A', text: 'Zn²⁺ only' },
              { id: 'B', text: 'Al³⁺ or Pb²⁺' },
              { id: 'C', text: 'Ca²⁺ or Mg²⁺' },
              { id: 'D', text: 'Fe²⁺ or Cu²⁺' }
            ],
            correctOptionId: 'B',
            explanation: 'Al³⁺, Pb²⁺, and Zn²⁺ dissolve in excess NaOH. But in excess NH₃, Zn²⁺ dissolves to form a tetraammine complex, while Al³⁺ and Pb²⁺ precipitates remain insoluble.'
          },
          {
            id: 'q2',
            type: 'text_input',
            prompt: 'To distinguish between Al³⁺ and Pb²⁺ in salt X, dilute potassium iodide KI(aq) is added. What observation confirms the presence of Pb²⁺?',
            placeholder: 'Describe observation...',
            correctAnswer: 'Yellow precipitate',
            acceptableAnswers: ['yellow precipitate', 'yellow ppt', 'bright yellow precipitate', 'yellow precipitate formed', 'yellow precipitate of lead iodide'],
            explanation: 'Lead ions react with iodide ions to form lead(II) iodide (PbI₂), a characteristic bright yellow precipitate. Al³⁺ produces no precipitate.'
          },
          {
            id: 'q3',
            type: 'single_choice',
            prompt: 'To test for the sulfate ion (SO₄²⁻), barium nitrate Ba(NO₃)₂ is added followed by dilute nitric acid HNO₃. What observation confirms SO₄²⁻ and rules out SO₃²⁻ / CO₃²⁻?',
            options: [
              { id: 'A', text: 'White precipitate that dissolves in dilute HNO₃ with effervescence' },
              { id: 'B', text: 'White precipitate that remains insoluble in dilute HNO₃' },
              { id: 'C', text: 'No precipitate formed upon adding Ba(NO₃)₂' },
              { id: 'D', text: 'Brown fumes of NO₂ gas evolved' }
            ],
            correctOptionId: 'B',
            explanation: 'Barium sulfate (BaSO₄) is insoluble in dilute nitric acid. Barium sulfite (BaSO₃) and barium carbonate (BaCO₃) dissolve in dilute acid.'
          }
        ]
      }
    ],

    'ORG': [
      {
        id: 'drill_org_01',
        competencyCode: 'ORG',
        title: 'Organic Unsaturation & Functional Group Deductions',
        durationSeconds: 300,
        knecMarkWeight: 10.0,
        examinerRule: 'Unsaturated hydrocarbons (>C=C< or -C≡C-) rapidly decolorize bromine water and acidified KMnO₄ without effervescence. Carboxylic acids (R-COOH) produce effervescence with solid NaHCO₃ and turn blue litmus red.',
        objective: 'Accurately distinguish between alkenes/alkynes, carboxylic acids, and alkanols.',
        questions: [
          {
            id: 'q1',
            type: 'single_choice',
            prompt: 'When liquid Y is shaken with bromine water in the dark, the reddish-brown/orange colour is rapidly decolourised without any gas evolution. What deduction is required by KNEC?',
            options: [
              { id: 'A', text: 'R-COOH / Carboxylic acid present' },
              { id: 'B', text: '>C=C< or -C≡C- / Unsaturated organic compound present' },
              { id: 'C', text: 'R-OH / Alkanol present' },
              { id: 'D', text: 'Saturated alkane present' }
            ],
            correctOptionId: 'B',
            explanation: 'Rapid decolorization of bromine water without light proves the presence of carbon-carbon double or triple bonds (>C=C< or -C≡C-).'
          },
          {
            id: 'q2',
            type: 'single_choice',
            prompt: 'Solid sodium hydrogencarbonate (NaHCO₃) is added to liquid Z. Effervescence occurs and a colourless gas that forms a white precipitate in calcium hydroxide is evolved. What functional group is present?',
            options: [
              { id: 'A', text: '>C=C< (Alkene)' },
              { id: 'B', text: 'R-COOH (Carboxylic acid / H⁺ ions)' },
              { id: 'C', text: 'R-OH (Alkanol)' },
              { id: 'D', text: 'Ester' }
            ],
            correctOptionId: 'B',
            explanation: 'Carboxylic acids (R-COOH) react with carbonates to liberate CO₂ gas, which gives a white precipitate with lime water.'
          },
          {
            id: 'q3',
            type: 'text_input',
            prompt: 'When liquid W is warmed with acidified potassium dichromate(VI) K₂Cr₂O₇, what characteristic color change indicates the presence of a primary or secondary alkanol (R-OH)? (Format: [initial] to [final])',
            placeholder: 'e.g. Orange to green',
            correctAnswer: 'Orange to green',
            acceptableAnswers: ['orange to green', 'orange turns green', 'from orange to green', 'orange to green solution'],
            explanation: 'Cr₂O₇²⁻ (orange) is reduced to Cr³⁺ (green) as the alkanol is oxidized.'
          }
        ]
      }
    ]
  };

  function getDrill(code, drillId = null) {
    const list = DRILL_CATALOG[code];
    if (!list || list.length === 0) return null;
    if (drillId) {
      const match = list.find(d => d.id === drillId);
      if (match) return match;
    }
    return list[0];
  }

  function gradeDrill(code, drillId, answers = {}) {
    const drill = getDrill(code, drillId);
    if (!drill) throw new Error('Drill not found for competency: ' + code);

    const results = [];
    let totalScore = 0;
    const maxScore = drill.questions.length * 10;

    drill.questions.forEach((q) => {
      const val = answers[q.id];
      let isCorrect = false;
      let earned = 0;
      let feedback = '';

      if (q.type === 'single_choice') {
        if (val && String(val).trim().toUpperCase() === q.correctOptionId.toUpperCase()) {
          isCorrect = true;
          earned = 10;
          feedback = 'Correct! ' + q.explanation;
        } else {
          earned = 0;
          feedback = `Incorrect. Correct answer was (${q.correctOptionId}). ${q.explanation}`;
        }
      } else if (q.type === 'multi_select') {
        const selected = Array.isArray(val) ? val.map(s => String(s).trim().toUpperCase()) : [];
        const correctSet = new Set(q.correctOptionIds.map(s => s.toUpperCase()));
        const allCorrect = q.correctOptionIds.every(id => selected.includes(id.toUpperCase()));
        const noExtras = selected.every(id => correctSet.has(id));

        if (allCorrect && noExtras) {
          isCorrect = true;
          earned = 10;
          feedback = 'Perfect identification! ' + q.explanation;
        } else if (allCorrect || selected.some(id => correctSet.has(id))) {
          earned = 5;
          feedback = `Partially correct. Valid selections were: ${q.correctOptionIds.join(', ')}. ${q.explanation}`;
        } else {
          earned = 0;
          feedback = `Incorrect selections. Correct choices: ${q.correctOptionIds.join(', ')}. ${q.explanation}`;
        }
      } else if (q.type === 'text_input') {
        const cleanInput = String(val || '').trim().toLowerCase().replace(/\s+/g, ' ');
        const cleanTarget = q.correctAnswer.toLowerCase().replace(/\s+/g, ' ');
        const acceptable = (q.acceptableAnswers || []).map(a => a.toLowerCase().replace(/\s+/g, ' '));

        if (cleanInput === cleanTarget || acceptable.includes(cleanInput)) {
          isCorrect = true;
          earned = 10;
          feedback = 'Spot on! ' + q.explanation;
        } else {
          earned = 0;
          feedback = `Expected: "${q.correctAnswer}". ${q.explanation}`;
        }
      }

      totalScore += earned;
      results.push({
        questionId: q.id,
        prompt: q.prompt,
        studentAnswer: val,
        isCorrect,
        score: earned,
        maxScore: 10,
        feedback
      });
    });

    const percentage = Math.round((totalScore / maxScore) * 100);
    const isMastery = percentage >= 80;
    const competencyBoost = isMastery ? Math.min(25, Math.round(percentage * 0.25)) : Math.round(percentage * 0.12);

    return {
      drillId: drill.id,
      competencyCode: drill.competencyCode,
      title: drill.title,
      examinerRule: drill.examinerRule,
      totalScore,
      maxScore,
      percentage,
      isMastery,
      status: isMastery ? 'Mastery Achieved' : (percentage >= 50 ? 'Competent' : 'Needs Practice'),
      competencyBoost,
      itemizedReview: results,
      chiefExaminerAdvice: isMastery
        ? 'Outstanding performance. You have mastered this KNEC practical standard and eliminated systematic deductions.'
        : 'Review the examiner rationales above. Apply this rule strictly in your next Paper 3 composite attempt.'
    };
  }

  // Expose global interface
  window.KnecRemediation = {
    DRILL_CATALOG,
    getDrill,
    gradeDrill
  };
})();
