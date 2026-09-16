/**
 * VirtuLab Kenya — KNEC Pedagogy & Grading Polish Core
 * 
 * Provides:
 * 1. Live Chemical Formula Formatter & Token Normalizer (Cations, Anions, Organic Functional Groups)
 * 2. Real-Time Taboo Phrase & Chemical Misconception Guardrails (Practice Mode Nudges)
 * 3. Chief Examiner Diagnostic Rationale Generator on Wrong / Partial Answers
 * 
 * Isomorphic: Operates in both browser window context and Node.js test environments.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.KnecPedagogy = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ── 1. Chemical Formula Formatter & Token Normalizer ─────────────────────

  /**
   * Transforms raw user-typed chemical strings into KNEC-standard unicode typography.
   * Handles inputs like:
   *   "Pb2+, Al3+, Zn2+ or SO42- present" -> "Pb²⁺, Al³⁺, Zn²⁺ or SO₄²⁻ present"
   *   ">c=c< or c#c with r-oh and r-cooh" -> ">C=C< or —C≡C— with R—OH and R—COOH"
   */
  function formatChemicalFormula(text) {
    if (!text || typeof text !== 'string') return '';
    let res = text;

    // Format Cations: Pb2+, Al3+, Zn2+, Fe2+, Fe3+, Cu2+, Ca2+, Ba2+, Mg2+, NH4+, Na+, K+
    res = res.replace(/(^|[^a-zA-Z0-9])(Pb|Al|Zn|Fe|Cu|Ca|Ba|Mg|NH4|Na|K)(?:\^?([23]?\+)|(?:\^?\+([23]?)))(?=[^a-zA-Z0-9]|$)/gi, (m, prefix, elem, c1, c2) => {
      const sym = elem.charAt(0).toUpperCase() + elem.slice(1).toLowerCase();
      const charge = (c1 || c2 || '+').trim();
      if (sym.toLowerCase() === 'nh4') return prefix + 'NH₄⁺';
      if (charge === '2+' || charge === '+2') return prefix + sym + '²⁺';
      if (charge === '3+' || charge === '+3') return prefix + sym + '³⁺';
      return prefix + sym + '⁺';
    });

    // Format Anions: SO42-, SO32-, CO32-, NO3-, Cl-, OH-, I-
    res = res.replace(/(^|[^a-zA-Z0-9])(SO4|SO3|CO3|NO3|Cl|OH|I)(?:\^?([2]?\-)|(?:\^?\-([2]?)))(?=[^a-zA-Z0-9]|$)/gi, (m, prefix, poly, c1, c2) => {
      const pLower = poly.toLowerCase();
      if (pLower === 'so4') return prefix + 'SO₄²⁻';
      if (pLower === 'so3') return prefix + 'SO₃²⁻';
      if (pLower === 'co3') return prefix + 'CO₃²⁻';
      if (pLower === 'no3') return prefix + 'NO₃⁻';
      if (pLower === 'cl') return prefix + 'Cl⁻';
      if (pLower === 'oh') return prefix + 'OH⁻';
      if (pLower === 'i') return prefix + 'I⁻';
      return m;
    });

    // Format Organic Bonds & Functional Groups
    res = res.replace(/(^|[^a-zA-Z0-9])(?:>c=c<|>C=C<)(?=[^a-zA-Z0-9]|$)/g, '$1>C=C<');
    res = res.replace(/(^|[^a-zA-Z0-9])(?:—c=c—|—C=C—|-c=c-|-C=C-)(?=[^a-zA-Z0-9]|$)/gi, '$1—C=C—');
    res = res.replace(/(^|[^a-zA-Z0-9])(?:—c≡c—|—C≡C—|-c#c-|c#c)(?=[^a-zA-Z0-9]|$)/gi, '$1—C≡C—');
    res = res.replace(/(^|[^a-zA-Z0-9])(?:R-OH|R—OH|ROH)(?=[^a-zA-Z0-9]|$)/gi, '$1R—OH');
    res = res.replace(/(^|[^a-zA-Z0-9])(?:R-COOH|R—COOH|RCOOH)(?=[^a-zA-Z0-9]|$)/gi, '$1R—COOH');
    res = res.replace(/(^|[^a-zA-Z0-9])(?:-COOH|—COOH)(?=[^a-zA-Z0-9]|$)/gi, '$1—COOH');
    res = res.replace(/(^|[^a-zA-Z0-9])(?:-OH|—OH)(?=[^a-zA-Z0-9]|$)/gi, '$1—OH');
    res = res.replace(/(^|[^a-zA-Z0-9])(?:-COO-|—COO—)(?=[^a-zA-Z0-9]|$)/gi, '$1—COO—');

    return res.trim();
  }

  /**
   * Extracts recognized chemical species and returns a structured preview object.
   */
  function getFormulaPreview(text, type = 'inorganic') {
    if (!text || typeof text !== 'string') {
      return { recognizedSpecies: [], formattedText: '', isValid: false, message: '' };
    }

    const trimmed = text.trim();
    const formatted = formatChemicalFormula(trimmed);
    const species = [];

    // Check for cations & anions
    const ionRegex = /(Pb²⁺|Al³⁺|Zn²⁺|Fe²⁺|Fe³⁺|Cu²⁺|Ca²⁺|Ba²⁺|Mg²⁺|NH₄⁺|Na⁺|K⁺|SO₄²⁻|SO₃²⁻|CO₃²⁻|Cl⁻|NO₃⁻|I⁻|OH⁻)/g;
    let ionMatch;
    while ((ionMatch = ionRegex.exec(formatted)) !== null) {
      if (!species.includes(ionMatch[1])) species.push(ionMatch[1]);
    }

    // Check for organic groups
    const orgRegex = /(>C=C<|—C=C—|—C≡C—|R—OH|R—COOH|—COOH|—OH|—COO—)/g;
    let orgMatch;
    while ((orgMatch = orgRegex.exec(formatted)) !== null) {
      if (!species.includes(orgMatch[1])) species.push(orgMatch[1]);
    }

    const hasSpecies = species.length > 0;
    return {
      recognizedSpecies: species,
      formattedText: formatted,
      isValid: hasSpecies,
      message: hasSpecies ? `✓ Recognized KNEC Notation: ${species.join(', ')}` : ''
    };
  }

  // ── 2. Real-Time Taboo Phrase & Misconception Guardrails ────────────────

  const TABOO_RULES = [
    {
      id: 'white_solution',
      severity: 'penalty',
      markDeduction: 0.5,
      ruleCode: 'TP',
      pattern: /white\s+solution/i,
      alert: '⚠️ KNEC Penalty: "White solution" is scientifically contradictory and penalised by 0.5 Mk. Solutions are transparent & colourless; only precipitates are white. Use "colourless solution".',
      expectedSuggestion: 'colourless solution formed'
    },
    {
      id: 'clear_ambiguity',
      severity: 'warning',
      markDeduction: 0.0,
      ruleCode: 'AMB',
      pattern: /\bclear\s+solution\b/i,
      test: (text) => {
        const lower = text.toLowerCase();
        return lower.includes('clear solution') && !lower.includes('colourless') && !lower.includes('colorless') && !lower.includes('blue') && !lower.includes('green');
      },
      alert: '💡 KNEC Precision Tip: "Clear" denotes absence of turbidity, not colour. Always specify "colourless solution" (or the exact tint) to secure full observation marks.',
      expectedSuggestion: 'colourless solution'
    },
    {
      id: 'carbonate_hydrogen',
      severity: 'penalty',
      markDeduction: 1.0,
      ruleCode: 'CHEM_ERR',
      pattern: /(effervescence|fizzing|bubbles|gas).*(hydrogen|h2\b)|(hydrogen|h2\b).*(effervescence|fizzing|bubbles|gas)/i,
      contextRequired: 'carbonate',
      alert: '⚠️ Chemistry Error: Carbonates evolve carbon(IV) oxide (CO₂) gas which turns lime water milky. They do NOT evolve hydrogen gas.',
      expectedSuggestion: 'Brisk effervescence of a colourless gas that turns limewater milky (CO₂)'
    },
    {
      id: 'alkanol_acidic',
      severity: 'penalty',
      markDeduction: 1.0,
      ruleCode: 'CHEM_ERR',
      pattern: /\b(acidic|acid|turns?\s+blue\s+litmus\s+red|red\s+litmus)\b/i,
      contextRequired: 'organic_neutral',
      alert: '⚠️ Misconception: Alkanols (alcohols) are neutral organic liquids. They have no effect on litmus paper. Carboxylic acid absent.',
      expectedSuggestion: 'No effect on litmus paper / neutral organic compound'
    },
    {
      id: 'unsaturated_blue_flame',
      severity: 'warning',
      markDeduction: 0.5,
      ruleCode: 'CHEM_ERR',
      pattern: /(pale\s+blue|non-luminous|blue\s+flame)/i,
      contextRequired: 'organic_unsaturated',
      alert: '⚠️ Combustion Error: Unsaturated compounds (>C=C< or —C≡C—) have high carbon-to-hydrogen ratios and burn with a luminous, smoky/sooty yellow flame.',
      expectedSuggestion: 'Burns with a luminous, yellow smoky flame'
    },
    {
      id: 'missing_ionic_charge',
      severity: 'penalty',
      markDeduction: 0.5,
      ruleCode: 'CP',
      test: (text, context) => {
        if (context !== 'inference' && context !== 'inorganic_inference') return false;
        const lower = text.toLowerCase();
        const bareIonMatch = /(^|[^a-zA-Z0-9])(pb|al|zn|fe|cu|ba|ca|mg|so4|so3|co3)(?=[^a-zA-Z0-9]|$)/i.test(lower);
        const hasCharges = /[²³⁺⁻\+\-\^]|\bion\b/i.test(text);
        return bareIonMatch && !hasCharges;
      },
      alert: '⚠️ Criterion [CP] Charge Penalty: Inferences must specify formal ionic charges (e.g. Pb²⁺, Al³⁺, Zn²⁺, SO₄²⁻). Uncharged elemental symbols lose 0.5 Mk.',
      expectedSuggestion: 'Specify formal superscript charges, e.g. Pb²⁺, Al³⁺, Zn²⁺'
    }
  ];

  function detectTabooPhrases(text, context = 'general', isExamMode = false) {
    if (isExamMode) return [];
    if (!text || typeof text !== 'string') return [];

    const hits = [];
    const trimmed = text.trim();

    for (const rule of TABOO_RULES) {
      if (rule.contextRequired && rule.contextRequired !== context && context !== 'all') {
        continue;
      }

      let matched = false;
      if (typeof rule.test === 'function') {
        matched = rule.test(trimmed, context);
      } else if (rule.pattern && rule.pattern.test(trimmed)) {
        matched = true;
      }

      if (matched) {
        hits.push({
          id: rule.id,
          severity: rule.severity,
          markDeduction: rule.markDeduction,
          ruleCode: rule.ruleCode,
          alert: rule.alert,
          expectedSuggestion: rule.expectedSuggestion
        });
      }
    }

    return hits;
  }

  // ── 3. Chief Examiner Diagnostic Rationale Generator ────────────────────

  function getExaminerRationale(item) {
    const {
      testLabel = 'Practical Test',
      stepLetter = 'a',
      score = 0.0,
      maxScore = 1.0,
      candidateText = '',
      expectedText = '',
      testKey = '',
      penalties = {},
      ruleCode = '',
      type = 'inorganic'
    } = item;

    const isFullMark = score >= (maxScore * 0.95);
    if (isFullMark) {
      return {
        isFullMark: true,
        summary: `Full marks awarded (${score.toFixed(1)} / ${maxScore.toFixed(1)} Mks).`,
        knecClause: 'Criterion Satisfied',
        rationale: 'Observation and inference precisely matched official KNEC marking scheme standards.',
        modelAnswer: expectedText || candidateText
      };
    }

    const candLower = (candidateText || '').toLowerCase().trim();
    const expLower = (expectedText || '').toLowerCase().trim();

    let knecClause = ruleCode ? `[${ruleCode}]` : '[GEN]';
    let rationale = '';
    let pedagogicalTip = '';

    if (penalties.tabooPenalty || /white\s+solution/i.test(candLower)) {
      knecClause = '[TP] Taboo Scientific Phrase Penalty';
      rationale = 'The candidate recorded "white solution". In chemistry, clear homogeneous liquids formed on salt dissolution are transparent and colourless. "White solution" is a scientific contradiction penalized by 0.5 Mk under KNEC Chief Examiner instructions.';
      pedagogicalTip = 'Always write "colourless solution formed" when a salt completely dissolves in water or excess reagent.';
    } else if (penalties.chargePenalty || (candLower && /(^|[^a-zA-Z0-9])(pb|al|zn|fe|cu|ba|ca|mg|so4|so3|co3)(?=[^a-zA-Z0-9]|$)/i.test(candLower) && !/[²³⁺⁻\+\-]/.test(candidateText))) {
      knecClause = '[CP] Ionic Charge Superscript Penalty';
      rationale = 'The candidate wrote elemental or radical letters without formal ionic superscripts (e.g. "Pb" or "SO4" instead of "Pb²⁺" or "SO₄²⁻"). Under KNEC marking schemes, writing an ion without its formal charge incurs a 0.5 Mk deduction.';
      pedagogicalTip = 'Always append superscript valency charges (+, 2+, 3+, 2-) to identify ions. Use the on-screen Scientific Notation Keypad for instant insertion.';
    } else if (penalties.ciPenalty || penalties.contradictoryIon) {
      knecClause = '[CI] Contradictory Ion Deduction';
      rationale = 'The candidate listed contradictory ions (e.g., coloured transition metal ions Cu²⁺, Fe²⁺, Fe³⁺ alongside a white precipitate, or soluble zinc in insoluble residue). In KNEC marking, contradictory deductions cancel marks.';
      pedagogicalTip = 'White precipitates eliminate coloured transition ions (Cu²⁺, Fe²⁺, Fe³⁺). Insoluble white ppt in excess NH₃ eliminates Zn²⁺.';
    } else if (type === 'volumetric') {
      if (ruleCode === 'PA' || penalties.nonConcordant) {
        knecClause = '[PA] Concordant Titre Principle';
        rationale = 'The averaged titres differ by more than ±0.20 cm³, or the student included the rough trial in the average. KNEC rules strictly permit only concordant values within ±0.20 cm³ (ideally within ±0.10 cm³).';
        pedagogicalTip = 'Ensure subsequent titration trials agree within 0.10 cm³ and never average the initial rough trial.';
      } else if (ruleCode === 'D' || penalties.decimalPlaces) {
        knecClause = '[D] Burette Decimal Precision';
        rationale = 'Burette readings were not recorded consistently to 2 decimal places with the last digit being .00 or .05 cm³.';
        pedagogicalTip = 'All burette graduation lines represent 0.10 cm³ intervals; readings must be estimated to 0.05 or 0.00 cm³.';
      } else if (ruleCode === 'AC' || penalties.accuracy) {
        knecClause = '[AC] Titration Accuracy';
        rationale = 'The candidate titre deviated from the school / teacher standard value by more than ±0.20 cm³, indicating premature endpoint or over-titration.';
        pedagogicalTip = 'Use dropwise and half-drop delivery as the endpoint approaches to capture the exact permanent colour change.';
      }
    } else if (type === 'organic') {
      if (testKey.includes('litmus') || testKey.includes('acid')) {
        if (/acid/i.test(candLower) && /neutral/i.test(expLower)) {
          knecClause = '[CHEM_ERR] Alkanol Litmus Misconception';
          rationale = 'The candidate inferred "acidic / carboxylic acid" on a substance that has no effect on litmus. Alkanols are neutral and do not change blue litmus to red.';
          pedagogicalTip = 'Only carboxylic acids (—COOH) turn moist blue litmus red. Alkanols (R—OH) are neutral to litmus.';
        }
      } else if (testKey.includes('ignit') || testKey.includes('burn')) {
        if (/blue/i.test(candLower) && /smoky|yellow|soot/i.test(expLower)) {
          knecClause = '[CHEM_ERR] Combustion Characteristics';
          rationale = 'The candidate inferred clean combustion with a blue flame. Unsaturated carbon compounds burn with a smoky, yellow luminous flame due to unburnt carbon soot.';
          pedagogicalTip = 'High carbon content (>C=C<, —C≡C—) yields yellow smoky flames; saturated low-carbon alkanes/alkanols burn with non-luminous pale blue flames.';
        }
      } else if (candLower.length === 0) {
        knecClause = '[BLANK] Unattempted Item';
        rationale = 'The observation or inference area was left blank.';
        pedagogicalTip = 'Perform the test on the bench and record observations promptly before reagents settle.';
      }
    }

    if (!rationale) {
      if (!candidateText || candidateText.trim() === '') {
        knecClause = '[BLANK] No Response Recorded';
        rationale = 'Candidate did not record any observation or deduction for this test.';
        pedagogicalTip = 'Follow test tube reagents carefully and record both initial colour and precipitate solubility in excess.';
      } else {
        knecClause = '[SCHEME] Marking Scheme Deviation';
        rationale = `Candidate response "${candidateText}" did not satisfy official KNEC scoring keywords. Expected observation/inference: "${expectedText}".`;
        pedagogicalTip = 'Use precise scientific terminology. State the colour, state of matter (precipitate vs solution), and solubility in excess.';
      }
    }

    return {
      isFullMark: false,
      knecClause,
      rationale,
      pedagogicalTip,
      modelAnswer: expectedText || 'See official KNEC Paper 3 Marking Scheme'
    };
  }

  return {
    formatChemicalFormula,
    getFormulaPreview,
    detectTabooPhrases,
    getExaminerRationale,
    TABOO_RULES
  };
}));
