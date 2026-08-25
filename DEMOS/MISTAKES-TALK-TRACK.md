# Mistakes in v1 worth talking about

Interview prep only. Not deployed (see .vercelignore). These are real flaws found in
the v1 PetWatch exercise and the old hub, verified against the files cited. None of
them are the ones already admitted publicly in the reconsidered case study (the
phantom second direction, over-explaining, the red-to-amber correction, volume over
judgment). These are new material.

Each entry: the line you can say, the evidence, and the growth turn. Lead with 1-3;
they are the strongest stories.

---

## 1. I modeled ownership twice and didn't notice until someone asked me to draw it

- **Evidence:** `Petwatch/artifacts/prd.md` data model. `Pet.owner_id` points at a User
  directly, while `Membership` separately carries `role: owner | watcher`. The map page
  draws both edges.
- **Why it's wrong:** The PRD's proudest insight is that occurrences are derived, never
  stored, "avoiding a class of bugs where the schedule and the rule disagree." Ownership
  breaks the same rule one entity over: revoke the owner's Membership row and
  `Pet.owner_id` still points at them. The exact bug class I bragged about eliminating,
  reintroduced next door.
- **The turn:** "I'd drop `owner_id` and derive ownership from Membership, the same
  discipline I applied to occurrences. The lesson I actually took: for every entity, ask
  'is this fact stored anywhere else?' The reconsidered version's append-only event log
  is that lesson, systematized."

## 2. My privacy fallback quietly gutted the safety feature it was protecting

- **Evidence:** `Petwatch/artifacts/research-plan.md`, decision rule A1. If watchers
  react badly to itemized visibility, ship V2: the owner sees only "last activity
  7:12am."
- **Why it's wrong:** The entire justification for completion visibility is the
  double-dosing case. Under V2, an owner with a twice-daily-medication pet sees one
  timestamp, not which of the day's four tasks happened. The fallback protects the
  relationship by destroying the medication guarantee, and I never stress-tested the
  "safe" variant against the reason the feature exists.
- **The turn:** "The fix is a third variant: passive for routine tasks, itemized for
  anything flagged safety-critical. The meta-lesson is that a fallback needs the same
  scrutiny as the primary design, because it's the design you actually ship when the
  test goes badly."

## 3. The process page claimed an audit that my own backlog says never ran

- **Evidence:** Old `process.html`: the AI "runs the mechanical audits, contrast and
  accessibility included." `Petwatch/artifacts/backlog.md`: "No accessibility audit...
  built-to-standard is not the same as tested-against-standard, and I would not claim
  otherwise."
- **Why it's wrong:** The process page's whole pitch was "demonstrated, not claimed,"
  and its one case study contradicted it. Claiming a capability and claiming it
  happened are different sentences, and I let them blur on exactly the page meant to
  prove I don't.
- **The turn:** "The rebuilt process page now separates observed, inferred, and unknown
  as a visible artifact. That framing exists partly because of this mistake."

## 4. I called the prototype 'the spec' and left the spec's hardest rule out of it

- **Evidence:** `prd.md`: "Undo window: 5 minutes, then the record is permanent."
  The v1 prototype's `complete()`: tapping your own completion always deletes it, no
  timer, forever. `ways-of-working.md`: "The prototype is the spec for interaction."
- **Why it's wrong:** An engineer building what's demoed ships a permanently editable
  record, which undercuts the evidence framing the product rests on. Silently wrong is
  worse than honestly incomplete.
- **The turn:** "Either build the constraint or annotate the exact line where the demo
  simplifies past it. The reconsidered version does this properly: the domain model has
  tests, and one product rule exists because a failing test forced the decision."

## 5. I put invented numbers in a table formatted like measured ones

- **Evidence:** `prd.md` success metrics: activation 40%, core value 60%, watcher
  activation 70%, retention 35%. The research plan itself says the core claim "is
  currently unvalidated."
- **Why it's wrong:** No baseline, no comparable, no range. A design director asks
  "where did 60% come from?" and the honest answer is "nowhere yet," which the table's
  formatting hides.
- **The turn:** "Label them working hypotheses to be replaced after the first five real
  handoffs. Same rigor as the decision rules, applied to the numbers."

## 6. My retention metric punished the product for working

- **Evidence:** `prd.md`: "Owner starts a second watch period within 90 days, 35%."
- **Why it's wrong:** PetWatch's value is infrequent, high-stakes trips. A family that
  travels twice a year reads as churn even when the product worked perfectly both
  times. A habitual-use metric borrowed for an episodic-use product.
- **The turn:** "Measure 'used again on the next trip, whenever that is' against
  self-reported travel cadence. Pick the metric from the user's rhythm, not the
  industry's."

## 7. I designed for the routine and forgot the actual emergency

- **Evidence:** No vet contact or emergency instruction field anywhere in the v1 data
  model or pet screen. The exclusions table cut "vet records, weight, medical history"
  as adjacent product, and the emergency number went with it.
- **Why it's wrong:** The owner persona is defined by anxiety, and two of seven seeded
  tasks are safety-flagged medication. "The one fact a watcher needs at 11pm when the
  dog won't get up" got cut by association with a genuinely out-of-scope feature.
- **The turn:** "Scope lines cut categories, but needs don't arrive in categories. Now
  when I cut a category I ask what single field inside it was doing the real work. The
  reconsidered Always-Know concept is partly this lesson."

## 8. My gracious registration workaround was gracious to the product, not the user

- **Evidence:** `prd.md`: the owner personally sends the invite through their own text
  message; "we have refused gracefully and handed the owner a rope."
- **Why it's wrong:** The same PRD defines the owner as anxious, packing, and short on
  time, then hands that person the product's growth work at the worst possible moment.
  "Least damaging to the spec" and "least damaging to the user's evening" are different
  tests, and I only ran the first.
- **The turn:** "I'd research the copy-paste moment itself, not just whether it beats
  the alternatives on paper."

## 9. I scheduled the safety feature's first failure test on a real animal

- **Evidence:** `backlog.md`: Release 1 gate is "five real handoffs, team members,
  their actual pets." PW-17's double-completion guard carries the safety label because
  "the failure mode is a harmed animal." No synthetic dry run of the guard's failure
  paths (race, stale screen, double-tap) is planned before the real handoffs.
- **Why it's wrong:** The fixtures to rehearse against already existed. The plan tested
  the happy path on fixtures and reserved the failure path for real insulin.
- **The turn:** "Add a chaos-style dry run, deliberately trigger the race, as a gate
  before any real pet is involved. Cheap to add, and I already had the fixtures."

---

## Why the hub itself was rebuilt (if asked about v2 vs v1)

- **The fake data stream.** Both old pages opened with a decorative SVG of random bars
  under copy that said "demonstrated, not claimed." Decoration that mimics evidence is
  worse than no decoration. It's gone.
- **The terminal costume.** Neon green, `$` prefixes, `cd ../` breadcrumbs. Dressed for
  engineers, shown to design directors. The product work underneath (the refusal of
  red, the quiet completion) was the better taste argument all along, so v2 leads with
  it.
- **"One door in" that opened into five houses.** The hub linked across five domains
  and asked the busiest reader in the room to assemble the story. v2 makes the argument
  on one page first and demotes the link farm to an evidence index at the bottom.

---

## Visual QA findings in the timed original (Aug 2026 audit)

Kept unfixed on purpose: "the timed original stays public and untouched" is a
public claim in the case study, and these are exactly the evidence for moving
QA upstream. Name them before the panel does.

1. **Five unreconciled oranges.** Prototype screen: header #DD6512, hero card
   #E9B62F, button #8F4E22, amber tiles #9A4E03. The Direction pane adds a
   fifth, #F07A28, for the same role. Line: "Four hours buys a direction, not
   a reconciled palette. The second pass runs on one accent in one token file."
2. **Hero math is wrong.** "2/7 done" + "1 waiting" + "5 more today" = 8.
   Direction pane, hero screen. Best possible argument for QA-upstream.
3. **Next tile says 6pm, hero card shows the 7:15 task**, contradicting the
   screen's own annotation ("the big card holds the most urgent thing,
   otherwise next up").
4. **"The the PRD"** doubled word, in the ways-of-working QA section.
5. **"Marmalade" never explained** — direction codename that reads as a
   mystery third pet.
6. **AA claim vs reality.** Note says small text on orange "goes dark for AA";
   the white status bar on #F07A28 is ~2.8:1, a fail.
7. **Dead tokens.** --kenji and --biscuit defined, never used; --biscuit holds
   Marcus's avatar color, not Biscuit's.
8. **Broken annotation target.** The overdue state, the philosophy's favorite
   moment, has a data-note with no matching note entry.
9. **Hardcoded red-brick #A03A2B** on the owner's "Remove access" confirm,
   off-token, next to three "never red" notes. Defensible (owner-side,
   destructive action), but say it before they do.
