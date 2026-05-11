import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/books/available',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('API Response:', JSON.stringify(jsonData, null, 2));
    } catch (err) {
      console.log('Raw Response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

req.end();
