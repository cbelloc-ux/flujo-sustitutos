const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'text/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  let filePath;

  if (url === '/') {
    filePath = path.join(ROOT, 'index.html');
  } else if (url.startsWith('/')) {
    const firstSegment = url.split('/')[1];
    if (['frutas', 'carnes', 'temporadas', 'mascotas', 'vinos', 'deli', 'belleza', 'babies'].includes(firstSegment)) {
      filePath = path.join(ROOT, 'plp.html');
    } else if (url.endsWith('.html') || url.endsWith('.css') || url.endsWith('.js') || url.startsWith('/assets/')) {
      filePath = path.join(ROOT, url);
    } else {
      filePath = path.join(ROOT, url);
    }
  } else {
    filePath = path.join(ROOT, url);
  }

  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
