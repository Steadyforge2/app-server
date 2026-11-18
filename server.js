const http = require('node:http');

const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY_BYTES = 1024 * 1024; // 1 MB

const server = http.createServer((req, res) => {
  const chunks = [];
  let size = 0;

  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });

  req.on('end', () => {
    const rawBody = Buffer.concat(chunks).toString('utf8');
    let data = rawBody;

    if (req.headers['content-type']?.includes('application/json') && rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
        return;
      }
    }

    console.log('\n--- Incoming request ---');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Data:', data);
    console.log('------------------------\n');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Request received' }));
  });

  req.on('error', (err) => {
    console.error('Request error:', err.message);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
