import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.bib': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
};
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let path = resolve(root, '.' + decodeURIComponent(url.pathname));
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    try {
      if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    } catch {}
    let body;
    try {
      body = await readFile(path);
    } catch {
      res
        .writeHead(404, { 'Content-Type': 'text/html' })
        .end(await readFile(resolve(root, '404.html')));
      return;
    }
    res
      .writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' })
      .end(body);
  } catch {
    res.writeHead(400).end('Bad request');
  }
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));
