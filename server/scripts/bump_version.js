#!/usr/bin/env node
// ============================================================
//  VirtuLab Kenya — PWA Cache & Asset Versioning Utility
// ============================================================
//
// Usage:
//   node server/scripts/bump_version.js               # Auto-increment vN to v(N+1)
//   node server/scripts/bump_version.js --dry-run     # Preview bump without writing
//   node server/scripts/bump_version.js --target 60   # Set specific version
//   node server/scripts/bump_version.js --sync-html   # Also update ?v=N in client HTML files

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const SW_PATH = path.join(ROOT_DIR, 'client/sw.js');

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const syncHtml = args.includes('--sync-html');
const targetIdx = args.indexOf('--target');
const manualTarget = targetIdx !== -1 && args[targetIdx + 1] ? parseInt(args[targetIdx + 1], 10) : null;

function bump() {
  if (!fs.existsSync(SW_PATH)) {
    console.error(`❌ Service worker not found at: ${SW_PATH}`);
    process.exit(1);
  }

  const swContent = fs.readFileSync(SW_PATH, 'utf8');
  const match = swContent.match(/const CACHE_NAME = ['"]virtulab-kenya-v(\d+)['"];/);

  if (!match) {
    console.error('❌ Could not parse CACHE_NAME in client/sw.js');
    process.exit(1);
  }

  const currentVersion = parseInt(match[1], 10);
  const nextVersion = manualTarget || (currentVersion + 1);

  console.log(`\n📦 VirtuLab Kenya — Cache Version Tool`);
  console.log(`   Current Version: v${currentVersion}`);
  console.log(`   Target Version:  v${nextVersion}`);

  if (isDryRun) {
    console.log(`\n🔍 [DRY RUN] Would update client/sw.js CACHE_NAME to: 'virtulab-kenya-v${nextVersion}'`);
    if (syncHtml) {
      console.log(`🔍 [DRY RUN] Would sync ?v=${nextVersion} across client HTML files.`);
    }
    return;
  }

  // Update sw.js
  const updatedSw = swContent.replace(
    /const CACHE_NAME = ['"]virtulab-kenya-v\d+['"];/,
    `const CACHE_NAME = 'virtulab-kenya-v${nextVersion}';`
  );
  fs.writeFileSync(SW_PATH, updatedSw, 'utf8');
  console.log(`✅ Updated client/sw.js -> virtulab-kenya-v${nextVersion}`);

  // Sync HTML if requested
  if (syncHtml) {
    const clientDir = path.join(ROOT_DIR, 'client');
    let updatedCount = 0;

    function walkDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          const html = fs.readFileSync(fullPath, 'utf8');
          const replaced = html.replace(/\?v=\d+/g, `?v=${nextVersion}`);
          if (replaced !== html) {
            fs.writeFileSync(fullPath, replaced, 'utf8');
            updatedCount++;
          }
        }
      }
    }

    walkDir(clientDir);
    console.log(`✅ Synced version string across ${updatedCount} HTML files.`);
  }

  console.log(`✨ Version bump complete!\n`);
}

bump();
