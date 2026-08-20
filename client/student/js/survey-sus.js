// ============================================================
//  VirtuLab Kenya — System Usability Scale (SUS) Engine
//  Standardized 10-Item Usability Evaluation (Brooke, 1996)
// ============================================================

const SUS_ITEMS = [
  { id: 1, text: 'I think that I would like to use VirtuLab Kenya frequently for chemistry practical revision.' },
  { id: 2, text: 'I found VirtuLab Kenya unnecessarily complex.' },
  { id: 3, text: 'I thought VirtuLab Kenya was easy to use.' },
  { id: 4, text: 'I think that I would need the support of a technical person to be able to use VirtuLab Kenya.' },
  { id: 5, text: 'I found the various functions in VirtuLab Kenya were well integrated.' },
  { id: 6, text: 'I thought there was too much inconsistency in VirtuLab Kenya.' },
  { id: 7, text: 'I would imagine that most learners would learn to use VirtuLab Kenya very quickly.' },
  { id: 8, text: 'I found VirtuLab Kenya very cumbersome to use.' },
  { id: 9, text: 'I felt very confident using VirtuLab Kenya.' },
  { id: 10, text: 'I needed to learn a lot of things before I could get going with VirtuLab Kenya.' }
];

function calculateSUS(responses) {
  let score = 0;
  for (let i = 0; i < 10; i++) {
    const val = parseInt(responses[i], 10) || 3;
    if (i % 2 === 0) {
      score += (val - 1);
    } else {
      score += (5 - val);
    }
  }
  const sus = score * 2.5;

  let grade = 'F';
  let adjective = 'Poor';
  if (sus >= 80.3) {
    grade = 'A (Excellent)';
    adjective = 'Excellent (Top 10th Percentile)';
  } else if (sus >= 68.0) {
    grade = 'B (Good)';
    adjective = 'Good (Above Benchmark Average of 68.0)';
  } else if (sus >= 51.0) {
    grade = 'C (OK)';
    adjective = 'Marginal Acceptability';
  } else {
    grade = 'D / F (Poor)';
    adjective = 'Unacceptable (Needs Redesign)';
  }

  return { score: sus, grade, adjective };
}

if (typeof window !== 'undefined') {
  window.SUS_ITEMS = SUS_ITEMS;
  window.calculateSUS = calculateSUS;
}
