// ============================================================
//  VirtuLab Kenya — KNEC Practical Examination Grading Engine
// ============================================================

function calculateKnecGrade(scoreOutof40) {
  const pct = (scoreOutof40 / 40.0) * 100;
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'A-';
  if (pct >= 60) return 'B+';
  if (pct >= 55) return 'B';
  if (pct >= 50) return 'C+';
  if (pct >= 45) return 'C';
  if (pct >= 40) return 'D+';
  if (pct >= 35) return 'D';
  return 'E';
}

function calculateKnecTitrationScore(studentAnswer, trueConc) {
  const diff = Math.abs(studentAnswer - trueConc);
  let score = 0;
  if (diff <= 0.005) score = 15.0;
  else if (diff <= 0.01) score = 14.0;
  else if (diff <= 0.02) score = 12.0;
  else if (diff <= 0.05) score = 9.0;
  else if (diff <= 0.1) score = 6.0;
  else score = 3.0;
  return { score, diff };
}

if (typeof window !== 'undefined') {
  window.calculateKnecGrade = calculateKnecGrade;
  window.calculateKnecTitrationScore = calculateKnecTitrationScore;
}
