const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, '../client/shared/api.js'),
  path.join(__dirname, '../pwa-android/app/src/main/assets/shared/api.js')
];

const headerSnippet = `function getServerBaseUrl() {
  try {
    if (typeof window !== 'undefined' && window.VirtuLabNative && typeof window.VirtuLabNative.getServer === 'function') {
      const nativeUrl = window.VirtuLabNative.getServer();
      if (nativeUrl && nativeUrl.trim()) return nativeUrl.trim().replace(/\\/+$/, '');
    }
  } catch (e) {}
  try {
    const custom = localStorage.getItem('vlk_server_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\\/+$/, '');
    }
  } catch (e) {}
  if (typeof window !== 'undefined' && window.location.hostname && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return window.location.origin;
  }
  // Default to current server IP on Wi-Fi
  return 'http://192.168.18.14:3000';
}

function getApiBase() {
  const base = getServerBaseUrl();
  return base ? (base + '/api') : '/api';
}

function resolveApiUrl(endpoint) {
  if (typeof endpoint !== 'string') return '';
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;

  const base = getServerBaseUrl().replace(/\\/+$/, '');
  let ep = endpoint.trim();
  if (ep.startsWith('/api/')) {
    ep = ep.substring(4);
  } else if (ep.startsWith('api/')) {
    ep = ep.substring(3);
  }
  if (!ep.startsWith('/')) ep = '/' + ep;
  return base + '/api' + ep;
}

const API_BASE = getApiBase();

// ── Live Server Management & Diagnostics ──────────────────────
const VLKServer = {
  getUrl() {
    return getServerBaseUrl();
  },
  setUrl(url) {
    if (!url || typeof url !== 'string') return;
    let clean = url.trim().replace(/\\/+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'http://' + clean;
    }
    try {
      localStorage.setItem('vlk_server_url', clean);
    } catch (e) {}
    try {
      if (window.VirtuLabNative && typeof window.VirtuLabNative.setServer === 'function') {
        window.VirtuLabNative.setServer(clean);
      }
    } catch (e) {}
    return clean;
  },
  async testHealth(url) {
    const target = (url ? url.trim().replace(/\\/+$/, '') : getServerBaseUrl()) + '/api/health';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(target, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      const data = await res.json();
      return { ok: true, data };
    } catch (err) {
      clearTimeout(timer);
      return { ok: false, error: err.name === 'AbortError' ? 'Connection timed out' : (err.message || 'Unreachable') };
    }
  },
  showModal() {
    if (typeof document === 'undefined') return;
    let existing = document.getElementById('vlkServerModal');
    if (existing) existing.remove();

    const currentUrl = VLKServer.getUrl();
    const modal = document.createElement('div');
    modal.id = 'vlkServerModal';
    modal.setAttribute('style', 'position:fixed;inset:0;background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:\\'Plus Jakarta Sans\\',-apple-system,sans-serif;');
    modal.innerHTML = \`
      <div style="background:#1E293B;border:1px solid #334155;border-radius:16px;max-width:440px;width:100%;padding:22px;box-shadow:0 20px 40px rgba(0,0,0,0.6);color:#F8FAFC;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.3rem;">🌐</span>
            <h3 style="margin:0;font-size:1.05rem;font-weight:800;color:#F8FAFC;">VirtuLab Server Connection</h3>
          </div>
          <button id="vlkCloseServerModal" style="background:none;border:none;color:#94A3B8;font-size:1.3rem;cursor:pointer;padding:4px 8px;">✕</button>
        </div>
        <p style="font-size:0.83rem;color:#94A3B8;line-height:1.5;margin:0 0 14px 0;">
          Connect your phone or browser to the VirtuLab PostgreSQL database server over local Wi-Fi or hotspot.
        </p>
        <label style="display:block;font-size:0.75rem;font-weight:700;color:#38BDF8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Backend Server IP / Address</label>
        <div style="margin-bottom:12px;">
          <input type="text" id="vlkServerInput" value="\${typeof escapeHtml === 'function' ? escapeHtml(currentUrl) : currentUrl}" placeholder="http://192.168.18.14:3000" style="width:100%;box-sizing:border-box;background:#0F172A;border:1px solid #334155;border-radius:8px;padding:10px 12px;color:#F8FAFC;font-size:0.88rem;font-family:monospace;outline:none;" />
        </div>
        <div id="vlkServerTestResult" style="min-height:24px;font-size:0.82rem;margin-bottom:14px;display:flex;align-items:center;gap:6px;"></div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button id="vlkTestServerBtn" type="button" style="background:#334155;color:#F8FAFC;border:none;padding:9px 14px;border-radius:8px;font-weight:700;font-size:0.82rem;cursor:pointer;">Test Ping</button>
          <button id="vlkSaveServerBtn" type="button" style="background:#0284C7;color:#FFFFFF;border:none;padding:9px 16px;border-radius:8px;font-weight:700;font-size:0.82rem;cursor:pointer;">Save & Reconnect</button>
        </div>
      </div>
    \`;
    document.body.appendChild(modal);

    const closeBtn = document.getElementById('vlkCloseServerModal');
    const input = document.getElementById('vlkServerInput');
    const testBtn = document.getElementById('vlkTestServerBtn');
    const saveBtn = document.getElementById('vlkSaveServerBtn');
    const resultBox = document.getElementById('vlkServerTestResult');

    closeBtn.onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    testBtn.onclick = async () => {
      resultBox.innerHTML = '<span style="color:#38BDF8;">⏳ Testing connection to server…</span>';
      const res = await VLKServer.testHealth(input.value);
      if (res.ok) {
        resultBox.innerHTML = \`<span style="color:#10B981;font-weight:700;">🟢 Connected! PostgreSQL DB is Active!</span>\`;
      } else {
        resultBox.innerHTML = \`<span style="color:#EF4444;font-weight:700;">🔴 Unreachable: \${typeof escapeHtml === 'function' ? escapeHtml(res.error) : res.error}</span>\`;
      }
    };

    saveBtn.onclick = async () => {
      VLKServer.setUrl(input.value);
      resultBox.innerHTML = '<span style="color:#10B981;font-weight:700;">✅ Saved! Refreshing connection…</span>';
      setTimeout(() => { window.location.reload(); }, 500);
    };

    VLKServer.testHealth(currentUrl).then(res => {
      if (!resultBox) return;
      if (res.ok) {
        resultBox.innerHTML = \`<span style="color:#10B981;font-weight:700;">🟢 Connected! Server active (DB: \${res.data?.db || 'ok'})</span>\`;
      } else {
        resultBox.innerHTML = \`<span style="color:#F59E0B;font-weight:600;">🟠 Offline / Unreachable: \${typeof escapeHtml === 'function' ? escapeHtml(res.error) : res.error}</span>\`;
      }
    });
  },
  mountStatusPill(containerId) {
    if (typeof document === 'undefined') return;
    const target = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!target) return;

    const pill = document.createElement('button');
    pill.type = 'button';
    pill.id = 'vlkServerStatusPill';
    pill.setAttribute('style', 'display:inline-flex;align-items:center;gap:6px;background:rgba(30,41,59,0.7);border:1px solid rgba(255,255,255,0.12);padding:5px 10px;border-radius:20px;color:#94A3B8;font-size:0.76rem;font-weight:700;cursor:pointer;backdrop-filter:blur(4px);transition:all 0.2s;');
    pill.innerHTML = \`<span>⏳</span> <span>Connecting…</span>\`;
    pill.title = 'Click to view or edit backend server address';
    pill.onclick = (e) => { e.preventDefault(); VLKServer.showModal(); };
    target.appendChild(pill);

    VLKServer.testHealth().then(res => {
      if (res.ok) {
        pill.innerHTML = \`<span style="color:#10B981;">●</span> <span style="color:#F8FAFC;">Database Live</span>\`;
        pill.style.borderColor = 'rgba(16,185,129,0.4)';
      } else {
        pill.innerHTML = \`<span style="color:#F59E0B;">●</span> <span style="color:#F59E0B;">Offline Mode</span>\`;
        pill.style.borderColor = 'rgba(245,158,11,0.4)';
      }
    });
  }
};
if (typeof window !== 'undefined') {
  window.VLKServer = VLKServer;
}`;

filesToPatch.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('Skipping missing file:', file);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');

  // Replace header / API_BASE definition
  if (content.includes('function getServerBaseUrl()')) {
    content = content.replace(/function getServerBaseUrl\(\)[\s\S]*?const API_BASE = [^;]+;/, headerSnippet);
  } else if (content.includes("const API_BASE = '/api';")) {
    content = content.replace("const API_BASE = '/api';", headerSnippet);
  }

  // Update clearToken logout fetch
  content = content.replace(
    /fetch\((?:API_BASE|\/api|getApiBase\(\))\s*\+\s*'\/auth\/logout'[^)]*\)/,
    "fetch(resolveApiUrl('/auth/logout'), { method: 'POST', credentials: 'include' })"
  );

  // Update downloadFile
  content = content.replace(
    /fetch\(API_BASE \+ endpoint, \{ headers, credentials: 'same-origin' \}\)/,
    "fetch(resolveApiUrl(endpoint), { headers, credentials: 'include' })"
  );

  // Update OfflineQueue.flush finalUrl
  content = content.replace(
    /const finalUrl = endpointClean\.startsWith\('\/api\/'\)\s*\?\s*endpointClean\s*:\s*API_BASE \+ endpointClean;/,
    "const finalUrl = resolveApiUrl(endpointClean);"
  );

  // Update apiRequest
  content = content.replace(
    /const res = await fetch\((?:API_BASE|getApiBase\(\))\s*\+\s*endpoint, options\);/,
    "const res = await fetch(resolveApiUrl(endpoint), options);"
  );
  content = content.replace(
    /credentials:\s*'same-origin'/,
    "credentials: 'include'"
  );

  // Update ErrorTracker
  content = content.replace(
    /fetch\(API_BASE \+ '\/errors\/client'/,
    "fetch(resolveApiUrl('/errors/client')"
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully patched:', file);
});
