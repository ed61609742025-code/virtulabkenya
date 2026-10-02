const https = require('https');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('Testing Render Health Check...');
  try {
    const health = await request({
      hostname: 'virtulab-web.onrender.com',
      path: '/api/health',
      method: 'GET'
    });
    console.log('Health Response:', health.statusCode, health.body);
  } catch (err) {
    console.error('Health Error:', err.message);
  }

  console.log('\nTesting Student Login (student1@test.com)...');
  const payload = JSON.stringify({ email: 'student1@test.com', password: 'password123' });
  try {
    const login = await request({
      hostname: 'virtulab-web.onrender.com',
      path: '/api/auth/student/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, payload);
    console.log('Login Status:', login.statusCode);
    console.log('Login Body:', login.body);
  } catch (err) {
    console.error('Login Error:', err.message);
  }
}

run();
