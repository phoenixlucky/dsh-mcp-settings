// Local static server for the jsdom card preview; serves docs/preview only.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve('E:/home/dsh-mcp/docs/preview');
const port = Number(process.env.PREVIEW_PORT || 8791);

http.createServer((request, response) => {
  const name = decodeURIComponent((request.url || '/').split('?')[0]).replace(/^\/+/, '') || 'mcp-settings-preview.html';
  const file = path.resolve(root, name);
  const relative = path.relative(root, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    response.writeHead(403).end('forbidden');
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404).end('not found');
      return;
    }
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }).end(data);
  });
}).listen(port, '127.0.0.1', () => console.log(`preview server on http://127.0.0.1:${port}/`));
