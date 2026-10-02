// ============================================================
//  VirtuLab Kenya — Client Constants & Chemistry Reference Config
// ============================================================

const VLK_CONFIG = {
  BURETTE_CAPACITY: 50.0,
  PIPETTE_DEFAULT: 25.0,
  TITRATION_TOLERANCE: 0.02,
  EXAM_TIMER_SECONDS: 900,
  COMPOSITE_EXAM_TIMER_SECONDS: 2700,
  RAM_VALUES: {
    H: 1.0,
    C: 12.0,
    N: 14.0,
    O: 16.0,
    Na: 23.0,
    S: 32.0,
    Cl: 35.5,
    K: 39.1,
    Ca: 40.1,
    Mn: 54.9,
    Fe: 55.8,
    Cu: 63.5,
    Zn: 65.4,
    Ba: 137.3
  }
};

if (typeof window !== 'undefined') {
  window.VLK_CONFIG = VLK_CONFIG;
}
