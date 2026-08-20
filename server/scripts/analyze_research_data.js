// ============================================================
//  VirtuLab Kenya — Automated Research Data Analysis CLI Tool
//  Generates Triangulated Statistical Tables for MSc Dissertation
// ============================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const researchRepo = require('../repositories/researchRepo');
const pool = require('../db/pool');

async function runAnalysis() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  VIRTU-LAB KENYA — MSC RESEARCH STATISTICAL ANALYSIS REPORT');
  console.log('  Open University of Kenya · Learning Design & Technology');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  try {
    const summary = await researchRepo.getResearchSummary();

    console.log('── 1. SAMPLE AND PARTICIPATION DEMOGRAPHICS ──');
    console.log(`• Paired Pre/Post Test Completers (N): ${summary.pairedCount}`);
    console.log(`• System Usability Scale (SUS) Responses: ${summary.sus.count}`);
    console.log(`• Technology Acceptance Model (TAM) Responses: ${summary.tam.totalRespondents}\n`);

    console.log('── 2. PRE-TEST VS POST-TEST DESCRIPTIVE STATISTICS (40 Marks) ──');
    console.log(`• Baseline Pre-Test Mean (M ± SD): ${summary.preTest.mean} ± ${summary.preTest.stdDev} (Median: ${summary.preTest.median})`);
    console.log(`• Post-Intervention Mean (M ± SD): ${summary.postTest.mean} ± ${summary.postTest.stdDev} (Median: ${summary.postTest.median})`);
    console.log(`• Mean Raw Score Gain: +${(summary.postTest.mean - summary.preTest.mean).toFixed(2)} marks\n`);

    console.log('── 3. LEARNING GAIN & EFFECT SIZES (EFFICACY) ──');
    console.log(`• Overall Group Hake\'s Gain (g): ${summary.groupGain.g} [${summary.groupGain.category}]`);
    console.log(`• Mean Individual Normalized Gain (g): ${summary.meanIndividualGain}`);
    console.log(`• Cohen\'s d Effect Size: d = ${summary.cohensD.d} [${summary.cohensD.interpretation}]`);
    console.log(`• Paired Sample t-Test: t(${summary.pairedTTest.df}) = ${summary.pairedTTest.t}, p ≈ ${summary.pairedTTest.pValue} (${summary.pairedTTest.isSignificant ? 'Statistically Significant p < 0.05' : 'Not Significant'})\n`);

    console.log('── 4. SYSTEM USABILITY SCALE (SUS) BENCHMARK ──');
    console.log(`• Mean SUS Score: ${summary.sus.meanScore} / 100 (SD = ${summary.sus.stdDev})`);
    console.log(`• Usability Rating: ${summary.sus.interpretation.grade} · ${summary.sus.interpretation.adjective} (${summary.sus.interpretation.acceptability})\n`);

    console.log('── 5. TECHNOLOGY ACCEPTANCE MODEL (TAM 3) CONSTRUCTS (1-5 Scale) ──');
    console.log(`• Perceived Usefulness (PU): ${summary.tam.PU} / 5.00`);
    console.log(`• Perceived Ease of Use (PEOU): ${summary.tam.PEOU} / 5.00`);
    console.log(`• Facilitating Conditions (FC): ${summary.tam.FC} / 5.00`);
    console.log(`• Behavioral Intention to Use (BI): ${summary.tam.BI} / 5.00\n`);

    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('✓ Analysis successfully completed.');
    console.log('═══════════════════════════════════════════════════════════════════');
  } catch (err) {
    console.error('Analysis error:', err.message);
  } finally {
    await pool.end().catch(() => {});
  }
}

if (require.main === module) {
  runAnalysis();
}

module.exports = { runAnalysis };
