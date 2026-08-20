// ============================================================
//  VirtuLab Kenya — Educational Research & Statistical Utilities
//  Master's in Learning Design & Technology Research Suite
// ============================================================

/**
 * Calculates Hake's Average Normalized Learning Gain (g)
 * Reference: Hake, R. R. (1998). American Journal of Physics.
 * Formula: g = (Post% - Pre%) / (100% - Pre%)
 *
 * @param {number} preScore - Baseline pre-test raw score
 * @param {number} postScore - Post-intervention raw score
 * @param {number} maxScore - Maximum possible score (default 40.0)
 * @returns {object} { g, prePct, postPct, category }
 */
function computeHakesGain(preScore, postScore, maxScore = 40.0) {
  const pre = Math.max(0, parseFloat(preScore) || 0);
  const post = Math.max(0, parseFloat(postScore) || 0);
  const max = Math.max(1, parseFloat(maxScore) || 40.0);

  const prePct = (pre / max) * 100;
  const postPct = (post / max) * 100;

  if (prePct >= 100) {
    return {
      g: 1.0,
      prePct: 100,
      postPct: 100,
      category: 'High Gain (Ceiling)'
    };
  }

  const g = parseFloat(((postPct - prePct) / (100 - prePct)).toFixed(4));
  let category = 'Low Gain';
  if (g >= 0.70) category = 'High Gain (g ≥ 0.70)';
  else if (g >= 0.30) category = 'Medium Gain (0.30 ≤ g < 0.70)';
  else category = 'Low Gain (g < 0.30)';

  return {
    g,
    prePct: parseFloat(prePct.toFixed(2)),
    postPct: parseFloat(postPct.toFixed(2)),
    gainPct: parseFloat((postPct - prePct).toFixed(2)),
    category
  };
}

/**
 * Computes descriptive statistics for a numeric array
 */
function computeDescriptives(values = []) {
  const clean = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
  if (clean.length === 0) {
    return { count: 0, mean: 0, stdDev: 0, min: 0, max: 0, median: 0 };
  }

  const n = clean.length;
  const sum = clean.reduce((a, b) => a + b, 0);
  const mean = sum / n;

  const variance = clean.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.sqrt(variance);

  const sorted = [...clean].sort((a, b) => a - b);
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  return {
    count: n,
    mean: parseFloat(mean.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2)),
    min: sorted[0],
    max: sorted[n - 1],
    median: parseFloat(median.toFixed(2))
  };
}

/**
 * Computes Cohen's d Effect Size between two groups/paired samples
 * Formula: d = (MeanPost - MeanPre) / s_pooled
 */
function computeCohensD(preScores = [], postScores = []) {
  const preDesc = computeDescriptives(preScores);
  const postDesc = computeDescriptives(postScores);

  if (preDesc.count < 2 || postDesc.count < 2) {
    return { d: 0, interpretation: 'Insufficient Sample' };
  }

  const n1 = preDesc.count;
  const n2 = postDesc.count;
  const s1 = preDesc.stdDev;
  const s2 = postDesc.stdDev;

  const pooledVariance = ((n1 - 1) * Math.pow(s1, 2) + (n2 - 1) * Math.pow(s2, 2)) / (n1 + n2 - 2);
  const sPooled = Math.sqrt(pooledVariance);

  if (sPooled === 0) return { d: 0, interpretation: 'Zero Variance' };

  const d = parseFloat(((postDesc.mean - preDesc.mean) / sPooled).toFixed(3));
  let interpretation = 'Negligible';
  if (Math.abs(d) >= 0.80) interpretation = 'Large Effect (d ≥ 0.80)';
  else if (Math.abs(d) >= 0.50) interpretation = 'Medium Effect (0.50 ≤ d < 0.80)';
  else if (Math.abs(d) >= 0.20) interpretation = 'Small Effect (0.20 ≤ d < 0.50)';

  return { d, sPooled: parseFloat(sPooled.toFixed(2)), interpretation };
}

/**
 * Computes Paired Sample t-Test
 */
function computePairedTTest(preScores = [], postScores = []) {
  const n = Math.min(preScores.length, postScores.length);
  if (n < 2) {
    return { t: 0, df: 0, pValue: 1.0, meanDiff: 0, seDiff: 0 };
  }

  const diffs = [];
  for (let i = 0; i < n; i++) {
    diffs.push(parseFloat(postScores[i]) - parseFloat(preScores[i]));
  }

  const diffDesc = computeDescriptives(diffs);
  const seDiff = diffDesc.stdDev / Math.sqrt(n);
  const t = seDiff > 0 ? parseFloat((diffDesc.mean / seDiff).toFixed(3)) : 0;
  const df = n - 1;

  // Approximate two-tailed p-value calculation
  let pValue = 0.05;
  if (Math.abs(t) > 3.29) pValue = 0.001;
  else if (Math.abs(t) > 2.58) pValue = 0.01;
  else if (Math.abs(t) > 1.96) pValue = 0.05;
  else pValue = 0.10;

  return {
    n,
    df,
    meanDiff: diffDesc.mean,
    stdDevDiff: diffDesc.stdDev,
    seDiff: parseFloat(seDiff.toFixed(3)),
    t,
    pValue,
    isSignificant: Math.abs(t) >= 1.96
  };
}

/**
 * Computes Cronbach's Alpha Internal Consistency Reliability
 * Formula: alpha = (k / (k - 1)) * (1 - sum(var_i) / var_total)
 *
 * @param {Array<Array<number>>} itemMatrix - Matrix where rows are respondents, cols are items
 */
function computeCronbachsAlpha(itemMatrix = []) {
  if (!itemMatrix || itemMatrix.length < 2) return { alpha: 0, items: 0 };

  const nRespondents = itemMatrix.length;
  const kItems = itemMatrix[0].length;
  if (kItems < 2) return { alpha: 0, items: kItems };

  // Calculate variance for each item column
  let sumItemVariances = 0;
  for (let j = 0; j < kItems; j++) {
    const colValues = itemMatrix.map(row => parseFloat(row[j]) || 0);
    const colDesc = computeDescriptives(colValues);
    sumItemVariances += Math.pow(colDesc.stdDev, 2);
  }

  // Calculate total scores per respondent and their variance
  const totalScores = itemMatrix.map(row => row.reduce((a, b) => a + (parseFloat(b) || 0), 0));
  const totalDesc = computeDescriptives(totalScores);
  const totalVariance = Math.pow(totalDesc.stdDev, 2);

  if (totalVariance === 0) return { alpha: 0, items: kItems };

  const alpha = (kItems / (kItems - 1)) * (1 - (sumItemVariances / totalVariance));
  const rounded = parseFloat(alpha.toFixed(3));

  let reliability = 'Poor';
  if (rounded >= 0.90) reliability = 'Excellent (α ≥ 0.90)';
  else if (rounded >= 0.80) reliability = 'Good / High (0.80 ≤ α < 0.90)';
  else if (rounded >= 0.70) reliability = 'Acceptable (0.70 ≤ α < 0.80)';
  else if (rounded >= 0.60) reliability = 'Questionable (0.60 ≤ α < 0.70)';

  return { alpha: rounded, items: kItems, reliability };
}

/**
 * Standard System Usability Scale (SUS) 10-Item Scoring Algorithm
 * Reference: Brooke, J. (1996). Usability Evaluation in Industry.
 *
 * Items are scored 1 (Strongly Disagree) to 5 (Strongly Agree).
 * For odd items (1, 3, 5, 7, 9): contribution is (Score - 1)
 * For even items (2, 4, 6, 8, 10): contribution is (5 - Score)
 * Total multiplied by 2.5 gives 0–100 SUS score.
 */
function computeSUSScore(responses = []) {
  if (!responses || responses.length < 10) {
    return { score: 0, grade: 'Incomplete', percentile: 0 };
  }

  let totalPoints = 0;
  for (let i = 0; i < 10; i++) {
    const rawVal = parseInt(responses[i], 10) || 3;
    if (i % 2 === 0) {
      // Odd items (1-indexed 1, 3, 5, 7, 9)
      totalPoints += (rawVal - 1);
    } else {
      // Even items (1-indexed 2, 4, 6, 8, 10)
      totalPoints += (5 - rawVal);
    }
  }

  const susScore = parseFloat((totalPoints * 2.5).toFixed(1));

  let grade = 'F';
  let adjective = 'Poor';
  let acceptability = 'Not Acceptable';

  if (susScore >= 80.3) {
    grade = 'A (Excellent)';
    adjective = 'Excellent';
    acceptability = 'Acceptable';
  } else if (susScore >= 68.0) {
    grade = 'B (Good)';
    adjective = 'Good';
    acceptability = 'Acceptable';
  } else if (susScore >= 51.0) {
    grade = 'C (OK)';
    adjective = 'OK';
    acceptability = 'Marginal';
  } else {
    grade = 'D / F (Poor)';
    adjective = 'Poor';
    acceptability = 'Not Acceptable';
  }

  return {
    score: susScore,
    grade,
    adjective,
    acceptability
  };
}

/**
 * Technology Acceptance Model (TAM 3) Construct Aggregator
 * References: Davis (1989), Venkatesh & Bala (2008).
 *
 * Constructs:
 * - PU: Perceived Usefulness (Items 1-4)
 * - PEOU: Perceived Ease of Use (Items 5-8)
 * - FC: Facilitating Conditions (Items 9-11)
 * - BI: Behavioral Intention to Use (Items 12-14)
 */
function computeTAMConstructs(responses = {}) {
  // responses can be an object with array of ratings per construct or keyed object
  const pu = computeDescriptives(responses.PU || []).mean;
  const peou = computeDescriptives(responses.PEOU || []).mean;
  const fc = computeDescriptives(responses.FC || []).mean;
  const bi = computeDescriptives(responses.BI || []).mean;

  const compositeMean = parseFloat(((pu + peou + fc + bi) / 4).toFixed(2));

  return {
    PU: pu,
    PEOU: peou,
    FC: fc,
    BI: bi,
    compositeMean,
    acceptanceLevel: compositeMean >= 4.0 ? 'High Acceptance (≥ 4.0/5.0)' : (compositeMean >= 3.0 ? 'Moderate Acceptance' : 'Low Acceptance')
  };
}

module.exports = {
  computeHakesGain,
  computeDescriptives,
  computeCohensD,
  computePairedTTest,
  computeCronbachsAlpha,
  computeSUSScore,
  computeTAMConstructs
};
