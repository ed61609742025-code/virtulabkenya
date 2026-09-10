// ============================================================
//  VirtuLab Kenya — Educational Research & Statistical Utilities
//  Master's in Learning Design & Technology Research Suite
//
//  References:
//    Hake, R. R. (1998). Am. J. Physics 66(1), 64–74.
//    Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences (2nd ed.).
//    Sauro, J. & Lewis, J. R. (2016). Quantifying the User Experience (2nd ed.).
//    Brooke, J. (1996). SUS: A 'Quick and Dirty' Usability Scale.
//    Davis, F. D. (1989). MIS Quarterly 13(3), 319–340.
//    Venkatesh, V. & Bala, H. (2008). Information Systems Research 19(3), 273–302.
//    Abramowitz, M. & Stegun, I. A. (1964). Handbook of Mathematical Functions.
// ============================================================

'use strict';

// ─────────────────────────────────────────────────────────────
//  Internal Helpers  (not exported)
// ─────────────────────────────────────────────────────────────

/**
 * Returns raw (unrounded) descriptive statistics.
 * Used internally so downstream calculations (Cohen's d, t-test)
 * do not suffer from compounding rounding error.
 *
 * @private
 * @param {number[]} values
 * @returns {{ n: number, mean: number, variance: number, stdDev: number, sorted: number[] }}
 */
function _rawDescriptives(values = []) {
  const clean = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
  const n = clean.length;
  if (n === 0) return { n: 0, mean: 0, variance: 0, stdDev: 0, sorted: [] };

  const mean = clean.reduce((a, b) => a + b, 0) / n;
  // Sample variance (Bessel-corrected, n-1)
  const variance = n > 1
    ? clean.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1)
    : 0;
  const stdDev = Math.sqrt(variance);
  const sorted = [...clean].sort((a, b) => a - b);

  return { n, mean, variance, stdDev, sorted };
}

// ─────────────────────────────────────────────────────────────
//  t-Distribution P-Value  (Abramowitz & Stegun 26.5.8)
//  Implemented as the regularized incomplete beta function so
//  the returned p-value is exact for any degrees of freedom —
//  not a discrete lookup table.
// ─────────────────────────────────────────────────────────────

/**
 * Lanczos approximation to the natural log of the Gamma function.
 * Accurate to ~15 significant digits for Re(z) > 0.
 * @private
 */
function _logGamma(z) {
  const c = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    1.208650973866179e-3,
    -5.395239384953e-6
  ];
  let x = z;
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let i = 0; i < 6; i++) ser += c[i] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/**
 * Continued-fraction expansion of the regularized incomplete beta function.
 * Uses Lentz's modified method (Numerical Recipes 6.4).
 * @private
 */
function _betaContinuedFraction(x, a, b) {
  const MAXIT = 200;
  const EPS   = 3e-7;
  const FPMIN = 1e-30;

  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;

  let c = 1.0;
  let d = 1.0 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;

    // Even step of the recurrence
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    h *= d * c;

    // Odd step of the recurrence
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1.0) < EPS) break;
  }
  return h;
}

/**
 * Regularized incomplete beta function I_x(a, b).
 * @private
 */
function _incompleteBeta(x, a, b) {
  if (x < 0 || x > 1) return NaN;
  if (x === 0) return 0;
  if (x === 1) return 1;

  const lbeta = _logGamma(a) + _logGamma(b) - _logGamma(a + b);

  // Choose the CF expansion that converges faster
  if (x < (a + 1) / (a + b + 2)) {
    const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta) / a;
    return front * _betaContinuedFraction(x, a, b);
  } else {
    const front = Math.exp(b * Math.log(1 - x) + a * Math.log(x) - lbeta) / b;
    return 1.0 - front * _betaContinuedFraction(1 - x, b, a);
  }
}

/**
 * Two-tailed p-value for a t-statistic with `df` degrees of freedom.
 * Uses the exact t-distribution CDF via the regularized incomplete beta function.
 * @private
 * @param {number} t  - t-statistic (absolute value used internally)
 * @param {number} df - degrees of freedom
 * @returns {number} Two-tailed p-value in [0, 1], rounded to 4 decimal places.
 */
function _tDistPValue(t, df) {
  if (df <= 0 || !isFinite(t)) return 1.0;
  const x = df / (df + t * t);
  const p = _incompleteBeta(x, df / 2, 0.5);
  return parseFloat(Math.min(1, Math.max(0, p)).toFixed(4));
}

// ─────────────────────────────────────────────────────────────
//  SUS Percentile Lookup  (Sauro & Lewis 2016)
//  25 breakpoints covering the full 0–100 SUS range.
// ─────────────────────────────────────────────────────────────

/**
 * Sauro & Lewis (2016) SUS percentile norms.
 * Each entry is [susScore, percentile]. Sorted ascending by score.
 * @private
 */
const SUS_PERCENTILE_TABLE = [
  [0,  0], [10, 1], [20, 1], [25, 1], [30, 2],
  [35, 3], [40, 5], [44, 8], [48, 12], [51, 15],
  [55, 25], [58, 30], [62, 38], [65, 45], [68, 50],
  [72, 65], [75, 70], [78, 75], [80.3, 82], [82, 86],
  [85, 90], [88, 93], [90, 96], [95, 99], [100, 100]
];

/**
 * Linearly interpolates a percentile from the SUS lookup table.
 * @private
 * @param {number} score - SUS score 0–100
 * @returns {number} Estimated percentile rank 0–100
 */
function _susPercentile(score) {
  const table = SUS_PERCENTILE_TABLE;
  if (score <= table[0][0]) return table[0][1];
  if (score >= table[table.length - 1][0]) return table[table.length - 1][1];

  for (let i = 0; i < table.length - 1; i++) {
    const [s0, p0] = table[i];
    const [s1, p1] = table[i + 1];
    if (score >= s0 && score <= s1) {
      const t = (score - s0) / (s1 - s0);
      return Math.round(p0 + t * (p1 - p0));
    }
  }
  return 0;
}

// ─────────────────────────────────────────────────────────────
//  Exported Statistical Functions
// ─────────────────────────────────────────────────────────────

/**
 * Calculates Hake's Average Normalized Learning Gain (g) for an individual
 * pre/post pair.
 * Reference: Hake, R. R. (1998). American Journal of Physics 66(1), 64–74.
 * Formula: g = (Post% − Pre%) / (100% − Pre%)
 *
 * @param {number} preScore  - Baseline pre-test raw score
 * @param {number} postScore - Post-intervention raw score
 * @param {number} [maxScore=40.0] - Maximum possible score
 * @returns {{ g: number, prePct: number, postPct: number, gainPct: number, category: string }}
 */
function computeHakesGain(preScore, postScore, maxScore = 40.0) {
  const pre  = Math.max(0, parseFloat(preScore)  || 0);
  const post = Math.max(0, parseFloat(postScore) || 0);
  const max  = Math.max(1, parseFloat(maxScore)  || 40.0);

  const prePct  = (pre  / max) * 100;
  const postPct = (post / max) * 100;
  const gainPct = parseFloat((postPct - prePct).toFixed(2));

  // Ceiling effect: student was already at 100%
  if (prePct >= 100) {
    return {
      g: 1.0,
      prePct: parseFloat(prePct.toFixed(2)),
      postPct: parseFloat(postPct.toFixed(2)),
      gainPct,
      category: 'High Gain (Ceiling)'
    };
  }

  // Negative gain (score regressed) — report as-is, not clamped
  const rawG = (postPct - prePct) / (100 - prePct);
  const g = parseFloat(rawG.toFixed(4));

  let category;
  if (g >= 0.70)      category = 'High Gain (g ≥ 0.70)';
  else if (g >= 0.30) category = 'Medium Gain (0.30 ≤ g < 0.70)';
  else if (g >= 0)    category = 'Low Gain (g < 0.30)';
  else                category = 'Negative Gain (score regressed)';

  return {
    g,
    prePct:  parseFloat(prePct.toFixed(2)),
    postPct: parseFloat(postPct.toFixed(2)),
    gainPct,
    category
  };
}

/**
 * Calculates the Group-level Hake's Normalized Gain using class means
 * (as opposed to averaging individual gains, which yields a different result).
 * This is the form most commonly reported in physics-education peer review.
 * Formula: g_group = (meanPost% − meanPre%) / (100% − meanPre%)
 *
 * @param {number[]} preScores  - Array of individual pre-test raw scores
 * @param {number[]} postScores - Array of individual post-test raw scores
 * @param {number} [maxScore=40.0] - Maximum possible score
 * @returns {{ g_group: number, meanPrePct: number, meanPostPct: number,
 *             meanGainPct: number, category: string,
 *             meanIndividualGain: number, n: number }}
 */
function computeGroupHakesGain(preScores = [], postScores = [], maxScore = 40.0) {
  const max = Math.max(1, parseFloat(maxScore) || 40.0);
  const n   = Math.min(preScores.length, postScores.length);

  if (n === 0) {
    return { g_group: 0, meanPrePct: 0, meanPostPct: 0, meanGainPct: 0,
             category: 'Insufficient Data', meanIndividualGain: 0, n: 0 };
  }

  const paired = Array.from({ length: n }, (_, i) => ({
    pre:  Math.max(0, parseFloat(preScores[i])  || 0),
    post: Math.max(0, parseFloat(postScores[i]) || 0)
  }));

  const meanPre  = paired.reduce((s, p) => s + p.pre,  0) / n;
  const meanPost = paired.reduce((s, p) => s + p.post, 0) / n;

  const meanPrePct  = (meanPre  / max) * 100;
  const meanPostPct = (meanPost / max) * 100;
  const meanGainPct = parseFloat((meanPostPct - meanPrePct).toFixed(2));

  let g_group;
  if (meanPrePct >= 100) {
    g_group = 1.0;
  } else {
    g_group = parseFloat(((meanPostPct - meanPrePct) / (100 - meanPrePct)).toFixed(4));
  }

  // Also compute the mean of individual gains for triangulation
  const individualGains = paired.map(p => {
    const prePct  = (p.pre  / max) * 100;
    const postPct = (p.post / max) * 100;
    return prePct >= 100 ? 1.0 : (postPct - prePct) / (100 - prePct);
  });
  const meanIndividualGain = parseFloat(
    (individualGains.reduce((s, g) => s + g, 0) / n).toFixed(4)
  );

  let category;
  if (g_group >= 0.70)      category = 'High Gain (g ≥ 0.70)';
  else if (g_group >= 0.30) category = 'Medium Gain (0.30 ≤ g < 0.70)';
  else if (g_group >= 0)    category = 'Low Gain (g < 0.30)';
  else                      category = 'Negative Gain (score regressed)';

  return {
    g_group,
    meanPrePct:  parseFloat(meanPrePct.toFixed(2)),
    meanPostPct: parseFloat(meanPostPct.toFixed(2)),
    meanGainPct,
    category,
    meanIndividualGain,
    n
  };
}

/**
 * Computes descriptive statistics for a numeric array.
 * Uses Bessel's correction (n−1) for sample standard deviation.
 *
 * @param {number[]} values - Array of numeric values
 * @returns {{ count: number, mean: number, stdDev: number,
 *             min: number, max: number, median: number }}
 */
function computeDescriptives(values = []) {
  const raw = _rawDescriptives(values);
  if (raw.n === 0) {
    return { count: 0, mean: 0, stdDev: 0, min: 0, max: 0, median: 0 };
  }

  const { n, mean, stdDev, sorted } = raw;
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  return {
    count:  n,
    mean:   parseFloat(mean.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2)),
    min:    sorted[0],
    max:    sorted[n - 1],
    median: parseFloat(median.toFixed(2))
  };
}

/**
 * Computes Cohen's d effect size between two score arrays.
 *
 * Two modes are supported:
 *
 * **Independent-samples (default, `paired = false`):**
 *   `d = (M₂ − M₁) / s_pooled`
 *   Appropriate when pre and post groups are different cohorts.
 *
 * **Repeated-measures / paired (`paired = true`):**
 *   `d_z = mean(differences) / sd(differences)`
 *   Appropriate for within-subjects pre/post designs (this study).
 *   Recommended by Cohen (1988) §2.2 and Lakens (2013).
 *
 * Uses unrounded intermediate values to avoid compounding rounding error.
 *
 * @param {number[]} preScores  - Pre-test scores (or Group 1 scores)
 * @param {number[]} postScores - Post-test scores (or Group 2 scores)
 * @param {boolean}  [paired=false] - Use repeated-measures d_z formula
 * @returns {{ d: number, sPooled?: number, sdDiff?: number,
 *             design: string, interpretation: string }}
 */
function computeCohensD(preScores = [], postScores = [], paired = false) {
  if (paired) {
    // ── Repeated-measures d_z ──────────────────────────────────
    const n = Math.min(preScores.length, postScores.length);
    if (n < 2) return { d: 0, design: 'repeated-measures', interpretation: 'Insufficient Sample' };

    const diffs = Array.from({ length: n }, (_, i) =>
      (parseFloat(postScores[i]) || 0) - (parseFloat(preScores[i]) || 0)
    );
    const rawDiffs = _rawDescriptives(diffs);
    if (rawDiffs.stdDev === 0) return { d: 0, design: 'repeated-measures', interpretation: 'Zero Variance' };

    const dz = rawDiffs.mean / rawDiffs.stdDev;
    const d  = parseFloat(dz.toFixed(3));

    return {
      d,
      sdDiff: parseFloat(rawDiffs.stdDev.toFixed(4)),
      design: 'repeated-measures (d_z)',
      interpretation: _cohensDInterpretation(d)
    };
  }

  // ── Independent-samples pooled d ──────────────────────────
  const preRaw  = _rawDescriptives(preScores);
  const postRaw = _rawDescriptives(postScores);

  if (preRaw.n < 2 || postRaw.n < 2) {
    return { d: 0, design: 'independent-samples', interpretation: 'Insufficient Sample' };
  }

  const n1 = preRaw.n;
  const n2 = postRaw.n;
  const pooledVariance = ((n1 - 1) * preRaw.variance + (n2 - 1) * postRaw.variance) / (n1 + n2 - 2);
  const sPooled = Math.sqrt(pooledVariance);

  if (sPooled === 0) return { d: 0, design: 'independent-samples', interpretation: 'Zero Variance' };

  const d = parseFloat(((postRaw.mean - preRaw.mean) / sPooled).toFixed(3));

  return {
    d,
    sPooled: parseFloat(sPooled.toFixed(4)),
    design: 'independent-samples',
    interpretation: _cohensDInterpretation(d)
  };
}

/**
 * Maps an absolute Cohen's d value to its verbal interpretation.
 * @private
 */
function _cohensDInterpretation(d) {
  const abs = Math.abs(d);
  if (abs >= 0.80) return 'Large Effect (d ≥ 0.80)';
  if (abs >= 0.50) return 'Medium Effect (0.50 ≤ d < 0.80)';
  if (abs >= 0.20) return 'Small Effect (0.20 ≤ d < 0.50)';
  return 'Negligible Effect (d < 0.20)';
}

/**
 * Computes a Paired-Sample t-Test for pre/post score arrays.
 *
 * Returns an **exact** two-tailed p-value computed from the t-distribution
 * CDF using the regularized incomplete beta function — not a lookup table.
 * Uses unrounded intermediate values throughout.
 *
 * @param {number[]} preScores  - Pre-test scores
 * @param {number[]} postScores - Post-test scores (matched pairs)
 * @returns {{ n: number, df: number, meanDiff: number, stdDevDiff: number,
 *             seDiff: number, t: number, pValue: number,
 *             isSignificant: boolean, significanceLevel: string }}
 */
function computePairedTTest(preScores = [], postScores = []) {
  const n = Math.min(preScores.length, postScores.length);
  if (n < 2) {
    return { n, df: 0, meanDiff: 0, stdDevDiff: 0, seDiff: 0,
             t: 0, pValue: 1.0, isSignificant: false, significanceLevel: 'n/s' };
  }

  const diffs = Array.from({ length: n }, (_, i) =>
    (parseFloat(postScores[i]) || 0) - (parseFloat(preScores[i]) || 0)
  );

  // Use unrounded raw descriptives for precision
  const rawDiffs = _rawDescriptives(diffs);
  const seDiff   = rawDiffs.stdDev / Math.sqrt(n);
  const df       = n - 1;

  if (seDiff === 0) {
    return { n, df, meanDiff: parseFloat(rawDiffs.mean.toFixed(4)),
             stdDevDiff: 0, seDiff: 0, t: 0, pValue: 1.0,
             isSignificant: false, significanceLevel: 'n/s' };
  }

  const t      = rawDiffs.mean / seDiff;
  const pValue = _tDistPValue(t, df);

  let significanceLevel;
  if (pValue < 0.001)      significanceLevel = 'p < 0.001';
  else if (pValue < 0.01)  significanceLevel = 'p < 0.01';
  else if (pValue < 0.05)  significanceLevel = 'p < 0.05';
  else if (pValue < 0.10)  significanceLevel = 'p < 0.10 (marginal)';
  else                     significanceLevel = 'n/s';

  return {
    n,
    df,
    meanDiff:   parseFloat(rawDiffs.mean.toFixed(4)),
    stdDevDiff: parseFloat(rawDiffs.stdDev.toFixed(4)),
    seDiff:     parseFloat(seDiff.toFixed(4)),
    t:          parseFloat(t.toFixed(3)),
    pValue,
    isSignificant: pValue < 0.05,
    significanceLevel
  };
}

/**
 * Computes Cronbach's Alpha internal consistency reliability coefficient.
 * Formula: α = (k / (k − 1)) × (1 − Σvar_i / var_total)
 * Uses Bessel-corrected (sample) variances throughout.
 *
 * @param {Array<Array<number>>} itemMatrix
 *   Matrix where rows = respondents and columns = items (e.g. Likert responses).
 * @returns {{ alpha: number, items: number, respondents: number,
 *             reliability: string, sumItemVariances: number, totalVariance: number }}
 */
function computeCronbachsAlpha(itemMatrix = []) {
  if (!itemMatrix || itemMatrix.length < 2) {
    return { alpha: 0, items: 0, respondents: 0, reliability: 'Insufficient Data',
             sumItemVariances: 0, totalVariance: 0 };
  }

  const nRespondents = itemMatrix.length;
  const kItems       = itemMatrix[0].length;
  if (kItems < 2) {
    return { alpha: 0, items: kItems, respondents: nRespondents,
             reliability: 'Insufficient Items', sumItemVariances: 0, totalVariance: 0 };
  }

  // Sum of item variances (column-wise)
  let sumItemVariances = 0;
  for (let j = 0; j < kItems; j++) {
    const col = itemMatrix.map(row => parseFloat(row[j]) || 0);
    sumItemVariances += _rawDescriptives(col).variance;
  }

  // Variance of total (row sum) scores
  const totalScores  = itemMatrix.map(row => row.reduce((a, b) => a + (parseFloat(b) || 0), 0));
  const totalVariance = _rawDescriptives(totalScores).variance;

  if (totalVariance === 0) {
    return { alpha: 0, items: kItems, respondents: nRespondents,
             reliability: 'Zero Variance', sumItemVariances: parseFloat(sumItemVariances.toFixed(4)),
             totalVariance: 0 };
  }

  const alpha   = (kItems / (kItems - 1)) * (1 - sumItemVariances / totalVariance);
  const rounded = parseFloat(alpha.toFixed(3));

  let reliability;
  if (rounded >= 0.90)      reliability = 'Excellent (α ≥ 0.90)';
  else if (rounded >= 0.80) reliability = 'Good / High (0.80 ≤ α < 0.90)';
  else if (rounded >= 0.70) reliability = 'Acceptable (0.70 ≤ α < 0.80)';
  else if (rounded >= 0.60) reliability = 'Questionable (0.60 ≤ α < 0.70)';
  else                      reliability = 'Poor (α < 0.60)';

  return {
    alpha: rounded,
    items: kItems,
    respondents: nRespondents,
    reliability,
    sumItemVariances: parseFloat(sumItemVariances.toFixed(4)),
    totalVariance:    parseFloat(totalVariance.toFixed(4))
  };
}

/**
 * Standard System Usability Scale (SUS) 10-Item Scoring Algorithm.
 * Reference: Brooke, J. (1996). Usability Evaluation in Industry.
 *            Sauro & Lewis (2016) for percentile norms.
 *
 * Scoring rules:
 *   Odd-indexed items  (0, 2, 4, 6, 8):  contribution = response − 1
 *   Even-indexed items (1, 3, 5, 7, 9):  contribution = 5 − response
 *   Final score = sum × 2.5  →  range 0–100
 *
 * @param {number[]} responses - Array of exactly 10 Likert responses (1–5)
 * @returns {{ score: number, percentile: number, grade: string,
 *             adjective: string, acceptability: string }}
 */
function computeSUSScore(responses = []) {
  if (!responses || responses.length < 10) {
    return { score: 0, percentile: 0, grade: 'Incomplete', adjective: 'N/A', acceptability: 'N/A' };
  }

  let totalPoints = 0;
  for (let i = 0; i < 10; i++) {
    const rawVal = parseInt(responses[i], 10);
    // Clamp to valid Likert range
    const val = Math.min(5, Math.max(1, isNaN(rawVal) ? 3 : rawVal));
    if (i % 2 === 0) {
      totalPoints += (val - 1);   // Positive items
    } else {
      totalPoints += (5 - val);   // Negative items
    }
  }

  const susScore   = parseFloat((totalPoints * 2.5).toFixed(1));
  const percentile = _susPercentile(susScore);

  let grade, adjective, acceptability;

  if (susScore >= 80.3) {
    grade = 'A (Excellent)'; adjective = 'Excellent'; acceptability = 'Acceptable';
  } else if (susScore >= 68.0) {
    grade = 'B (Good)';      adjective = 'Good';      acceptability = 'Acceptable';
  } else if (susScore >= 51.0) {
    grade = 'C (OK)';        adjective = 'OK';         acceptability = 'Marginal';
  } else {
    grade = 'D / F (Poor)';  adjective = 'Poor';       acceptability = 'Not Acceptable';
  }

  return { score: susScore, percentile, grade, adjective, acceptability };
}

/**
 * Technology Acceptance Model (TAM 3) Construct Aggregator.
 * References: Davis (1989); Venkatesh & Bala (2008).
 *
 * Expected `responses` shape:
 *   { PU: number[], PEOU: number[], FC: number[], BI: number[] }
 * where each array contains Likert ratings (typically 1–5) for that construct.
 *
 * Returns mean scores per construct and a composite mean across all four.
 *
 * @param {{ PU?: number[], PEOU?: number[], FC?: number[], BI?: number[] }} responses
 * @returns {{ PU: number, PEOU: number, FC: number, BI: number,
 *             compositeMean: number, acceptanceLevel: string }}
 */
function computeTAMConstructs(responses = {}) {
  const pu   = computeDescriptives(responses.PU   || []).mean;
  const peou = computeDescriptives(responses.PEOU || []).mean;
  const fc   = computeDescriptives(responses.FC   || []).mean;
  const bi   = computeDescriptives(responses.BI   || []).mean;

  // Only average constructs that have data
  const filled = [pu, peou, fc, bi].filter(v => v > 0);
  const compositeMean = filled.length > 0
    ? parseFloat((filled.reduce((a, b) => a + b, 0) / filled.length).toFixed(2))
    : 0;

  let acceptanceLevel;
  if (compositeMean >= 4.0)      acceptanceLevel = 'High Acceptance (≥ 4.0 / 5.0)';
  else if (compositeMean >= 3.0) acceptanceLevel = 'Moderate Acceptance (3.0–3.99 / 5.0)';
  else                           acceptanceLevel = 'Low Acceptance (< 3.0 / 5.0)';

  return { PU: pu, PEOU: peou, FC: fc, BI: bi, compositeMean, acceptanceLevel };
}

// ─────────────────────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────────────────────
module.exports = {
  computeHakesGain,
  computeGroupHakesGain,
  computeDescriptives,
  computeCohensD,
  computePairedTTest,
  computeCronbachsAlpha,
  computeSUSScore,
  computeTAMConstructs
};
