const http = require('node:http');
const { randomUUID } = require('node:crypto');
const { mkdir, writeFile } = require('node:fs/promises');
const path = require('node:path');

const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY_BYTES = 1024 * 1024;
const REQUESTS_DIR = path.join(__dirname, 'requests');

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const receivedAt = new Date();
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

  req.on('end', async () => {
    const body = Buffer.concat(chunks);
    const rawBody = body.toString('utf8');
    const isJson = req.headers['content-type']?.includes('application/json');
    let data = rawBody;

    if (isJson && rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        sendJson(res, 400, { success: false, error: 'Invalid JSON' });
        return;
      }
    }

    const timestamp = receivedAt.toISOString().replace(/:/g, '-');
    const extension = isJson && rawBody ? 'json' : 'txt';
    const filename = `${timestamp}-${randomUUID()}.${extension}`;

    try {
      await writeFile(path.join(REQUESTS_DIR, filename), body, { flag: 'wx' });
    } catch (err) {
      console.error('Could not save request:', err.message);
      sendJson(res, 500, { success: false, error: 'Could not save request' });
      return;
    }

    console.log('\n--- Incoming request ---');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Data:', data);
    console.log('Saved file:', filename);

    sendJson(res, 200, { success: true, message: 'Request received' });
  });

  req.on('error', (err) => {
    console.error('Request error:', err.message);
  });
});

async function start() {
  await mkdir(REQUESTS_DIR, { recursive: true });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Could not start server:', err.message);
  process.exitCode = 1;
});