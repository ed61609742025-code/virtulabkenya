// ============================================================
//  VirtuLab Kenya — Real-Time Laboratory Telemetry Repository
// ============================================================

const pool = require('../db/pool');

let telemetryTablesEnsured = false;

/**
 * Ensure database tables for Live Telemetry, Safety Incidents & Interventions exist.
 */
async function ensureTelemetryTables() {
  if (telemetryTablesEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS live_lab_telemetry (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
        school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
        session_token VARCHAR(100),
        practical_type VARCHAR(64) NOT NULL,
        bench_name VARCHAR(100) DEFAULT 'Lab Bench',
        apparatus_state JSONB DEFAULT '{}',
        safety_alerts JSONB DEFAULT '[]',
        status VARCHAR(32) DEFAULT 'active',
        last_heartbeat TIMESTAMP DEFAULT NOW(),
        started_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT uq_student_active_telemetry UNIQUE (student_id)
      );

      CREATE INDEX IF NOT EXISTS idx_telemetry_teacher ON live_lab_telemetry(teacher_id, last_heartbeat);
      CREATE INDEX IF NOT EXISTS idx_telemetry_heartbeat ON live_lab_telemetry(last_heartbeat);

      CREATE TABLE IF NOT EXISTS lab_safety_incidents (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
        school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
        practical_type VARCHAR(64) NOT NULL,
        severity VARCHAR(32) DEFAULT 'warning',
        alert_code VARCHAR(64) NOT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        apparatus_snapshot JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_safety_teacher ON lab_safety_incidents(teacher_id, created_at);

      CREATE TABLE IF NOT EXISTS teacher_lab_interventions (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        intervention_type VARCHAR(32) DEFAULT 'guidance',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_interventions_student ON teacher_lab_interventions(student_id, is_read);
    `);
    telemetryTablesEnsured = true;
  } catch (err) {
    console.warn('[telemetryRepo] ensureTelemetryTables note:', err.message);
  }
}

/**
 * Record student laboratory heartbeat with active apparatus state.
 */
async function recordHeartbeat(studentId, {
  practicalType = 'titration',
  benchName = 'Lab Bench',
  apparatusState = {},
  safetyAlerts = [],
  status = 'active',
  sessionToken = null
}) {
  await ensureTelemetryTables();

  // Look up student's teacher and school
  const studentRes = await pool.query(
    'SELECT teacher_id, school_id FROM students WHERE id = $1',
    [studentId]
  );
  const teacherId = studentRes.rows[0]?.teacher_id || null;
  const schoolId = studentRes.rows[0]?.school_id || null;

  const result = await pool.query(
    `INSERT INTO live_lab_telemetry 
       (student_id, teacher_id, school_id, session_token, practical_type, bench_name, apparatus_state, safety_alerts, status, last_heartbeat)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
     ON CONFLICT (student_id)
     DO UPDATE SET 
       practical_type = EXCLUDED.practical_type,
       bench_name = EXCLUDED.bench_name,
       apparatus_state = EXCLUDED.apparatus_state,
       safety_alerts = EXCLUDED.safety_alerts,
       status = EXCLUDED.status,
       last_heartbeat = NOW(),
       teacher_id = COALESCE(EXCLUDED.teacher_id, live_lab_telemetry.teacher_id),
       school_id = COALESCE(EXCLUDED.school_id, live_lab_telemetry.school_id)
     RETURNING id, student_id, practical_type, bench_name, apparatus_state, safety_alerts, status, last_heartbeat`,
    [
      studentId,
      teacherId,
      schoolId,
      sessionToken,
      practicalType,
      benchName,
      JSON.stringify(apparatusState || {}),
      JSON.stringify(safetyAlerts || []),
      status
    ]
  );

  // If there are high-severity safety alerts, log to lab_safety_incidents table
  if (Array.isArray(safetyAlerts) && safetyAlerts.length > 0) {
    for (const alert of safetyAlerts) {
      if (alert.severity === 'danger' || alert.severity === 'critical' || alert.isIncident) {
        await pool.query(
          `INSERT INTO lab_safety_incidents 
             (student_id, teacher_id, school_id, practical_type, severity, alert_code, title, description, apparatus_snapshot)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            studentId,
            teacherId,
            schoolId,
            practicalType,
            alert.severity || 'warning',
            alert.code || 'SAFETY_ALERT',
            alert.title || 'Laboratory Protocol Deviation',
            alert.description || alert.message || 'Safety threshold reached during experiment',
            JSON.stringify(apparatusState || {})
          ]
        ).catch(e => console.warn('[telemetryRepo] safety incident log note:', e.message));
      }
    }
  }

  // Fetch unread teacher interventions for this student to send back in heartbeat response
  const interventionsRes = await pool.query(
    `SELECT id, teacher_id, message, intervention_type, created_at 
     FROM teacher_lab_interventions 
     WHERE student_id = $1 AND is_read = FALSE
     ORDER BY created_at ASC`,
    [studentId]
  ).catch(() => ({ rows: [] }));

  // Mark fetched interventions as read
  if (interventionsRes.rows.length > 0) {
    const ids = interventionsRes.rows.map(i => i.id);
    await pool.query(
      `UPDATE teacher_lab_interventions SET is_read = TRUE WHERE id = ANY($1::int[])`,
      [ids]
    ).catch(() => {});
  }

  return {
    telemetry: result.rows[0],
    interventions: interventionsRes.rows
  };
}

/**
 * Fetch live active lab benches for a teacher or admin.
 * Includes benches that sent a heartbeat within the last 120 seconds.
 */
async function getLiveTelemetry(userId, userRole = 'teacher') {
  await ensureTelemetryTables();
  const isAdmin = userRole === 'admin';

  const whereClause = isAdmin
    ? "t.last_heartbeat >= NOW() - INTERVAL '120 seconds' AND t.status != 'abandoned'"
    : "(t.teacher_id = $1 OR t.teacher_id IS NULL) AND t.last_heartbeat >= NOW() - INTERVAL '120 seconds' AND t.status != 'abandoned'";

  const params = isAdmin ? [] : [userId];

  const query = `
    SELECT 
      t.id,
      t.student_id,
      s.name AS student_name,
      s.email AS student_email,
      s.form,
      t.practical_type,
      t.bench_name,
      t.apparatus_state,
      t.safety_alerts,
      t.status,
      t.started_at,
      t.last_heartbeat,
      ROUND(EXTRACT(EPOCH FROM (NOW() - t.started_at)))::int AS elapsed_seconds,
      ROUND(EXTRACT(EPOCH FROM (NOW() - t.last_heartbeat)))::int AS seconds_since_heartbeat,
      COALESCE(wg.name, t.bench_name) AS effective_bench_name,
      COALESCE(wgm.role, 'Apparatus Operator') AS student_role
    FROM live_lab_telemetry t
    JOIN students s ON s.id = t.student_id
    LEFT JOIN lab_workgroup_members wgm ON wgm.student_id = s.id
    LEFT JOIN lab_workgroups wg ON wg.id = wgm.workgroup_id
    WHERE ${whereClause}
    ORDER BY t.last_heartbeat DESC
  `;

  const result = await pool.query(query, params).catch(err => {
    console.warn('[telemetryRepo] getLiveTelemetry fallback:', err.message);
    return { rows: [] };
  });

  const benches = result.rows || [];

  // Fetch recent safety incidents (last 2 hours)
  const incidentsWhere = isAdmin
    ? "created_at >= NOW() - INTERVAL '2 hours'"
    : "(teacher_id = $1 OR teacher_id IS NULL) AND created_at >= NOW() - INTERVAL '2 hours'";

  const incidentsQuery = `
    SELECT 
      i.id,
      i.student_id,
      s.name AS student_name,
      s.form,
      i.practical_type,
      i.severity,
      i.alert_code,
      i.title,
      i.description,
      i.apparatus_snapshot,
      i.created_at
    FROM lab_safety_incidents i
    JOIN students s ON s.id = i.student_id
    WHERE ${incidentsWhere}
    ORDER BY i.created_at DESC
    LIMIT 20
  `;

  const incidentsRes = await pool.query(incidentsQuery, params).catch(() => ({ rows: [] }));

  // Compute aggregate live metrics
  const activeCount = benches.length;
  const safetyAlertCount = benches.reduce((acc, b) => acc + (Array.isArray(b.safety_alerts) ? b.safety_alerts.length : 0), 0);
  const avgElapsed = activeCount > 0
    ? Math.round(benches.reduce((acc, b) => acc + (b.elapsed_seconds || 0), 0) / activeCount)
    : 0;

  return {
    timestamp: new Date().toISOString(),
    metrics: {
      activeStudents: activeCount,
      activeBenches: new Set(benches.map(b => b.effective_bench_name)).size,
      safetyAlertCount,
      avgElapsedSeconds: avgElapsed,
      protocolCompliancePct: activeCount > 0 ? Math.round(((activeCount - safetyAlertCount) / activeCount) * 100) : 100
    },
    benches,
    recentIncidents: incidentsRes.rows || []
  };
}

/**
 * Send an instructor intervention message to a student's active lab bench.
 */
async function createIntervention(teacherId, { studentId, message, interventionType = 'guidance' }) {
  await ensureTelemetryTables();
  const cleanMsg = (message || '').trim();
  if (!cleanMsg) {
    throw new Error('Intervention message cannot be empty.');
  }

  const sId = parseInt(studentId, 10);
  if (isNaN(sId)) throw new Error('Invalid student ID.');

  const result = await pool.query(
    `INSERT INTO teacher_lab_interventions (teacher_id, student_id, message, intervention_type)
     VALUES ($1, $2, $3, $4)
     RETURNING id, teacher_id, student_id, message, intervention_type, created_at`,
    [teacherId, sId, cleanMsg, interventionType]
  );

  return result.rows[0];
}

/**
 * Simulate live laboratory class feed for testing or demonstration purposes.
 * Creates realistic telemetry snapshots for enrolled students across practical modules.
 */
async function simulateClassFeed(userId, userRole = 'teacher') {
  await ensureTelemetryTables();
  const isAdmin = userRole === 'admin';

  // Fetch up to 6 students to populate the live benches
  const studentQuery = isAdmin
    ? 'SELECT id, name, form FROM students ORDER BY id ASC LIMIT 6'
    : 'SELECT id, name, form FROM students WHERE teacher_id = $1 ORDER BY id ASC LIMIT 6';
  const studentParams = isAdmin ? [] : [userId];

  const studentsRes = await pool.query(studentQuery, studentParams).catch(() => ({ rows: [] }));
  const students = studentsRes.rows;

  if (students.length === 0) {
    throw new Error('No students found to simulate laboratory telemetry. Please enroll or import students first.');
  }

  const simulations = [
    {
      practicalType: 'titration',
      benchName: 'Bench 1: Burette Station',
      apparatusState: {
        analyte: 'HCl (0.10 M)',
        titrant: 'NaOH (0.10 M)',
        buretteVolumeDispensed: 18.40,
        targetEquivalence: 20.00,
        currentPH: 4.65,
        indicator: 'Phenolphthalein',
        flaskColor: 'Colorless (Acidic)',
        dropRateDps: 2.1
      },
      safetyAlerts: []
    },
    {
      practicalType: 'titration',
      benchName: 'Bench 2: Redox Station',
      apparatusState: {
        analyte: 'FeSO4 (0.05 M)',
        titrant: 'KMnO4 (0.02 M)',
        buretteVolumeDispensed: 24.80,
        targetEquivalence: 25.00,
        currentPH: 1.80,
        indicator: 'Self-indicating (KMnO4)',
        flaskColor: 'Faint permanent pink',
        dropRateDps: 0.5
      },
      safetyAlerts: [
        { code: 'BURST_RISK', severity: 'warning', title: 'Slow Stopcock Approach', message: 'Within 0.20 cm³ of endpoint' }
      ]
    },
    {
      practicalType: 'qualitative',
      benchName: 'Bench 3: Salt Analysis Rig',
      apparatusState: {
        unknownSalt: 'Sample C (CuSO4)',
        reagentAdded: 'Aqueous Ammonia (NH3)',
        precipitate: 'Pale blue precipitate dissolving in excess to form deep blue solution',
        inferredCation: 'Cu2+ (Copper II)',
        flameTest: 'Green-Blue flame'
      },
      safetyAlerts: []
    },
    {
      practicalType: 'energy',
      benchName: 'Bench 4: Calorimeter Rig',
      apparatusState: {
        reaction: 'Zn(s) + CuSO4(aq) Displacement',
        initialTempT1: 21.5,
        currentTempLive: 34.2,
        peakTempT2: 34.2,
        deltaT: 12.7,
        enthalpyDeltaHKJ: -218.4,
        heatLossRate: 0.05
      },
      safetyAlerts: []
    },
    {
      practicalType: 'organic',
      benchName: 'Bench 5: Functional Groups',
      apparatusState: {
        unknownCompound: 'Sample O (Ethanol)',
        testA_BromineWater: 'No decolourisation (Saturated)',
        testB_AcidifiedDichromate: 'Orange to green colour change (Cr3+ formed)',
        testC_SodiumCarbonate: 'No effervescence (Not carboxylic acid)',
        inferredGroup: 'Alkanol (Primary Alcohol)'
      },
      safetyAlerts: []
    },
    {
      practicalType: 'rates',
      benchName: 'Bench 6: Kinetics Bench',
      apparatusState: {
        reaction: 'Na2S2O3 + HCl Thiosulphate cross test',
        concentrationM: 0.20,
        temperatureC: 45.0,
        elapsedSeconds: 28,
        crossVisible: false,
        rateInverseTime: 0.0357
      },
      safetyAlerts: []
    }
  ];

  const simulatedBenches = [];
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const sim = simulations[i % simulations.length];

    await recordHeartbeat(s.id, {
      practicalType: sim.practicalType,
      benchName: sim.benchName,
      apparatusState: sim.apparatusState,
      safetyAlerts: sim.safetyAlerts,
      status: 'active'
    });
    simulatedBenches.push({ student: s.name, bench: sim.benchName, module: sim.practicalType });
  }

  return {
    success: true,
    message: `Initialized ${simulatedBenches.length} active live student telemetry feeds.`,
    simulatedBenches
  };
}

module.exports = {
  ensureTelemetryTables,
  recordHeartbeat,
  getLiveTelemetry,
  createIntervention,
  simulateClassFeed
};
