// ============================================================
//  VirtuLab Kenya — AI Practical Tutor & Voice Assistant Widget
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

  function initAiTutorWidget() {
    if (document.getElementById('vlk-ai-fab-btn')) return;

    const container = document.createElement('div');
    container.className = 'vlk-ai-widget-container';
    container.innerHTML = `
      <div class="vlk-ai-panel" id="vlk-ai-tutor-panel">
        <div class="vlk-ai-header">
          <h3>🤖 Mwalimu AI Tutor & Voice Assistant</h3>
          <button class="vlk-ai-close" id="vlk-ai-close-btn">&times;</button>
        </div>
        <div class="vlk-ai-body">
          <div class="vlk-ai-chips">
            <button class="vlk-ai-chip" data-prompt="How do I get concordant titre readings?">💡 Concordant Titres</button>
            <button class="vlk-ai-chip" data-prompt="What reagent tests for Sulfate ions?">🧪 Cation/Anion Tests</button>
            <button class="vlk-ai-chip" data-prompt="How to distinguish Alkenes from Alkanes?">🔥 Organic Tests</button>
            <button class="vlk-ai-chip" data-prompt="Help me understand this color change.">🎨 Color Changes</button>
          </div>
          <div style="margin-bottom:8px;font-size:0.78rem;color:var(--text-muted);">Ask Mwalimu AI or request a KCSE practical hint:</div>
          <div style="display:flex;gap:6px;">
            <input type="text" id="vlk-ai-query-input" placeholder="Type your practical question..." style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--card-border);background:var(--bg-dark);color:var(--text-main);font-size:0.82rem;outline:none;" />
            <button id="vlk-ai-send-btn" style="padding:8px 14px;background:var(--blue-accent);color:#FFF;border:none;border-radius:8px;font-weight:700;cursor:pointer;">Ask</button>
          </div>
          <div class="vlk-ai-response-box" id="vlk-ai-response-box">
            <div id="vlk-ai-response-text">Select a prompt chip or ask a question above.</div>
            <div style="margin-top:10px; display:flex; justify-content:flex-end;">
              <button type="button" id="vlk-ai-speech-btn" class="btn" style="display:none; padding:4px 12px; font-size:0.75rem; font-weight:700; border-radius:100px;">🔊 Listen Voice</button>
            </div>
          </div>
        </div>
      </div>
      <button class="vlk-ai-fab" id="vlk-ai-fab-btn" title="Mwalimu AI Voice Assistant">🤖</button>
    `;
    document.body.appendChild(container);

    const fab = document.getElementById('vlk-ai-fab-btn');
    const panel = document.getElementById('vlk-ai-tutor-panel');
    const closeBtn = document.getElementById('vlk-ai-close-btn');
    const sendBtn = document.getElementById('vlk-ai-send-btn');
    const queryInput = document.getElementById('vlk-ai-query-input');
    const responseBox = document.getElementById('vlk-ai-response-box');
    const responseText = document.getElementById('vlk-ai-response-text');
    const speechBtn = document.getElementById('vlk-ai-speech-btn');

    fab.addEventListener('click', () => panel.classList.toggle('active'));
    closeBtn.addEventListener('click', () => panel.classList.remove('active'));

    if (speechBtn) {
      speechBtn.addEventListener('click', () => {
        if (window.VLKVoice.isSpeaking) {
          window.VLKVoice.stop();
        } else {
          window.VLKVoice.speak(responseText.innerText);
        }
      });
    }

    document.querySelectorAll('.vlk-ai-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        queryInput.value = chip.dataset.prompt;
        sendQuery(chip.dataset.prompt);
      });
    });

    sendBtn.addEventListener('click', () => {
      if (queryInput.value.trim()) sendQuery(queryInput.value.trim());
    });

    async function sendQuery(queryStr) {
      responseBox.classList.add('active');
      if (speechBtn) speechBtn.style.display = 'none';
      responseText.innerText = '🤔 Analyzing KCSE practical context...';
      try {
        const data = await apiRequest('POST', '/feedback/tutor-hint', {
          experimentType: document.title || 'Chemistry Practical',
          studentQuery: queryStr,
          studyMode: 'guided'
        });
        if (data.hint) {
          responseText.innerText = data.hint;
          if (speechBtn) speechBtn.style.display = 'inline-block';
        } else {
          responseText.innerText = 'Unable to generate hint at this time.';
        }
      } catch (err) {
        responseText.innerText = err.message || 'AI Assistant is currently unavailable.';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAiTutorWidget);
  } else {
    initAiTutorWidget();
  }
})();
