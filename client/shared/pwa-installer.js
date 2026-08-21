// ============================================================
//  VirtuLab Kenya — Mobile PWA Install Prompt & Service Worker Script
// ============================================================

(function () {
  'use strict';

  // 1. Service Worker Registration & Auto-Update Check
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[VirtuLab PWA] Service Worker registered with scope:', reg.scope);
          // Check for immediate updates
          if (reg.update) reg.update().catch(() => {});
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

  // 2. Check standalone / installed mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true ||
                       document.referrer.includes('android-app://');

  if (isStandalone) {
    console.log('[VirtuLab PWA] Running in native standalone mode.');
    return; // Don't show install banner if already installed and running as PWA
  }

  // Check dismissal timestamp (suppress banner for 7 days if dismissed)
  const dismissedTime = localStorage.getItem('vlk_pwa_dismissed');
  if (dismissedTime && (Date.now() - parseInt(dismissedTime, 10)) < 7 * 24 * 60 * 60 * 1000) {
    return;
  }

  let deferredPrompt = null;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  function createBannerHTML() {
    const bannerDiv = document.createElement('div');
    bannerDiv.className = 'vlk-pwa-banner';
    bannerDiv.id = 'vlkPwaBanner';

    // Resolve robust icon path for relative or root-hosted deployments
    const isNestedPath = window.location.pathname.includes('/student/') || 
                         window.location.pathname.includes('/teacher/') || 
                         window.location.pathname.includes('/admin/');
    const iconSrc = isNestedPath ? '../shared/icon-192.png' : 'shared/icon-192.png';

    bannerDiv.innerHTML = `
      <div class="vlk-pwa-header">
        <img src="${iconSrc}" 
             onerror="this.onerror=null; this.src='../shared/icon-192.png'; if(!this.complete || this.naturalWidth === 0) { this.style.display='none'; const fb = this.nextElementSibling; if(fb) fb.style.display='flex'; }" 
             alt="VirtuLab Kenya" 
             class="vlk-pwa-icon">
        <div class="vlk-pwa-icon-fallback" style="display:none; width:44px; height:44px; border-radius:10px; background:#0B2545; color:#FFF; font-size:1.4rem; align-items:center; justify-content:center; border:1px solid #B8860B;">⚗️</div>
        <div class="vlk-pwa-details">
          <h4 class="vlk-pwa-title">VirtuLab Kenya 🧪</h4>
          <p class="vlk-pwa-desc">Install for offline lab simulations & fast access</p>
        </div>
        <button class="vlk-pwa-close" id="vlkPwaClose" aria-label="Close">&times;</button>
      </div>
      ${isIOS ? `
        <div class="vlk-pwa-ios-instructions">
          <span>📲 To install on iOS: Tap the <strong>Share</strong> button <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> then select <strong>Add to Home Screen</strong></span>
        </div>
      ` : `
        <div class="vlk-pwa-actions">
          <button class="vlk-pwa-btn-install" id="vlkPwaInstall">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Install App
          </button>
          <button class="vlk-pwa-btn-dismiss" id="vlkPwaDismiss">Later</button>
        </div>
      `}
    `;

    document.body.appendChild(bannerDiv);

    // Bind event listeners
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
      installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const choiceResult = await deferredPrompt.userChoice;
          console.log('[VirtuLab PWA] User install choice:', choiceResult.outcome);
          deferredPrompt = null;
        }
        dismissHandler();
      });
    }

    // Show banner after short delay
    setTimeout(() => {
      bannerDiv.classList.add('active');
    }, 1500);
  }

  // Handle Chrome / Android beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!document.getElementById('vlkPwaBanner')) {
      createBannerHTML();
    }
  });

  // For iOS, prompt after page load if not installed
  if (isIOS) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (!document.getElementById('vlkPwaBanner')) {
          createBannerHTML();
        }
      }, 2000);
    });
  }
})();
