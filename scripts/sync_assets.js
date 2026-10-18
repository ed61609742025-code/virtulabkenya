// ============================================================
//  VirtuLab Kenya — Web to Android TWA Asset Synchronization Script
// ============================================================
//
// Synchronizes updated client web assets (HTML, CSS, JS, SVG icons, images)
// to the local Android APK asset bundle in pwa-android/app/src/main/assets/
// Ensures 100% parity between web progressive app and offline native APK.
// ============================================================

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const clientRoot = path.join(root, 'client');
const androidAssetsRoot = path.join(root, 'pwa-android', 'app', 'src', 'main', 'assets');

let syncCount = 0;
let failureCount = 0;

function syncFile(srcRelative, destRelative) {
  const srcPath = path.join(root, srcRelative);
  const destPath = path.join(root, destRelative);

  if (!fs.existsSync(srcPath)) {
    console.warn(`⚠️ Source file missing: ${srcRelative}`);
    return;
  }

  try {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    
    // Check if destination exists and has identical size & modification time to avoid unnecessary disk I/O
    if (fs.existsSync(destPath)) {
      const srcStat = fs.statSync(srcPath);
      const destStat = fs.statSync(destPath);
      if (srcStat.size === destStat.size && Math.abs(srcStat.mtimeMs - destStat.mtimeMs) < 1000) {
        return; // Already up to date
      }
    }

    fs.copyFileSync(srcPath, destPath);
    syncCount++;
  } catch (err) {
    console.error(`❌ Failed to sync ${srcRelative}: ${err.message}`);
    failureCount++;
  }
}

function syncDirectory(srcDirRelative, destDirRelative) {
  const srcDirPath = path.join(root, srcDirRelative);
  if (!fs.existsSync(srcDirPath)) {
    console.warn(`⚠️ Directory missing: ${srcDirRelative}`);
    return;
  }

  const entries = fs.readdirSync(srcDirPath, { withFileTypes: true });
  for (const entry of entries) {
    // Ignore hidden files and system temp files
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

    const srcEntryRelative = path.join(srcDirRelative, entry.name);
    const destEntryRelative = path.join(destDirRelative, entry.name);

    if (entry.isDirectory()) {
      syncDirectory(srcEntryRelative, destEntryRelative);
    } else if (entry.isFile()) {
      syncFile(srcEntryRelative, destEntryRelative);
    }
  }
}

console.log('🔄 Starting VirtuLab Kenya asset synchronization to Android APK assets...');

// 1. Root files
const rootFiles = [
  'client/sw.js',
  'client/manifest.json',
  'client/index.html',
  'client/favicon.ico',
  'client/privacy.html',
  'client/terms.html'
];

for (const file of rootFiles) {
  const relativeName = path.basename(file);
  syncFile(file, path.join('pwa-android/app/src/main/assets', relativeName));
}

// 2. Full directory mirrors
const directoriesToSync = [
  ['client/shared', 'pwa-android/app/src/main/assets/shared'],
  ['client/student', 'pwa-android/app/src/main/assets/student'],
  ['client/teacher', 'pwa-android/app/src/main/assets/teacher'],
  ['client/admin', 'pwa-android/app/src/main/assets/admin']
];

for (const [srcDir, destDir] of directoriesToSync) {
  syncDirectory(srcDir, destDir);
}

if (failureCount > 0) {
  console.error(`\n⚠️ Asset sync finished with ${failureCount} error(s). (Synced ${syncCount} files)`);
  process.exit(1);
} else {
  console.log(`\n🎉 ALL_SYNCED_SUCCESSFULLY: ${syncCount} files updated in pwa-android/app/src/main/assets/`);
}
