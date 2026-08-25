// Tokens Out — export local Figma variable collections as W3C DTCG token JSON.
//
// The point of this plugin is the JD bullet: "establish a platform-agnostic source of
// truth for the design system, reducing its dependency on Figma." This is that migration
// in miniature — the tokens leave Figma in a neutral format that a build pipeline
// (Style Dictionary and friends) can consume.

figma.showUI(__html__, { width: 460, height: 600, themeColors: true });

// ── helpers ────────────────────────────────────────────────────────────────

// Figma gives colors as 0–1 floats. DTCG wants hex.
function toHex(c) {
  const ch = (n) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, '0');
  const base = '#' + ch(c.r) + ch(c.g) + ch(c.b);
  // only emit the alpha pair when it actually carries information
  return (c.a === undefined || c.a >= 1) ? base : base + ch(c.a);
}

// "color/brand/500" → ["color", "brand", "500"]
function segments(name) {
  return name.split('/').map((s) => s.trim()).filter(Boolean);
}

// Numbers that aren't lengths. Figma has one FLOAT type for all of them, so this is a
// heuristic — and being able to explain *why* it's a heuristic is the interesting part.
const UNITLESS = /(opacity|weight|ratio|scale|z-index|line-height|flex|order|count)/i;

function floatToken(name, value) {
  if (UNITLESS.test(name)) return { $type: 'number', $value: value };
  return { $type: 'dimension', $value: `${value}px` };
}

const FONT_ISH = /(font|family|typeface)/i;

function stringToken(name, value) {
  if (FONT_ISH.test(name)) return { $type: 'fontFamily', $value: value };
  // DTCG has no plain-string type; emit the value and let the pipeline decide.
  return { $value: value };
}

function isGroup(v) {
  return typeof v === 'object' && v !== null && !('$value' in v);
}

// A group and a token can collide — "space" as a token and "space/2" as a child.
// Keep both rather than silently dropping one; the report flags it.
function setPath(root, path, value, collisions) {
  let node = root;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!isGroup(node[key])) {
      if (node[key] !== undefined) {
        const displaced = node[key];
        node[key] = { _token: displaced };
        collisions.push(path.slice(0, i + 1).join('.'));
      } else {
        node[key] = {};
      }
    }
    node = node[key];
  }
  const leaf = path[path.length - 1];
  if (isGroup(node[leaf])) {
    node[leaf]._token = value;                 // group already claimed this name
    collisions.push(path.join('.'));
  } else {
    node[leaf] = value;
  }
}

// ── the export ─────────────────────────────────────────────────────────────

async function exportTokens() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  if (!collections.length) {
    figma.ui.postMessage({ type: 'error', message: 'No local variable collections in this file.' });
    return;
  }

  const allVars = await figma.variables.getLocalVariablesAsync();
  const byId = new Map(allVars.map((v) => [v.id, v]));
  const collectionById = new Map(collections.map((c) => [c.id, c]));

  // A DTCG alias is a dotted path in braces: {primitives.color.brand.500}
  function aliasPath(variableId) {
    const target = byId.get(variableId);
    if (!target) return null;
    const collection = collectionById.get(target.variableCollectionId);
    const prefix = collection ? segments(collection.name) : [];
    return '{' + [...prefix, ...segments(target.name)].join('.') + '}';
  }

  const out = {};
  const report = { collections: 0, variables: 0, aliases: 0, skipped: [], multiMode: [], collisions: [] };

  for (const collection of collections) {
    report.collections++;
    const multiMode = collection.modes.length > 1;
    if (multiMode) report.multiMode.push(collection.name);

    for (const mode of collection.modes) {
      for (const variableId of collection.variableIds) {
        const variable = byId.get(variableId);
        if (!variable) continue;

        const raw = variable.valuesByMode[mode.modeId];
        if (raw === undefined) continue;

        let token;
        if (raw && raw.type === 'VARIABLE_ALIAS') {
          const ref = aliasPath(raw.id);
          if (!ref) { report.skipped.push(`${variable.name} — unresolved alias`); continue; }
          token = { $value: ref };
          report.aliases++;
        } else {
          switch (variable.resolvedType) {
            case 'COLOR':   token = { $type: 'color', $value: toHex(raw) }; break;
            case 'FLOAT':   token = floatToken(variable.name, raw); break;
            case 'STRING':  token = stringToken(variable.name, raw); break;
            case 'BOOLEAN': token = { $value: raw }; break;
            default:
              report.skipped.push(`${variable.name} — unsupported type ${variable.resolvedType}`);
              continue;
          }
        }

        if (variable.description) token.$description = variable.description;
        report.variables++;

        // Collections with one mode don't need a mode level; multi-mode ones do.
        // DTCG has no native mode concept — this is the honest, boring choice, and
        // it's worth saying out loud that it's a choice.
        const path = multiMode
          ? [...segments(collection.name), ...segments(mode.name), ...segments(variable.name)]
          : [...segments(collection.name), ...segments(variable.name)];

        setPath(out, path, token, report.collisions);
      }
    }
  }

  figma.ui.postMessage({
    type: 'result',
    json: JSON.stringify(out, null, 2),
    report,
    fileName: (figma.root.name || 'tokens').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase()
  });
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export') {
    try {
      await exportTokens();
    } catch (err) {
      figma.ui.postMessage({ type: 'error', message: String(err && err.message ? err.message : err) });
    }
  }
  if (msg.type === 'notify') figma.notify(msg.message);
  if (msg.type === 'close') figma.closePlugin();
};

// export once on open so the panel isn't empty
exportTokens().catch(() => {});
