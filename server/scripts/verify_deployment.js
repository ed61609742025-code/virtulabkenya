#!/usr/bin/env node
// ============================================================
//  VirtuLab Kenya — Production Deployment Verification CLI
//  Usage: node server/scripts/verify_deployment.js [URL]
//  Example: node server/scripts/verify_deployment.js https://virtulab.co.ke
// ============================================================

const targetUrl = process.argv[2] || process.env.PROD_URL || 'http://localhost:3000';

console.log('\n============================================================');
console.log('  🔍 VirtuLab Kenya — Deployment Health & Security Audit');
console.log(`  🎯 Target Host: ${targetUrl}`);
console.log('============================================================\n');

async function runAudit() {
  let passed = 0;
  let failed = 0;

  function report(name, isSuccess, details = '') {
    if (isSuccess) {
      console.log(`  ✅ [PASS] ${name} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.log(`  ❌ [FAIL] ${name} ${details ? '— ' + details : ''}`);
      failed++;
    }
  }

  // Check 1: Health Endpoint
  try {
    const t0 = Date.now();
    const res = await fetch(`${targetUrl}/api/health`);
    const lat = Date.now() - t0;
    const body = await res.json();

    const isHealthy = res.status === 200 && (body.status === 'ok' || body.status === 'healthy' || body.project === 'VirtuLab Kenya' || body.success === true);
    report('API Health Endpoint (/api/health)', isHealthy, `Status: ${res.status}, Latency: ${lat}ms`);
    
    if (body.project || body.version) {
      console.log(`     └─ Platform: ${body.project || 'VirtuLab Kenya'} (v${body.version || '1.0.0'})`);
    }
  } catch (err) {
    report('API Health Endpoint (/api/health)', false, `Connection refused: ${err.message}`);
  }

  // Check 2: PWA Web App Manifest & Service Worker
  try {
    const res = await fetch(`${targetUrl}/manifest.json`);
    const isManifest = res.status === 200;
    report('PWA Manifest (/manifest.json)', isManifest, `Status: ${res.status}`);

    const swRes = await fetch(`${targetUrl}/sw.js`);
    const isSw = swRes.status === 200;
    report('Service Worker Script (/sw.js)', isSw, `Status: ${swRes.status}`);
  } catch (err) {
    report('PWA Offline Assets', false, err.message);
  }

  // Check 3: HTTP Security Headers
  try {
    const res = await fetch(`${targetUrl}/`);
    const headers = res.headers;

    const hasNosniff = headers.get('x-content-type-options') === 'nosniff';
    report('Header: X-Content-Type-Options (nosniff)', hasNosniff);

    const hasFrameOptions = !!headers.get('x-frame-options');
    report('Header: X-Frame-Options (Clickjacking guard)', hasFrameOptions, headers.get('x-frame-options') || 'Missing');

    if (targetUrl.startsWith('https://')) {
      const hasHsts = !!headers.get('strict-transport-security');
      report('Header: Strict-Transport-Security (HSTS)', hasHsts, headers.get('strict-transport-security') || 'Missing');
    }
  } catch (err) {
    report('Security Headers Check', false, err.message);
  }

  // Check 4: Unauthenticated Security Guard
  try {
    const res = await fetch(`${targetUrl}/api/sessions/mine`);
    const isProtected = res.status === 401;
    report('JWT Authentication Guard (/api/sessions/mine)', isProtected, `HTTP ${res.status}`);
  } catch (err) {
    report('JWT Security Guard', false, err.message);
  }

  console.log('\n------------------------------------------------------------');
  console.log(`  📊 Audit Summary: ${passed} Passed, ${failed} Failed`);
  console.log('------------------------------------------------------------\n');

  if (failed > 0) {
    console.log('⚠️  Some deployment checks failed. Check server logs and network routing.\n');
    process.exitCode = 1;
  } else {
    console.log('🎉 Production deployment verified successfully!\n');
    process.exitCode = 0;
  }
}

runAudit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exitCode = 1;
});
