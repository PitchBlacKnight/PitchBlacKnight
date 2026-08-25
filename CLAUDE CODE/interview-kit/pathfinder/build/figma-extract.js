/**
 * Pathfinder — Figma extraction step.
 *
 * NOT a Node script. This runs inside Figma, against the Plugin API: paste it into
 * the kit's figma-plugin/ console, or hand it to the Figma MCP server's use_figma
 * tool. It is checked in so the extraction is reproducible and reviewable rather
 * than a thing someone did once by hand.
 *
 *   Figma  ──figma-extract.js──▶  raw export  ──▶  tokens/*.tokens.json
 *                                                        │
 *                                                  build/build.mjs
 *                                                        │
 *                                              dist/  css · json · swift · skill
 *
 * What it deliberately captures beyond values:
 *
 *   scopes          the audit surface. A variable with ALL_SCOPES is offered in every
 *                   property picker, which is how a 105-token semantic tier becomes
 *                   unusable in the canvas. Values alone would hide this.
 *   alias targets   so the semantic tier can be written as references into primitive
 *                   instead of flattened hex — the mode structure survives the export.
 *   collection ids  so tokens/figma-source.json can be verified against the file
 *                   later, and a renamed or emptied collection is a build warning.
 *
 * Source file: Pathfinder Design System V.3 — IXARP0cNnQOUmaDVQYZkNe
 */

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const variables = await figma.variables.getLocalVariablesAsync();
const textStyles = await figma.getLocalTextStylesAsync();
const effectStyles = await figma.getLocalEffectStylesAsync();

const nameById = {};
variables.forEach((v) => (nameById[v.id] = v.name));

const hex = (c) =>
  '#' +
  [c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('') +
  (c.a !== undefined && c.a < 1 ? Math.round(c.a * 255).toString(16).padStart(2, '0') : '');

/* An alias is emitted as {target/name} so the reference survives the export.
   Flattening here would throw away the whole point of a semantic tier. */
const value = (v) => {
  if (v === undefined) return null;
  if (v && typeof v === 'object' && v.type === 'VARIABLE_ALIAS') return '{' + (nameById[v.id] || v.id) + '}';
  if (v && typeof v === 'object' && 'r' in v) return hex(v);
  return v;
};

return {
  file: { key: figma.fileKey, name: figma.root.name },

  collections: collections.map((c) => ({
    name: c.name,
    id: c.id,
    modes: c.modes.map((m) => ({ id: m.modeId, name: m.name })),
    variables: variables
      .filter((v) => v.variableCollectionId === c.id)
      .map((v) => ({
        name: v.name,
        type: v.resolvedType,
        scopes: v.scopes,                    // ALL_SCOPES here is a finding, not a default
        values: Object.fromEntries(c.modes.map((m) => [m.name, value(v.valuesByMode[m.modeId])]))
      }))
  })),

  textStyles: textStyles.map((s) => ({
    name: s.name,
    family: s.fontName.family,
    style: s.fontName.style,
    size: s.fontSize,
    lineHeight: s.lineHeight,
    letterSpacing: s.letterSpacing,
    textCase: s.textCase
  })),

  effectStyles: effectStyles.map((s) => ({
    name: s.name,
    effects: s.effects.map((e) => ({
      type: e.type,
      radius: e.radius,
      spread: e.spread,
      offset: e.offset,
      color: e.color ? hex(e.color) : null
    }))
  }))
};
