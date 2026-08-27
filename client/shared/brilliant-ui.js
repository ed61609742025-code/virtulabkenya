// ============================================================
//  VirtuLab Kenya — Brilliant UI & Mobile Navigation Engine
//  Tactile Buttons, Haptics, Audio Cues & Mobile Bottom Nav
// ============================================================

(function () {
  'use strict';

  // ── 1. Web Audio Micro-Synth (100% Offline Cues) ─────────────
  let bAudioCtx = null;
  let hasUserInteracted = false;

  function markUserInteraction() {
    hasUserInteracted = true;
    if (bAudioCtx && bAudioCtx.state === 'suspended') {
      bAudioCtx.resume().catch(() => {});
    }
    window.removeEventListener('pointerdown', markUserInteraction, true);
    window.removeEventListener('keydown', markUserInteraction, true);
    window.removeEventListener('touchstart', markUserInteraction, true);
  }
  window.addEventListener('pointerdown', markUserInteraction, { capture: true, passive: true });
  window.addEventListener('keydown', markUserInteraction, { capture: true, passive: true });
  window.addEventListener('touchstart', markUserInteraction, { capture: true, passive: true });

  function getBAudioCtx() {
    if (!hasUserInteracted) return null;
    if (!bAudioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        bAudioCtx = new AudioContextClass();
      }
    }
    if (bAudioCtx && bAudioCtx.state === 'suspended') {
      bAudioCtx.resume().catch(() => {});
    }
    return bAudioCtx;
  }

  const BrilliantAudio = {
    playClick() {
      try {
        const ctx = getBAudioCtx();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } catch (e) {}
    },

    playSuccess() {
      try {
        const ctx = getBAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          gain.gain.setValueAtTime(0.08, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.18);
        });
      } catch (e) {}
    },

    playIncorrect() {
      try {
        const ctx = getBAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.15);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } catch (e) {}
    }
  };

  // ── 2. Haptic Vibration ───────────────────────────────────────
  function triggerHaptic(pattern = 10) {
    if (!hasUserInteracted) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // ── 3. Global Click Interceptor for Tactile Feedback ─────────
  document.addEventListener('pointerdown', (e) => {
    const tactileBtn = e.target.closest('.btn-tactile, .btn-brilliant, .b-choice-card, .b-nav-item, .nav-btn-chip');
    if (tactileBtn && !tactileBtn.hasAttribute('disabled')) {
      BrilliantAudio.playClick();
      triggerHaptic(8);
    }
  }, { passive: true });

  // ── 4. Universal Mobile Bottom Navigation Bar Injection ──────
  function initMobileBottomNav() {
    // Only inject in student pages
    const isStudentPage = window.location.pathname.includes('/student/') || 
                          (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html'));
    
    // Avoid double injection if hardcoded or already inserted
    if (document.getElementById('vlkBrilliantBottomNav') || document.querySelector('.mobile-bottom-nav')) return;
    
    if (isStudentPage) {
      document.body.classList.add('has-bottom-nav');
      
      const navEl = document.createElement('nav');
      navEl.className = 'b-mobile-bottom-nav';
      navEl.id = 'vlkBrilliantBottomNav';
      navEl.setAttribute('aria-label', 'Student Navigation');

      const currentPath = window.location.pathname.toLowerCase();

      // Resolve base path
      const isNested = currentPath.includes('/student/');
      const basePath = isNested ? '' : 'student/';

      const navItems = [
        {
          id: 'nav-workbenches',
          href: `${basePath}home.html`,
          icon: '🧪',
          label: 'Workbenches',
          match: ['home.html', '/client/index.html', '/index.html', '/']
        },
        {
          id: 'nav-revision',
          href: `${basePath}home.html#reference`,
          icon: '📚',
          label: 'Revision',
          match: ['#reference']
        },
        {
          id: 'nav-badges',
          href: `${basePath}home.html#achievements`,
          icon: '🏆',
          label: 'Badges',
          match: ['#achievements']
        },
        {
          id: 'nav-analytics',
          href: `${basePath}history.html`,
          icon: '📊',
          label: 'Analytics',
          match: ['history.html', 'certificate.html']
        }
      ];

      navEl.innerHTML = navItems.map((item) => {
        const isActive = item.match.some((m) => currentPath.endsWith(m) || (m === '/' && (currentPath === '/' || currentPath === '')));
        return `
          <a href="${item.href}" class="b-nav-item ${isActive ? 'active' : ''}" id="${item.id}">
            <span class="b-nav-icon">${item.icon}</span>
            <span>${item.label}</span>
            ${item.badge ? '<span class="b-nav-badge-dot"></span>' : ''}
          </a>
        `;
      }).join('');

      document.body.appendChild(navEl);
    }
  }

  // ── 5. Segmented Step Progress Bar Renderer ──────────────────
  function renderSegmentedProgress(containerOrId, totalSteps, activeStepIndex) {
    const container = typeof containerOrId === 'string' ? document.getElementById(containerOrId) : containerOrId;
    if (!container) return;

    let html = '<div class="b-progress-segmented" role="progressbar" aria-valuenow="' + (activeStepIndex + 1) + '" aria-valuemin="1" aria-valuemax="' + totalSteps + '">';
    for (let i = 0; i < totalSteps; i++) {
      let stateClass = '';
      if (i < activeStepIndex) stateClass = 'completed';
      else if (i === activeStepIndex) stateClass = 'active';
      html += `
        <div class="b-segment ${stateClass}">
          <div class="b-segment-fill"></div>
        </div>
      `;
    }
    html += '</div>';
    container.innerHTML = html;
  }

  // ── 6. Interactive Choice Card Engine ────────────────────────
  function setupChoiceCards(containerOrId, onSelect) {
    const container = typeof containerOrId === 'string' ? document.getElementById(containerOrId) : containerOrId;
    if (!container) return;

    const cards = container.querySelectorAll('.b-choice-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        if (container.dataset.locked === 'true') return;
        cards.forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        BrilliantAudio.playClick();
        triggerHaptic(10);
        if (typeof onSelect === 'function') {
          onSelect(card.dataset.value || card.innerText.trim(), card);
        }
      });
    });
  }

  // ── Public API ───────────────────────────────────────────────
  window.BrilliantUI = {
    audio: BrilliantAudio,
    vibrate: triggerHaptic,
    renderSegmentedProgress,
    setupChoiceCards,
    initNav: initMobileBottomNav
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileBottomNav);
  } else {
    initMobileBottomNav();
  }
})();
