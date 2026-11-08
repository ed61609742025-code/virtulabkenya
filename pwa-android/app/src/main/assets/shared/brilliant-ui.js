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

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && bAudioCtx && bAudioCtx.state === 'running') {
      bAudioCtx.suspend().catch(() => {});
    }
  });

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
    if (
      document.getElementById('vlkBrilliantBottomNav') ||
      document.getElementById('vlkBottomNav') ||
      document.querySelector('.vlk-bottom-nav') ||
      document.querySelector('.mobile-bottom-nav') ||
      document.querySelector('.b-mobile-bottom-nav') ||
      document.body.classList.contains('no-bottom-nav')
    ) return;
    
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
          href: `${basePath}reference.html`,
          icon: '📚',
          label: 'Revision',
          match: ['reference.html']
        },
        {
          id: 'nav-analytics',
          href: `${basePath}history.html`,
          icon: '📊',
          label: 'History',
          match: ['history.html', 'certificate.html']
        },
        {
          id: 'nav-profile',
          href: `${basePath}profile.html`,
          icon: '👤',
          label: 'Me',
          match: ['profile.html']
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

  // ── 7. Dynamic Scroll-Hide / Show for Mobile Bottom Navigation (Twitter / X style) ──
  function initScrollAwareBottomNav() {
    let lastScrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
    let ticking = false;
    const scrollThreshold = 10; // Threshold in px to prevent micro-jitter

    function updateNavVisibility() {
      const currentScrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || (document.body ? document.body.scrollTop : 0) || 0);
      const navElements = document.querySelectorAll('.vlk-bottom-nav, .mobile-bottom-nav, .b-mobile-bottom-nav');
      if (!navElements.length) return;

      const diff = currentScrollY - lastScrollY;

      // Always show when close to the top of the page (within first 60px)
      if (currentScrollY <= 60) {
        navElements.forEach(el => el.classList.remove('nav-hidden'));
        lastScrollY = currentScrollY;
        return;
      }

      // Always show when reaching the very bottom of the document
      const windowHeight = window.innerHeight;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );
      if (windowHeight + currentScrollY >= docHeight - 35) {
        navElements.forEach(el => el.classList.remove('nav-hidden'));
        lastScrollY = currentScrollY;
        return;
      }

      // Check scroll direction once beyond the threshold
      if (Math.abs(diff) >= scrollThreshold) {
        if (diff > 0) {
          // Scrolling down the page (reading downward) -> slide down to hide
          navElements.forEach(el => el.classList.add('nav-hidden'));
        } else {
          // Scrolling up the page (back to top) -> slide up to show
          navElements.forEach(el => el.classList.remove('nav-hidden'));
        }
        lastScrollY = currentScrollY;
      }
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateNavVisibility();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Show nav on resize or orientation change
    window.addEventListener('resize', () => {
      const navElements = document.querySelectorAll('.vlk-bottom-nav, .mobile-bottom-nav, .b-mobile-bottom-nav');
      navElements.forEach(el => el.classList.remove('nav-hidden'));
    }, { passive: true });

    // Hide bottom nav when soft keyboard pops up on mobile form inputs
    window.addEventListener('focusin', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
        const navElements = document.querySelectorAll('.vlk-bottom-nav, .mobile-bottom-nav, .b-mobile-bottom-nav');
        navElements.forEach(el => el.classList.add('nav-hidden'));
      }
    }, { passive: true });

    window.addEventListener('focusout', () => {
      const navElements = document.querySelectorAll('.vlk-bottom-nav, .mobile-bottom-nav, .b-mobile-bottom-nav');
      navElements.forEach(el => el.classList.remove('nav-hidden'));
    }, { passive: true });
  }

  // ── Public API ───────────────────────────────────────────────
  window.BrilliantUI = {
    audio: BrilliantAudio,
    vibrate: triggerHaptic,
    renderSegmentedProgress,
    setupChoiceCards,
    initNav: initMobileBottomNav,
    initScrollNav: initScrollAwareBottomNav
  };

  function boot() {
    initMobileBottomNav();
    initScrollAwareBottomNav();
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
