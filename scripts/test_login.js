const http = require('http');

const postData = JSON.stringify({
  email: 'student1@test.com',
  password: 'password123'
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/auth/student/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('LOGIN_STATUS:', res.statusCode);
    console.log('LOGIN_RESPONSE:', body);
  });
});

req.on('error', (e) => console.error('ERR:', e));
req.write(postData);
req.end();
