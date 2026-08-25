# How AI Was Used in This Exercise

The brief encourages AI use and asks how it was used. Given that the exercise is
explicitly about *AI-enabled product design*, I treated the submission itself as a
demonstration: this is roughly the workflow I would bring to a Goji project, run
honestly inside the four-hour box, with the seams shown.

Tooling: **Claude Code** (Opus), working in a local repo, with the browser used to
test the prototype as it was built. No other AI tools.

---

## The division of labor, plainly

**The judgment calls in this submission are mine. The production speed is the AI's.**
Neither of us could have shipped this alone in an afternoon - that is the whole
argument for the workflow.

### Where AI carried real weight

| Work | What AI did | Roughly |
|---|---|---|
| Prototype build | Full front-end from my interaction decisions: state model, screens, the completion/undo mechanics, the sheet system, annotations | ~2h of the 4 |
| Artifact drafting | First prose drafts of the PRD, backlog, and research plan from my outlines and dictated decisions | ~45m |
| Edge-case sweep | Enumerating the edge-case list - invite states, timezone traps, revocation while the app is open | ~15m |
| Consistency pass | Keeping IDs, ticket numbers and cross-references aligned across five documents | throughout |

The edge-case sweep deserves a note: this is the place where a model is genuinely
*better* than a designer working alone, not merely faster. "What happens if the
invite link is opened while logged into the wrong account" is exactly the kind of
case a tired human misses at 4pm and a QA engineer finds in week six. Generating
that list early, then curating it by hand, moved QA thinking to the design phase -
which is where I want it anyway (see `ways-of-working.md`).

### Where the human did the work AI could not

- **The central thesis.** The completion gap in the PRD, The gap in the current scope - the observation that the
  user stories describe a product with no completion state, and that this is a
  category error rather than a missing feature - came from reading the stories
  closely and noticing an *absence*. The stories are internally consistent; nothing
  in them signals that anything is missing. Asked to "review these user stories,"
  a model produces auth flows and CRUD refinements, because absences don't
  pattern-match. Finding the hole is still the designer's job.
- **The surveillance counter-argument.** Having found "add completion," the
  reflexive next step is to design it. Stopping to ask *whether the watcher would
  hate it* - and making that the first research question with a pre-committed
  decision rule - is product judgment, not generation.
- **Every scope cut.** The Not-Building table, the RRULE refusal, the marketplace
  non-goal. Models are additive by disposition; deciding what *not* to build is
  where design actually happens.
- **Taste.** The prototype's calm palette, the refusal of red for overdue tasks,
  "he will insist it is the blue bag" - the texture that makes an artifact feel
  like a product rather than a template.

### Where AI was wrong, and it mattered

Honest examples, because a log that only lists successes is marketing:

1. **First pass at overdue styling was red and urgent.** Standard pattern,
   confidently produced. Wrong product: it shouts at a volunteer doing a favor.
   The amber "surface by position, not alarm" treatment is the correction, and the
   reasoning is now a design note on the prototype itself.
2. **The first data-model draft materialized schedule occurrences** into a table -
   the obvious pattern, and the one that costs a cron job, a backfill horizon, and
   a migration every time a routine is edited. Deriving occurrences from rules
   (the PRD, Data model) is the simpler system, and choosing it required knowing why the obvious
   pattern is expensive - which is to say, it required the reviewer to know more
   than the generator.
3. **Drafted copy kept sliding toward compliance language** - "verify," "confirm,"
   "task overdue." Individually fine; in aggregate they build the surveillance
   product the research plan is explicitly worried about. Tone had to be enforced
   line by line against the design intent, and it drifted back more than once.

The pattern across all three: **AI produces the statistically likely design, and
the statistically likely design encodes nobody's specific intent.** It is
confidently generic. The failure mode is not wrong code - it is plausible design
decisions made by no one.

---

## What this means for how I'd work at Goji

1. **Prototype at the speed of conversation.** The clickable prototype existed the
   same afternoon as the thesis. On agency timelines this changes what a kickoff
   or a mid-sprint client conversation can be: reactions to an artifact instead of
   nods at a description. Concept-testing something this real in week one - before
   a line of production code - is the single biggest process shift AI enables.
2. **Front-load the paranoia.** Edge-case enumeration and copy-variant generation
   are cheap now. Run them at design time, curate ruthlessly, and hand QA a
   spec that already thought about the expired invite.
3. **The designer's judgment is the product.** Everything a model produces is a
   draft awaiting someone with intent. The three failures above are exactly the
   demo I would give a client who asks "so why do we still need designers?" -
   generation is abundant; knowing which generated thing is wrong, and why, is
   the scarce thing they are paying for.

---

## Time accounting

Honest, against the 4-hour limit:

| | |
|---|---|
| Reading the brief; forming the thesis; scoping decisions | ~40m |
| PRD, backlog, research plan, ways-of-working (drafting + heavy revision) | ~1h 20m |
| Prototype: direction, build, interaction testing, annotation | ~1h 30m |
| Submission hub, this log, final read-through | ~30m |

Without AI assistance this scope is roughly three days of work, and the honest
alternative inside four hours would have been a deck of static frames and a
shorter document - which is precisely the version the brief warns against.
