// ============================================================
//  VirtuLab Kenya — Subscription & Payment UI Controller
// ============================================================

(function () {
  let cachedPlans = null;
  let cachedStatus = null;
  let selectedPlanId = 1; // Default to Student Term Pass

  /**
   * Initialize subscription state on page load.
   */
  async function init() {
    try {
      if (typeof window.Subscriptions === 'undefined') return;

      // Check payment return query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const paymentRef = urlParams.get('reference') || urlParams.get('trxref');
      if (paymentRef) {
        handlePaymentReturn(paymentRef);
      }

      await refreshStatus();
    } catch (err) {
      console.warn('[SubscriptionUI] Init error:', err.message);
    }
  }

  /**
   * Fetch current subscription entitlement and update UI pills.
   */
  async function refreshStatus() {
    try {
      const res = await window.Subscriptions.getStatus();
      if (!res || !res.success) return null;

      cachedStatus = res.subscription;
      updateNavbarPill(cachedStatus);
      return cachedStatus;
    } catch (err) {
      console.warn('[SubscriptionUI] Refresh status error:', err);
      return null;
    }
  }

  /**
   * Update the badge in the navigation header.
   */
  function updateNavbarPill(status) {
    const pill = document.getElementById('subStatusPill');
    if (!pill) return;

    if (!status || !status.isActive) {
      pill.className = 'vlk-sub-pill upgrade-needed';
      pill.innerHTML = '⚡ <span>Upgrade (KES 500)</span>';
      pill.title = 'Upgrade to an active KCSE term pass';
    } else if (status.isGracePeriod) {
      pill.className = 'vlk-sub-pill grace-warning';
      pill.innerHTML = `⚠️ <span>Grace Period (${status.graceDaysLeft || 1}d)</span>`;
      pill.title = 'Pass expired! 3-day grace period active. Click to renew.';
    } else {
      pill.className = 'vlk-sub-pill active-pass';
      const daysText = status.daysRemaining !== null ? `${status.daysRemaining}d left` : 'Active';
      pill.innerHTML = `⭐ <span>${status.planName || 'Term Pass'} (${daysText})</span>`;
      pill.title = `Active pass: ${status.planName}. Click to view details.`;
    }
    pill.style.display = 'inline-flex';
  }

  /**
   * Open the Subscription & Billing Modal.
   */
  async function openModal() {
    let overlay = document.getElementById('vlkSubModalOverlay');
    if (!overlay) {
      overlay = renderModalDOM();
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Refresh data in modal
    await populateModalContent();
  }

  /**
   * Close the Subscription Modal.
   */
  function closeModal() {
    const overlay = document.getElementById('vlkSubModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  /**
   * Populate modal cards with live plans and current user status.
   */
  async function populateModalContent() {
    const statusBox = document.getElementById('vlkModalCurrentStatus');
    const plansGrid = document.getElementById('vlkModalPlansGrid');

    // 1. Render Current Status
    if (cachedStatus && statusBox) {
      if (cachedStatus.isActive) {
        statusBox.innerHTML = `
          <div class="vlk-status-info">
            <h4>${cachedStatus.planName}</h4>
            <p>${cachedStatus.source === 'school' ? '🏫 Institutional School License' : '👤 Direct Student Pass'} · ${cachedStatus.daysRemaining !== null ? `${cachedStatus.daysRemaining} days remaining` : 'Permanent'}</p>
          </div>
          <span style="font-size:0.75rem; font-weight:800; color:#059669; background:rgba(5,150,105,0.1); padding:4px 10px; border-radius:999px;">ACTIVE</span>
        `;
      } else {
        statusBox.innerHTML = `
          <div class="vlk-status-info">
            <h4>Free / Unsubscribed Tier</h4>
            <p>Upgrade to unlock full KCSE mocks, all 8 lab practicals, and Walimu AI</p>
          </div>
          <span style="font-size:0.75rem; font-weight:800; color:#0284C7; background:rgba(2,132,199,0.1); padding:4px 10px; border-radius:999px;">FREE TIER</span>
        `;
      }
    }

    // 2. Fetch and render plans
    if (!cachedPlans) {
      try {
        const plansRes = await window.Subscriptions.getPlans('student');
        if (plansRes && plansRes.success) {
          cachedPlans = plansRes.plans;
        }
      } catch (e) {
        console.error('Failed to load plans:', e);
      }
    }

    if (cachedPlans && plansGrid) {
      plansGrid.innerHTML = cachedPlans.map(p => {
        const isRec = p.plan_code === 'student_term';
        const isSelected = p.id === selectedPlanId;
        return `
          <div class="vlk-plan-card ${isSelected ? 'selected' : ''}" onclick="window.VLKSubscriptionUI.selectPlan(${p.id})" id="vlkPlanCard_${p.id}">
            ${isRec ? '<span class="vlk-plan-badge-rec">Most Popular</span>' : ''}
            <div class="vlk-plan-name">${p.name}</div>
            <div class="vlk-plan-duration">${p.duration_days} Days access</div>
            <div class="vlk-plan-price">KES ${Math.round(p.price_kes)} <span>/ pass</span></div>
            <ul class="vlk-plan-features">
              <li>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                All 8 KCSE Labs
              </li>
              <li>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                Walimu AI Tutor
              </li>
              <li>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                40-Mark Mocks
              </li>
            </ul>
          </div>
        `;
      }).join('');
    }
  }

  /**
   * Plan selection handler.
   */
  function selectPlan(planId) {
    selectedPlanId = planId;
    document.querySelectorAll('.vlk-plan-card').forEach(el => {
      el.classList.remove('selected');
    });
    const card = document.getElementById(`vlkPlanCard_${planId}`);
    if (card) card.classList.add('selected');

    const plan = cachedPlans ? cachedPlans.find(p => p.id === planId) : null;
    const btn = document.getElementById('vlkPaySubmitBtn');
    if (btn && plan) {
      btn.innerHTML = `<span>Pay KES ${Math.round(plan.price_kes)} via M-Pesa / Card</span> →`;
    }
  }

  /**
   * Display a non-blocking toast notification.
   */
  function showToast(message, type = 'success') {
    let toast = document.getElementById('vlkSubToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'vlkSubToast';
      toast.className = 'vlk-sub-toast';
      document.body.appendChild(toast);
    }
    toast.className = `vlk-sub-toast ${type} show`;
    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.15rem;">${type === 'success' ? '🎉' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
        <div>${message}</div>
      </div>
    `;
    setTimeout(() => {
      toast.classList.remove('show');
    }, 6000);
  }

  /**
   * Handle checkout submit.
   */
  async function submitPayment() {
    const btn = document.getElementById('vlkPaySubmitBtn');
    const phoneInput = document.getElementById('vlkPhoneInput');
    const errorEl = document.getElementById('vlkCheckoutError');

    if (errorEl) errorEl.style.display = 'none';

    // Strip whitespace, dashes, parentheses and periods
    let rawPhone = phoneInput ? phoneInput.value.replace(/[\s\-\(\)\.]/g, '') : '';
    let phone = rawPhone;
    if (phone.startsWith('+254')) {
      phone = phone.substring(1);
    } else if (phone.startsWith('0')) {
      phone = '254' + phone.substring(1);
    } else if (phone.length === 9 && (phone.startsWith('7') || phone.startsWith('1'))) {
      phone = '254' + phone;
    }

    // Validate Kenyan Safaricom / Airtel mobile numbers if provided
    if (phone) {
      const isValidKePhone = /^254(7|1)\d{8}$/.test(phone);
      if (!isValidKePhone) {
        if (errorEl) {
          errorEl.textContent = 'Please enter a valid Kenyan Safaricom/Airtel number (e.g. 0712 345 678).';
          errorEl.style.display = 'block';
        }
        return;
      }
    }

    if (!selectedPlanId) {
      if (errorEl) {
        errorEl.textContent = 'Please choose a subscription plan.';
        errorEl.style.display = 'block';
      }
      return;
    }

    try {
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>Connecting to M-Pesa...</span>';
      }

      const res = await window.Subscriptions.checkout({
        planId: selectedPlanId,
        phone,
        callbackUrl: window.location.href.split('?')[0] + '?payment=complete'
      });

      if (!res || !res.success || !res.authorizationUrl) {
        throw new Error(res.error || 'Payment checkout initialization failed.');
      }

      // Redirect student to Paystack hosted M-Pesa STK / Card page
      window.location.href = res.authorizationUrl;
    } catch (err) {
      console.error('Checkout error:', err);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Try Again</span>';
      }
      if (errorEl) {
        errorEl.textContent = err.message || 'Payment initiation failed. Please try again.';
        errorEl.style.display = 'block';
      }
    }
  }

  /**
   * Handle return from Paystack checkout callback.
   */
  async function handlePaymentReturn(reference) {
    try {
      const verifyRes = await window.Subscriptions.verify(reference);
      // Clean URL query parameters
      window.history.replaceState({}, document.title, window.location.pathname);

      if (verifyRes && verifyRes.success && verifyRes.status === 'success') {
        showToast('<strong>Hongera!</strong> Your VirtuLab Kenya subscription has been activated successfully!', 'success');
        await refreshStatus();
      } else {
        showToast('Payment verification pending. If M-Pesa deducted funds, your pass will activate shortly.', 'info');
      }
    } catch (e) {
      console.warn('Verification on return note:', e.message);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  /**
   * Render modal HTML markup into DOM.
   */
  function renderModalDOM() {
    let overlay = document.getElementById('vlkSubModalOverlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'vlkSubModalOverlay';
    overlay.className = 'vlk-sub-modal-overlay';
    overlay.innerHTML = `
      <div class="vlk-sub-modal" onclick="event.stopPropagation()">
        <div class="vlk-sub-header">
          <h3 class="vlk-sub-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            VirtuLab Pass &amp; Subscriptions
          </h3>
          <button type="button" class="vlk-sub-close-btn" onclick="window.VLKSubscriptionUI.closeModal()">&times;</button>
        </div>
        <div class="vlk-sub-body">
          <div id="vlkModalCurrentStatus" class="vlk-current-status-card">
            <!-- Populated dynamically -->
          </div>

          <label class="vlk-input-label">Select Your KCSE Practical Plan:</label>
          <div id="vlkModalPlansGrid" class="vlk-plans-grid">
            <!-- Populated dynamically -->
          </div>

          <div class="vlk-checkout-box">
            <label class="vlk-input-label" for="vlkPhoneInput">Safaricom M-Pesa Phone Number:</label>
            <div class="vlk-phone-input-wrap">
              <span class="vlk-phone-prefix">+254</span>
              <input type="tel" id="vlkPhoneInput" class="vlk-phone-input" placeholder="712 345 678" maxlength="10">
            </div>
            <div class="vlk-mpesa-help">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <span>Instant STK Push: You will receive an M-Pesa PIN prompt on your phone.</span>
            </div>
            <div id="vlkCheckoutError" style="display:none; color:#EF4444; font-size:0.78rem; font-weight:700; margin-bottom:10px;"></div>
            <button type="button" id="vlkPaySubmitBtn" class="vlk-pay-btn" onclick="window.VLKSubscriptionUI.submitPayment()">
              <span>Pay KES 500 via M-Pesa / Card</span> →
            </button>
          </div>
        </div>
      </div>
    `;

    overlay.addEventListener('click', closeModal);
    document.body.appendChild(overlay);
    return overlay;
  }

  // Global interface
  window.VLKSubscriptionUI = {
    init,
    refreshStatus,
    openModal,
    closeModal,
    selectPlan,
    submitPayment,
    showToast
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
