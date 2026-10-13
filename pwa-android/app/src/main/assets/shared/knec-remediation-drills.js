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

  // ── Standalone Interactive Modal UI & Controller ─────────────
  let _activeDrill = null;
  let _drillTimerInterval = null;

  function ensureStylesInDOM() {
    if (document.getElementById('vlk-remediation-drill-styles')) return;
    const style = document.createElement('style');
    style.id = 'vlk-remediation-drill-styles';
    style.textContent = `
      .vlk-drill-backdrop {
        position: fixed; inset: 0; z-index: 100050;
        background: rgba(10, 15, 29, 0.85);
        backdrop-filter: blur(8px);
        overflow-y: auto; padding: 20px;
        display: none; box-sizing: border-box;
      }
      .vlk-drill-dialog {
        max-width: 680px; margin: 30px auto;
        background: var(--card-bg, #0F172A);
        border: 1.5px solid var(--card-border, #334155);
        border-radius: 16px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
        overflow: hidden; color: var(--text-main, #F8FAFC);
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .vlk-drill-header {
        background: linear-gradient(135deg, rgba(2, 132, 199, 0.18), rgba(15, 23, 42, 0.7));
        border-bottom: 1px solid var(--card-border, #334155);
        padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
      }
      .vlk-drill-timer-pill {
        display: flex; align-items: center; gap: 6px;
        background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35);
        color: #EF4444; padding: 5px 12px; border-radius: 100px;
        font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 0.85rem;
      }
      .vlk-drill-rule-banner {
        background: rgba(245, 158, 11, 0.09);
        border-left: 4px solid #F59E0B;
        border-radius: 8px; padding: 12px 16px; margin-bottom: 18px;
        font-size: 0.84rem; line-height: 1.5;
      }
      .vlk-drill-option-label {
        display: flex; align-items: flex-start; gap: 10px;
        background: var(--card-bg-hover, #1E293B);
        border: 1px solid var(--card-border, #334155);
        border-radius: 8px; padding: 10px 14px; cursor: pointer;
        font-size: 0.88rem; transition: all 0.15s ease;
      }
      .vlk-drill-option-label:hover {
        border-color: #0284C7; background: rgba(2, 132, 199, 0.1);
      }
      .vlk-drill-menu-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 14px; margin-top: 14px;
      }
      .vlk-drill-menu-card {
        background: var(--card-bg-hover, #1E293B);
        border: 1.5px solid var(--card-border, #334155);
        border-radius: 12px; padding: 14px 16px;
        cursor: pointer; text-align: left;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex; flex-direction: column; justify-content: space-between;
      }
      .vlk-drill-menu-card:hover {
        border-color: #0284C7; transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(2, 132, 199, 0.18);
      }
      .vlk-drill-btn {
        display: inline-flex; align-items: center; justify-content: center;
        padding: 9px 18px; border-radius: 8px; font-weight: 800;
        font-size: 0.85rem; cursor: pointer; border: none;
        transition: all 0.15s ease;
      }
      .vlk-drill-btn-primary {
        background: linear-gradient(135deg, #0284C7, #0369A1);
        color: #FFF; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
      }
      .vlk-drill-btn-primary:hover {
        filter: brightness(1.1); transform: translateY(-1px);
      }
      .vlk-drill-btn-secondary {
        background: var(--card-bg-hover, #1E293B);
        color: var(--text-muted, #94A3B8);
        border: 1px solid var(--card-border, #334155);
      }
    `;
    document.head.appendChild(style);
  }

  function ensureModalInDOM() {
    ensureStylesInDOM();
    if (!document.getElementById('vlkRemediationDrillModal')) {
      const modalEl = document.createElement('div');
      modalEl.id = 'vlkRemediationDrillModal';
      modalEl.className = 'vlk-drill-backdrop';
      modalEl.innerHTML = `
        <div class="vlk-drill-dialog">
          <div class="vlk-drill-header">
            <div style="display:flex; align-items:center; gap:12px;">
              <span id="vlkDrillIcon" style="font-size:1.6rem;">⚡</span>
              <div>
                <div style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--cyan-accent, #0284C7); font-weight:800;">KNEC Practical Remediation Micro-Drill</div>
                <h3 id="vlkDrillTitle" style="margin:0; font-size:1.1rem; color:var(--heading-color, #FFF); font-weight:800;">Drill</h3>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="vlk-drill-timer-pill">
                <span>⏱️</span>
                <span id="vlkDrillTimerDisplay">05:00</span>
              </div>
              <button type="button" onclick="window.KnecRemediation.closeModal()" style="background:transparent; border:none; color:var(--text-muted, #94A3B8); font-size:1.5rem; cursor:pointer; line-height:1;" aria-label="Close Drill">&times;</button>
            </div>
          </div>

          <div id="vlkDrillActiveStage" style="padding:20px;">
            <div class="vlk-drill-rule-banner">
              <div style="font-size:0.75rem; text-transform:uppercase; font-weight:800; color:#F59E0B; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
                <span>👨‍🏫</span> KNEC Chief Examiner Standard:
              </div>
              <div id="vlkDrillRuleText"></div>
            </div>

            <form id="vlkDrillForm" onsubmit="event.preventDefault(); window.KnecRemediation.submitModal();">
              <div id="vlkDrillQuestionsList" style="display:flex; flex-direction:column; gap:16px;"></div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:22px; padding-top:16px; border-top:1px solid var(--card-border, #334155); flex-wrap:wrap; gap:10px;">
                <button type="button" class="vlk-drill-btn vlk-drill-btn-secondary" onclick="window.KnecRemediation.closeModal()">Exit Drill</button>
                <button type="submit" class="vlk-drill-btn vlk-drill-btn-primary">⚡ Submit for Instant KNEC Grading</button>
              </div>
            </form>
          </div>

          <div id="vlkDrillResultStage" style="display:none; padding:24px 20px;">
            <div style="text-align:center; margin-bottom:20px;">
              <div id="vlkDrillResultTrophy" style="font-size:2.8rem; margin-bottom:8px;">🎯</div>
              <h3 id="vlkDrillResultStatus" style="font-size:1.3rem; font-weight:900; margin-bottom:4px;">Mastery Attained!</h3>
              <p id="vlkDrillResultSummary" style="font-size:0.85rem; color:var(--text-muted, #94A3B8); max-width:480px; margin:0 auto; line-height:1.5;"></p>
              <div style="display:flex; justify-content:center; gap:14px; margin-top:16px;">
                <div style="background:var(--card-bg-hover, #1E293B); border:1px solid var(--card-border, #334155); border-radius:10px; padding:10px 18px;">
                  <div style="font-size:0.7rem; color:var(--text-muted, #94A3B8); text-transform:uppercase; font-weight:700;">Score</div>
                  <div id="vlkDrillResultScore" style="font-size:1.4rem; font-weight:900; font-family:'JetBrains Mono', monospace; color:var(--cyan-accent, #0284C7);">30 / 30</div>
                </div>
                <div style="background:var(--card-bg-hover, #1E293B); border:1px solid rgba(16,185,129,0.3); border-radius:10px; padding:10px 18px;">
                  <div style="font-size:0.7rem; color:var(--text-muted, #94A3B8); text-transform:uppercase; font-weight:700;">Status</div>
                  <div id="vlkDrillResultBadge" style="font-size:1.1rem; font-weight:900; font-family:'JetBrains Mono', monospace; color:#10B981;">Mastered</div>
                </div>
              </div>
            </div>
            <div style="background:rgba(0,0,0,0.25); border:1px solid var(--card-border, #334155); border-radius:10px; padding:14px; margin-bottom:18px;">
              <div style="font-weight:800; font-size:0.86rem; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                <span>📝</span> Itemized Chief Examiner Verification:
              </div>
              <div id="vlkDrillResultBreakdown" style="display:flex; flex-direction:column; gap:10px; font-size:0.82rem;"></div>
            </div>
            <div style="display:flex; justify-content:flex-end;">
              <button type="button" class="vlk-drill-btn vlk-drill-btn-secondary" onclick="window.KnecRemediation.closeModal()">Close &amp; Return to Lab</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }

    if (!document.getElementById('vlkWorkbenchDrillsMenuModal')) {
      const menuEl = document.createElement('div');
      menuEl.id = 'vlkWorkbenchDrillsMenuModal';
      menuEl.className = 'vlk-drill-backdrop';
      menuEl.innerHTML = `
        <div class="vlk-drill-dialog" style="max-width:640px;">
          <div class="vlk-drill-header">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:1.5rem;">🎯</span>
              <div>
                <h3 id="vlkMenuTitle" style="margin:0; font-size:1.1rem; font-weight:800;">Diagnostic Drills &amp; KNEC Rubric</h3>
                <span id="vlkMenuSub" style="font-size:0.75rem; color:var(--text-muted, #94A3B8);">Micro-drills to eliminate systematic deductions</span>
              </div>
            </div>
            <button type="button" onclick="window.KnecRemediation.closeWorkbenchDrillsMenu()" style="background:transparent; border:none; color:var(--text-muted, #94A3B8); font-size:1.5rem; cursor:pointer; line-height:1;">&times;</button>
          </div>
          <div style="padding:20px;">
            <div id="vlkMenuCardsList" class="vlk-drill-menu-grid"></div>
            <div style="display:flex; justify-content:flex-end; margin-top:18px; padding-top:14px; border-top:1px solid var(--card-border, #334155);">
              <button type="button" class="vlk-drill-btn vlk-drill-btn-secondary" onclick="window.KnecRemediation.closeWorkbenchDrillsMenu()">Back to Workbench</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(menuEl);
    }
  }

  function openDrillModal(code) {
    const lookupCode = (code === 'AC') ? 'AC/FA' : code;
    const drill = getDrill(lookupCode);
    if (!drill) {
      alert(`Drill for rule "${code}" could not be loaded.`);
      return;
    }

    ensureModalInDOM();
    _activeDrill = {
      code,
      lookupCode,
      drill,
      timeLeft: drill.durationSeconds || 300
    };

    const modal = document.getElementById('vlkRemediationDrillModal');
    const titleEl = document.getElementById('vlkDrillTitle');
    const iconEl = document.getElementById('vlkDrillIcon');
    const ruleEl = document.getElementById('vlkDrillRuleText');
    const timerDisplay = document.getElementById('vlkDrillTimerDisplay');
    const qList = document.getElementById('vlkDrillQuestionsList');
    const activeStage = document.getElementById('vlkDrillActiveStage');
    const resultStage = document.getElementById('vlkDrillResultStage');

    const iconMap = { 'D': '📏', 'PA': '⚖️', 'AC': '🎯', 'AC/FA': '🎯', 'INORG': '🧂', 'ORG': '🧫' };
    if (iconEl) iconEl.textContent = iconMap[code] || '⚡';
    if (titleEl) titleEl.textContent = drill.title;
    if (ruleEl) ruleEl.textContent = drill.examinerRule;
    if (timerDisplay) timerDisplay.textContent = '05:00';

    if (activeStage) activeStage.style.display = 'block';
    if (resultStage) resultStage.style.display = 'none';

    if (qList) {
      qList.innerHTML = (drill.questions || []).map((q, idx) => {
        let inputHtml = '';
        if (q.type === 'single_choice' && q.options) {
          inputHtml = `
            <div style="display:grid; gap:8px; margin-top:8px;">
              ${q.options.map(opt => `
                <label class="vlk-drill-option-label">
                  <input type="radio" name="q_${q.id}" value="${opt.id}" required>
                  <span><b>(${opt.id})</b> ${opt.text}</span>
                </label>
              `).join('')}
            </div>
          `;
        } else if (q.type === 'multi_select' && q.options) {
          inputHtml = `
            <div style="display:grid; gap:8px; margin-top:8px;">
              ${q.options.map(opt => `
                <label class="vlk-drill-option-label">
                  <input type="checkbox" name="q_${q.id}" value="${opt.id}">
                  <span><b>(${opt.id})</b> ${opt.text}</span>
                </label>
              `).join('')}
            </div>
          `;
        } else if (q.type === 'text_input') {
          inputHtml = `
            <div style="margin-top:8px;">
              <input type="text" name="q_${q.id}" placeholder="${q.placeholder || 'Type your answer...'}" style="width:100%; padding:10px 14px; font-size:0.9rem; border-radius:8px; border:1px solid var(--card-border, #334155); background:var(--card-bg, #0F172A); color:#FFF; box-sizing:border-box;" required autocomplete="off">
            </div>
          `;
        }

        return `
          <div style="background:rgba(255,255,255,0.03); border:1px solid var(--card-border, #334155); border-radius:10px; padding:12px 14px;">
            <div style="font-size:0.72rem; text-transform:uppercase; font-weight:800; color:var(--cyan-accent, #0284C7); margin-bottom:4px;">
              Question ${idx + 1} of ${drill.questions.length}
            </div>
            <div style="font-weight:700; font-size:0.88rem; line-height:1.45; margin-bottom:6px;">
              ${q.prompt}
            </div>
            ${inputHtml}
          </div>
        `;
      }).join('');
    }

    if (_drillTimerInterval) clearInterval(_drillTimerInterval);
    _drillTimerInterval = setInterval(() => {
      if (!_activeDrill) return;
      _activeDrill.timeLeft--;
      if (timerDisplay) {
        const m = String(Math.floor(_activeDrill.timeLeft / 60)).padStart(2, '0');
        const s = String(_activeDrill.timeLeft % 60).padStart(2, '0');
        timerDisplay.textContent = `${m}:${s}`;
      }
      if (_activeDrill.timeLeft <= 0) {
        clearInterval(_drillTimerInterval);
        submitDrillModal();
      }
    }, 1000);

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeDrillModal() {
    if (_drillTimerInterval) {
      clearInterval(_drillTimerInterval);
      _drillTimerInterval = null;
    }
    _activeDrill = null;
    const modal = document.getElementById('vlkRemediationDrillModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function submitDrillModal() {
    if (!_activeDrill) return;
    if (_drillTimerInterval) {
      clearInterval(_drillTimerInterval);
      _drillTimerInterval = null;
    }

    const { code, lookupCode, drill } = _activeDrill;
    const form = document.getElementById('vlkDrillForm');
    const answers = {};

    (drill.questions || []).forEach(q => {
      if (q.type === 'single_choice') {
        const selected = form ? form.querySelector(`input[name="q_${q.id}"]:checked`) : null;
        answers[q.id] = selected ? selected.value : '';
      } else if (q.type === 'multi_select') {
        const checks = form ? form.querySelectorAll(`input[name="q_${q.id}"]:checked`) : [];
        answers[q.id] = Array.from(checks).map(c => c.value);
      } else if (q.type === 'text_input') {
        const input = form ? form.querySelector(`input[name="q_${q.id}"]`) : null;
        answers[q.id] = input ? input.value.trim() : '';
      }
    });

    const evalResult = gradeDrill(lookupCode, drill.id, answers);

    try {
      localStorage.setItem('vlk_knec_drill_mastery_' + code, evalResult.totalScore.toString());
    } catch (e) {}

    const activeStage = document.getElementById('vlkDrillActiveStage');
    const resultStage = document.getElementById('vlkDrillResultStage');
    const trophyEl = document.getElementById('vlkDrillResultTrophy');
    const statusEl = document.getElementById('vlkDrillResultStatus');
    const summaryEl = document.getElementById('vlkDrillResultSummary');
    const scoreEl = document.getElementById('vlkDrillResultScore');
    const badgeResEl = document.getElementById('vlkDrillResultBadge');
    const breakdownEl = document.getElementById('vlkDrillResultBreakdown');

    if (activeStage) activeStage.style.display = 'none';
    if (resultStage) resultStage.style.display = 'block';

    if (trophyEl) trophyEl.textContent = evalResult.isMastery ? '🏆' : '🎯';
    if (statusEl) statusEl.textContent = evalResult.status;
    if (summaryEl) summaryEl.textContent = evalResult.chiefExaminerAdvice;
    if (scoreEl) scoreEl.textContent = `${evalResult.totalScore} / ${evalResult.maxScore}`;
    if (badgeResEl) {
      badgeResEl.textContent = evalResult.isMastery ? 'Mastery Attained' : 'Needs Practice';
      badgeResEl.style.color = evalResult.isMastery ? '#10B981' : '#F59E0B';
    }

    if (breakdownEl) {
      breakdownEl.innerHTML = (evalResult.itemizedReview || []).map((item, idx) => `
        <div style="background:rgba(255,255,255,0.03); border-left:3px solid ${item.isCorrect ? '#10B981' : '#EF4444'}; border-radius:6px; padding:8px 12px;">
          <div style="font-weight:700; margin-bottom:2px;">Q${idx + 1}: ${item.prompt}</div>
          <div style="color:${item.isCorrect ? '#10B981' : '#EF4444'}; font-weight:700; font-size:0.78rem;">${item.feedback}</div>
        </div>
      `).join('');
    }

    if (window.BrilliantUI) {
      if (evalResult.isMastery) {
        window.BrilliantUI.audio.playSuccess();
        window.BrilliantUI.celebrate();
      } else {
        window.BrilliantUI.audio.playClick();
      }
    }
  }

  function openWorkbenchDrillsMenu(benchType) {
    ensureModalInDOM();
    const modal = document.getElementById('vlkWorkbenchDrillsMenuModal');
    const titleEl = document.getElementById('vlkMenuTitle');
    const subEl = document.getElementById('vlkMenuSub');
    const listEl = document.getElementById('vlkMenuCardsList');
    if (!modal || !listEl) return;

    let items = [];
    if (benchType === 'titration') {
      titleEl.textContent = '🧪 Titration Diagnostic & KNEC Rubric Drills';
      subEl.textContent = 'Paper 3 Question 1 (15 Marks) mark-deduction eliminators';
      items = [
        { code: 'D', icon: '📏', title: '2-Decimal Precision & .0/.5 Rule', penalty: '-1.0 Mark Penalty', desc: 'Strict burette 2-decimal formatting and half-millimeter eye-level interpolation.' },
        { code: 'PA', icon: '⚖️', title: 'Concordancy Selection & Averaging', penalty: '-1.0 Mark Penalty', desc: 'Identify ±0.20 cm³ concordant titres, discard outliers, state explicit working.' },
        { code: 'AC/FA', icon: '🎯', title: 'Optical Meniscus Alignment & Accuracy', penalty: '-1.0 Mark Penalty', desc: 'Match teacher baseline within ±0.1 cm³ reading at bottom of curved meniscus.' },
        { speedMode: 'titration', icon: '⏱️', title: '60s Titration Speed Sprint', penalty: 'High Yield Sprint', desc: 'Fast-paced rapid recall on indicator transitions, titrant choice, and stoichiometry.' }
      ];
    } else if (benchType === 'qualitative') {
      titleEl.textContent = '🔍 Qualitative Analysis Diagnostic Drills';
      subEl.textContent = 'Paper 3 Question 2 (15 Marks) precipitate & deduction mastery';
      items = [
        { code: 'INORG', icon: '🧂', title: 'Inorganic Cation & Anion Deductions', penalty: '-3.0 Marks Risk', desc: 'Formulate exact ionic formula deductions (Pb²⁺, Zn²⁺, Al³⁺, SO₄²⁻) with observations.' },
        { speedMode: 'qualitative', icon: '⏱️', title: '60s Qualitative Speed Sprint', penalty: 'High Yield Sprint', desc: 'Rapid precipitate color matching, excess NaOH/NH₃ solubility, and flame tests.' }
      ];
    } else if (benchType === 'organic') {
      titleEl.textContent = '⚗️ Organic Chemistry Diagnostic Drills';
      subEl.textContent = 'Paper 3 Question 3 (10 Marks) functional group deduction mastery';
      items = [
        { code: 'ORG', icon: '🧫', title: 'Organic Functional Group Deductions', penalty: '-3.0 Marks Risk', desc: 'Differentiate C=C unsaturation, R-OH alkanols, and R-COOH carboxylic acids in Paper 3 format.' },
        { speedMode: 'organic', icon: '⏱️', title: '45s Organic Speed Sprint', penalty: 'High Yield Sprint', desc: 'Unsaturation tests with Br₂/KMnO₄, oxidation, and esterification aroma recognition.' }
      ];
    } else if (benchType === 'rates' || benchType === 'energy') {
      titleEl.textContent = '⚡ Kinetics & Energetics Diagnostic Drills';
      subEl.textContent = 'Physical chemistry calculations, reaction rate graphs, and thermochemistry';
      items = [
        { speedMode: 'energy', icon: '⏱️', title: '45s Kinetics & Energetics Sprint', penalty: 'High Yield Sprint', desc: 'Enthalpy calculations (ΔH = mcΔT), polystyrene insulation, cooling curves, and rate plots.' }
      ];
    }

    listEl.innerHTML = items.map(item => {
      if (item.code) {
        return `
          <div class="vlk-drill-menu-card" onclick="window.KnecRemediation.closeWorkbenchDrillsMenu(); window.KnecRemediation.openModal('${item.code}');">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:1.3rem;">${item.icon}</span>
                <span style="background:rgba(239,68,68,0.15); color:#EF4444; border:1px solid rgba(239,68,68,0.3); font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:100px;">${item.penalty}</span>
              </div>
              <h4 style="margin:0 0 6px; font-size:0.95rem; font-weight:800;">${item.title}</h4>
              <p style="margin:0; font-size:0.8rem; color:var(--text-muted, #94A3B8); line-height:1.4;">${item.desc}</p>
            </div>
            <div style="margin-top:12px; display:flex; justify-content:flex-end;">
              <span style="font-size:0.78rem; font-weight:800; color:var(--cyan-accent, #0284C7);">Practice 5-Min Rule →</span>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="vlk-drill-menu-card" onclick="window.location.href='speed_battle.html?mode=${item.speedMode}';">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:1.3rem;">${item.icon}</span>
                <span style="background:rgba(2,132,199,0.15); color:var(--cyan-accent, #0284C7); border:1px solid rgba(2,132,199,0.3); font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:100px;">${item.penalty}</span>
              </div>
              <h4 style="margin:0 0 6px; font-size:0.95rem; font-weight:800;">${item.title}</h4>
              <p style="margin:0; font-size:0.8rem; color:var(--text-muted, #94A3B8); line-height:1.4;">${item.desc}</p>
            </div>
            <div style="margin-top:12px; display:flex; justify-content:flex-end;">
              <span style="font-size:0.78rem; font-weight:800; color:var(--cyan-accent, #0284C7);">Start Timed Sprint ⚡</span>
            </div>
          </div>
        `;
      }
    }).join('');

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeWorkbenchDrillsMenu() {
    const modal = document.getElementById('vlkWorkbenchDrillsMenuModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Expose global interface
  window.KnecRemediation = {
    DRILL_CATALOG,
    getDrill,
    gradeDrill,
    openModal: openDrillModal,
    closeModal: closeDrillModal,
    submitModal: submitDrillModal,
    openWorkbenchDrillsMenu,
    closeWorkbenchDrillsMenu
  };
})();
