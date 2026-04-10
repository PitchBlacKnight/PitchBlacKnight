const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = '/Users/mikelrosenthal/PitchBlacKnight/ASSETS/deploy';
const PORT = 3000;
const MIME = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.mp3':'audio/mpeg','.mp4':'video/mp4','.m4a':'audio/mp4','.svg':'image/svg+xml','.ico':'image/x-icon','.json':'application/json','.pdf':'application/pdf','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf' };
http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/' || url === '') url = '/index.html';
  const file = path.join(ROOT, url);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('Server running on http://localhost:' + PORT));
