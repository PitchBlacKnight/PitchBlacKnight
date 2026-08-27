#!/usr/bin/env node
/**
 * Keystone component metadata build.
 *
 * Emits one machine-readable record per component — the *inventory* layer, as
 * opposed to the *rules* layer that build.mjs generates.
 *
 * The point of this file is the provenance block. Each record carries a SHA-256
 * of the component source it was generated from and the token version it was
 * built against. Run `node build/metadata.mjs --check` after editing a component
 * and the record reports itself STALE. That is the difference between
 * documentation that rots silently and documentation that tells you it has.
 *
 * Usage:
 *   node build/metadata.mjs          generate records
 *   node build/metadata.mjs --check  verify records against current source
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const sha = (s) => 'sha256:' + createHash('sha256').update(s).digest('hex').slice(0, 16);

const tokensVersion = sha(
  readFileSync(join(ROOT, 'tokens/primitive.tokens.json'), 'utf8') +
  readFileSync(join(ROOT, 'tokens/semantic.tokens.json'), 'utf8') +
  readFileSync(join(ROOT, 'tokens/component.tokens.json'), 'utf8')
);

/* ────────────────────────────────────────────────────────────────────────
   Records. Written by a human — deliberately.

   The anti-patterns and selection criteria below are the only fields that
   cannot be derived from source, and they are the most valuable fields in
   the schema. A generator that emits `antiPatterns: []` has produced a
   record that looks complete and teaches an agent nothing.
   ──────────────────────────────────────────────────────────────────────── */

const RECORDS = {
  'ks-button': {
    source: 'components/ks-button.js',
    record: {
      component: {
        name: 'ks-button', category: 'atoms', type: 'interactive',
        description: 'The action control. Announces an action, never a destination.',
        status: 'stable', since: '1.0.0', replacedBy: null
      },
      tokens: {
        background: 'component.button.bg', backgroundHover: 'component.button.bg-hover',
        backgroundActive: 'component.button.bg-active', foreground: 'component.button.fg',
        radius: 'component.button.radius', focusRing: 'component.button.focus-ring',
        motion: 'component.button.motion', gap: 'component.button.gap',
        height: 'component.button.height-{size}', paddingInline: 'component.button.pad-inline-{size}'
      },
      usage: {
        useCases: ['primary-call-to-action', 'form-submit', 'destructive-confirm', 'dialog-action'],
        requiredProps: [],
        selectionCriteria: {
          primary: 'The single main action in a view. One per view — never two.',
          secondary: 'Supporting actions shown alongside a primary.',
          ghost: 'Tertiary actions in dense UI where visual weight would compete with content.',
          danger: 'Destructive actions that have already been confirmed elsewhere.'
        },
        commonPatterns: [
          { name: 'submit-with-loading', description: 'Form submit that must not reflow while pending.',
            composition: '<ks-button type="submit" loading>Save</ks-button>' },
          { name: 'confirm-pair', description: 'Destructive confirm alongside a cancel.',
            composition: '<ks-button variant="secondary">Cancel</ks-button>\n<ks-button variant="danger">Delete</ks-button>' }
        ],
        antiPatterns: [
          { scenario: 'Using ks-button to navigate to another page',
            reason: 'Buttons announce actions; links announce destinations. Screen-reader users navigate by role, so a button that navigates is unreachable in a links list.',
            alternative: 'A link element' },
          { scenario: 'Two primary buttons in one view',
            reason: 'Primary means the single main action. Two primaries means neither is.',
            alternative: 'One primary, the rest secondary' },
          { scenario: 'Icon-only button with no aria-label',
            reason: 'Produces an unlabelled control in the accessibility tree. The component warns in dev but cannot fix it.',
            alternative: 'aria-label, or a visible label' },
          { scenario: 'Removing the element from the tab order while disabled',
            reason: 'A keyboard user auditing a form cannot find a control they cannot focus.',
            alternative: 'aria-disabled plus suppressed activation — which is what this component does' }
        ]
      },
      composition: {
        slots: { default: 'label text', leadingIcon: 'optional', trailingIcon: 'optional' },
        nestedComponents: [], commonPartners: ['ks-input', 'form', 'dialog'],
        parentConstraints: ['Must not be nested inside another interactive element'],
        forbiddenParents: ['ks-button', 'a', 'button']
      },
      behavior: {
        states: [
          { name: 'default' },
          { name: 'hover', tokens: { background: 'component.button.bg-hover' } },
          { name: 'active', tokens: { background: 'component.button.bg-active' } },
          { name: 'focus-visible', tokens: { outline: 'component.button.focus-ring' },
            a11y: '2px ring at 2px offset, ≥3:1 against both the control and the surface behind it' },
          { name: 'disabled', tokens: { background: 'component.button.bg-disabled', foreground: 'component.button.fg-disabled' },
            a11y: 'aria-disabled=true, remains focusable, carries an inset border as a non-colour signal' },
          { name: 'loading', a11y: 'aria-busy=true, label persists, width does not change' }
        ],
        interactions: { click: 'fires click unless disabled or loading', Enter: 'activates', Space: 'activates' }
      },
      accessibility: {
        role: 'button',
        accessibleName: 'From slotted text, or aria-label when icon-only',
        keyboard: { Tab: 'moves focus', Enter: 'activate', Space: 'activate' },
        screenReader: 'Announces name, role, and disabled/busy state',
        focusManagement: 'delegatesFocus on the shadow root; never traps',
        contrast: [
          { pair: ['component.button.fg', 'component.button.bg'], min: 4.5 },
          { pair: ['component.button.focus-ring', 'semantic.surface'], min: 3.0 }
        ],
        nonColorSignal: 'Disabled carries an inset border and not-allowed cursor; loading carries a spinner',
        wcag: ['1.4.3', '1.4.11', '2.1.1', '2.4.7', '2.5.5', '4.1.2'],
        targetSize: '44×44 via an invisible ::after hit area, so the visual control is not inflated'
      },
      aiHints: {
        priority: 'high',
        keywords: ['button', 'action', 'submit', 'cta', 'confirm', 'delete'],
        context: 'Reach here for any action. For navigation, reach for a link instead.'
      }
    }
  },

  'ks-input': {
    source: 'components/ks-input.js',
    record: {
      component: {
        name: 'ks-input', category: 'atoms', type: 'input',
        description: 'Single-line text entry with a always-visible label and an announced error state.',
        status: 'stable', since: '1.0.0', replacedBy: null
      },
      tokens: {
        background: 'component.input.bg', foreground: 'component.input.fg',
        placeholder: 'component.input.fg-placeholder', border: 'component.input.border',
        borderHover: 'component.input.border-hover', borderInvalid: 'component.input.border-invalid',
        focusRing: 'component.input.focus-ring', radius: 'component.input.radius',
        height: 'component.input.height', paddingInline: 'component.input.pad-inline'
      },
      usage: {
        useCases: ['form-field', 'search', 'inline-edit'],
        requiredProps: ['label'],
        selectionCriteria: {
          text: 'Default. Free-form short text.',
          email: 'Triggers the correct mobile keyboard and browser validation.',
          password: 'Obscured entry. Never reuse for non-secret values.',
          search: 'Search affordance; pair with a clear control.'
        },
        commonPatterns: [
          { name: 'field-with-hint', description: 'Helper text that explains why the value is needed.',
            composition: '<ks-input label="Work email" type="email" helper="We only use this to send your invite."></ks-input>' },
          { name: 'server-error', description: 'Error returned after submit.',
            composition: '<ks-input label="Work email" error="Enter a valid email address."></ks-input>' }
        ],
        antiPatterns: [
          { scenario: 'Using placeholder as the label',
            reason: 'The placeholder disappears on focus, so the user loses the field name exactly when they need it, and most screen readers do not announce it as a name.',
            alternative: 'The label attribute — it is required for this reason' },
          { scenario: 'Signalling invalid with a red border only',
            reason: 'Fails for colour-blind users and for anyone with a high-contrast theme.',
            alternative: 'Border plus icon plus message — which is what this component renders' },
          { scenario: 'Showing helper and error at the same time',
            reason: 'Two competing messages in one live region; the error is what matters.',
            alternative: 'Error replaces helper while invalid' }
        ]
      },
      composition: {
        slots: {}, nestedComponents: [], commonPartners: ['ks-button', 'form'],
        parentConstraints: ['Should sit inside a form or fieldset for grouping semantics'],
        forbiddenParents: ['ks-button', 'a']
      },
      behavior: {
        states: [
          { name: 'default' },
          { name: 'hover', tokens: { border: 'component.input.border-hover' } },
          { name: 'focus-visible', tokens: { outline: 'component.input.focus-ring' },
            a11y: '2px ring at 0 offset so the field boundary stays legible' },
          { name: 'invalid', tokens: { border: 'component.input.border-invalid' },
            a11y: 'aria-invalid=true, aria-describedby to the message, message carries role=alert' },
          { name: 'disabled', tokens: { background: 'component.input.bg-disabled' }, a11y: 'native disabled' },
          { name: 'readonly', a11y: 'native readonly; border unchanged so it does not read as disabled' }
        ],
        interactions: { input: 'emits ks-input with the current value' }
      },
      accessibility: {
        role: 'textbox',
        accessibleName: 'From the required label attribute, associated by for/id',
        keyboard: { Tab: 'moves focus' },
        screenReader: 'Announces label, value, required and invalid state; error announced via role=alert',
        focusManagement: 'delegatesFocus on the shadow root',
        contrast: [
          { pair: ['component.input.fg', 'component.input.bg'], min: 4.5 },
          { pair: ['component.input.border', 'semantic.surface'], min: 3.0 },
          { pair: ['component.input.border-invalid', 'semantic.surface'], min: 3.0 }
        ],
        nonColorSignal: 'Invalid carries a triangle icon and message text alongside the border colour',
        wcag: ['1.3.1', '1.4.3', '1.4.11', '2.4.7', '3.3.1', '3.3.2', '4.1.2'],
        targetSize: '40px control height; 44px reachable via label click target'
      },
      aiHints: {
        priority: 'high',
        keywords: ['input', 'field', 'text', 'form', 'email'],
        context: 'Any single-line text entry. Multi-line needs a textarea component, which does not exist yet — flag the gap.'
      }
    }
  }
};

/* ── generate or check ────────────────────────────────────────────────── */
mkdirSync(join(ROOT, 'metadata'), { recursive: true });

const report = [];
for (const [name, { source, record }] of Object.entries(RECORDS)) {
  const src = readFileSync(join(ROOT, source), 'utf8');
  const checksum = sha(src);
  const outPath = join(ROOT, 'metadata', `${name}.metadata.json`);

  if (CHECK) {
    if (!existsSync(outPath)) { report.push({ name, status: 'MISSING' }); continue; }
    const prev = JSON.parse(readFileSync(outPath, 'utf8'));
    const p = prev.provenance || {};
    const stale = p.sourceChecksum !== checksum || p.tokensVersion !== tokensVersion;
    report.push({
      name,
      status: stale ? 'STALE' : 'current',
      reason: stale
        ? (p.sourceChecksum !== checksum ? 'component source changed' : 'token source changed')
        : null,
      reviewedBy: p.reviewedBy
    });
    continue;
  }

  const full = {
    ...record,
    provenance: {
      generatedFrom: source,
      sourceChecksum: checksum,
      tokensVersion,
      generator: 'build/metadata.mjs',
      reviewedBy: 'human'   // these records were hand-authored; a derived one would say 'unreviewed'
    }
  };
  writeFileSync(outPath, JSON.stringify(full, null, 2) + '\n');
  const anti = record.usage.antiPatterns.length;
  report.push({ name, status: 'written', antiPatterns: anti, states: record.behavior.states.length, contrastPairs: record.accessibility.contrast.length });
}

console.log(`\n  Keystone metadata ${CHECK ? '— check' : ''}`);
console.log(`  ${'─'.repeat(52)}`);
for (const r of report) {
  const extra = r.status === 'written'
    ? `  ${r.antiPatterns} anti-patterns · ${r.states} states · ${r.contrastPairs} contrast pairs`
    : (r.reason ? `  ← ${r.reason}` : '');
  console.log(`  ${r.name.padEnd(14)} ${String(r.status).padEnd(9)}${extra}`);
}
if (CHECK && report.some((r) => r.status !== 'current')) {
  console.log(`\n  Records are stale. Regenerate, then have a human review the diff.\n`);
  process.exit(1);
}
console.log('');
