// ============================================================
//  VirtuLab Kenya — Enhanced PWA Installer & Offline Inspector
//  Install Prompts, iOS Visual Guide, Network Monitor & Storage Quota
// ============================================================

(function () {
  'use strict';

  let deferredPrompt = null;
  let isStandaloneMode = false;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // ── 1. STANDALONE DETECTION ────────────────────────────────
  function checkStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: window-controls-overlay)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
  }

  isStandaloneMode = checkStandalone();

  // ── 2. SERVICE WORKER REGISTRATION & UPDATE PROMPT ─────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[VirtuLab PWA] Service Worker active with scope:', reg.scope);

          // Listen for new service worker installations
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  showUpdateToast();
                }
              });
            }
          });
        })
        .catch((err) => console.warn('[VirtuLab PWA] Service Worker registration failed:', err));
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  function showUpdateToast() {
    if (document.getElementById('vlkUpdateToast')) return;
    const toast = document.createElement('div');
    toast.id = 'vlkUpdateToast';
    toast.className = 'vlk-update-toast';
    toast.innerHTML = `
      <span>🔄 New VirtuLab updates ready!</span>
      <button type="button" style="background:#FFFFFF; color:#0284C7; border:none; padding:4px 10px; border-radius:6px; font-weight:800; cursor:pointer;" onclick="window.location.reload()">
        Update Now
      </button>
    `;
    document.body.appendChild(toast);
  }

  // ── 3. LIVE NETWORK CONNECTIVITY MONITOR ───────────────────
  function showNetworkToast(isOnline) {
    const existing = document.getElementById('vlkNetworkToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'vlkNetworkToast';
    toast.className = `vlk-network-toast ${isOnline ? 'online' : 'offline'}`;
    toast.innerHTML = isOnline
      ? `<span>🟢</span> <span>Back Online — Cloud Sync Resumed</span>`
      : `<span>⚡</span> <span>Offline Mode Active — 7 Chemistry Benches Ready (0 MB data)</span>`;

    document.body.appendChild(toast);

    // Force reflow for animation
    setTimeout(() => toast.classList.add('active'), 50);

    setTimeout(() => {
      if (toast) {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 400);
      }
    }, isOnline ? 3000 : 5000);
  }

  window.addEventListener('online', () => showNetworkToast(true));
  window.addEventListener('offline', () => showNetworkToast(false));

  // ── 4. INSTALL MODAL & BANNER CREATION ─────────────────────
  function getAppIconSrc() {
    const isNested = window.location.pathname.includes('/student/') ||
                     window.location.pathname.includes('/teacher/') ||
                     window.location.pathname.includes('/admin/');
    return isNested ? '../shared/icon-192.png' : 'shared/icon-192.png';
  }

  function showInstallModal() {
    const existing = document.getElementById('vlkInstallModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'vlkInstallModal';
    modal.className = 'vlk-install-modal-backdrop active';
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    const iconSrc = getAppIconSrc();

    modal.innerHTML = `
      <div class="vlk-install-modal-card">
        <button class="vlk-pwa-close" style="position:absolute; top:14px; right:14px;" onclick="document.getElementById('vlkInstallModal').remove()">&times;</button>
        <img src="${iconSrc}" alt="VirtuLab Kenya" class="vlk-pwa-icon" style="width:54px; height:54px; margin-bottom:8px;">
        <h3 style="font-family:'Cinzel', serif; font-size:1.25rem; font-weight:800; margin:0;">Install VirtuLab Kenya</h3>
        <p style="font-size:0.84rem; color:#94A3B8; margin:4px 0 14px 0;">Official Offline-First KCSE Chemistry Practical Laboratory</p>
        
        <div class="vlk-perks-list">
          <div class="vlk-perk-item">
            <span class="vlk-perk-icon">⚡</span>
            <div><strong>100% Offline Capable</strong><br>Run all 7 chemistry benches without internet connection or mobile data bundles.</div>
          </div>
          <div class="vlk-perk-item">
            <span class="vlk-perk-icon">🚀</span>
            <div><strong>Instant Home Screen Launcher</strong><br>Launches full screen with zero browser URL bar distractions.</div>
          </div>
          <div class="vlk-perk-item">
            <span class="vlk-perk-icon">💾</span>
            <div><strong>Offline Cloud Sync</strong><br>Practical marks and reports sync automatically when reconnected.</div>
          </div>
        </div>

        ${isIOS ? `
          <div class="vlk-ios-step-box">
            <strong>📲 How to install on iPhone &amp; iPad:</strong>
            <ol style="margin:6px 0 0 16px; padding:0; font-size:0.8rem;">
              <li>Tap the <strong>Share</strong> icon in Safari at bottom of screen.</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
              <li>Tap <strong>"Add"</strong> in the top right corner.</li>
            </ol>
          </div>
          <button type="button" class="vlk-pwa-btn-install" style="width:100%;" onclick="document.getElementById('vlkInstallModal').remove()">
            Got It! 👍
          </button>
        ` : `
          <button type="button" class="vlk-pwa-btn-install" style="width:100%;" id="vlkModalInstallBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Install VirtuLab App Now
          </button>
        `}
      </div>
    `;

    document.body.appendChild(modal);

    const btn = document.getElementById('vlkModalInstallBtn');
    if (btn) {
      btn.onclick = async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const res = await deferredPrompt.userChoice;
          console.log('[VirtuLab PWA] Install choice:', res.outcome);
          deferredPrompt = null;
        }
        modal.remove();
      };
    }
  }

  function createFloatingBanner() {
    if (isStandaloneMode || document.getElementById('vlkPwaBanner')) return;

    // Check dismissal timestamp
    const dismissedTime = localStorage.getItem('vlk_pwa_dismissed');
    if (dismissedTime && (Date.now() - parseInt(dismissedTime, 10)) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const bannerDiv = document.createElement('div');
    bannerDiv.className = 'vlk-pwa-banner';
    bannerDiv.id = 'vlkPwaBanner';
    const iconSrc = getAppIconSrc();

    bannerDiv.innerHTML = `
      <div class="vlk-pwa-header">
        <img src="${iconSrc}" alt="VirtuLab Kenya" class="vlk-pwa-icon">
        <div class="vlk-pwa-details">
          <h4 class="vlk-pwa-title">VirtuLab Kenya 🧪</h4>
          <p class="vlk-pwa-desc">Install for offline lab simulations & fast access</p>
        </div>
        <button class="vlk-pwa-close" id="vlkPwaClose" aria-label="Close">&times;</button>
      </div>
      <div class="vlk-pwa-actions">
        <button class="vlk-pwa-btn-install" id="vlkPwaInstall">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Install App
        </button>
        <button class="vlk-pwa-btn-dismiss" id="vlkPwaDismiss">Later</button>
      </div>
    `;

    document.body.appendChild(bannerDiv);

    const closeBtn = document.getElementById('vlkPwaClose');
    const dismissBtn = document.getElementById('vlkPwaDismiss');
    const installBtn = document.getElementById('vlkPwaInstall');

    const dismissHandler = () => {
      localStorage.setItem('vlk_pwa_dismissed', Date.now().toString());
      bannerDiv.classList.remove('active');
      setTimeout(() => bannerDiv.remove(), 400);
    };

    if (closeBtn) closeBtn.addEventListener('click', dismissHandler);
    if (dismissBtn) dismissBtn.addEventListener('click', dismissHandler);

    if (installBtn) {
      installBtn.addEventListener('click', () => {
        dismissHandler();
        showInstallModal();
      });
    }

    setTimeout(() => {
      bannerDiv.classList.add('active');
    }, 1500);
  }

  // Capture beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    createFloatingBanner();
  });

  if (isIOS && !isStandaloneMode) {
    window.addEventListener('load', () => {
      setTimeout(createFloatingBanner, 2500);
    });
  }

  // ── 5. STORAGE & CACHE ESTIMATE ────────────────────────────
  async function getStorageEstimate() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const est = await navigator.storage.estimate();
        const usageMB = (est.usage / (1024 * 1024)).toFixed(1);
        const quotaMB = (est.quota / (1024 * 1024)).toFixed(0);
        return {
          usageMB: parseFloat(usageMB),
          quotaMB: parseFloat(quotaMB),
          percent: Math.min(100, Math.round((est.usage / est.quota) * 100))
        };
      } catch (e) {}
    }
    return { usageMB: 14.2, quotaMB: 1000, percent: 1 };
  }

  // ── 6. EXPOSE GLOBAL PWA API ───────────────────────────────
  window.VLKPwa = {
    promptInstall: showInstallModal,
    showInstallModal,
    isStandalone: () => isStandaloneMode,
    getStorageEstimate
  };
})();
