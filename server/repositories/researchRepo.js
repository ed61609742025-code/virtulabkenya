// ============================================================
//  VirtuLab Kenya — Educational Research & Assessment Repository
//  Master's in Learning Design & Technology Research Suite
// ============================================================

const pool = require('../db/pool');
const stats = require('../utils/statistics');

async function saveAssessment(data) {
  const {
    studentId,
    assessment_type, // 'pre_test' | 'post_test'
    title,
    section_a_score,
    section_b_score,
    section_c_score,
    section_d_score,
    total_score,
    max_score = 40.0,
    percentage,
    answers,
    rubric_breakdown,
    duration_seconds
  } = data;

  const query = `
    INSERT INTO research_assessments (
      student_id, assessment_type, title, section_a_score,
      section_b_score, section_c_score, section_d_score, total_score,
      max_score, percentage, answers, rubric_breakdown, duration_seconds
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `;

  const values = [
    studentId,
    assessment_type || 'pre_test',
    title || 'Chemistry Practical Competency Achievement Test (CPCAT)',
    parseFloat(section_a_score) || 0,
    parseFloat(section_b_score) || 0,
    parseFloat(section_c_score) || 0,
    parseFloat(section_d_score) || 0,
    parseFloat(total_score) || 0,
    parseFloat(max_score) || 40.0,
    parseFloat(percentage) || 0,
    answers ? JSON.stringify(answers) : null,
    rubric_breakdown ? JSON.stringify(rubric_breakdown) : null,
    parseInt(duration_seconds, 10) || 0
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getStudentAssessments(studentId) {
  const result = await pool.query(
    `SELECT * FROM research_assessments
     WHERE student_id = $1
     ORDER BY created_at ASC`,
    [studentId]
  );
  return result.rows;
}

async function getPairedAssessments(teacherId = null, schoolId = null) {
  let query = `
    SELECT 
      s.id AS student_id,
      s.name AS student_name,
      s.form AS student_form,
      sch.name AS school_name,
      pre.total_score AS pre_score,
      pre.percentage AS pre_percentage,
      pre.created_at AS pre_date,
      post.total_score AS post_score,
      post.percentage AS post_percentage,
      post.created_at AS post_date
    FROM students s
    JOIN schools sch ON sch.id = s.school_id
    JOIN research_assessments pre ON pre.student_id = s.id AND pre.assessment_type = 'pre_test'
    JOIN research_assessments post ON post.student_id = s.id AND post.assessment_type = 'post_test'
  `;

  const conditions = [];
  const values = [];

  if (teacherId) {
    values.push(teacherId);
    conditions.push(`s.teacher_id = $${values.length}`);
  }
  if (schoolId) {
    values.push(schoolId);
    conditions.push(`s.school_id = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY s.id ASC';

  const result = await pool.query(query, values);

  // Compute individual gains
  return result.rows.map(row => {
    const gainObj = stats.computeHakesGain(row.pre_score, row.post_score, 40.0);
    return {
      ...row,
      hakes_g: gainObj.g,
      gain_category: gainObj.category,
      gain_pct: gainObj.gainPct
    };
  });
}

async function saveSurvey(data) {
  const {
    userId,
    userRole = 'student',
    schoolId = null,
    survey_type, // 'SUS' | 'TAM'
    responses,
    score,
    construct_scores,
    feedback_text
  } = data;

  const query = `
    INSERT INTO research_surveys (
      user_id, user_role, school_id, survey_type,
      responses, score, construct_scores, feedback_text
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [
    userId || null,
    userRole,
    schoolId,
    survey_type || 'SUS',
    JSON.stringify(responses || {}),
    score !== undefined ? parseFloat(score) : null,
    construct_scores ? JSON.stringify(construct_scores) : null,
    feedback_text || null
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getSurveys(surveyType, userRole = null, schoolId = null) {
  let query = `SELECT * FROM research_surveys WHERE survey_type = $1`;
  const values = [surveyType];

  if (userRole) {
    values.push(userRole);
    query += ` AND user_role = $${values.length}`;
  }
  if (schoolId) {
    values.push(schoolId);
    query += ` AND school_id = $${values.length}`;
  }

  query += ` ORDER BY created_at DESC`;
  const result = await pool.query(query, values);
  return result.rows;
}

async function getResearchSummary(teacherId = null) {
  const paired = await getPairedAssessments(teacherId);
  const preScores = paired.map(p => parseFloat(p.pre_score));
  const postScores = paired.map(p => parseFloat(p.post_score));

  const preDesc = stats.computeDescriptives(preScores);
  const postDesc = stats.computeDescriptives(postScores);
  const cohensD = stats.computeCohensD(preScores, postScores);
  const pairedT = stats.computePairedTTest(preScores, postScores);

  const gains = paired.map(p => p.hakes_g);
  const gainDesc = stats.computeDescriptives(gains);

  // Overall Hake's gain for group
  const groupGain = preDesc.mean < 40 ? stats.computeHakesGain(preDesc.mean, postDesc.mean, 40.0) : { g: 0, category: 'N/A' };

  // Fetch SUS survey data
  const susSurveys = await getSurveys('SUS');
  const susScores = susSurveys.map(s => parseFloat(s.score)).filter(s => !isNaN(s));
  const susDesc = stats.computeDescriptives(susScores);

  // Fetch TAM survey data
  const tamSurveys = await getSurveys('TAM');
  const puScores = [];
  const peouScores = [];
  const fcScores = [];
  const biScores = [];

  tamSurveys.forEach(t => {
    if (t.construct_scores) {
      const cs = typeof t.construct_scores === 'string' ? JSON.parse(t.construct_scores) : t.construct_scores;
      if (cs.PU) puScores.push(cs.PU);
      if (cs.PEOU) peouScores.push(cs.PEOU);
      if (cs.FC) fcScores.push(cs.FC);
      if (cs.BI) biScores.push(cs.BI);
    }
  });

  const tamSummary = {
    PU: stats.computeDescriptives(puScores).mean,
    PEOU: stats.computeDescriptives(peouScores).mean,
    FC: stats.computeDescriptives(fcScores).mean,
    BI: stats.computeDescriptives(biScores).mean,
    totalRespondents: tamSurveys.length
  };

  return {
    pairedCount: paired.length,
    preTest: preDesc,
    postTest: postDesc,
    groupGain,
    meanIndividualGain: gainDesc.mean,
    cohensD,
    pairedTTest: pairedT,
    sus: {
      count: susDesc.count,
      meanScore: susDesc.mean,
      stdDev: susDesc.stdDev,
      interpretation: stats.computeSUSScore(Array(10).fill(Math.round(susDesc.mean / 20)))
    },
    tam: tamSummary,
    pairedList: paired
  };
}

async function exportResearchDatasetCSV() {
  const paired = await getPairedAssessments();
  const susSurveys = await getSurveys('SUS');
  const tamSurveys = await getSurveys('TAM');

  const susMap = {};
  susSurveys.forEach(s => {
    if (s.user_id) susMap[s.user_id] = s.score;
  });

  const tamMap = {};
  tamSurveys.forEach(t => {
    if (t.user_id) {
      const cs = typeof t.construct_scores === 'string' ? JSON.parse(t.construct_scores) : t.construct_scores;
      tamMap[t.user_id] = cs;
    }
  });

  const headers = [
    'Student_ID',
    'School_Name',
    'Form_Level',
    'PreTest_Raw_Score_40',
    'PreTest_Pct',
    'PostTest_Raw_Score_40',
    'PostTest_Pct',
    'Gain_Pct',
    'Hakes_Normalized_Gain_g',
    'Gain_Category',
    'SUS_Usability_Score_100',
    'TAM_Perceived_Usefulness_PU',
    'TAM_Ease_Of_Use_PEOU',
    'TAM_Facilitating_Conditions_FC',
    'TAM_Behavioral_Intention_BI'
  ];

  const rows = paired.map(p => {
    const sus = susMap[p.student_id] !== undefined ? susMap[p.student_id] : '';
    const tam = tamMap[p.student_id] || {};
    return [
      `STU-${String(p.student_id).padStart(4, '0')}`,
      `"${p.school_name.replace(/"/g, '""')}"`,
      `"${p.student_form || 'Form 4'}"`,
      p.pre_score,
      p.pre_percentage,
      p.post_score,
      p.post_percentage,
      p.gain_pct,
      p.hakes_g,
      `"${p.gain_category}"`,
      sus,
      tam.PU || '',
      tam.PEOU || '',
      tam.FC || '',
      tam.BI || ''
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

module.exports = {
  saveAssessment,
  getStudentAssessments,
  getPairedAssessments,
  saveSurvey,
  getSurveys,
  getResearchSummary,
  exportResearchDatasetCSV
};
