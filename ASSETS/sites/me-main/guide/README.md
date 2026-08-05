# Interview Kit

```bash
open "interview-kit/index.html"
```

Start at the hub. Every page has a switcher in the top bar, `⌘K` to jump, `R` to rehearse
out loud, `J`/`K` to step through sections. Checkboxes persist in the browser.

```
interview-kit/
├── index.html            ← hub: pick an interview
├── goji-labs.html        ← Goji Labs · Product Designer · agency, AI-accelerated prototyping
├── state-farm.html       ← State Farm · Design Systems Engineer · $70/hr, 12mo, remote
├── loom.html             ← the ~3-min Loom run sheet (Goji requires it)
├── figma-demo.html       ← node IDs, prompts + variable audit for the Pathfinder Figma file
├── landscape.html        ← what already exists publicly, and where your work sits
├── kit.css / kit.js      ← shared; edit once, all pages update
│
├── keystone-ds.zip       ← producer skill — rules + component-metadata schema
├── keystone-composer.zip ← consumer skill — selects from the inventory, flags gaps
├── skill/                ← source for both
├── figma-plugin/         ← Figma variables → W3C DTCG exporter (closes State Farm's gap)
├── rename.sh             ← swap "Keystone" for their real system name
└── fallback/             ← drop screenshots of good output here before each call
```

If you edit `kit.css` or `kit.js` and a change doesn't appear, bump `?v=2` to `?v=3` in the
HTML files — or hard-reload. Browsers cache these aggressively.

## The three things to do first

**1 · Install both skills** (both interviews) — claude.ai → Settings → Capabilities →
Code execution on. Then Customize → Skills → + → Create skill → upload `keystone-ds.zip`
and `keystone-composer.zip` → toggle on. Run a prompt once before the call, not during it.

`keystone-ds` produces: the rules, plus a machine-readable component-metadata schema with
a `provenance` block (source checksum + token version) so records can be detected as stale.
`keystone-composer` consumes: it selects existing components, treats anti-patterns as hard
rules, refuses to silently trust a stale record, and flags gaps rather than inventing
components. Two skills because producing and consuming are different jobs.

**2 · Build the Figma plugin** (State Farm) — `figma-plugin/` is a working scaffold that
exports variable collections to W3C DTCG token JSON. State Farm lists "experience building
tools or plugins with the Figma Plugin API" under *must bring*, and it's your one real gap.
This closes it with an artifact and demonstrates two more JD bullets at the same time.
Adapt it until it's genuinely yours — do not demo code you can't explain line by line.

**3 · Record the Loom** (Goji) — `loom.html` has the setup, the five beats with the exact
scroll position in your existing Pathfinder case study, and what kills these. Nothing new
to build; you're scrolling a page you already wrote. It's reusable for any application —
nothing in it names Goji.

## Connect the Figma MCP server to Claude Code

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

Then `/mcp` in Claude Code, pick figma, authenticate. Figma also ships a Claude Code plugin
that bundles the MCP config with their Agent Skills. Auth expires — re-check on the day.

You want two Figma files ready: a **clean demo frame** with real variables and auto-layout
for design→code, and a **scratch file** for the code→design write. Never demo a write
against a file that matters.

## Make the demo system theirs

```bash
./rename.sh "TheirSystem" "TheirCompany" "Role As Posted"
```

Renames across the skill and the pages, re-zips. Run it once — it isn't idempotent.

## What only you can write

- **"Show me a time AI got it wrong."** — a real story. What it produced → how you caught
  it → what rule you added so it couldn't recur. The third move is the whole answer.
  Flagged amber on the Goji page, section 08.
- **One live observation about Goji's work** — open a couple of their case studies the
  morning of and add one concrete sentence.
- **Your rate floor for State Farm** — decide before the call, and confirm W2 vs 1099 with
  Angela. That conversation belongs with the recruiter, not the hiring manager.

## Where the numbers came from

Every figure is pulled from `ASSETS/sites/me-main` — `resume-design-systems.html`,
`pathfinder.html`, `avant-marketing.html`, `ge-edison.html`, `bcbs-fiber.html` — plus the
talk track in `~/Downloads`. Nothing invented. If a number is stale, fix it at the source
and here.
