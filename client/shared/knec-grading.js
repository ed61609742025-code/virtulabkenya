// ============================================================
//  VirtuLab Kenya — KNEC Practical Examination Grading Engine
//  Standardized KCSE Paper 3 (233/3) 12-Point Academic Scale & Table 1 Rubrics
// ============================================================

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    Object.assign(root, exports);
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Official KNEC KCSE 12-Point Grading Scale
   * @param {number} score - Candidate's earned score
   * @param {number} [maxScore=40.0] - Maximum score for practical examination
   * @returns {string} Letter grade ('A' through 'E')
   */
  function calculateKnecGrade(score, maxScore = 40.0) {
    const s = Number(score) || 0;
    const m = Number(maxScore) || 40.0;
    const pct = (s / m) * 100.0;

    if (pct >= 80.0) return 'A';
    if (pct >= 75.0) return 'A-';
    if (pct >= 70.0) return 'B+';
    if (pct >= 65.0) return 'B';
    if (pct >= 60.0) return 'B-';
    if (pct >= 55.0) return 'C+';
    if (pct >= 50.0) return 'C';
    if (pct >= 45.0) return 'C-';
    if (pct >= 40.0) return 'D+';
    if (pct >= 35.0) return 'D';
    if (pct >= 30.0) return 'D-';
    return 'E';
  }

  /**
   * Official KNEC KCSE Grade Point Equivalent (12 to 1)
   * @param {string} grade
   * @returns {number} Points (1–12)
   */
  function getKnecPoints(grade) {
    const map = {
      'A': 12, 'A-': 11,
      'B+': 10, 'B': 9, 'B-': 8,
      'C+': 7, 'C': 6, 'C-': 5,
      'D+': 4, 'D': 3, 'D-': 2,
      'E': 1
    };
    return map[grade] || 1;
  }

  /**
   * Official KNEC Performance Descriptor
   * @param {string} grade
   * @returns {string} Performance Descriptor
   */
  function getKnecDescriptor(grade) {
    switch (grade) {
      case 'A': return 'Distinction (Superior Competency)';
      case 'A-': return 'Excellent Practical Competency';
      case 'B+': return 'Very Good Competency';
      case 'B': return 'Good Competency';
      case 'B-': return 'Above Average';
      case 'C+': return 'Satisfactory Competency (University Entry)';
      case 'C': return 'Average Practical Skills';
      case 'C-': return 'Below Average';
      case 'D+': return 'Elementary Skills';
      case 'D': return 'Weak Practical Skills';
      case 'D-': return 'Very Weak Practical Skills';
      default: return 'Needs Remediation';
    }
  }

  /**
   * Official KNEC Table 1 Quantitative Titration Rubric
   * Evaluates Complete Table (CT), Decimals (D), Accuracy (AC), Principle of Averaging (PA), and Final Accuracy (FA).
   *
   * @param {Array<{initial: number, final: number, used: number, recorded: boolean}>} trials
   * @param {number} trueTitre - Supervisor's or theoretical titre in cm³
   * @param {number} [candidateAvg] - Candidate's declared average titre
   * @returns {{ tableScore: number, maxScore: number, rubric: Array, stats: Object }}
   */
  function evaluateKnecTable1(trials = [], trueTitre = 25.0, candidateAvg = null) {
    const valid = (trials || []).filter(t => t && t.recorded && Number(t.used) > 0);
    const rubric = [];
    let tableScore = 0.0;

    // 1. Complete Table (CT) — 1.0 Mark
    let ctPenalty = 0.0;
    let hasInverted = false;
    let hasArithErr = false;
    let hasUnrealistic = false;

    for (const t of trials) {
      if (t && t.recorded) {
        if (Number(t.initial) > Number(t.final)) hasInverted = true;
        const calcUsed = Math.max(0, Number(t.final) - Number(t.initial));
        if (Math.abs(Number(t.used) - calcUsed) > 0.02) hasArithErr = true;
        if (Number(t.final) > 50.0 || Number(t.used) > 50.0 || Number(t.used) < 1.0) hasUnrealistic = true;
      }
    }
    if (hasInverted || hasArithErr || hasUnrealistic) ctPenalty = 0.5;

    let ctMark = 0.0;
    if (valid.length >= 3) {
      ctMark = Math.max(0.0, 1.0 - ctPenalty);
    } else if (valid.length === 2) {
      ctMark = Math.max(0.0, 0.5 - ctPenalty);
    }
    tableScore += ctMark;
    rubric.push({
      code: 'CT',
      criterion: 'Complete Table (CT)',
      max: 1.0,
      mark: ctMark,
      pass: ctMark >= 1.0,
      detail: ctMark >= 1.0 ? 'Full mark: Complete trials recorded within realistic boundaries.' : 'Penalized: Incomplete or arithmetic discrepancy in titre values.'
    });

    // 2. Use of Decimals (D) — 1.0 Mark (All readings must terminate in .0 or .5)
    let decViolations = 0;
    for (const t of valid) {
      const s = Number(t.final).toFixed(2);
      const last = s.slice(-1);
      if (last !== '0' && last !== '5') decViolations++;
    }
    const dMark = (valid.length >= 2 && decViolations === 0) ? 1.0 : 0.0;
    tableScore += dMark;
    rubric.push({
      code: 'D',
      criterion: 'Use of Decimals (D)',
      max: 1.0,
      mark: dMark,
      pass: dMark === 1.0,
      detail: dMark === 1.0 ? 'Full mark: Strict 2 d.p. convention ending in .00 or .05 respected.' : `0.0 Mark: ${decViolations} reading(s) violated KNEC precision rules.`
    });

    // 3. Accuracy vs Supervisor (AC) — 1.0 Mark
    let minDev = 999.0;
    for (const t of valid) {
      const dev = Math.abs(Number(t.used) - trueTitre);
      if (dev < minDev) minDev = dev;
    }
    let acMark = 0.0;
    if (valid.length >= 2 && minDev <= 0.10) acMark = 1.0;
    else if (valid.length >= 2 && minDev <= 0.20) acMark = 0.5;
    tableScore += acMark;
    rubric.push({
      code: 'AC',
      criterion: 'Accuracy vs School Value (AC)',
      max: 1.0,
      mark: acMark,
      pass: acMark >= 1.0,
      detail: acMark >= 1.0 ? `Full mark: Titre within ±0.10 cm³ of supervisor value (${trueTitre.toFixed(2)} cm³).` : (acMark > 0 ? `Partial mark: Within ±0.20 cm³ (${minDev.toFixed(2)} cm³ deviation).` : `0.0 Mark: Deviation > ±0.20 cm³ (${minDev < 900 ? minDev.toFixed(2) : 'N/A'} cm³).`)
    });

    // 4. Principles of Averaging (PA) — 1.0 Mark
    let paMark = 0.0;
    if (valid.length >= 2) {
      const vols = valid.map(t => Number(t.used));
      const spread = Math.max(...vols) - Math.min(...vols);
      const meanVol = vols.reduce((a, b) => a + b, 0) / vols.length;
      const candVal = candidateAvg !== null ? Number(candidateAvg) : meanVol;
      const arithAccurate = Math.abs(candVal - meanVol) <= 0.02;

      if (spread <= 0.20 && arithAccurate) paMark = 1.0;
      else if (spread <= 0.20) paMark = 0.5;
    }
    tableScore += paMark;
    rubric.push({
      code: 'PA',
      criterion: 'Principles of Averaging (PA)',
      max: 1.0,
      mark: paMark,
      pass: paMark >= 1.0,
      detail: paMark >= 1.0 ? 'Full mark: Concordant titres averaged within ±0.20 cm³.' : '0.0 Mark: Titres spread exceeds ±0.20 cm³ or arithmetic error.'
    });

    // 5. Final Accuracy (FA) — 1.0 Mark
    const vols = valid.map(t => Number(t.used));
    const finalMean = vols.length > 0 ? vols.reduce((a, b) => a + b, 0) / vols.length : 0;
    const finalDev = Math.abs(finalMean - trueTitre);
    let faMark = 0.0;
    if (valid.length >= 2 && finalDev <= 0.10) faMark = 1.0;
    else if (valid.length >= 2 && finalDev <= 0.20) faMark = 0.5;
    tableScore += faMark;
    rubric.push({
      code: 'FA',
      criterion: 'Final Accuracy of Mean (FA)',
      max: 1.0,
      mark: faMark,
      pass: faMark >= 1.0,
      detail: faMark >= 1.0 ? `Full mark: Mean titre within ±0.10 cm³ of supervisor.` : (faMark > 0 ? `Partial mark: Mean titre within ±0.20 cm³.` : `0.0 Mark: Mean titre deviated > ±0.20 cm³.`)
    });

    return {
      tableScore: parseFloat(tableScore.toFixed(1)),
      maxScore: 5.0,
      rubric,
      stats: {
        trialsCount: valid.length,
        minDeviation: minDev < 900 ? minDev : null,
        meanTitre: vols.length > 0 ? finalMean : null
      }
    };
  }

  /**
   * Backward-compatible titration concentration scoring
   */
  function calculateKnecTitrationScore(studentAnswer, trueConc) {
    const diff = Math.abs(Number(studentAnswer) - Number(trueConc));
    let score = 0;
    if (diff <= 0.005) score = 15.0;
    else if (diff <= 0.01) score = 14.0;
    else if (diff <= 0.02) score = 12.0;
    else if (diff <= 0.05) score = 9.0;
    else if (diff <= 0.1) score = 6.0;
    else score = 3.0;
    return { score, diff };
  }

  return {
    calculateKnecGrade,
    getKnecPoints,
    getKnecDescriptor,
    evaluateKnecTable1,
    calculateKnecTitrationScore
  };
}));
