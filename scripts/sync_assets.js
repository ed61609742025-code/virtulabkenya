const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const filesToSync = [
  ['client/student/login.html', 'pwa-android/app/src/main/assets/student/login.html'],
  ['client/student/home.html', 'pwa-android/app/src/main/assets/student/home.html'],
  ['client/shared/api.js', 'pwa-android/app/src/main/assets/shared/api.js'],
  ['client/student/css/dashboard.css', 'pwa-android/app/src/main/assets/student/css/dashboard.css'],
  ['client/student/css/mobile.css', 'pwa-android/app/src/main/assets/student/css/mobile.css'],
  ['client/student/js/home.js', 'pwa-android/app/src/main/assets/student/js/home.js']
];

for (const [src, dest] of filesToSync) {
  const srcPath = path.join(root, src);
  const destPath = path.join(root, dest);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${src} -> ${dest}`);
}
console.log('ALL_SYNCED_SUCCESSFULLY');
