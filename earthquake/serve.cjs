const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.geojson': 'application/geo+json' };
const server = http.createServer((req, res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
  if (!file.startsWith(root + path.sep) || !['.html', '.css', '.js', '.svg', '.geojson'].includes(path.extname(file))) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => { if (error) res.writeHead(404).end(); else { res.writeHead(200, { 'Content-Type': mime[path.extname(file)], 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' }); res.end(data); } });
});
server.listen(8000, '127.0.0.1', () => console.log('Open http://127.0.0.1:8000 — Ctrl+C to stop.'));
