// ============================================================
//  VirtuLab Kenya — Simulation Coverage & Gap Audit Tool
//  Reports which questions across all past papers and mock series
//  have interactive simulation engines vs written-only status.
// ============================================================

const path = require('path');
const rootDir = path.resolve(__dirname, '..', '..');

const {
  COMPOSITE_EXAM_PRESETS
} = require(path.join(rootDir, 'client', 'student', 'js', 'composite-engine.js'));

const {
  KCSE_PAST_PAPERS_ARCHIVE
} = require(path.join(rootDir, 'client', 'student', 'js', 'kcse-past-papers-data.js'));

/**
 * Evaluates simulation coverage across all past papers and mock presets
 * @returns {Object} Full coverage breakdown, statistics, and pending question list
 */
function evaluateSimulationCoverage() {
  const archivePapers = KCSE_PAST_PAPERS_ARCHIVE || [];
  const presets = COMPOSITE_EXAM_PRESETS || {};

  const paperLedger = [];
  const pendingSimulations = [];

  let totalQuestionsCount = 0;
  let simulatedQuestionsCount = 0;
  let writtenOnlyQuestionsCount = 0;

  archivePapers.forEach(paper => {
    const hasPreset = Boolean(paper.playablePresetKey && presets[paper.playablePresetKey]);
    const preset = hasPreset ? presets[paper.playablePresetKey] : null;

    const questionsReport = [];
    const qList = Array.isArray(paper.questions) ? paper.questions : [];

    qList.forEach((q, idx) => {
      totalQuestionsCount++;
      const qNum = q.num || idx + 1;
      let isSimulated = false;
      let simType = 'written_only';
      let benchDetails = 'No interactive bench';

      if (preset) {
        const pQ = preset[`q${qNum}`];
        if (pQ) {
          simType = pQ.simulationType || pQ.type || 'simulated';
          if (simType !== 'written') {
            isSimulated = true;
            benchDetails = `Bench: ${simType}`;
          }
        }
      }

      if (isSimulated) {
        simulatedQuestionsCount++;
      } else {
        writtenOnlyQuestionsCount++;
        pendingSimulations.push({
          paperId: paper.id,
          year: paper.year,
          paperTitle: paper.title,
          questionNumber: qNum,
          questionTitle: q.title || `Question ${qNum}`,
          topics: paper.topics || []
        });
      }

      questionsReport.push({
        num: qNum,
        title: q.title,
        isSimulated,
        simType,
        benchDetails
      });
    });

    paperLedger.push({
      id: paper.id,
      year: paper.year,
      title: paper.title,
      isPlayable: hasPreset,
      playablePresetKey: paper.playablePresetKey || null,
      questionCount: qList.length,
      simulatedCount: questionsReport.filter(qr => qr.isSimulated).length,
      questions: questionsReport
    });
  });

  // Calculate percentages
  const paperCoveragePercent = archivePapers.length > 0
    ? ((paperLedger.filter(p => p.isPlayable).length / archivePapers.length) * 100).toFixed(1)
    : 0;

  const questionCoveragePercent = totalQuestionsCount > 0
    ? ((simulatedQuestionsCount / totalQuestionsCount) * 100).toFixed(1)
    : 0;

  return {
    totalPapers: archivePapers.length,
    playablePapers: paperLedger.filter(p => p.isPlayable).length,
    paperCoveragePercent: Number(paperCoveragePercent),
    totalQuestions: totalQuestionsCount,
    simulatedQuestions: simulatedQuestionsCount,
    writtenOnlyQuestions: writtenOnlyQuestionsCount,
    questionCoveragePercent: Number(questionCoveragePercent),
    paperLedger,
    pendingSimulations
  };
}

// ── CLI Runner ──
if (require.main === module) {
  console.log('\n📊 VirtuLab Kenya — Practical Simulation Coverage Audit\n');
  const report = evaluateSimulationCoverage();

  console.log('────────────────────────────────────────────────────────────────────────');
  console.log(`📋 High-Level Summary:`);
  console.log(`   • Total Archived Past Papers:    ${report.totalPapers}`);
  console.log(`   • Full 40M Playable Simulations: ${report.playablePapers} (${report.paperCoveragePercent}% coverage)`);
  console.log(`   • Total Practical Questions:     ${report.totalQuestions}`);
  console.log(`   • Questions with Simulations:    ${report.simulatedQuestions} (${report.questionCoveragePercent}%)`);
  console.log(`   • Questions Written-Only:        ${report.writtenOnlyQuestions}`);
  console.log('────────────────────────────────────────────────────────────────────────\n');

  console.log('📑 Year-by-Year Past Paper Simulation Ledger:');
  console.log('┌──────┬──────────────────────┬─────────────┬─────────────┬─────────────┬──────────────┐');
  console.log('│ Year │ Paper ID             │ Q1 Status   │ Q2 Status   │ Q3 Status   │ Playable 40M │');
  console.log('├──────┼──────────────────────┼─────────────┼─────────────┼─────────────┼──────────────┤');

  report.paperLedger.forEach(p => {
    const formatQ = (qNum) => {
      const q = p.questions.find(item => item.num === qNum);
      if (!q) return '  —  ';
      return q.isSimulated ? '🟢 Sim' : '📝 Text';
    };

    const yearPad = String(p.year).padEnd(4, ' ');
    const idPad = p.id.padEnd(20, ' ');
    const q1 = formatQ(1).padEnd(11, ' ');
    const q2 = formatQ(2).padEnd(11, ' ');
    const q3 = formatQ(3).padEnd(11, ' ');
    const play = (p.isPlayable ? '🟢 YES' : '⚪ NO').padEnd(12, ' ');

    console.log(`│ ${yearPad} │ ${idPad} │ ${q1} │ ${q2} │ ${q3} │ ${play} │`);
  });
  console.log('└──────┴──────────────────────┴─────────────┴─────────────┴─────────────┴──────────────┘\n');

  if (report.pendingSimulations.length > 0) {
    console.log(`⚠️ Actionable List: ${report.pendingSimulations.length} Questions Without Interactive Simulations:`);
    report.pendingSimulations.forEach((pend, idx) => {
      console.log(`  ${String(idx + 1).padStart(2, ' ')}. [${pend.year}] ${pend.paperId} -> Q${pend.questionNumber}: ${pend.questionTitle}`);
    });
    console.log('\n💡 Tip: To add a simulation for any pending question, create its preset in `client/student/js/composite-engine.js` and link `playablePresetKey` in `client/student/js/kcse-past-papers-data.js`.\n');
  } else {
    console.log('🎉 100% Simulation Coverage! Every single archived practical question has an active simulation engine.\n');
  }
}

module.exports = {
  evaluateSimulationCoverage
};
