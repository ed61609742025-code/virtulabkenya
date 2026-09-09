/**
 * VirtuLab Kenya — Web Push Notification Client Manager
 * Handles Service Worker PushManager subscription lifecycle, VAPID key conversion,
 * permission dialogs, and backend synchronization.
 */
(function(window) {
  'use strict';

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function getAuthToken() {
    if (typeof window.getToken === 'function') {
      const t = window.getToken();
      if (t) return t;
    }
    if (typeof getToken === 'function') {
      try {
        const t = getToken();
        if (t) return t;
      } catch (e) {}
    }
    if (window.Auth && typeof window.Auth.getToken === 'function') {
      try {
        const t = window.Auth.getToken();
        if (t) return t;
      } catch (e) {}
    }
    try {
      return (
        localStorage.getItem('vlk_token') ||
        sessionStorage.getItem('vlk_token') ||
        localStorage.getItem('virtulab_token') ||
        localStorage.getItem('token') ||
        null
      );
    } catch (e) {
      return null;
    }
  }

  function isSupported() {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  function getPermission() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission; // 'default', 'granted', 'denied'
  }

  async function getRegistration() {
    if (!('serviceWorker' in navigator)) return null;
    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await navigator.serviceWorker.register('/sw.js');
      }
      return await navigator.serviceWorker.ready;
    } catch (e) {
      console.warn('[PushManager] getRegistration fallback:', e.message);
      return await navigator.serviceWorker.ready;
    }
  }

  async function getSubscription() {
    try {
      const reg = await getRegistration();
      if (!reg || !reg.pushManager) return null;
      return await reg.pushManager.getSubscription();
    } catch (e) {
      console.warn('[PushManager] getSubscription error:', e.message);
      return null;
    }
  }

  async function isSubscribed() {
    const sub = await getSubscription();
    return sub !== null;
  }

  /**
   * Subscribe to Web Push notifications.
   */
  async function subscribe() {
    if (!isSupported()) {
      alert('Push Notifications are not supported by your current browser.');
      return false;
    }

    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      if (perm === 'denied') {
        alert('Push notifications are blocked in your browser settings. Please enable notifications for VirtuLab Kenya in your browser address bar.');
      }
      syncUI();
      return false;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please log in to enable push notifications on this device.');
      return false;
    }

    try {
      // 1. Retrieve VAPID Public Key from server
      const keyRes = await fetch('/api/push/vapid-public-key', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const keyData = await keyRes.json();

      if (!keyData.success || !keyData.publicKey) {
        throw new Error(keyData.error || 'Server did not provide a VAPID public key.');
      }

      const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);

      // 2. Register subscription with Service Worker PushManager
      const reg = await getRegistration();
      if (!reg) throw new Error('Service Worker is not ready.');

      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      }

      // 3. Send subscription object to backend server
      const subRes = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscription })
      });

      const subData = await subRes.json();
      if (!subData.success) {
        throw new Error(subData.error || 'Failed to register subscription on server.');
      }

      // 4. Request persistent storage to protect offline cache & DB from OEM cleanup daemons
      await requestPersistentStorage();

      console.log('[PushManager] Push notification subscription active.');
      window.dispatchEvent(new CustomEvent('vlk-push-changed', { detail: { subscribed: true } }));
      syncUI();
      alert('🔔 Web Push Notifications are now active for your account on this device!');
      return true;
    } catch (err) {
      console.error('[PushManager] Subscription failed:', err);
      alert('Could not enable push notifications: ' + err.message);
      syncUI();
      return false;
    }
  }

  /**
   * Unsubscribe from Web Push notifications.
   */
  async function unsubscribe() {
    try {
      const sub = await getSubscription();
      if (sub) {
        const token = getAuthToken();
        if (token) {
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ endpoint: sub.endpoint })
          }).catch(() => {});
        }
        await sub.unsubscribe();
      }

      console.log('[PushManager] Unsubscribed from push notifications.');
      window.dispatchEvent(new CustomEvent('vlk-push-changed', { detail: { subscribed: false } }));
      syncUI();
      alert('🔕 Push notifications have been disabled on this device.');
      return true;
    } catch (err) {
      console.error('[PushManager] Unsubscribe failed:', err);
      syncUI();
      return false;
    }
  }

  /**
   * Toggle subscription state.
   */
  async function toggle() {
    const subscribed = await isSubscribed();
    if (subscribed) {
      return await unsubscribe();
    } else {
      return await subscribe();
    }
  }

  /**
   * Dispatch a diagnostic test notification.
   */
  async function sendTestNotification() {
    const token = getAuthToken();
    if (!token) {
      alert('Please log in first.');
      return;
    }

    try {
      const res = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        if (data.sent > 0) {
          console.log('[PushManager] Test alert dispatched.');
        } else {
          alert('No active device subscription registered. Please click "Enable Push Alerts" first.');
        }
      } else {
        alert(data.error || 'Could not send test notification.');
      }
    } catch (e) {
      alert('Test push failed: ' + e.message);
    }
  }

  /**
   * Synchronize UI toggles, badges, and labels across current page.
   */
  async function syncUI() {
    const supported = isSupported();
    const perm = getPermission();
    const subscribed = supported ? await isSubscribed() : false;

    // 1. Toggle Button
    document.querySelectorAll('.vlk-push-toggle-btn, #pushToggleBtn, #tPushToggleBtn').forEach((btn) => {
      if (!supported) {
        btn.textContent = 'Not Supported';
        btn.disabled = true;
        btn.style.opacity = '0.5';
      } else if (perm === 'denied') {
        btn.textContent = 'Blocked';
        btn.disabled = true;
        btn.title = 'Push notifications blocked in browser address bar';
        btn.style.opacity = '0.6';
      } else if (subscribed) {
        btn.textContent = '🔔 Push ON';
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.title = 'Click to disable push notifications on this device';
      } else {
        btn.textContent = 'Enable Alerts';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.title = 'Click to enable real-time push alerts';
      }
    });

    // 2. Status Label
    document.querySelectorAll('.vlk-push-status-text, #pushStatusText, #tPushStatusText').forEach((lbl) => {
      if (!supported) {
        lbl.textContent = 'Push alerts not supported in this browser';
      } else if (perm === 'denied') {
        lbl.textContent = '⚠️ Blocked in browser settings';
      } else if (subscribed) {
        lbl.textContent = '✓ Real-Time Push Alerts Active';
      } else {
        lbl.textContent = 'Push Alerts: Disabled';
      }
    });

    // 3. Test Button visibility
    document.querySelectorAll('.vlk-push-test-btn, #pushTestBtn, #tPushTestBtn').forEach((btn) => {
      btn.style.display = subscribed ? 'inline-block' : 'none';
    });

    // 4. Battery Guide Button/Link visibility
    document.querySelectorAll('.vlk-push-guide-btn, #pushBatteryGuideBtn, #tPushBatteryGuideBtn').forEach((btn) => {
      btn.style.display = supported ? 'inline-flex' : 'none';
    });

    // Request persistent storage if user has active subscription
    if (subscribed) {
      requestPersistentStorage().catch(() => {});
    }
  }

  /**
   * Request Persistent Storage API to prevent browser & OEM cleaners from clearing offline DB & cache
   */
  async function requestPersistentStorage() {
    if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.persist === 'function') {
      try {
        const isPersisted = await navigator.storage.persisted();
        if (!isPersisted) {
          const granted = await navigator.storage.persist();
          console.log(`[PushManager] Storage persistence ${granted ? 'granted' : 'denied'}.`);
          return granted;
        }
        return true;
      } catch (err) {
        console.warn('[PushManager] Storage persistence error:', err.message);
      }
    }
    return false;
  }

  function detectDeviceTab() {
    const ua = (navigator.userAgent || '').toLowerCase();
    if (ua.includes('tecno') || ua.includes('infinix') || ua.includes('transsion') || ua.includes('itel')) {
      return 'guide-tecno';
    }
    if (ua.includes('samsung') || ua.includes('sm-')) {
      return 'guide-samsung';
    }
    if (ua.includes('xiaomi') || ua.includes('redmi') || ua.includes('poco')) {
      return 'guide-xiaomi';
    }
    return 'guide-tecno';
  }

  /**
   * Open the Mobile Battery & Notification Guide Modal ("Don't Kill My App" guide for Kenya mobile users)
   */
  function openBatteryGuideModal() {
    let modal = document.getElementById('vlkBatteryGuideModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'vlkBatteryGuideModal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'vlkBatteryGuideTitle');
      modal.style.cssText = 'position:fixed; inset:0; z-index:99999; display:flex; align-items:center; justify-content:center; background:rgba(10,15,30,0.75); backdrop-filter:blur(6px); padding:16px; overflow-y:auto;';

      modal.innerHTML = `
        <div style="background:var(--card-bg, #111827); color:var(--text-color, #f3f4f6); border:1px solid var(--card-border, #374151); border-radius:18px; max-width:600px; width:100%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.6); overflow:hidden; font-family:'Plus Jakarta Sans', system-ui, sans-serif;">
          <!-- Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-bottom:1px solid var(--card-border, #374151); background:rgba(255,255,255,0.02);">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:1.4rem;">🔋</span>
              <div>
                <h3 id="vlkBatteryGuideTitle" style="margin:0; font-size:1.05rem; font-weight:800; color:var(--heading-color, #ffffff);">Mobile Battery &amp; Notification Guide</h3>
                <p style="margin:0; font-size:0.75rem; color:var(--text-muted, #9ca3af);">Ensure timely delivery of practicals, exams &amp; teacher alerts</p>
              </div>
            </div>
            <button type="button" onclick="VLKPush.closeBatteryGuideModal()" style="background:none; border:none; color:var(--text-muted, #9ca3af); cursor:pointer; font-size:1.4rem; padding:4px 8px; border-radius:8px; line-height:1;" aria-label="Close dialog">&times;</button>
          </div>

          <!-- Body -->
          <div style="padding:20px; max-height:70vh; overflow-y:auto;">
            <div style="background:rgba(6,182,212,0.08); border-left:4px solid #06b6d4; padding:12px 14px; border-radius:8px; font-size:0.8rem; line-height:1.45; margin-bottom:16px; color:var(--text-color, #e5e7eb);">
              <strong>Why check this?</strong> Many mobile systems (especially Tecno, Infinix, Samsung &amp; Xiaomi) put background web apps to sleep to save power. To avoid missed assignment deadlines and delayed notices, enable background activity below.
            </div>

            <!-- Device Tabs -->
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
              <button type="button" class="vlk-guide-tab-btn" data-target="guide-tecno" onclick="VLKPush.switchGuideTab('guide-tecno')" style="padding:6px 14px; border-radius:20px; border:1px solid #06b6d4; background:#06b6d4; color:#fff; font-weight:700; font-size:0.78rem; cursor:pointer;">Tecno / Infinix</button>
              <button type="button" class="vlk-guide-tab-btn" data-target="guide-samsung" onclick="VLKPush.switchGuideTab('guide-samsung')" style="padding:6px 14px; border-radius:20px; border:1px solid var(--card-border, #374151); background:transparent; color:var(--text-muted, #9ca3af); font-weight:700; font-size:0.78rem; cursor:pointer;">Samsung</button>
              <button type="button" class="vlk-guide-tab-btn" data-target="guide-xiaomi" onclick="VLKPush.switchGuideTab('guide-xiaomi')" style="padding:6px 14px; border-radius:20px; border:1px solid var(--card-border, #374151); background:transparent; color:var(--text-muted, #9ca3af); font-weight:700; font-size:0.78rem; cursor:pointer;">Xiaomi / Redmi</button>
              <button type="button" class="vlk-guide-tab-btn" data-target="guide-stock" onclick="VLKPush.switchGuideTab('guide-stock')" style="padding:6px 14px; border-radius:20px; border:1px solid var(--card-border, #374151); background:transparent; color:var(--text-muted, #9ca3af); font-weight:700; font-size:0.78rem; cursor:pointer;">Other Android</button>
            </div>

            <!-- Content: Tecno / Infinix -->
            <div id="guide-tecno" class="vlk-guide-tab-pane" style="display:block;">
              <div style="font-weight:700; font-size:0.86rem; margin-bottom:8px; color:var(--cyan-accent, #22d3ee);">HiOS &amp; XOS (Tecno &amp; Infinix):</div>
              <ol style="margin:0 0 14px 20px; padding:0; font-size:0.82rem; line-height:1.6; color:var(--text-color, #d1d5db);">
                <li>Go to <strong>Settings &rarr; Battery Lab</strong> (or <em>Power Marathon</em>).</li>
                <li>Tap <strong>App Battery Management</strong> &rarr; Select <strong>Chrome</strong> (or your browser).</li>
                <li>Select <strong>Allow Background Running</strong> and ensure <em>Deep Sleep</em> is disabled.</li>
                <li>Open <strong>Phone Master</strong> &rarr; <strong>Auto-start Management</strong> &rarr; Switch browser <strong>ON</strong>.</li>
              </ol>
            </div>

            <!-- Content: Samsung -->
            <div id="guide-samsung" class="vlk-guide-tab-pane" style="display:none;">
              <div style="font-weight:700; font-size:0.86rem; margin-bottom:8px; color:var(--cyan-accent, #22d3ee);">Samsung One UI:</div>
              <ol style="margin:0 0 14px 20px; padding:0; font-size:0.82rem; line-height:1.6; color:var(--text-color, #d1d5db);">
                <li>Open <strong>Settings &rarr; Battery and device care &rarr; Battery</strong>.</li>
                <li>Tap <strong>Background usage limits</strong> &rarr; <strong>Never sleeping apps</strong>.</li>
                <li>Tap <strong>+</strong> and add <strong>Chrome</strong> (or VirtuLab).</li>
                <li>In <strong>Settings &rarr; Apps &rarr; Chrome &rarr; Battery</strong>, choose <strong>Unrestricted</strong>.</li>
              </ol>
            </div>

            <!-- Content: Xiaomi / Redmi -->
            <div id="guide-xiaomi" class="vlk-guide-tab-pane" style="display:none;">
              <div style="font-weight:700; font-size:0.86rem; margin-bottom:8px; color:var(--cyan-accent, #22d3ee);">MIUI &amp; HyperOS (Xiaomi / Redmi / POCO):</div>
              <ol style="margin:0 0 14px 20px; padding:0; font-size:0.82rem; line-height:1.6; color:var(--text-color, #d1d5db);">
                <li>Go to <strong>Settings &rarr; Apps &rarr; Manage apps</strong> &rarr; Select <strong>Chrome</strong>.</li>
                <li>Turn ON <strong>Autostart</strong> permission.</li>
                <li>Scroll down to <strong>Battery saver</strong> and choose <strong>No restrictions</strong>.</li>
                <li>In <strong>Notifications</strong>, enable <em>Allow sound and vibration</em>.</li>
              </ol>
            </div>

            <!-- Content: Stock Android -->
            <div id="guide-stock" class="vlk-guide-tab-pane" style="display:none;">
              <div style="font-weight:700; font-size:0.86rem; margin-bottom:8px; color:var(--cyan-accent, #22d3ee);">Stock Android (Pixel / Motorola / Nokia):</div>
              <ol style="margin:0 0 14px 20px; padding:0; font-size:0.82rem; line-height:1.6; color:var(--text-color, #d1d5db);">
                <li>Long press the <strong>Chrome</strong> / <strong>VirtuLab</strong> app icon &rarr; Tap <strong>App info (ℹ️)</strong>.</li>
                <li>Tap <strong>App battery usage</strong> &rarr; Choose <strong>Unrestricted</strong>.</li>
                <li>Under <strong>Mobile data &amp; Wi-Fi</strong>, ensure <strong>Background data</strong> is turned ON.</li>
              </ol>
            </div>

            <div style="font-size:0.75rem; color:var(--text-muted, #9ca3af); border-top:1px solid var(--card-border, #374151); padding-top:10px; margin-top:10px;">
              💡 <em>Note:</em> VirtuLab Kenya automatically dispatches push alerts with <strong>High-Urgency FCM/APNs priority</strong> to wake resting devices.
            </div>
          </div>

          <!-- Footer -->
          <div style="padding:14px 20px; border-top:1px solid var(--card-border, #374151); display:flex; justify-content:flex-end; background:rgba(255,255,255,0.02);">
            <button type="button" onclick="VLKPush.closeBatteryGuideModal()" style="padding:8px 20px; background:var(--cyan-accent, #06b6d4); color:#fff; border:none; border-radius:8px; font-weight:700; font-size:0.82rem; cursor:pointer;">Got It</button>
          </div>
        </div>
      `;

      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeBatteryGuideModal();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeBatteryGuideModal();
      });

      document.body.appendChild(modal);
    }

    // Auto-select detected device tab
    switchGuideTab(detectDeviceTab());
    modal.style.display = 'flex';
  }

  function closeBatteryGuideModal() {
    const modal = document.getElementById('vlkBatteryGuideModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  function switchGuideTab(targetId) {
    document.querySelectorAll('.vlk-guide-tab-pane').forEach((pane) => {
      pane.style.display = pane.id === targetId ? 'block' : 'none';
    });
    document.querySelectorAll('.vlk-guide-tab-btn').forEach((btn) => {
      const isTarget = btn.getAttribute('data-target') === targetId;
      btn.style.background = isTarget ? '#06b6d4' : 'transparent';
      btn.style.color = isTarget ? '#fff' : 'var(--text-muted, #9ca3af)';
      btn.style.border = isTarget ? '1px solid #06b6d4' : '1px solid var(--card-border, #374151)';
    });
  }

  // Auto-initialize UI sync once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => syncUI());
  } else {
    setTimeout(syncUI, 100);
  }

  window.VLKPush = {
    isSupported,
    getPermission,
    getSubscription,
    isSubscribed,
    subscribe,
    unsubscribe,
    toggle,
    sendTestNotification,
    syncUI,
    requestPersistentStorage,
    openBatteryGuideModal,
    closeBatteryGuideModal,
    switchGuideTab
  };

})(window);
