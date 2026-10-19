#!/usr/bin/env node
/**
 * ============================================================
 *  VirtuLab Kenya — Cloudflare Edge Cache Purge Automation
 *  Automated Invalidation via Cache-Tags and URLs
 * ============================================================
 *
 *  Usage:
 *    node scripts/purge_edge_cache.js --tags virtulab-static,virtulab-code
 *    node scripts/purge_edge_cache.js --files https://virtulab.co.ke/sw.js
 *    node scripts/purge_edge_cache.js --all
 *    node scripts/purge_edge_cache.js --dry-run
 */

const path = require('path');
const https = require('https');

// Load environment variables from server/.env if available
try {
  require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
} catch (e) {}

const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || process.env.CF_ZONE_ID || '';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || process.env.CLOUDFLARE_PURGE_TOKEN || '';

function buildPurgePayload(args = process.argv.slice(2)) {
  const payload = {};
  let isDryRun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--all' || arg === '-a') {
      payload.purge_everything = true;
    } else if (arg === '--dry-run') {
      isDryRun = true;
    } else if (arg === '--tags' || arg === '-t') {
      const next = args[i + 1] || 'virtulab-static';
      payload.tags = next.split(',').map(s => s.trim()).filter(Boolean);
      i++;
    } else if (arg.startsWith('--tags=')) {
      payload.tags = arg.replace('--tags=', '').split(',').map(s => s.trim()).filter(Boolean);
    } else if (arg === '--files' || arg === '-f') {
      const next = args[i + 1] || '';
      payload.files = next.split(',').map(s => s.trim()).filter(Boolean);
      i++;
    } else if (arg.startsWith('--files=')) {
      payload.files = arg.replace('--files=', '').split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  // Default to purging default tag if no specific flag supplied
  if (!payload.purge_everything && (!payload.tags || payload.tags.length === 0) && (!payload.files || payload.files.length === 0)) {
    payload.tags = ['virtulab-static'];
  }

  return { payload, isDryRun };
}

async function purgeEdgeCache(options = {}) {
  const zoneId = options.zoneId || ZONE_ID;
  const token = options.token || API_TOKEN;
  const payload = options.payload || { tags: ['virtulab-static'] };
  const isDryRun = options.isDryRun || false;

  const endpoint = `https://api.cloudflare.com/client/v4/zones/${zoneId || '{ZONE_ID}'}/purge_cache`;

  if (isDryRun || !zoneId || !token) {
    const reason = isDryRun ? 'DRY-RUN MODE' : 'MISSING CLOUDFLARE CREDENTIALS';
    console.log(`[Cloudflare Edge Cache Purge] (${reason})`);
    console.log(`Target Endpoint: ${endpoint}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    if (!token && !isDryRun) {
      console.log('Note: To execute real cache purge, export CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN in server/.env');
    }
    return {
      success: true,
      dryRun: true,
      endpoint,
      payload
    };
  }

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = https.request(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          resolve({ success: res.statusCode === 200, raw: data });
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(postData);
    req.end();
  });
}

if (require.main === module) {
  const { payload, isDryRun } = buildPurgePayload();
  purgeEdgeCache({ payload, isDryRun })
    .then(result => {
      if (result.success) {
        console.log('[Cloudflare Edge Cache Purge] Invalidation request processed successfully.');
      } else {
        console.warn('[Cloudflare Edge Cache Purge] Response:', result);
      }
    })
    .catch(err => {
      console.error('[Cloudflare Edge Cache Purge] Error:', err.message);
      process.exit(1);
    });
}

module.exports = {
  buildPurgePayload,
  purgeEdgeCache
};
