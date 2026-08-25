// PetWatch Reconsidered — the one build script.
// One source tree, one command, two output flavors:
//   dist/index.html + dist/prototype.html      self-contained pages (Vercel, local)
//   dist/artifacts/*.html                      body-fragment variants for claude.ai
//                                              artifact publishing (host supplies the
//                                              document skeleton)
// v1 shipped a stale public page because it had two build scripts and three trees.
// This file exists so that class of bug can't.
//
// Usage: node build.mjs [--casestudy-url=URL] [--prototype-url=URL]
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(root, p), 'utf8');
const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const tokens = read('tokens.css');
const domain = read('domain/caremoment.js').replace(/^export /gm, '');
const app = read('prototype/app.js').replace(/^import\s+\{[\s\S]*?\}\s+from\s+'[^']*';\n/m, '');
if (/^import\s/m.test(app)) throw new Error('unstripped import remains in app.js');

const urls = {
  // relative pair for the self-contained dist; artifact URLs injected via CLI
  dist: { casestudy: './index.html', prototype: './prototype.html' },
  artifact: {
    casestudy: arg('casestudy-url', './index.html'),
    prototype: arg('prototype-url', './prototype.html'),
  },
};

function assemble(page, { casestudy, prototype }) {
  let html = read(page);
  html = html.replace(
    /<link rel="stylesheet" href="\.\.\/tokens\.css">/,
    `<style>\n${tokens}\n</style>`,
  );
  html = html.replace(
    /<script type="module" src="\.\/app\.js"><\/script>/,
    () => `<script type="module">\n${domain}\n${app}\n</script>`,
  );
  html = html.replaceAll('__CASESTUDY_URL__', casestudy).replaceAll('__PROTOTYPE_URL__', prototype);
  // photographs of Hex, inlined: a published page fetches nothing but fonts
  html = html.replace(/\.\.\/assets\/([\w-]+\.jpg)/g, (_, file) => {
    const b64 = readFileSync(join(root, 'assets', file)).toString('base64');
    return `data:image/jpeg;base64,${b64}`;
  });
  return html;
}

// claude.ai artifacts supply their own <!doctype>/<head>/<body>; hand them a
// fragment: <title> first (scanned from the first 8KB), then everything the
// page needs inline.
function toFragment(html) {
  const title = html.match(/<title>[\s\S]*?<\/title>/)?.[0] ?? '';
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';
  const keep = [...head.matchAll(/<link[^>]*fonts\.googleapis[^>]*>|<style>[\s\S]*?<\/style>/g)]
    .map((m) => m[0])
    .join('\n');
  const body = html.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? '';
  return `${title}\n${keep}\n${body}`;
}

mkdirSync(join(root, 'dist/artifacts'), { recursive: true });

const pages = [
  { src: 'casestudy/index.html', dist: 'dist/index.html', frag: 'dist/artifacts/casestudy.html' },
  {
    src: 'prototype/index.html',
    dist: 'dist/prototype.html',
    frag: 'dist/artifacts/prototype.html',
  },
];
for (const p of pages) {
  writeFileSync(join(root, p.dist), assemble(p.src, urls.dist));
  writeFileSync(join(root, p.frag), toFragment(assemble(p.src, urls.artifact)));
  console.log(`built ${p.dist} and ${p.frag}`);
}

// The Vercel payload is a build output, never a hand-maintained copy — v1
// shipped a stale public page exactly because its share build was edited by
// hand and never regenerated.
const deployDir = join(root, '..', 'petwatch-reconsidered');
if (existsSync(deployDir)) {
  copyFileSync(join(root, 'dist/index.html'), join(deployDir, 'index.html'));
  copyFileSync(join(root, 'dist/prototype.html'), join(deployDir, 'prototype.html'));
  console.log('copied dist pages to ../petwatch-reconsidered (Vercel payload)');
}
