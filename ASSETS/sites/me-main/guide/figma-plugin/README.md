# Tokens Out — Figma variables → W3C DTCG

A small, real Figma plugin. It reads every local variable collection and emits
[W3C Design Token Community Group](https://tr.designtokens.org/format/) JSON — the
platform-agnostic format a build pipeline (Style Dictionary and friends) consumes.

**Why this one.** State Farm's JD lists "experience building tools or plugins with the
Figma Plugin API" under *must bring*, and it's the one requirement your portfolio doesn't
answer. This plugin closes that — and it happens to demonstrate two more bullets at the
same time:

- *"Develop or maintain plugins that automate designer workflows"* — the gap, closed with an artifact
- *"Establish a platform-agnostic source of truth… reducing dependency on Figma"* — this **is** that migration, in miniature
- *"Experience with token transformation or build pipelines"* — DTCG JSON is exactly what Style Dictionary eats

## Run it

1. Figma desktop app → **Plugins → Development → Import plugin from manifest…**
2. Pick `manifest.json` in this folder
3. Open a file that has variables — **use a real one**, ideally something with a
   primitive/semantic split and a light/dark collection
4. **Plugins → Development → Tokens Out**

It exports on open. Copy or download the JSON.

## What it does

- Walks `getLocalVariableCollectionsAsync()` and every mode in each collection
- Resolves `VARIABLE_ALIAS` values into DTCG references — `{primitives.color.brand.500}` —
  so the semantic layer stays a reference layer instead of being flattened into duplicates
- Maps types: `COLOR` → `color` (hex, alpha only when it carries information),
  `FLOAT` → `dimension` or `number`, `STRING` → `fontFamily` or bare value
- Turns `color/brand/500` into nested groups
- Carries variable descriptions through as `$description`
- Reports what it skipped and why

## The three things worth being able to explain

They will ask you about the code. These are the interesting parts — and they're
interesting because they're *judgment calls*, not API usage.

**1. Figma has one `FLOAT` type; DTCG distinguishes `dimension` from `number`.**
There's no way to know from the API whether `4` means 4px or a 4× line-height multiplier.
The plugin guesses from the name (`UNITLESS` regex in `code.js`). That's a heuristic, and
the real fix is upstream: a naming convention, or the description field carrying the
intent. *Say that.* "The bug isn't in the exporter, it's in the token naming" is exactly
the kind of answer a design systems team wants to hear.

**2. DTCG has no native concept of modes.**
Figma's light/dark modes have no standard representation. This plugin nests them as
groups. Other valid choices: one file per mode, or `$extensions`. Naming the tradeoff is
better than pretending there's a right answer — the spec genuinely hasn't settled it.

**3. Aliases are the whole point.**
Flattening the semantic layer into resolved values would produce a valid file that
destroys the architecture. Preserving references is what keeps primitives private and
semantics the API — the same argument as the design system itself, one layer down.

## Make it yours before you demo it

Do not screen-share code you can't explain line by line. Pick at least one:

- Add a **CSS custom properties** output alongside the JSON — proves you understand the
  transformation step, not just the export
- Add a **lint mode**: flag variables with no description, names off the convention, or
  collections with orphaned aliases
- Handle `$extensions` for Figma-specific metadata (scopes, code syntax)
- Add a diff: compare against a pasted previous export and show what changed — that's the
  versioning story their JD asks about

## Known limits

- Local variables only — no library/remote variables
- `BOOLEAN` variables emit with no `$type` (DTCG has no boolean type)
- No `typography` or `shadow` composite tokens; Figma doesn't model them as variables
- Group/token name collisions (`space` and `space/2`) are preserved but flagged rather
  than resolved
