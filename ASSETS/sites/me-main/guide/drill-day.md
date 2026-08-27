# Drill Day — get un-rusty, one rep at a time

Verified against 2026 sources. The three companion files are the reference layer:
- **research-figma-2026.md** — Figma current state + YOUR account limits
- **research-claude-code-2026.md** — Claude Code current state + safe/unsafe commands
- **research-tokens-2026.md** — token spec + platform + the corrected talking points

## ⚠️ BEFORE ANYTHING — three fixes from the research

1. **Your "modes are unsettled" answer was outdated and has been corrected everywhere**
   (say.html, live.html, state-farm.html, case-study.html, phone.html, the Stephen email).
   New line: DTCG 2025.10 answered modes with resolvers last October; Style Dictionary
   hasn't implemented them; runtime output is still your architecture. **Re-rehearse this
   one — the old version was in your muscle memory.**
2. **Stop saying "W3C standard."** DTCG 2025.10 is a stable Community Group Final Report,
   NOT a W3C Standard. Say "the stable spec" or "DTCG 2025.10."
3. **Run `claude update`** — you're 18 patch versions behind, and some current behavior
   differs.

## The principle for the whole day

You are not memorizing answers — you already have those. You are rebuilding **hand
memory** so you can do these things live while talking. Every drill below ends with
you having actually typed/clicked the thing, not read about it. Say the words OUT
LOUD while doing it — the interview skill is narrating while operating, and that's
a separate skill from either one alone.

---

## Morning block 1 — your own pipeline, cold (90 min)

Rust check: can you run your own system from a blank terminal without looking anything up?

### Drill 1.1 — the build, narrated (20 min, 3 reps)
```
cd "~/PitchBlacKnight/CLAUDE CODE/interview-kit/pathfinder"
node build/build.mjs
```
- Rep 1: run it, read every line of output slowly, remember what each block is.
- Rep 2: run it and narrate out loud what's happening BEFORE each block scrolls:
  "It reads five token files… resolves 307 tokens across two modes… emits four
  targets… then checks every contrast pair as a token-pair ratio…"
- Rep 3: narrate it with the terminal CLOSED. If you can't, do rep 2 again.
- The sentence that must be automatic: **"One neutral source, four consumers —
  CSS, Swift, the docs, and the skill file. Figma becomes a fifth."**

### Drill 1.2 — break it on purpose (20 min)
- Open `tokens/semantic.tokens.json`, point a semantic token at another semantic
  token in the wrong direction (or reference a component token). Run the build.
- Watch the governance check catch it. Put it back. Run again — 0 violations.
- Why this drill: "how is one-way flow enforced?" is a likely follow-up, and the
  strongest answer is "let me show you what happens when you violate it."

### Drill 1.3 — the staleness gate, both states (20 min)
*(after the metadata.mjs path fix — see blockers in stephen-build page)*
- Run `node build/metadata.mjs --check` → passes.
- Hand-edit one line of `dist/pathfinder.css`. Run again → fails, exit 1.
- Rebuild → passes again.
- Out-loud line: **"The doc can't be wrong, because a wrong doc fails the build."**

### Drill 1.4 — tour your own JSON (30 min)
- Open all five token files. For each, say out loud: what tier, what it's allowed
  to reference, one example token, and one thing you'd criticize about it.
- You found 4 real flaws in your own system. Re-find them from scratch — don't
  recite them from memory. The finding-motion is the demo.

---

## Morning block 2 — Figma hands-on (2 hrs)

Do these in your REAL file (Pathfinder V.3). Rust here is most visible because
Figma's UI moves — the exact click-paths get verified against current docs in the
researched section below.

### Drill 2.1 — variables panel speed-run (30 min, 3 reps)
From a cold open of the file, in under 2 minutes, show:
1. A primitive collection, and that nothing else is allowed to touch it directly.
2. A semantic variable whose value is an ALIAS (shows a chip, not a hex).
3. The mode switcher on the semantic collection — flip light/dark, watch a
   component change with zero component edits.
4. Scoping on one variable (why bg tokens don't appear in a text-color picker).
- Say-while-doing: "modes switch here, at the semantic layer, and only here."

### Drill 2.2 — component properties inventory (30 min)
On your button and input: identify every property type in use — variant, boolean,
text, instance-swap — and add one of any type that's missing, then delete it.
The point is that the property-creation flow is in your fingers again.
- SLOTS (GA Jun 2026, all plans — your best "new" demo): Convert to slot = right-click nested frame (Cmd-Shift-S). Min/max layers is a WARNING only; "Only allow preferred instances" is the real enforcement. Removing a slot property is DESTRUCTIVE across a published library. Full detail: research-figma-2026.md

### Drill 2.3 — run your own exporter (30 min)
- Import/run the DTCG exporter plugin in the file. Export once.
- Open the JSON. Find one alias chain and follow it end to end out loud:
  `component.button.bg → {action.primary} → {blue.500} → #hex`.
- The killer line: **"Both flattened and aliased are valid DTCG. Only one still
  has an architecture."**

### Drill 2.4 — Dev Mode + annotations (30 min)
- Open Dev Mode on the annotated components. Know exactly where the annotations
  live and what an engineer sees.
- CODE CONNECT: Org/Enterprise ONLY — absent on your Pro plan. DISCUSS, do not attempt: show a local .figma.ts template file (new parserless format — the .figma.tsx figma.connect() form is legacy) and tell the Verizon story. Deleting+recreating a component silently breaks mappings — good war story.

---

## Afternoon block 1 — Claude Code as the agentic layer (2.5 hrs)

This is the block for "using Claude as an agentic agent to build website concepts."
The demo that matters: **design system in → governed concept out.**

### Drill 3.1 — skill files from the inside (30 min)
- Read your three SKILL.md files end to end (after the keystone→pathfinder rename).
- For each, say out loud: what it's for, what hard rules it carries, and what the
  model would do differently without it.
- SKILL.md 2026: description field decides auto-loading (third person, what AND when); paths: globs gate activation; allowed-tools grant lasts ONE turn; !`cmd` injects live output at load. Skills and commands are merged now. Full detail: research-claude-code-2026.md

### Drill 3.2 — the governed generation loop (60 min, the centerpiece)
Rep the full arc you'd run live:
1. Fresh Claude Code session in a scratch folder containing ONLY the skill file
   and `dist/pathfinder.css`.
2. Prompt: "Using the Pathfinder skill, build a landing-page concept for
   [pick something mundane — a scheduling product]. Every value must be
   annotated with the token it came from."
3. While it generates, NARRATE what the skill is doing: "it knows there are three
   button variants, so it won't invent a fourth… every color it uses has to name
   its token, so I can audit this instead of trusting it."
4. When it finishes: audit one section live. Find a value, trace its annotation
   back to the token file. If anything is un-annotated, make it fix it — the
   correction IS the demo of governance.
- Run this at least twice on different concepts. The second run is always calmer.

### Drill 3.3 — the MCP read (40 min)
1. Connect: `claude plugin install figma@claude-plugins-official` then /plugin -> figma -> Allow access. Set MAX_MCP_OUTPUT_TOKENS=50000 first. **ONLY use files in YOUR pro team — the INTERVIEW team View seat has 6 calls/MONTH and one prompt kills it.** Select the frame in the desktop app before every call — empty selection looks like breakage.
2. Select a component in your file, ask Claude Code for it, show that what comes
   back has REAL variable names — not hexes guessed from a screenshot.
3. Out-loud line: **"It's reading the file, not looking at a picture of it."**

### Drill 3.4 — failure rehearsal (20 min)
Things WILL go wrong live. Rehearse the recovery, not just the happy path:
- MCP not connecting → your fallback is the exporter JSON, already on disk.
- Generation ignores a rule → point at it, make it correct itself, say "this is
  why the annotation rule exists — I catch this in review, not in production."
- Total tool failure → you have screenshots of every artifact. The talk track
  works over stills. (This is why the artifact screenshots get taken FIRST.)

---

## Afternoon block 2 — speak the eight, capture the nine (2 hrs)

1. One pass through stephen.html in practice mode: each of the eight areas,
   out loud, one breath of headline + one specific example. Time each — none
   should pass 90 seconds unprompted.
2. Then capture the nine artifacts per the production plan (pbk-build.vercel.app):
   terminal shots first (A, F, I), Figma shots second (C, D, G), the two diagrams
   last (B, A'). Same window size, same theme, generous padding — consistency
   across screenshots is itself a design-systems signal.

## End of day — the 10-minute close
Run the whole thing once, badly, out loud, timed: build → Figma → generation →
the thesis. Don't polish it. The point of the first full run is to find where the
seams are, and it's better to find them tonight than on the call.

---

# [SECTION PENDING RESEARCH]
## 2026 standards: Figma / Claude Code / tokens — verified sources
Filled in from the three research agents before this page ships.
