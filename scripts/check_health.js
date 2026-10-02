const http = require('http');

function check(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function main() {
  try {
    const r1 = await check('http://127.0.0.1:3000/api/health');
    console.log('LOCAL_HEALTH:', r1.status, r1.data);
    const r2 = await check('http://192.168.18.14:3000/api/health');
    console.log('LAN_HEALTH:', r2.status, r2.data);
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

main();
