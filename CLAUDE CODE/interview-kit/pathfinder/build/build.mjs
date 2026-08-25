#!/usr/bin/env node
/**
 * Pathfinder token build.
 *
 *   Figma: Pathfinder Design System V.3
 *        │  build/figma-extract.js  (runs in Figma, not here)
 *        ▼
 *   tokens/*.tokens.json  (W3C DTCG) + tokens/figma-source.json (provenance)
 *        │
 *        ├─ resolve aliases · enforce one-way tier flow · audit
 *        │
 *        ├─→ dist/pathfinder.css          CSS custom properties, light + dark
 *        ├─→ dist/pathfinder.tokens.json  flattened + resolved, for any other consumer
 *        ├─→ dist/Pathfinder.swift        iOS — proof the source is platform-agnostic
 *        └─→ dist/pathfinder.skill.md     machine-readable guidance, GENERATED
 *                                         from the same source as the CSS
 *
 * The last output is the point. The skill file falls out of the same source as the CSS,
 * so it cannot drift from the system it describes. Its audit section is generated too —
 * which is why it says uncomfortable things about the file it came from.
 *
 * Usage:
 *   node build/build.mjs            build; fail on architecture violations
 *   node build/build.mjs --strict   also fail on findings at severity=fail
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STRICT = process.argv.includes('--strict');
const readRaw = (p) => readFileSync(join(ROOT, p), 'utf8');
const read = (p) => JSON.parse(readRaw(p));

const SOURCES = [
  'tokens/primitive.tokens.json',
  'tokens/semantic.tokens.json',
  'tokens/typography.tokens.json',
  'tokens/elevation.tokens.json',
  'tokens/component.tokens.json'
];

const [primitive, semantic, typography, elevation, component] = SOURCES.map(read);
const provenance = read('tokens/figma-source.json');

/* Version stamp: any change to any token source changes this. metadata.mjs stores it
   in each component record, which is how a record can report itself stale. */
const tokensVersion =
  'sha256:' + createHash('sha256').update(SOURCES.map(readRaw).join('')).digest('hex').slice(0, 16);

const TIER = { primitive: 0, semantic: 1, typography: 1, elevation: 1, focus: 1, backdrop: 1, component: 2 };
const MODES = ['light', 'dark'];

const errors = [];
const warnings = [];
const findings = [];   // audit output — printed, and written into the generated guidance

/* ── flatten a DTCG tree into { 'dot.path': token } ───────────────────── */
function flatten(node, prefix = [], out = {}) {
  for (const [key, val] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    if (val && typeof val === 'object' && '$value' in val) {
      out[[...prefix, key].join('.')] = val;
    } else if (val && typeof val === 'object') {
      flatten(val, [...prefix, key], out);
    }
  }
  return out;
}

const flatPrimitive = flatten(primitive);
const flatSemanticAll = flatten(semantic);
const flatOther = { ...flatten(typography), ...flatten(elevation) };
const flatComponent = flatten(component);

/* semantic paths arrive as `semantic.light.bg.app`; strip the mode so a component
   can reference `{semantic.bg.app}` and resolve per mode. */
const semanticByMode = Object.fromEntries(MODES.map((m) => [m, {}]));
for (const [path, tok] of Object.entries(flatSemanticAll)) {
  const parts = path.split('.');            // semantic, <mode>, <name...>
  const mode = parts[1];
  if (!MODES.includes(mode)) continue;
  semanticByMode[mode]['semantic.' + parts.slice(2).join('.')] = tok;
}

const REF = /^\{([^}]+)\}$/;
const tierOf = (path) => TIER[path.split('.')[0]];

/* ── resolve one value, following references, enforcing the flow ───────── */
function resolveValue(path, raw, mode, table, seen = new Set()) {
  if (typeof raw !== 'string' || !REF.test(raw)) return raw;
  const target = raw.match(REF)[1];

  const from = tierOf(path);
  const to = tierOf(target);
  if (from !== undefined && to !== undefined && to > from) {
    errors.push(`${path} → {${target}} references a HIGHER tier. Flow must be primitive → semantic → component.`);
    return raw;
  }
  if (from !== undefined && to !== undefined && to === from && path.split('.')[0] === target.split('.')[0]) {
    warnings.push(`${path} → {${target}} is a same-tier reference. Usually a sign the token should not exist.`);
  }
  if (seen.has(target)) {
    errors.push(`Circular reference: ${[...seen, target].join(' → ')}`);
    return raw;
  }
  seen.add(path);

  const next = table[target];
  if (!next) {
    errors.push(`${path} → {${target}} does not resolve. Broken reference.`);
    return raw;
  }
  return resolveValue(target, next.$value, mode, table, seen);
}

/* Composite tokens (typography, shadow) hold sub-values, each of which may itself be
   a reference. Resolving only top-level strings would silently ship the literal
   string "{primitive.font.weight.bold}" into the CSS. */
function resolveToken(path, tok, mode, table) {
  const raw = tok.$value;
  if (Array.isArray(raw) && raw.every((l) => l && typeof l === 'object')) {
    return raw.map((layer) =>
      Object.fromEntries(Object.entries(layer).map(([k, v]) => [k, resolveValue(path, v, mode, table)]))
    );
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, resolveValue(path, v, mode, table)]));
  }
  return resolveValue(path, raw, mode, table);
}

/* ── resolve everything, per mode ─────────────────────────────────────── */
const resolved = {};
for (const mode of MODES) {
  const table = { ...flatPrimitive, ...semanticByMode[mode], ...flatOther, ...flatComponent };
  resolved[mode] = {};
  for (const [path, tok] of Object.entries(table)) {
    resolved[mode][path] = { $type: tok.$type, $value: resolveToken(path, tok, mode, table) };
  }
}

/* ── audit 1 · does the mirror still match the file? ──────────────────── */
const nonCodeOnly = (prefix) =>
  Object.entries(flatPrimitive).filter(([p, t]) => p.startsWith(prefix) && !t.$codeOnly).length;

const MIRROR = {
  'PF3/Primitives': nonCodeOnly('primitive.color.'),
  'PF3/Spacing': nonCodeOnly('primitive.space.'),
  'PF3/Radius': nonCodeOnly('primitive.radius.'),
  'PF3/Sizing': nonCodeOnly('primitive.size.'),
  'PF3/Opacity': nonCodeOnly('primitive.opacity.'),
  'PF3/Semantic': Object.keys(semanticByMode.light).length
};
for (const col of provenance.collections) {
  const local = MIRROR[col.name];
  if (local === undefined) continue;
  if (local !== col.variables) {
    errors.push(
      `Mirror drift: ${col.name} has ${col.variables} variables in Figma, ${local} in tokens/. ` +
        `Re-run build/figma-extract.js — the token files no longer describe the file.`
    );
  }
}

/* ── audit 2 · semantic names that are value-identical in both modes ──── */
const dupes = {};
for (const path of Object.keys(semanticByMode.light)) {
  const key = `${resolved.light[path].$value}|${resolved.dark[path].$value}`;
  (dupes[key] ||= []).push(path);
}
const clusters = Object.values(dupes)
  .filter((g) => g.length > 1)
  .sort((a, b) => b.length - a.length);
for (const group of clusters) {
  findings.push({
    kind: 'duplicate-semantics',
    severity: 'warn',
    text: `${group.length} names resolve identically in both modes: ${group.join(', ')}`
  });
}

/* ── audit 3 · contrast ───────────────────────────────────────────────── */
const srgb = (hex) => {
  const h = hex.replace('#', '').slice(0, 6);
  return [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
};
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const ratio = (a, b) => {
  const [l1, l2] = [lum(srgb(a)), lum(srgb(b))].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/* [foreground, background, minimum, WCAG clause, severity when it misses]
   Severity is part of the pair, not of the result. A border that is the only thing
   marking an input's boundary has to clear 3:1; a divider drawn between two rows
   that are already distinguishable does not, and reporting both as failures is how
   an accessibility check earns the right to be ignored. */
const PAIRS = [
  ['semantic.text.primary', 'semantic.bg.app', 4.5, '1.4.3 body text', 'fail'],
  ['semantic.text.secondary', 'semantic.bg.app', 4.5, '1.4.3 body text', 'fail'],
  ['semantic.text.tertiary', 'semantic.bg.app', 4.5, '1.4.3 body text', 'fail'],
  ['semantic.text.label', 'semantic.bg.app', 4.5, '1.4.3 form labels', 'fail'],
  ['semantic.text.link', 'semantic.bg.app', 4.5, '1.4.3 links', 'fail'],
  ['semantic.text.placeholder', 'semantic.bg.input', 4.5, '1.4.3 — placeholders are text', 'fail'],
  ['semantic.text.badge', 'semantic.bg.badge', 4.5, '1.4.3 body text', 'fail'],
  ['semantic.text.nav-default', 'semantic.bg.app', 4.5, '1.4.3 body text', 'fail'],
  ['semantic.text.tooltip', 'semantic.bg.tooltip', 4.5, '1.4.3 body text', 'fail'],
  ['semantic.status.error', 'semantic.bg.app', 4.5, '1.4.3 status text', 'fail'],
  ['semantic.status.success', 'semantic.bg.app', 4.5, '1.4.3 status text', 'fail'],
  ['semantic.status.warning', 'semantic.bg.app', 4.5, '1.4.3 status text', 'fail'],
  ['component.button.fg', 'component.button.bg', 4.5, '1.4.3 label on control', 'fail'],
  ['component.input.fg', 'component.input.bg', 4.5, '1.4.3 value on control', 'fail'],
  ['semantic.border.input', 'semantic.bg.input', 3.0, '1.4.11 — the border is the field boundary', 'fail'],
  ['semantic.border.focus-ring', 'semantic.bg.app', 3.0, '1.4.11 focus indicator vs page', 'fail'],
  ['component.button.focus-ring', 'component.button.bg', 3.0, '1.4.11 — adjacency only applies at outline-offset 0; the ring is offset 2px over bg/app, so this is the ratio it would have if anyone removed the offset', 'warn'],
  ['semantic.border.default', 'semantic.bg.app', 3.0, 'decorative — 1.4.11 applies only if this border is the sole boundary signal', 'warn'],
  ['semantic.border.divider', 'semantic.bg.app', 3.0, 'decorative — dividers separate content that is already distinguishable', 'warn']
];

const contrast = [];
for (const mode of MODES) {
  for (const [fg, bg, min, why, severity] of PAIRS) {
    const a = resolved[mode][fg]?.$value;
    const b = resolved[mode][bg]?.$value;
    if (typeof a !== 'string' || typeof b !== 'string') continue;
    const r = Math.round(ratio(a, b) * 100) / 100;
    const row = { mode, fg, bg, min, why, severity, ratio: r, pass: r >= min };
    contrast.push(row);
    if (!row.pass) {
      findings.push({
        kind: 'contrast',
        severity,
        text: `${mode}: ${fg} on ${bg} is ${r}:1, below the ${min}:1 it needs — ${why} (${a} on ${b})`
      });
    }
  }
}

/* ── audit 4 · findings carried in from the extraction ────────────────── */
for (const f of provenance.findings) {
  findings.push({ kind: f.id, severity: f.severity, text: f.claim, fix: f.fix });
}

/* ── emit ─────────────────────────────────────────────────────────────── */
const cssVar = (p) => '--' + p.replace(/\./g, '-');
const quoteFamily = (v) => (Array.isArray(v) ? v : [v]).map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ');
const shadowCss = (layers) =>
  layers
    .map((l) =>
      [l.inset ? 'inset' : null, l.offsetX || '0', l.offsetY || '0', l.blur || '0', l.spread || '0', l.color]
        .filter(Boolean)
        .join(' ')
    )
    .join(', ');

/* One token can produce more than one declaration: a composite typography token
   becomes six, because CSS has no composite custom-property type to bind it to. */
function declarations(path, tok) {
  const v = tok.$value;
  if (tok.$type === 'typography') {
    const out = [
      [`${cssVar(path)}-font-family`, quoteFamily(v.fontFamily)],
      [`${cssVar(path)}-font-weight`, v.fontWeight],
      [`${cssVar(path)}-font-size`, v.fontSize],
      [`${cssVar(path)}-line-height`, v.lineHeight],
      [`${cssVar(path)}-letter-spacing`, v.letterSpacing],
      [`${cssVar(path)}-font`, `${v.fontWeight} ${v.fontSize}/${v.lineHeight} ${quoteFamily(v.fontFamily)}`]
    ];
    if (v.textTransform) out.push([`${cssVar(path)}-text-transform`, v.textTransform]);
    return out;
  }
  if (tok.$type === 'shadow') return [[cssVar(path), shadowCss(v)]];
  if (tok.$type === 'fontFamily') return [[cssVar(path), quoteFamily(v)]];
  return [[cssVar(path), v]];
}

const isModal = (p) => p.startsWith('semantic.') || p.startsWith('component.');

function emitCss() {
  const lines = [
    '/* Pathfinder — generated by build/build.mjs. Do not edit by hand. */',
    `/* Source:  ${provenance.file.name} · ${provenance.file.key} */`,
    `/* Tokens:  ${SOURCES.length} DTCG files, ${tokensVersion} */`,
    ''
  ];

  lines.push(':root {');
  lines.push('  color-scheme: light dark;');
  lines.push('');
  for (const [p, t] of Object.entries(resolved.light)) {
    if (!isModal(p)) for (const [n, v] of declarations(p, t)) lines.push(`  ${n}: ${v};`);
  }
  lines.push('');
  lines.push('  /* light is the default mode, as it is in the Figma collection */');
  for (const [p, t] of Object.entries(resolved.light)) {
    if (isModal(p)) for (const [n, v] of declarations(p, t)) lines.push(`  ${n}: ${v};`);
  }
  lines.push('}');
  lines.push('');
  lines.push('[data-theme="dark"] {');
  for (const [p, t] of Object.entries(resolved.dark)) {
    if (!isModal(p)) continue;
    const now = declarations(p, t);
    const before = declarations(p, resolved.light[p]);
    now.forEach(([n, v], i) => {
      if (String(v) !== String(before[i][1])) lines.push(`  ${n}: ${v};`);
    });
  }
  lines.push('}');
  lines.push('');
  lines.push('@media (prefers-reduced-motion: reduce) {');
  lines.push('  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }');
  lines.push('}');
  return lines.join('\n') + '\n';
}

function emitSwift() {
  const camel = (p) =>
    p
      .split('.')
      .map((s, i) => (i === 0 ? s : s[0].toUpperCase() + s.slice(1)))
      .join('')
      .replace(/-(\w)/g, (_, c) => c.toUpperCase());
  const hexToSwift = (hex) => {
    const h = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3));
    return `Color(red: ${r}, green: ${g}, blue: ${b})`;
  };
  const out = [
    '// Pathfinder — generated by build/build.mjs. Same source as pathfinder.css.',
    `// ${provenance.file.name} · ${tokensVersion}`,
    'import SwiftUI',
    ''
  ];
  for (const mode of MODES) {
    out.push(`enum Pathfinder${mode[0].toUpperCase()}${mode.slice(1)} {`);
    for (const [p, t] of Object.entries(resolved[mode])) {
      if (t.$type === 'color' && typeof t.$value === 'string' && t.$value.startsWith('#')) {
        out.push(`    static let ${camel(p)} = ${hexToSwift(t.$value)}`);
      }
    }
    out.push('}');
    out.push('');
  }
  return out.join('\n');
}

function emitSkill() {
  const names = (prefix, mode = 'light') => Object.keys(resolved[mode]).filter((p) => p.startsWith(prefix));
  const semanticNames = names('semantic.');
  const componentNames = names('component.');
  const typeNames = names('typography.');
  const spaceNames = names('primitive.space.');
  const failing = contrast.filter((c) => !c.pass && c.severity === 'fail');
  const soft = contrast.filter((c) => !c.pass && c.severity !== 'fail');
  const worst = [...contrast].filter((c) => c.pass).sort((a, b) => a.ratio - b.ratio).slice(0, 6);

  const audit = findings
    .filter((f) => f.kind !== 'duplicate-semantics' && f.kind !== 'contrast')
    .map((f) => `- **${f.kind}** (${f.severity}) — ${f.text}${f.fix ? `\n  - Fix: ${f.fix}` : ''}`)
    .join('\n');

  return `# Pathfinder — generated system guidance

<!-- GENERATED by build/build.mjs from tokens/*.tokens.json. Do not edit by hand.
     This file cannot drift from the system: it is built from the same source as the CSS.
     Source: ${provenance.file.name} (${provenance.file.key}), extracted ${provenance.file.extractedAt}.
     Token version: ${tokensVersion} -->

## Counts

- primitive:  ${names('primitive.').length}
- semantic:   ${semanticNames.length} (× ${MODES.length} modes)
- typography: ${typeNames.length}
- elevation:  ${names('elevation.').length + names('focus.').length + names('backdrop.').length}
- component:  ${componentNames.length}

## Rules

1. Every value in generated code resolves to a token. A raw hex or an off-scale pixel is a defect.
2. Components bind to \`component.*\` or \`semantic.*\`. Never to \`primitive.*\` for colour.
3. Spacing comes only from this scale: ${spaceNames.map((p) => p.split('.').pop()).join(', ')} — the key is half the pixel value, so \`space/8\` is 16px. Values between steps do not exist.
4. Type comes only from the ramp: ${typeNames.map((p) => p.replace('typography.', '')).join(', ')}. There is no loose font-size scale to reach for.
5. Every interactive element carries a visible \`:focus-visible\` ring using \`${cssVar('semantic.border.focus-ring')}\`, 2px at 2px offset.
6. Minimum target 44×44, reached with an invisible hit area where the visual control is smaller — every control height in PF3/Sizing is below 44.
7. No state is signalled by colour alone.
8. Legacy collections (\`_Legacy/*\`) are out of bounds. If a value is only available there, that is a gap to report, not a token to use.

## Semantic tokens (the public API)

${semanticNames.map((p) => `- \`${cssVar(p)}\` — light \`${resolved.light[p].$value}\` · dark \`${resolved.dark[p].$value}\``).join('\n')}

## Type ramp

${typeNames
  .map(
    (p) =>
      `- \`${cssVar(p)}-font\` — ${resolved.light[p].$value.fontWeight} ${resolved.light[p].$value.fontSize}/${resolved.light[p].$value.lineHeight}, tracking ${resolved.light[p].$value.letterSpacing}`
  )
  .join('\n')}

## Component tokens

${componentNames.map((p) => `- \`${cssVar(p)}\``).join('\n')}

## Audit — generated, not curated

${audit}

### Duplicate semantics

${
  clusters.length
    ? clusters
        .map((g) => `- ${g.length} names, one value: ${g.map((p) => `\`${p.replace('semantic.', '')}\``).join(', ')}`)
        .join('\n')
    : '- none'
}

### Contrast

${
  failing.length
    ? failing.map((c) => `- **FAIL** ${c.mode} · \`${c.fg}\` on \`${c.bg}\` — ${c.ratio}:1, needs ${c.min}:1 · ${c.why}`).join('\n')
    : `- all ${contrast.length} checked pairs pass`
}
${
  soft.length
    ? '\nBelow threshold but not a violation:\n\n' +
      soft.map((c) => `- ${c.mode} · \`${c.fg}\` on \`${c.bg}\` — ${c.ratio}:1 · ${c.why}`).join('\n')
    : ''
}

Tightest passing pairs, for anyone about to darken a background:

${worst.map((c) => `- ${c.ratio}:1 — ${c.mode} · ${c.fg} on ${c.bg} (needs ${c.min})`).join('\n')}
`;
}

/* ── write ────────────────────────────────────────────────────────────── */
mkdirSync(join(ROOT, 'dist'), { recursive: true });
writeFileSync(join(ROOT, 'dist/pathfinder.css'), emitCss());
writeFileSync(join(ROOT, 'dist/Pathfinder.swift'), emitSwift());
writeFileSync(join(ROOT, 'dist/pathfinder.skill.md'), emitSkill());
writeFileSync(
  join(ROOT, 'dist/pathfinder.tokens.json'),
  JSON.stringify(
    {
      $description: 'Resolved Pathfinder tokens, all modes.',
      provenance: {
        file: provenance.file,
        collections: provenance.collections.map((c) => `${c.name} (${c.variables})`),
        tokensVersion,
        generator: 'build/build.mjs'
      },
      audit: { findings, contrast },
      modes: resolved
    },
    null,
    2
  ) + '\n'
);

/* ── report ───────────────────────────────────────────────────────────── */
const count = Object.keys(resolved.light).length;
const failing = findings.filter((f) => f.severity === 'fail');
console.log(`\n  Pathfinder build   ${tokensVersion}`);
console.log(`  ${'─'.repeat(62)}`);
console.log(`  source            ${provenance.file.name} · ${provenance.file.key}`);
console.log(`  tokens resolved   ${count} × ${MODES.length} modes`);
console.log(`  outputs           dist/pathfinder.css`);
console.log(`                    dist/pathfinder.tokens.json`);
console.log(`                    dist/Pathfinder.swift`);
console.log(`                    dist/pathfinder.skill.md`);

console.log(`\n  contrast          ${contrast.filter((c) => c.pass).length}/${contrast.length} pairs pass`);
for (const c of contrast.filter((c) => !c.pass)) {
  const mark = c.severity === 'fail' ? '✗' : '·';
  console.log(`    ${mark} ${c.mode.padEnd(5)} ${c.fg} on ${c.bg} — ${c.ratio}:1, needs ${c.min}:1  ${c.severity === 'fail' ? '' : '(' + c.why.split('—')[0].trim() + ')'}`);
}

console.log(`\n  audit             ${findings.length} findings`);
for (const f of findings.filter((x) => x.kind !== 'duplicate-semantics' && x.kind !== 'contrast')) {
  console.log(`    · ${f.kind} — ${f.text}`);
}
if (clusters.length) {
  console.log(
    `    · duplicate-semantics — ${clusters.length} clusters, ${clusters.reduce((n, g) => n + g.length, 0)} names`
  );
  for (const g of clusters.slice(0, 4)) console.log(`        ${g.map((p) => p.replace('semantic.', '')).join(' = ')}`);
  if (clusters.length > 4) console.log(`        …and ${clusters.length - 4} more (full list in the generated guidance)`);
}

if (warnings.length) {
  console.log(`\n  warnings (${warnings.length})`);
  warnings.forEach((w) => console.log(`    · ${w}`));
}
if (errors.length) {
  console.log(`\n  ERRORS (${errors.length})`);
  errors.forEach((e) => console.log(`    ✗ ${e}`));
  console.log('');
  process.exit(1);
}
console.log(`\n  governance        one-way flow enforced, 0 violations`);
if (STRICT && failing.length) {
  console.log(`  strict            ${failing.length} finding(s) at severity=fail\n`);
  process.exit(1);
}
console.log(
  failing.length
    ? `  note              ${failing.length} finding(s) at severity=fail — run --strict to make them block\n`
    : '\n'
);
