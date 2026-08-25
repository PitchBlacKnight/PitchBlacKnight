# Verified: token standards & platform (researched 2026-08-06, primary sources)

## ⚠️ CORRECTION TO YOUR REHEARSED ANSWER — the modes line is now WRONG
Your kit says: "The token spec still has no real answer for modes — light and dark are genuinely
unsettled." **That was true when written. It is no longer true.**
- **DTCG 2025.10 shipped Oct 28, 2025** — first STABLE version. Three modules: Format, Color,
  **Resolver**. The Resolver module IS the answer to modes.
- How it works: theming lives OUTSIDE token files in a `.resolver.json` — `sets` (always active),
  `modifiers` with `contexts` (e.g. theme: light/dark), `resolutionOrder` (later wins). Spec
  deliberately never says "mode" — vocabulary is **modifier/context** (generalizes to brand ×
  theme × density).
- **THE UPDATED HONEST EDGE (use this instead):** "The spec answered modes last October — the
  Resolver module in 2025.10. But it's only half-shipped: **Style Dictionary hasn't implemented
  resolvers yet** (tracking issue #1590, 'not started'), resolvers standardize composition but say
  nothing about runtime output — light-dark() vs data-theme is still your architecture — and they
  don't arbitrate context conflicts. So authoring is settled; the pipeline is not."
  → Same credibility, current facts, and it still ends on a genuinely open problem.

## ⚠️ SECOND CORRECTION — stop saying "W3C token JSON"
DTCG 2025.10 is a **Community Group Final Report — explicitly NOT a W3C Standard, not on the
Standards Track**. "W3C standard" is the most common overstatement in this space; interviewers who
know will notice. Say: **"DTCG 2025.10 — the stable spec"** or "the Community Group spec."

## More 2025.10 facts (quotable precision)
- **Hex strings are now INVALID as color values.** Colors are objects:
  `{colorSpace: "oklch", components: [...], alpha, hex?}` — hex is optional fallback only.
  14 color spaces. Real-world bite: Penpot can't import 2025.10 colors (issue #9305, open).
- **dimension MUST be an object** `{value: 16, unit: "px"}` — only `px` and `rem` legal.
  number = bare unitless. (Your Figma FLOAT-vs-dimension talking point still stands — Figma never
  added a dimension type; six variable types now incl. Timing/Easing.)
- Two reference mechanisms: `{alias.path}` (whole $value only) vs **`$ref` JSON Pointer** (reaches
  inside composites). Plus `$deprecated` (tokens AND groups), `$extends` (group inheritance).
  **$deprecated is spec'd — pairs perfectly with your "no deprecation path" self-audit story.**
- The spec says NOTHING about primitive→semantic→component tiering — that's convention, not
  standard. Saying so shows you know the spec's boundary.
- Governance note: co-chairs stepped back June 2026, no announced next version. The group is quiet.

## Toolchain state
- **Style Dictionary 5.5.0** (Node ≥22 required). v5 base format is 2025.10 but support is
  partial: color ✅, dimension objects ✅, **Resolver ❌ not started**. `expand` decomposes
  composites for CSS.
- **Tokens Studio**: plugin + hosted Studio platform now (two-way sync since Jun 2026). Still
  targets the OLDER $-dialect, still needs `@tokens-studio/sd-transforms` as glue. Round-trip with
  Figma variables is lossy (23 types → 4) and can't touch scoping/publishing.
- **Figma now ships NATIVE DTCG variable export/import** (right-click mode/collection → Export).
  Gap: composites (typography/shadows) not supported. Your plugin exporter still matters — and
  REST Variables API is still Enterprise-only, so plugin export is the only portable path (and the
  only path on your Pro plan).
- **Terrazzo** (ex-Cobalt) v2.5, healthy, MIT, claims full DTCG (vendor claim). **Specify DEAD**
  (Nov 2024), Backlight dead (Jun 2025). **Pattern worth naming:** hosted-token-platform products
  died; the survivors live in your repo (Storybook, Terrazzo) or went enterprise-AI (Supernova
  $9.2M, Knapsack $10M, both repositioned around AI agents). Sustainable primitive = repo +
  Storybook + DTCG build step.
- "Docs connected to production" credibility tiers: Storybook wins BY CONSTRUCTION (stories are
  source files — no second copy to drift; same argument as your generated docs). zeroheight now
  has real git integration for tokens. Supernova's claim outruns the product (truth lives in
  their container, not your repo).

## Web components 2026 — your architecture is validated, with new edges
- **Custom properties are STILL the theming channel through shadow boundary.** Nothing displaced
  them: no @theme at-rule (that's Tailwind v4 authoring), ::theme() shelved, open-stylable shadow
  roots going nowhere, :host-context() still Chromium-only.
- **NEW & cross-browser since May 2026: style queries** — `@container style(--token: value)`
  works everywhere (Firefox 151 was last). "Component reacts to an inherited token without JS."
- **@property gotchas (excellent interview material):** (1) registering a property with
  initial-value silently KILLS every var(--x, fallback) in the codebase — typos resolve to
  initial-value instead of failing visibly; (2) **@property does not work inside shadow DOM in
  any browser** — definitions must live in light DOM (Adobe conformance suite: fail ×4).
- @scope: cross-browser since Dec 2025 (Firefox 146) but it's selector-scoping, NOT isolation —
  inherited properties still cross. Not a shadow DOM substitute.
- ::part(): can't chain, no descendants after it, `&` after ::part explicitly rejected by CSSWG
  (Jan 2025). Spec renamed: "CSS Shadow Module Level 1" (Parts+Scoping merged, Jan 2026).
- Declarative Shadow DOM: baseline since 2024; setHTMLUnsafe() (2025) fixed the innerHTML gap;
  still no standard SSR pipeline; adoptedStyleSheets can't serialize.
- Stale assumptions to avoid: **FAST is NOT deprecated** (fast-element 3.0 GA + Fluent UI WC 3.0,
  June 2026); Shoelace archived → **Web Awesome** (MIT core + paid Pro); **anchor positioning is
  no longer Chrome-only** (Safari 26 + Firefox 147); Lit 4 has NOT shipped.
- Chrome-only, don't depend: CSS @function, @mixin, if(), interestfor (Apple opposed).

## AI + design systems — the honest landscape
- **There is NO standard for AI-consumable component metadata.** Everyone ships proprietary
  manifests behind an MCP server. Quotable summary line:
  "DTCG 2025.10 for tokens, MCP for component access, SKILL.md for procedural knowledge — and the
  component-semantics layer, the part that tells an agent WHEN to use a component and why, has no
  standard at all."
- MCP: donated to Linux Foundation (Dec 2025) — no longer an Anthropic project. Spec 2026-07-28.
- SKILL.md: real published spec (agentskills.io), adopted by ~30 vendors INCLUDING FIGMA (their
  design-system rules ship as a skill). Unversioned though — can't pin.
- AGENTS.md: foundation-stewarded but literally not a format ("use any headings you like").
- Meta's **Astryx** (Jan 2026, 11.7k stars, "agent-ready design system"): uses CLAUDE.md +
  .claude/skills — a vendor-specific layout, no cross-vendor convention. Even Meta.
- W3C Design System Documentation CG created **July 30, 2026** — 20 people, no chair, no drafts.
  The standards effort started A WEEK AGO. You can say that in the room.
- **Best stat for your pitch (zeroheight DS Report 2026, n=147): only 40% of teams have automated
  token pipelines — 60% still sync manually.** The format war is over; automation isn't. That IS
  your offer. Also: 86% of systems include tokens; AI: 10% built-in, 46% experimenting.

## Kit files that need the modes-line fix
say.html (the "poking at" answer) · stephen-reply-email.md · stephen.html · possibly
state-farm.html/talk-track.html — search for "unsettled" and "W3C".
