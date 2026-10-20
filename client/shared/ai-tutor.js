// ============================================================
//  VirtuLab Kenya — AI Practical Tutor & Voice Assistant Widget
//  Mwalimu AI: Context-Aware Socratic Chemistry Coach
// ============================================================

// Global Voice Synthesis Helper
window.VLKVoice = {
  isSpeaking: false,
  speak(text) {
    if (!('speechSynthesis' in window)) {
      alert('Web Speech Synthesis is not supported in your browser.');
      return;
    }
    this.stop();
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/[^\w\s.,?!'()-]/gi, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Clear speaking speed for educational clarity
    utterance.pitch = 1.0;
    
    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('UK') || v.name.includes('US')));
    if (preferredVoice) utterance.voice = preferredVoice;

    this.isSpeaking = true;
    utterance.onend = () => { this.isSpeaking = false; updateSpeechBtnState(false); };
    utterance.onerror = () => { this.isSpeaking = false; updateSpeechBtnState(false); };

    window.speechSynthesis.speak(utterance);
    updateSpeechBtnState(true);
  },
  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      updateSpeechBtnState(false);
    }
  }
};

function updateSpeechBtnState(speaking) {
  const btn = document.getElementById('vlk-ai-speech-btn');
  if (btn) {
    btn.innerHTML = speaking ? '⏸️ Stop Speech' : '🔊 Listen Voice';
    btn.classList.toggle('speaking', speaking);
  }
}

// ── Universal Laboratory Context Hook ──
window.VLK = window.VLK || {};
if (window.VLK._pendingContextProvider && !window.VLK._labContextProvider) {
  window.VLK._labContextProvider = window.VLK._pendingContextProvider;
}

window.VLK.registerLabContext = function(providerFn) {
  window.VLK._labContextProvider = providerFn;
  if (typeof window.VLK._onContextRegistered === 'function') {
    try { window.VLK._onContextRegistered(); } catch(e) {}
  }
};

window.VLK.getLabContext = function() {
  if (typeof window.VLK._labContextProvider === 'function') {
    try {
      const custom = window.VLK._labContextProvider();
      if (custom && typeof custom === 'object') return custom;
    } catch(err) {
      console.warn('[AI Tutor] Context provider error:', err);
    }
  }

  // Fallback: Autonomous DOM inspection across VirtuLab Kenya workbenches
  const path = window.location.pathname.toLowerCase();
  const ctx = {
    labType: 'Chemistry Practical',
    practicalTitle: document.title || 'VirtuLab Workbench',
    stage: 'Active Practice',
    lastErrorOrFeedback: null
  };

  if (path.includes('lab.html')) {
    ctx.labType = 'Volumetric Analysis (Titration)';
    const titrantConcEl = document.getElementById('titrantConcVal');
    const buretteVolEl = document.getElementById('volumeDisplay');
    if (titrantConcEl) ctx.titrant = titrantConcEl.textContent;
    if (buretteVolEl) ctx.buretteVolume = buretteVolEl.textContent;
  } else if (path.includes('qualitative.html')) {
    ctx.labType = 'Qualitative Salt Analysis';
    const spec = document.getElementById('specimenTitle') || document.getElementById('sampleIdBadge');
    if (spec) ctx.practicalTitle = spec.textContent;
  } else if (path.includes('gas_prep.html')) {
    ctx.labType = 'Gas Preparation & Collection';
    const sub = document.getElementById('knecSubbarGas');
    if (sub) ctx.gasName = sub.textContent;
  } else if (path.includes('organic.html')) {
    ctx.labType = 'Organic Chemistry Qualitative Analysis';
  } else if (path.includes('rates.html')) {
    ctx.labType = 'Reaction Rates & Chemical Kinetics';
  } else if (path.includes('energy.html')) {
    ctx.labType = 'Thermochemistry & Energy Changes';
  } else if (path.includes('solubility.html')) {
    ctx.labType = 'Solubility Curves & Crystallization';
  }

  // Look for any visible error/warning alert on page
  const alertEl = document.querySelector('.alert-error, .alert-warning, .feedback-card.error, .obs-entry.warn');
  if (alertEl && alertEl.offsetParent !== null) {
    ctx.lastErrorOrFeedback = alertEl.innerText.trim().slice(0, 160);
  }

  return ctx;
};

(function() {
  // Strict Directive: Do not run in formal assignments or composite exams
  function isAssessmentMode() {
    const url = window.location.href.toLowerCase();
    if (url.includes('composite_exam.html')) return true;
    const params = new URLSearchParams(window.location.search);
    const studyMode = params.get('mode') || params.get('studyMode');
    if (studyMode === 'assignment' || studyMode === 'exam') return true;
    return false;
  }

  if (isAssessmentMode()) {
    console.log('[AI Practical Tutor] Disabled in formal assessment/exam mode.');
    return;
  }

  let conversationHistory = [];

  function initAiTutorWidget() {
    if (document.getElementById('vlk-ai-fab-btn')) return;

    const container = document.createElement('div');
    container.className = 'vlk-ai-widget-container';
    container.innerHTML = `
      <div class="vlk-ai-panel" id="vlk-ai-tutor-panel">
        <div class="vlk-ai-header">
          <h3>🤖 Mwalimu AI Lab Tutor</h3>
          <div class="vlk-ai-header-actions">
            <button type="button" class="vlk-ai-action-btn" id="vlk-ai-clear-btn" title="Reset conversation">🔄 New</button>
            <button class="vlk-ai-close" id="vlk-ai-close-btn">&times;</button>
          </div>
        </div>
        <div class="vlk-ai-context-banner" id="vlk-ai-context-banner">
          <span class="vlk-ai-context-dot"></span>
          <span id="vlk-ai-context-text" style="overflow:hidden;text-overflow:ellipsis;">Connected to Workbench</span>
        </div>
        <div class="vlk-ai-body">
          <div class="vlk-ai-chips" id="vlk-ai-chips"></div>
          
          <div style="display:flex;gap:6px;margin-bottom:8px;">
            <input type="text" id="vlk-ai-query-input" placeholder="Ask Mwalimu AI about your experiment..." style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--card-border, #232E42);background:var(--bg-dark, #0B1320);color:var(--text-main, #F1F5F9);font-size:0.80rem;outline:none;" />
            <button id="vlk-ai-send-btn" style="padding:8px 14px;background:var(--blue-accent, #3B82F6);color:#FFF;border:none;border-radius:8px;font-weight:700;font-size:0.80rem;cursor:pointer;">Ask</button>
          </div>

          <div class="vlk-ai-chat-thread" id="vlk-ai-chat-thread">
            <div class="vlk-ai-msg assistant" id="vlk-ai-welcome-msg">
              👋 Habari! I am <b>Mwalimu AI</b>, your KCSE Practical Tutor. I'm actively watching your workbench. Click a quick prompt above or ask any question when you get stuck!
            </div>
          </div>

          <div style="margin-top:8px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.70rem;color:var(--text-muted, #94A3B8);">KCSE Paper 3 (233/3) Aligned</span>
            <button type="button" id="vlk-ai-speech-btn" class="btn" style="display:none; padding:4px 10px; font-size:0.72rem; font-weight:700; border-radius:100px; background:var(--card-bg-hover, #1C2638); color:var(--text-main, #F1F5F9); border:1px solid var(--card-border, #232E42); cursor:pointer;">🔊 Listen Voice</button>
          </div>
        </div>
      </div>
      <button class="vlk-ai-fab" id="vlk-ai-fab-btn" title="Mwalimu AI Socratic Tutor">🤖</button>
    `;
    document.body.appendChild(container);

    const fab = document.getElementById('vlk-ai-fab-btn');
    const panel = document.getElementById('vlk-ai-tutor-panel');
    const closeBtn = document.getElementById('vlk-ai-close-btn');
    const clearBtn = document.getElementById('vlk-ai-clear-btn');
    const sendBtn = document.getElementById('vlk-ai-send-btn');
    const queryInput = document.getElementById('vlk-ai-query-input');
    const chatThread = document.getElementById('vlk-ai-chat-thread');
    const speechBtn = document.getElementById('vlk-ai-speech-btn');
    const contextText = document.getElementById('vlk-ai-context-text');
    const chipsContainer = document.getElementById('vlk-ai-chips');

    function updateLiveContextUI() {
      const ctx = window.VLK.getLabContext();
      let summary = ctx.labType || 'Chemistry Lab';
      if (ctx.activeStep) {
        summary += ` · ${ctx.activeStep}`;
      } else if (ctx.gasName) {
        summary += ` · ${ctx.gasName}`;
      } else if (ctx.practicalTitle) {
        summary += ` · ${ctx.practicalTitle}`;
      }
      if (contextText) contextText.textContent = summary;
      renderContextChips(ctx);
    }

    function renderContextChips(ctx) {
      if (!chipsContainer) return;
      chipsContainer.innerHTML = '';
      const labType = (ctx.labType || '').toLowerCase();

      let prompts = [];

      if (ctx.lastErrorOrFeedback) {
        prompts.push({ label: '⚠️ Explain My Last Error', text: `Why did I get this error or observation: "${ctx.lastErrorOrFeedback}"? How should I fix it?` });
      }

      if (labType.includes('titration') || labType.includes('volumetric')) {
        prompts.push(
          { label: '💡 Concordant Titres', text: 'How do I ensure my titre readings are concordant within the KNEC ±0.10 cm³ limit?' },
          { label: '🔢 Moles Calculation', text: 'How do I calculate the moles of titrant and analyte from my average volume?' },
          { label: '⚖️ Mole Ratio Help', text: 'What is the stoichiometric mole ratio in this titration equation and how do I apply it?' },
          { label: '🎨 End-Point Color', text: 'What is the exact color change at the end-point for this indicator?' }
        );
      } else if (labType.includes('qualitative') || labType.includes('salt')) {
        prompts.push(
          { label: '🧪 Cation from Precipitate', text: 'How do I identify my cation from the color of precipitate and its solubility in excess reagent?' },
          { label: '💧 Excess NH₃ Test', text: 'What does solubility in excess aqueous ammonia tell me about Zn²⁺, Al³⁺, and Pb²⁺?' },
          { label: '🔥 Flame Test Identity', text: 'What characteristic flame color should I look for and how do I distinguish Ca²⁺ from Na⁺?' },
          { label: '🫧 Anion Gas Test', text: 'How do I deduce whether the anion is CO₃²⁻, SO₄²⁻, or Cl⁻ from my test observations?' }
        );
      } else if (labType.includes('gas')) {
        prompts.push(
          { label: '🧪 Drying Agent Choice', text: 'Why must certain gases use quicklime (CaO) instead of concentrated H₂SO₄?' },
          { label: '🏺 Collection Method', text: 'Why is this gas collected over water vs downward/upward delivery?' },
          { label: '🔥 Thermal Heating', text: 'Why does this gas reaction require heating over wire gauze while others run cold?' },
          { label: '✨ Confirmatory Test', text: 'What is the definitive confirmatory test for this gas according to KCSE Paper 3?' }
        );
      } else if (labType.includes('organic')) {
        prompts.push(
          { label: '🧪 Bromine Water Test', text: 'What does immediate decolourization of bromine water signify in organic tests?' },
          { label: '🔥 Smoky vs Clean Flame', text: 'What does a yellow luminous sooty flame tell me about the carbon:hydrogen ratio?' },
          { label: '🍋 Alkanol vs Carboxylic', text: 'How do I differentiate an alkanol from an alkanoic acid using sodium carbonate?' },
          { label: '🏷️ Functional Group Deduction', text: 'How do I deduce the correct functional group from my completed observations?' }
        );
      } else if (labType.includes('rate') || labType.includes('kinetic')) {
        prompts.push(
          { label: '⏱️ Disappearing Cross', text: 'How does varying the concentration of sodium thiosulfate affect the reaction rate (1/t)?' },
          { label: '📈 Tangent & Gradient', text: 'How do I draw a tangent at a given time on a gas volume curve to calculate the rate?' },
          { label: '💥 Collision Theory', text: 'How do temperature and surface area increase the frequency of effective collisions?' },
          { label: '⚡ Catalyst Role', text: 'Why does adding a catalyst like MnO₂ lower activation energy without being consumed?' }
        );
      } else if (labType.includes('energy') || labType.includes('thermo')) {
        prompts.push(
          { label: '🔥 Exothermic vs Endothermic', text: 'How do I deduce whether this reaction is exothermic (negative ΔH) or endothermic from temperature changes?' },
          { label: '🔢 Q = mcΔT Heat Formula', text: 'How do I calculate heat evolved using Q = m·c·ΔT and find the molar enthalpy change?' },
          { label: '📉 Extrapolation Graph', text: 'Why must temperature be extrapolated back to the time of mixing on a KNEC thermochemistry cooling curve?' },
          { label: '🕯️ Combustion Enthalpy', text: 'How do I calculate molar heat of combustion from the mass of fuel burned in the spirit lamp?' }
        );
      } else if (labType.includes('solubil') || labType.includes('crystal')) {
        prompts.push(
          { label: '❄️ Crystallization Temp', text: 'How do I identify the exact temperature when crystals first appear upon cooling?' },
          { label: '📊 Solubility (g/100g H₂O)', text: 'How do I calculate solubility in grams of solute per 100g of water from my mass and volume?' },
          { label: '📈 Curve Interpretation', text: 'What does the slope of this solubility curve tell me about the heat of solution?' },
          { label: '💧 Serial Dilution', text: 'Why does adding 2.0 cm³ water increments lower the crystallization temperature in serial dilution?' }
        );
      } else {
        prompts.push(
          { label: '🎯 KCSE Mark Maximizer', text: 'What are the most common mistakes students make on this type of practical?' },
          { label: '📋 Next Step Guidance', text: 'What is the recommended scientific procedure for the next step?' },
          { label: '🔍 Key Observations', text: 'What critical observations should I record to gain full marks?' },
          { label: '⚡ Calculation Help', text: 'Help me understand the formula required for this calculation.' }
        );
      }

      // Render top 4 chips
      prompts.slice(0, 4).forEach(p => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'vlk-ai-chip';
        btn.textContent = p.label;
        btn.addEventListener('click', () => {
          queryInput.value = p.text;
          sendQuery(p.text);
        });
        chipsContainer.appendChild(btn);
      });
    }

    fab.addEventListener('click', () => {
      const isActive = panel.classList.toggle('active');
      if (isActive) {
        updateLiveContextUI();
        queryInput.focus();
      }
    });

    closeBtn.addEventListener('click', () => panel.classList.remove('active'));

    clearBtn.addEventListener('click', () => {
      conversationHistory = [];
      chatThread.innerHTML = `
        <div class="vlk-ai-msg assistant">
          Conversation reset. Ask Mwalimu AI about your current laboratory step!
        </div>
      `;
      if (speechBtn) speechBtn.style.display = 'none';
      queryInput.value = '';
    });

    window.VLK._onContextRegistered = () => {
      if (panel.classList.contains('active')) {
        updateLiveContextUI();
      }
    };

    if (speechBtn) {
      speechBtn.addEventListener('click', () => {
        const lastAssistantMsg = chatThread.querySelector('.vlk-ai-msg.assistant:last-of-type');
        if (!lastAssistantMsg) return;
        if (window.VLKVoice.isSpeaking) {
          window.VLKVoice.stop();
        } else {
          window.VLKVoice.speak(lastAssistantMsg.innerText);
        }
      });
    }

    queryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (queryInput.value.trim()) sendQuery(queryInput.value.trim());
      }
    });

    sendBtn.addEventListener('click', () => {
      if (queryInput.value.trim()) sendQuery(queryInput.value.trim());
    });

    async function sendQuery(queryStr) {
      const welcome = document.getElementById('vlk-ai-welcome-msg');
      if (welcome) welcome.remove();

      // Append user bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'vlk-ai-msg user';
      userBubble.textContent = queryStr;
      chatThread.appendChild(userBubble);

      queryInput.value = '';
      sendBtn.disabled = true;

      // Append typing indicator
      const assistantBubble = document.createElement('div');
      assistantBubble.className = 'vlk-ai-msg assistant';
      assistantBubble.innerHTML = '🤔 <i>Mwalimu AI is analyzing your workbench...</i>';
      chatThread.appendChild(assistantBubble);
      chatThread.scrollTop = chatThread.scrollHeight;

      if (speechBtn) speechBtn.style.display = 'none';

      // Pull fresh live lab context right at query time
      const liveContext = window.VLK.getLabContext();

      try {
        const data = await apiRequest('POST', '/feedback/tutor-hint', {
          experimentType: liveContext.labType || document.title || 'Chemistry Practical',
          context: liveContext,
          studentQuery: queryStr,
          history: conversationHistory,
          studyMode: 'guided'
        });

        if (data && data.hint) {
          assistantBubble.innerHTML = data.hint.replace(/\n/g, '<br>');
          conversationHistory.push({ role: 'user', text: queryStr });
          conversationHistory.push({ role: 'model', text: data.hint });
          if (conversationHistory.length > 8) conversationHistory = conversationHistory.slice(-8);

          if (speechBtn) speechBtn.style.display = 'inline-block';
        } else {
          assistantBubble.textContent = 'Mwalimu AI could not generate guidance right now. Please try again.';
        }
      } catch (err) {
        assistantBubble.textContent = err.message || 'Mwalimu AI is currently offline or unreachable.';
      } finally {
        sendBtn.disabled = false;
        chatThread.scrollTop = chatThread.scrollHeight;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAiTutorWidget);
  } else {
    initAiTutorWidget();
  }
})();
