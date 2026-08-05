# Case Study Playbook
**A uniform product design process + a uniform way to present it.**
Mikel Rosenthal · 2026

This is two documents in one:

- **Part I — The Process.** The workflow I run on every product engagement. Seven stages, four cross-cutting practices. This is what I *do*.
- **Part II — The Presentation.** The fixed narrative spine every case study on this site follows, and the interactive devices used to demonstrate thinking rather than assert it. This is how I *show* it.

The point of a uniform process is not conformity. It's that when every case study answers the same questions in the same order, a reader can compare projects, find the part they care about in ten seconds, and trust that nothing flattering was cherry-picked.

---

# PART I — THE PROCESS

## The seven stages

### 01 · FRAME
Before research, before sketches: what breaks if we do nothing?

- The business consequence, stated in the client's own units (revenue, cycle time, churn, support load, deal size).
- Who the user actually is, and what job they're hiring this product to do.
- The constraints that are real (regulatory, technical, org, timeline) vs. the ones that are habit.
- **The one-sentence brief.** If it takes a paragraph, the problem isn't framed yet.
- **The metric, named now.** Decide how you'll know it worked *before* you design. A design without a defined success signal is decoration.

**Artifacts:** problem statement, JTBD, constraint map, success metric + instrumentation plan.

### 02 · EVIDENCE
Get the truth out of people's heads and into the open.

- Contextual inquiry — watch the work happen, don't ask about it. Fifteen minutes of shadowing beats an hour of interview.
- Telemetry archaeology — funnels, drop-off, rage clicks, time-on-task, the paths nobody designed.
- Support-ticket and sales-call mining — the cheapest, most under-used research corpus in any company.
- Competitive and adjacent teardown — including the spreadsheet or email thread the product is actually competing with.
- **Interface inventory** — screenshot every distinct state in production. Fragmentation becomes countable, not anecdotal.

**2026 practice:** use AI to cluster and code a qualitative corpus at volume — hundreds of tickets, dozens of transcripts — then *hand-verify every quote you cite.* Machine synthesis is a first pass and a hypothesis generator, never a finding. Note in the case study where you did this; it's a credibility signal, not a shortcut to hide.

**Artifacts:** research plan, session notes, opportunity map, interface inventory, evidence-ranked findings.

### 03 · MODEL
The stage most portfolios skip, and the one that separates senior work from good work.

- **Conceptual model** — what objects exist in this product, what they're called, how they relate. Get the nouns right and the screens design themselves.
- **Service blueprint** — the user's front stage, the staff's back stage, the systems underneath. Reveals where the product ends and a human handoff begins.
- **Information architecture** — navigation as a consequence of the model, not a menu exercise.
- **The critical path** — the one sequence that must be flawless. Everything else is secondary.

**Artifacts:** domain model, blueprint, IA, critical-path definition.

### 04 · SHAPE
Design decisions, not screens.

- Flows first, at low fidelity, fast and disposable.
- **Every state, from v1:** default, loading, empty, partial, error, permission-denied, success, disabled. A pattern without failure modes is a prototype.
- **Divergence on the hard parts only.** Three real alternatives for the two or three genuinely contested decisions. One option is not a decision; five is procrastination.
- Content design in parallel, never after. Labels, microcopy, error messages, and empty-state guidance are design work.
- Accessibility as a gate: WCAG 2.2 AA, keyboard-first, focus order, target sizes, reduced-motion honored. Under the European Accessibility Act (in force June 2025), this is procurement-blocking for anything sold into the EU — treat it as a requirement, not a polish pass.

**Artifacts:** flows, wireframes, state matrices, decision records, content spec.

### 05 · SYSTEM
Make the right way the easy way.

- Three-tier tokens: primitives → semantic → component. Engineers consume intent, never hex.
- Components with full state coverage and documented usage rules.
- Design-to-code as a pipeline: variables → tokens → code, with Code Connect or equivalent mapping so the component in the file *is* the component in the repo.
- Governance sized to the org: contribution model, versioning, deprecation policy, office hours.

**Artifacts:** token architecture, component library, docs, contribution + versioning model.

### 06 · PROVE
Evidence that it works, before it ships to everyone.

- Prototype at the fidelity the question requires — no higher.
- Moderated usability on the critical path; five users per segment finds the structural problems.
- Unmoderated at volume for time-on-task and comprehension.
- Instrumented rollout: flag it, ship to a slice, compare against the metric named in stage 01.
- **Write down what failed.** A case study with no failed round is a case study nobody believes.

**Artifacts:** prototype, test plan, findings + severity, revised design, experiment result.

### 07 · SHIP & LEARN
Launch is the midpoint.

- Adoption instrumentation — is the new path actually being used, or is the old workaround still winning?
- Post-launch qualitative check-in at 30 and 90 days.
- A named owner and a next-iteration backlog.
- The honest retro: what I'd do differently, what's still unsolved.

**Artifacts:** launch metrics, adoption curve, retro, roadmap.

---

## Four cross-cutting practices (2026)

**A · AI as a design material, not just a design tool.**
Two distinct questions, and case studies must separate them. *Tool:* how AI accelerated my process (synthesis, variant generation, code scaffolding). *Material:* how the product itself surfaces probabilistic output to a user. The second is the harder, more valuable craft — designing for confidence display, explainability ("why this recommendation"), graceful wrongness, correction and override, and the user's right to see the deterministic data underneath. Any product that scores, ranks, matches, or recommends is an AI-material design problem whether or not a model is involved.

**B · Continuous discovery over big-bang research.**
A standing weekly contact with users, an opportunity-solution tree that stays alive across the engagement, and small assumption tests instead of one large study that's stale by build time.

**C · Instrument before you design.**
The metric is named in stage 01 and the events are specced in stage 04. Retrofitted analytics measure whatever was easy to log, which is never the thing that mattered.

**D · Accessibility and performance as gates.**
Both are checked at Shape and again at Prove. Neither is a phase at the end. Both belong in the outcome numbers.

---

# PART II — THE PRESENTATION

## The narrative spine

Every case study on this site uses the same seven beats, in this order. Section numbering is visible so a reader can navigate and compare.

| # | Section | Answers | Target length |
|---|---------|---------|---------------|
| 00 | **Hero + Impact strip** | What is this, and did it work? | 1 dek line + 4 numbers |
| 01 | **The Stakes** | What breaks if nothing changes? | 150–200 words + 1 pull quote |
| 02 | **What I Found** | What did I learn, and how? | 200 words + 1 evidence visual |
| 03 | **The Model** | What's the idea that organizes everything? | 150 words + 1 diagram |
| 04 | **The Decisions** | Where was it genuinely hard, and why did I choose this? | 3 decision cards |
| 05 | **The Product** | Show me. | 4–6 annotated screens |
| 06 | **Proof** | How do you know? | Test findings + a failure |
| 07 | **Outcome & Honest Retro** | What happened, what's unsolved? | Metrics + 100-word retro |

Rules:
- **Lead with the result.** The hero states the outcome. Nobody reads to find out whether it worked.
- **One idea per case study.** If you can't name it in a sentence, the case study isn't finished.
- **Show the discarded option.** The alternative you rejected proves there was a decision.
- **Name the failure.** One real thing that didn't work, and what you did about it.
- **Every image earns its place.** A screen with no annotation is wallpaper.
- **Skimmable at three depths:** headlines only (30 seconds), + deks and captions (3 minutes), + full prose (10 minutes). All three must be coherent on their own.

## Devices that demonstrate rather than assert

Ranked by signal-per-effort. Use three to five per case study, never all of them.

1. **Decision cards** — three options, the tradeoff, the choice, the reason. Highest-signal device in a senior portfolio. Cheap to build.
2. **Annotated screens** — numbered hotspots over a real screenshot, each tied to a research finding. Proves the pixels came from evidence.
3. **State gallery** — one component in every state including the ugly ones. Instant credibility with engineers and hiring managers.
4. **Before / after wipe** — a draggable divider on the same task, old vs. new. Visceral, wordless.
5. **Interactive flow** — the product's spine as a clickable or scroll-driven state machine. Best when the flow *is* the idea.
6. **Explainability reveal** — for any scored or recommended output, a toggle exposing the reasoning underneath. Directly demonstrates AI-material craft.
7. **Metric strip with definitions** — numbers with a hover or footnote defining measurement and window. Undefended numbers read as marketing.
8. **Process timeline** — phases with dates and what shipped in each. Proves duration and ownership.

## Craft standards

- Under 2s LCP on a mid-tier connection; images responsive, lazy-loaded below the fold, `width`/`height` set to prevent layout shift.
- Motion: 200–400ms, ease-out, one motion idea repeated — not a catalog of effects. `prefers-reduced-motion` fully honored, no exceptions.
- Keyboard-navigable end to end; visible focus rings; every interactive device operable without a pointer.
- Type: three sizes and two weights carry 90% of the page. Measure at 60–75 characters.
- Semantic HTML — `section`, `figure`/`figcaption`, real headings in order.
- Dark and light both shipped and both proofread.
- Mobile: the interactive devices degrade to static, annotated fallbacks. They never break and never disappear silently.

## How award-winning work approaches this

**Work & Co** — ruthless single-idea framing. Their case studies open with the business outcome in one line and carry three or four hero moments, not thirty. *Steal:* the discipline of subtraction. Cut until only the load-bearing images remain.

**MetaLab** — before/after as the whole argument. They show the old product honestly, which makes the new one land without adjectives. *Steal:* show the ugly prior state. It costs you nothing and buys enormous credibility.

**Instrument** — treats the case study page itself as a designed artifact, with a distinct art direction per project that echoes the work. *Steal:* let the Pathfinder page's own visual system nod to Pathfinder's, so the page demonstrates system thinking by existing.

**Locomotive / Immersive Garden and the Awwwards craft tier** — scroll choreography as structure, not decoration. One motion concept, executed with precision, repeated. *Steal:* pick one motion idea and use it for every transition. Restraint reads as intent; variety reads as indecision.

**Ueno (archived)** — conversational, first-person voice with actual opinions and jokes. Personality survived the corporate context. *Steal:* write like a person who has a position, not a process document.

**The strongest individual portfolios (Case Study Club / Bestfolios tier)** — near-universally structured as problem → constraint → decision → outcome, with the designer's specific contribution stated explicitly when the work was collaborative. *Steal:* an explicit "my role / the team" line. Vagueness about credit is the fastest way to lose a reader's trust.

**The common thread:** awards go to pages that are *designed*, but jobs go to pages that are *reasoned*. The winning combination is award-tier craft in service of a legible argument — never craft as a substitute for one.

---

## Reuse checklist

Before publishing any case study:

- [ ] Outcome stated in the hero
- [ ] One-sentence idea, findable
- [ ] Role and team credit explicit
- [ ] At least one rejected alternative shown
- [ ] At least one failure named
- [ ] Every metric has a definition and a window
- [ ] Every image annotated or captioned
- [ ] 3+ demonstration devices, ≤5
- [ ] Keyboard pass complete
- [ ] Reduced-motion pass complete
- [ ] Light and dark proofread
- [ ] Mobile fallbacks verified
- [ ] Reads coherently at 30s / 3min / 10min
