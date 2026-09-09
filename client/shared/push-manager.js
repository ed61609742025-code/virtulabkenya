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
    syncUI
  };

})(window);
