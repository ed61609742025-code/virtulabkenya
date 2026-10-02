// ============================================================
//  VirtuLab Kenya — Technology Acceptance Model (TAM 3) Engine
//  Evaluating Perceived Usefulness, Ease of Use, & Adoption
// ============================================================

const TAM_ITEMS = [
  // Perceived Usefulness (PU)
  { id: 'PU1', construct: 'PU', text: 'Using VirtuLab Kenya enhances my learning/teaching effectiveness in chemistry practicals.' },
  { id: 'PU2', construct: 'PU', text: 'VirtuLab Kenya improves my performance in KCSE Paper 3 calculations and qualitative analysis.' },
  { id: 'PU3', construct: 'PU', text: 'VirtuLab Kenya enables me to complete laboratory practical tasks and revisions more efficiently.' },
  { id: 'PU4', construct: 'PU', text: 'I find VirtuLab Kenya useful for understanding abstract chemical reactions.' },

  // Perceived Ease of Use (PEOU)
  { id: 'PEOU1', construct: 'PEOU', text: 'My interaction with VirtuLab Kenya simulations is clear and understandable.' },
  { id: 'PEOU2', construct: 'PEOU', text: 'It is easy for me to become skillful at using VirtuLab Kenya controls (burettes, burners, tests).' },
  { id: 'PEOU3', construct: 'PEOU', text: 'I find VirtuLab Kenya easy to navigate across mobile phones and desktop computers.' },
  { id: 'PEOU4', construct: 'PEOU', text: 'Learning to operate VirtuLab Kenya practical modules was straightforward for me.' },

  // Facilitating Conditions (FC)
  { id: 'FC1', construct: 'FC', text: 'I have the necessary access (smartphone, tablet, or PC) to practice on VirtuLab Kenya.' },
  { id: 'FC2', construct: 'FC', text: 'The offline PWA capability makes it convenient to practice without constant internet.' },
  { id: 'FC3', construct: 'FC', text: 'Guidance and Socratic feedback in the platform help me when I encounter difficulties.' },

  // Behavioral Intention (BI)
  { id: 'BI1', construct: 'BI', text: 'I intend to continue using VirtuLab Kenya throughout my secondary school studies/teaching.' },
  { id: 'BI2', construct: 'BI', text: 'I predict that I will use VirtuLab Kenya frequently for KCSE Paper 3 practical preparation.' },
  { id: 'BI3', construct: 'BI', text: 'I would strongly recommend VirtuLab Kenya to other Kenyan chemistry learners and educators.' }
];

function calculateTAM(keyedResponses) {
  const groups = { PU: [], PEOU: [], FC: [], BI: [] };
  Object.keys(keyedResponses).forEach(k => {
    const item = TAM_ITEMS.find(i => i.id === k);
    if (item && groups[item.construct]) {
      groups[item.construct].push(parseFloat(keyedResponses[k]) || 3);
    }
  });

  const avg = arr => arr.length ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : 0;

  return {
    PU: avg(groups.PU),
    PEOU: avg(groups.PEOU),
    FC: avg(groups.FC),
    BI: avg(groups.BI),
    compositeMean: avg([...groups.PU, ...groups.PEOU, ...groups.FC, ...groups.BI])
  };
}

if (typeof window !== 'undefined') {
  window.TAM_ITEMS = TAM_ITEMS;
  window.calculateTAM = calculateTAM;
}
