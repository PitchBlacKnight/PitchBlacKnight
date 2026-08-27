# Verified: Figma for the live demo (researched 2026-08-06, official sources + live whoami)

## ⚠️ YOUR ACCOUNT — checked live, this decides the demo
- `mikelrosenthal's team`: **Professional plan, Full seat** → MCP 200 calls/day, 15/min. Demo here.
- `INTERVIEW` team: **Starter plan, View seat** → **6 MCP calls per MONTH. One prompt burns the
  whole quota mid-interview. NEVER demo against a file in this team.**
- **Code Connect is Org/Enterprise only — absent on Pro. You cannot demo it.** Discuss it, show a
  local `.figma.ts` file in the editor, and say plainly your plan doesn't include it. (Verizon story
  covers the real experience.)
- Modes cap on Pro: **10 per collection**. Enterprise = "unlimited via extended collections" —
  do NOT quote "40", that's forum lore.

## VARIABLES — stale-knowledge trap #1
- **Six types now**: Color, Number, String, Boolean, **Timing** (ms), **Easing** (curves/springs) —
  the last two came with Figma Motion. A **dimension type was never added**; spacing/radius stay
  Number and units are the export layer's problem (your existing talking point stands, updated).
- 5,000 variables per collection. Collections-per-file: undocumented — don't quote a number.
- Scoping click-path: right-click var → Edit variable → Scope tab. Also `Hide from publishing`
  (how primitives stay private). **Gotcha: scoping is a UI filter, not enforcement — the Plugin
  API ignores it. Never call it enforcement.**

## SLOTS — GA June 10, 2026, ALL plans → your best "new capability" demo
- Fifth component property type: flexible region in a component; consumers add/resize/rearrange
  content **without detaching**, still get library updates.
- Create: select nested frame in main component → right-click → **Convert to slot** (⌘⇧S), or
  "Wrap in new slot", or property-first via Create property → Slot.
- Settings: min/max layers (warning only, NOT enforced), preferred instances,
  **"Only allow preferred instances"** = the real enforcement toggle.
- vs instance swap: swap = guardrails, exactly one instance, locked layout. Slot = flexibility,
  many layers, freeform. Variants = states, not content. Figma admits teams abused variants as a
  slots workaround and ships a migration guide.
- Gotchas: **removing a slot property is destructive** (all instance content resets, no undo across
  a published library); can't bind a slot to top-level layer; properties can't bind to layers
  inside a slot; slot position/flow only editable on the main component.
- Plugin API: `SlotNode`, `createSlot()`, `slotNode.limitViolations`
  ('BELOW_MIN'|'ABOVE_MAX'|'HAS_NON_PREFERRED') → **programmatic library linting hook** — natural
  extension to your audit script; mention it.

## COMPONENT PROPERTIES
- Five types now: boolean, text, instance swap, variant, **slot**. Variant only on component sets.
- Expose nested instances: Properties → "Expose properties from" → Nested instances. Gotcha: they
  bubble up FLAT — name defensively ("Icon → Size").
- **Property values can now be bound to variables** (2026) → properties driven by modes.

## MCP SERVER
- Remote server GA; `use_figma` (write-to-canvas) open beta, free now, will become paid usage —
  saying that aloud signals roadmap awareness.
- Setup: `claude plugin install figma@claude-plugins-official` → /plugin → figma → Allow access.
- 24 tools + 1 prompt verified live. Key: `get_design_context`, `get_variable_defs` (the token
  demo), `get_metadata`, `search_design_system`, `get_motion_context`, `whoami`.
- **`create_design_system_rules` prompt = strong, cheap, Pro-safe demo.**
- **Gotcha: MCP reads your current selection in the desktop app.** Nothing selected / wrong file
  focused → empty results that look like breakage. Select the frame first, every time.
- Jul 16 2026: MCP code imports now **bind to existing variables** instead of hardcoding — recent,
  relevant, quotable.

## WHAT'S NEW (Config 2026, Jun 24) — say "open beta", not GA (help center is conservative source)
- **Figma Motion** (open beta, all plans, Full seat): animations live IN the design system — animate
  a component once, animation travels with instances; exports CSS/JSON/React; MCP-readable via
  `get_motion_context`. The genuinely new DS surface — on your plan.
- Shaders, Weave, Figma Agent, Generative Plugins: open beta. Code Layers / 3D: waitlist only.
- **Figma Make: GA**, React-only kits. If discussing, volunteer the documented caveat: Make kits
  "don't support full extraction of design tokens" — variables land as a simplified single CSS
  file. Sites: still beta. Buzz: beta, but genuinely consumes variables + modes.
- Plugin API 2026: Motion API + timelines (Jun), MP4/GIF/WebM export (Jul), grid layout (May),
  slots (Jun). **REST Variables API is still Enterprise-only → a plugin-based exporter is the only
  portable choice — and on Pro, your only choice. This validates your exporter decision; say it.**

## DON'T ASSERT LIVE (docs contradict or silent)
Enterprise mode count as a number · collections-per-file limit · Enterprise MCP limits ·
Starter Dev-seat quota (docs self-contradict) · GA status of Motion/shaders/agent (say beta) ·
Draw GA date · a "Content seat" existing · Sites pricing.

## DEMO PLAN (all verified Pro-safe)
1. **Slots** — build card with slot, preferred instances, trip the max-layers warning. New + GA.
2. **Variables** — semantic aliasing primitive, mode flip, scoping, Hide-from-publishing.
   Mention Timing/Easing as the new types.
3. **MCP** — `get_variable_defs` on a selection → `create_design_system_rules`. Own team only.
4. **Motion** — animate once, instances inherit; `get_motion_context` for agents.
Discuss-only: Code Connect, extended collections, Code Layers.
