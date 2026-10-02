const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcApk = path.join(root, 'pwa-android/app/build/outputs/apk/debug/app-debug.apk');

if (!fs.existsSync(srcApk)) {
  console.error('Source APK not found at', srcApk);
  process.exit(1);
}

const stats = fs.statSync(srcApk);
console.log('Source APK size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');

const dest1 = path.join(root, 'VirtuLab_Kenya.apk');
const dest2 = path.join(root, 'VirtuLab_Kenya_PWA.apk');

fs.copyFileSync(srcApk, dest1);
console.log('Copied to', dest1);

fs.copyFileSync(srcApk, dest2);
console.log('Copied to', dest2);

console.log('APK_DEPLOYMENT_COMPLETE');
