const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const filesToSync = [
  ['client/student/login.html', 'pwa-android/app/src/main/assets/student/login.html'],
  ['client/student/home.html', 'pwa-android/app/src/main/assets/student/home.html'],
  ['client/shared/api.js', 'pwa-android/app/src/main/assets/shared/api.js'],
  ['client/student/css/dashboard.css', 'pwa-android/app/src/main/assets/student/css/dashboard.css'],
  ['client/student/css/mobile.css', 'pwa-android/app/src/main/assets/student/css/mobile.css'],
  ['client/student/js/home.js', 'pwa-android/app/src/main/assets/student/js/home.js'],
  ['client/sw.js', 'pwa-android/app/src/main/assets/sw.js']
];

let failureCount = 0;

for (const [src, dest] of filesToSync) {
  const srcPath = path.join(root, src);
  const destPath = path.join(root, dest);

  if (!fs.existsSync(srcPath)) {
    console.error(`❌ Source file missing: ${src}`);
    failureCount++;
    continue;
  }

  try {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Synced: ${src} -> ${dest}`);
  } catch (err) {
    console.error(`❌ Failed to sync ${src}: ${err.message}`);
    failureCount++;
  }
}

if (failureCount > 0) {
  console.error(`\n⚠️  Asset sync finished with ${failureCount} error(s).`);
  process.exit(1);
} else {
  console.log('\n🎉 ALL_SYNCED_SUCCESSFULLY');
}
