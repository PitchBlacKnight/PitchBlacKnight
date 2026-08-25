# PetWatch - How I'd Work With This Team

The brief asks how I would structure my work and interact with the team from
inception through launch. This is that, written against the actual roster -
product managers and strategists, TPMs, front-end and back-end engineers, DevOps,
QA - and the actual toolchain: Slack, Linear, Notion, Figma, Claude.

---

## The stance

On a team with dedicated product strategists and TPMs, **the fastest way for a
designer to be useless is to try to be the product manager.** My job is not to
decide what the business should do. It is to make the decision space visible,
build the thing that answers the question, and make sure what ships is what we
agreed.

Concretely, that means I hold three things:
1. **The problem's shape** - kept honest, kept in front of everyone, revised in public
2. **The artifact that resolves arguments** - a prototype beats an opinion, every time
3. **The gap between intent and build** - I am the person who notices at 80% that the
   empty state was never designed

---

## Week 0 - before anything is designed

**A 90-minute kickoff workshop.** Attendees: product strategy, PM, TPM, eng lead,
QA. I facilitate, I do not present.

Agenda:
- **Problem framing, out loud.** Everyone writes the problem in one sentence,
  silently, then we read them. On every project I have run this, the sentences
  disagree - and it is much cheaper to discover that in a room than in cycle 4.
- **The one metric.** We leave with a single north star. My proposal is in the PRD, Success metrics;
  the point is that we agree on one, not that mine wins.
- **The v1 cut line.** Not a roadmap - a line. What is *not* in v1, written down,
  with the trigger that would change it.
- **The riskiest assumption.** Named, owned, and scheduled. For PetWatch it is A1.

Output: one Notion page, linked from the Linear project, that is the source of
truth. If a decision is not on it, it did not happen.

**This is where I would raise the completion gap** (the PRD, The gap in the current scope) - in week 0, in a room,
with the strategist present. Not in a document three weeks later, and not by
quietly designing it in and hoping nobody notices. The stories came from someone;
they deserve the argument face to face.

---

## The operating rhythm

| Cadence | What | Who |
|---|---|---|
| Mon | Cycle planning - design tickets in the same cycle as eng, never a separate board | Everyone |
| Wed, 30 min | **Desk check** - review the build on staging, not mockups | Design + eng + QA |
| Thu | Refinement - I write acceptance criteria *with* QA | Design + QA + eng |
| Fri, 30 min | Demo - working software, including the ugly states | Everyone + stakeholders |

**The Wednesday desk check is the ritual I would fight to keep.** Reviewing
Figma tells you what was intended. Reviewing staging tells you what exists. The
gap between them is where products quietly get worse, and half an hour mid-cycle
catches things that a Friday demo only lets you regret.

**Design runs about one cycle ahead** - far enough to unblock engineers, close
enough that I am designing against something real rather than imagining forward.
Designing three cycles ahead produces beautiful work that describes a product that
no longer exists.

---

## Working in Linear

- **Design tickets live in the delivery cycle**, not a parallel design board.
  Separate boards are how design becomes a service desk that engineering waits on.
- **Design work that blocks a build is modeled as a blocking dependency.** Visible,
  not implied - so the TPM can plan against it and I can be held to it.
- **Every UI ticket carries acceptance criteria I co-wrote with QA**, and those
  criteria include the states. "Renders correctly" is not acceptance criteria;
  "empty, loading, error, offline, and the two-watchers-collide case" is.
- **Edge cases from the PRD, Edge cases become test cases at refinement**, not bugs at QA. That
  list exists specifically so QA is not the first person to think about the
  expired invite.
- **Analytics events are acceptance criteria on the feature ticket.** A separate
  instrumentation ticket is a ticket that does not get built.

---

## Working in Figma

- **Tokens first, atomic build.** Primitives → components → patterns → flows. The
  library is published from cycle 1 so engineers build against tokens rather than
  measuring screenshots.
- **Code Connect + Dev Mode** to bind Figma components to their React
  counterparts. This is the part that matters: handoff stops being a throw over a
  wall and becomes a link between two representations of the same component. When
  a token changes, both sides know.
- **One file, branched - not fifteen files.** "Final_v3_ENGHANDOFF" is a symptom of
  a team that does not trust its own source of truth.
- **The prototype is the spec for interaction.** Static redlines cannot describe
  optimistic completion with a 5-minute undo. A clickable artifact can.

---

## Working with engineering

**Pair, do not spec, on the load-bearing parts.** PW-14 - occurrence resolution
and pet-timezone behavior - is a design decision wearing a backend costume. I want
to be in the conversation where it is built, because the failure mode ("feed at
7am" meaning 7am in the owner's hotel) is invisible in a Figma file and obvious in
a schema.

**Ask what is expensive before I commit to it.** The derived-occurrence model in
the PRD, Data model is me trying to do this - a design that saves a cron job, a backfill and a
migration class is a design that ships sooner. But I would put it to the backend
engineer as a question, not a decree. I have been wrong about that kind of thing
before.

**Take the cheaper version when the reason is good.** If an engineer says the undo
window is hard, I want the real constraint, and then I want to solve for the same
user need at a lower cost. What I do not want is to win the argument and lose the
cycle.

---

## Working with QA and DevOps

**QA is upstream of me, not downstream.** Acceptance criteria get written together
in refinement. The the PRD, Edge cases edge-case list is the deliverable of that partnership,
and it is written in the PRD precisely so it is a design input rather than a
QA discovery.

**Seeded staging fixtures are a design tool** (PW-7). I want a pet with a full week
of tasks, a pending invite, an expired invite, and a revoked watcher on staging
from cycle 1. Otherwise every review - design and QA alike - happens against an
empty database, and we ship a product that has only ever been seen in its best
state. That is how empty states end up unhandled.

**PW-17 gets a dedicated QA pass.** The `safety` label is not decoration; the
double-completion guard is the one ticket where failure means a harmed animal.

---

## Working in Slack

- **One `#petwatch` channel.** Not one per discipline - the point is that the TPM
  sees the design conversation.
- **Decisions posted as threaded `Decision:` messages**, mirrored to the Notion
  page weekly. Slack is where decisions are made and immediately lost; Notion is
  where they live.
- **No design feedback in DMs.** If it is worth changing, it is worth the rest of
  the team seeing why. This is a rule I hold for myself more than for others.

---

## Through launch

**Instrument before launching, not after.** Per the PRD, Success metrics, including the
counter-metrics - especially batch-completion rate. I want the number that tells
us we are fooling ourselves available on day one, because it is the number nobody
asks for later.

**The Release 1 gate is five real handoffs.** Team members, their own animals,
their own friends. Not a usability test - live fire, with real consequences and
real anxiety. Every break becomes a ticket before anyone outside sees it.

**Launch readiness is a shared checklist, not a design sign-off.** Empty states,
error states, offline behavior, the password reset email, the invite email
rendering in Outlook, AA contrast verified in both themes. I own the design rows.
I do not own the decision to ship.

**Post-launch week one I bring the A2 number to product strategy** - the
unregistered-invite rate. Not to relitigate the constraint, but because that is
the moment the conversation can be had with evidence instead of instinct.

---

## Where I would use AI, and where I would not

Recorded in full in `ai-log.md`. The short version of the working principle:

**AI compresses the distance between an idea and something you can react to.** In
this exercise it turned a product thesis into a clickable prototype in a single
afternoon - which means the team's first conversation happens against an artifact
instead of a description. On an agency timeline that is the entire value: every
client can afford a real prototype and a real design system, not just the ones with
long engagements.

**What it does not do is decide.** The gap in the PRD, The gap in the current scope, came from reading the
user stories closely and noticing an absence. No model surfaced it, because
nothing in the source material says it is missing - the stories are internally
consistent, and that is exactly what makes the omission hard to see. Judgment about
what matters, what to cut, and what is worth the team's argument stays with the
designer. The acceleration is real and it is not a substitute for the work.
