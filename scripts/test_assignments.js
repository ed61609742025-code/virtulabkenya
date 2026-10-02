const http = require('http');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6InN0dWRlbnQiLCJuYW1lIjoiVGVzdCBTdHVkZW50IiwiZW1haWwiOiJzdHVkZW50MUB0ZXN0LmNvbSIsImlhdCI6MTc5MDk2MjY4NiwiZXhwIjoxNzkxNTY3NDg2fQ.Bxx7d_7MR8FgXYBz1QwW4yQdzvaJejY3N51YfMZxBQk";

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/assignments/mine',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('ASSIGNMENTS_STATUS:', res.statusCode);
    const data = JSON.parse(body);
    console.log('COUNT:', data.assignments ? data.assignments.length : 0);
    if (data.assignments && data.assignments.length > 0) {
      console.log('SAMPLE_ASSIGNMENTS:', data.assignments.slice(0, 3).map(a => ({ id: a.id, title: a.title, type: a.titration_type })));
    }
  });
});

req.on('error', (e) => console.error('ERR:', e));
req.end();
