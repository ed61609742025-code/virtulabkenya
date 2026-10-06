# Cloudflare CDN & Kenya Low-Latency Production Setup (Nairobi NBO & Mombasa MBA)
**VirtuLab Kenya — Production Infrastructure & Edge Acceleration Architecture**

---

## 1. Executive Summary & Latency Target

| Metric | Without Cloudflare (Direct Render) | With Cloudflare Edge CDN (NBO / KIXP) | Improvement |
|---|---|---|---|
| **DNS Resolution (Kenya)** | 85ms – 160ms (Overseas Authoritative) | **< 5ms** (Anycast DNS at KIXP Nairobi) | **95% faster** |
| **Static Assets TTFB (CSS, JS, 3D, WebP)** | 220ms – 450ms (Transit to Europe/US) | **< 25ms** (Served directly from Nairobi NBO) | **10x faster** |
| **Repeat Visit Handshake (Mobile 4G/5G)** | 180ms – 320ms (Full TLS 1.3 Handshake) | **0ms (0-RTT TLS Connection Resumption)** | **Instantaneous** |
| **Cellular Jitter / Packet Loss Handling** | High (TCP Head-of-line blocking) | **Resilient (HTTP/3 / QUIC UDP Transport)** | **Zero connection stall** |
| **Bandwidth Bundle Consumption** | Standard Gzip compression | **Brotli (-22% file size over Gzip)** | **Saves student mobile data** |

---

## 2. DNS & KeNIC (`.co.ke`) Registrar Configuration

VirtuLab Kenya operates under the Kenyan national top-level domain `.co.ke`.

### A. Pointing Nameservers at KeNIC Registrar
Log into your domain registrar (e.g. *Safaricom Domains, Truehost Kenya, Kenya Website Experts, or EACDirectory*) and replace existing DNS nameservers with Cloudflare's Anycast nameservers:
```
Nameserver 1: dara.ns.cloudflare.com
Nameserver 2: tory.ns.cloudflare.com
```

### B. Cloudflare DNS Zone Records
In the Cloudflare Dashboard under **DNS -> Records**:

| Type | Name | Content / Target | Proxy Status | TTL | Description |
|---|---|---|---|---|---|
| **CNAME** | `@` (`virtulab.co.ke`) | `virtulab-web.onrender.com` | **Proxied (Orange Cloud)** | Auto | Apex CNAME Flattening to Render |
| **CNAME** | `www` | `virtulab.co.ke` | **Proxied (Orange Cloud)** | Auto | Canonical www redirect |
| **CAA** | `@` | `0 issue "letsencrypt.org"` | DNS Only | Auto | Restricts TLS cert issuance |
| **CAA** | `@` | `0 issue "digicert.com"` | DNS Only | Auto | Cloudflare Universal SSL |

### C. Render Custom Domain Verification
In Render Dashboard (**Settings -> Custom Domains**):
1. Add `virtulab.co.ke` and `www.virtulab.co.ke`.
2. Cloudflare's Proxied CNAME fulfills Render's SSL validation seamlessly.

---

## 3. SSL/TLS & Edge Security Configuration

Under **Cloudflare -> SSL/TLS**:

1. **Encryption Mode**: **Full (Strict)**
   - Guarantees end-to-end encryption between Cloudflare edge and Render origin.
2. **Edge Certificates**:
   - **Minimum TLS Version**: `TLS 1.2`
   - **TLS 1.3**: `Enabled`
   - **0-RTT Connection Resumption**: `Enabled` *(vital for mobile learners on Safaricom 4G/5G)*
   - **Automatic HTTPS Rewrites**: `Enabled`
   - **Always Use HTTPS**: `Enabled`
   - **HSTS (HTTP Strict Transport Security)**: `max-age=31536000; includeSubDomains; preload`

---

## 4. Kenya Edge Network & Speed Optimization

Under **Cloudflare -> Speed -> Optimization**:

1. **Protocol Optimization**:
   - **HTTP/3 (with QUIC)**: `Enabled`
     *Eliminates Head-of-Line blocking over high-latency cellular towers in rural Kenya.*
   - **HTTP/2 to Origin**: `Enabled`
   - **0-RTT**: `Enabled`
2. **Content Compression**:
   - **Brotli**: `Enabled`
     *Automatically recompresses static assets to Brotli level 11 at edge, saving ~22% data on 2G/3G connections.*
   - **Early Hints (103 Early Hints)**: `Enabled`
     *Cloudflare sends preloads for CSS and fonts to the student's browser while Render is processing origin queries.*
3. **Argo Smart Routing (Recommended for Production)**:
   - Under **Traffic -> Argo**: `Enabled`
   - Dynamically routes dynamic API traffic across Cloudflare's private optical backbone directly to Render's data center, bypassing congested public ISP transit routes in East Africa.

---

## 5. Cloudflare Edge Cache Rules

Under **Cloudflare -> Caching -> Cache Rules**, configure the following 5 rules in exact priority order:

### Rule 1: Static Media & Fonts (Long-Term Edge Storage)
- **Condition**:
  ```
  (http.request.uri.path starts_with "/shared/assets/") or
  (http.request.uri.path matches ".*\\.(woff2|ttf|eot|svg|png|jpg|jpeg|webp|ico|mp3)$")
  ```
- **Settings**:
  - **Cache eligibility**: `Eligible for cache`
  - **Edge Cache TTL**: `Override origin` -> `30 days`
  - **Browser Cache TTL**: `Override origin` -> `7 days`
  - **Serve stale content while revalidating**: `Enabled`
  - **Cache Deception Armor**: `Enabled`

### Rule 2: Application JavaScript & CSS (Versioned Code)
- **Condition**:
  ```
  (http.request.uri.path starts_with "/shared/" and http.request.uri.path matches ".*\\.(js|css)$") or
  (http.request.uri.path starts_with "/student/js/") or
  (http.request.uri.path starts_with "/student/css/") or
  (http.request.uri.path starts_with "/teacher/js/")
  ```
- **Settings**:
  - **Cache eligibility**: `Eligible for cache`
  - **Edge Cache TTL**: `Override origin` -> `7 days`
  - **Browser Cache TTL**: `Override origin` -> `1 day`
  - **Serve stale content while revalidating**: `Enabled (86400s)`

### Rule 3: Service Worker & PWA Manifest (Zero Cache Bypass)
- **Condition**:
  ```
  (http.request.uri.path eq "/sw.js") or (http.request.uri.path eq "/manifest.json")
  ```
- **Settings**:
  - **Cache eligibility**: `Bypass cache`
  - *Ensures immediate PWA client updates across Kenya without stale worker caching.*

### Rule 4: Dynamic HTML Entry Points & CSP Nonces (Zero Cache Bypass)
- **Condition**:
  ```
  (http.request.uri.path eq "/") or
  (http.request.uri.path matches ".*\\.html$") or
  (http.request.uri.path starts_with "/student/") or
  (http.request.uri.path starts_with "/teacher/")
  ```
- **Settings**:
  - **Cache eligibility**: `Bypass cache`
  - *Guarantees that per-request cryptographic CSP nonces and auth cookies remain dynamic.*

### Rule 5: Dynamic API Endpoints & WebSockets
- **Condition**:
  ```
  (http.request.uri.path starts_with "/api/") or
  (http.request.uri.path starts_with "/socket.io/")
  ```
- **Settings**:
  - **Cache eligibility**: `Bypass cache`

---

## 6. Real-Time Cache Invalidation via Cloudflare API

When deploying a new VirtuLab release, static assets tagged with `virtulab-static` can be purged instantaneously (< 150ms) across all global Cloudflare PoPs:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache" \
     -H "Authorization: Bearer {CLOUDFLARE_API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{"tags":["virtulab-static"]}'
```

Or purge specific asset URLs:
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache" \
     -H "Authorization: Bearer {CLOUDFLARE_API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{"files":["https://virtulab.co.ke/sw.js", "https://virtulab.co.ke/shared/style.css"]}'
```

---

## 7. Kenya ISP Peering & Peering Partners (KIXP)

Cloudflare peers directly at the **Kenya Internet Exchange Point (KIXP)** at the East Africa Data Centre in Nairobi. Traffic from the following Kenyan networks remains in-country:
- **AS33771**: Safaricom PLC (4G/5G, Fibre, M-PESA API routes)
- **AS37061**: Airtel Networks Kenya Limited
- **AS36914**: Telkom Kenya Limited
- **AS36926**: Kenya Education Network Trust (KENET - Universities and TVETs)
- **AS37153**: Jamii Telecommunications Limited (Faiba)
- **AS30844**: Liquid Intelligent Technologies Kenya

---

## 8. Verifying Kenya Edge Routing Live

Run a diagnostic request against the VirtuLab edge diagnostic endpoint:
```bash
curl -I https://virtulab.co.ke/api/edge/status
```

Look for the following response headers:
```http
HTTP/2 200
cf-ray: 8d7543a123-NBO
cf-cache-status: DYNAMIC
x-edge-pop: NBO
content-type: application/json
```

- If `cf-ray` ends in `-NBO`: The request hit Cloudflare's **Nairobi** data center directly via KIXP!
- If `cf-ray` ends in `-MBA`: The request hit Cloudflare's **Mombasa** submarine landing station!
