# PetWatch - Validation Plan

The product definition makes a bold claim: that PetWatch as briefed is just a way
to publish instructions, and that letting people check tasks off is what turns it
into something both people can actually trust.

**That claim is currently unvalidated.** This document is how I would find out
whether I am right, fast and cheaply, and - more importantly - what I would do if I
am wrong.

---

## Assumptions, ranked by risk

Risk = how much of the product collapses if the assumption is false, weighted by how confident
I currently am. A1 sits at the top because I am least sure of it and it costs the
most to be wrong about.

### A1 - Owners want confirmation, and sitters don't experience it as surveillance
**If false:** The central thesis is wrong. We are building an anxiety amplifier and
a way to make friends feel policed.
**Confidence:** Low. This is genuinely uncertain and I do not want to design past it.

The tension is real. The sitter is doing a *favor*. Anything that reads as
monitoring risks damaging the relationship the product depends on - and the owner
will feel that damage before we do.

**Method - 6 paired interviews, 30 min each, both sides of the same handoff.**
Talking to owners alone would give me a badly skewed answer; owners will say yes to
visibility. The sitter's reaction is the finding.

- Recruit: people who had a friend or family member watch a pet in the last 6 months
- Ask about the *last real* handoff, not hypotheticals: what did you send, what did
  you worry about, did you check in, how did that feel to receive
- Concept test two variants after the retrospective, never before:
  - **V1 active:** sitter ticks tasks off; owner sees an itemized feed
  - **V2 passive:** sitter sees the checklist; owner sees only "last activity 7:12am"
- The question that matters, asked of the sitter: *"If your friend could see this,
  would you still want to use it?"*

**Decision rule, written before the research so I cannot rationalize afterwards:**
- 4 or more of 6 sitters react neutrally or positively to V1 → build V1
- 3 or more of 6 react negatively → ship V2, keep the completion data model, revisit
- Split → ship V2 as the default with V1 as an owner-invited opt-in, and treat the
  ambiguity as a finding rather than a tie to break

### A2 - The registration constraint materially blocks the core loop
**If false:** Great, the constraint is cheap and the PRD is over-worried about it.
**Confidence:** High that it blocks - I would be surprised to be wrong.

**Method - just count it, no interviews needed.** This one answers itself for free.
Log every invite attempt against an unregistered email from day one. If it is a
large share of attempts, that is a fact rather than my opinion, and it is the
argument that reopens the constraint with product strategy.

Cost: one analytics event. Included in PW-24. I would rather bring a number to that
conversation in week one post-launch than an argument now.

### A3 - Days-of-week recurrence covers real routines
**If false:** We under-model the schedule and owners fall back to cramming
everything into the notes field, which we would see as unusually long notes.
**Confidence:** Medium-high.

**Method - ask 8 owners to show me the real thing, ~20 minutes each.**
The cheapest and most revealing study in this plan:

> *"Show me the actual instructions you left last time - the text, the note on the
> counter, the email, the photo of the whiteboard. Send it as-is."*

Real artifacts beat self-report every time. People cannot accurately describe their
own routines from memory, but the note on the fridge is ground truth. I would code
the results for: recurrence patterns that days-of-week cannot express, how much
content is *conditional* ("if she won't eat, then…"), and how much is reassurance
rather than instruction. That last category is a design finding hiding in plain
sight - if half the note is "don't worry if she hides under the bed, she does that,"
then the product has an emotional job we have not designed for at all.

### A4 - Today-first is the right default for sitters
**If false:** Cheap to fix. Navigation change.
**Confidence:** High.

**Method - usability test the prototype. 5 moderated (45 min) + 15 unmoderated.**
Tasks, given cold with no orientation:
1. "You're watching Kenji today. What do you need to do, and when?"
2. "You just fed him. Show me what you'd do."
3. "Your friend asked what you have coming up this week. Find out."
4. "You think someone else may have already walked him. Check."

Watching #4 is the real prize - it tells me whether the double-completion guard is
legible before it is load-bearing.

**Success:** 4/5 complete #1 and #2 unaided in under 30 seconds.

### A5 - Owners will invest the setup effort at all
**If false:** Nothing downstream matters; the funnel dies at the top.
**Confidence:** Medium. Setup is the biggest ask in the product and it lands at the
worst possible moment - the owner is packing.

**Method - measure it, then attack it.** Activation funnel from PW-24: pet created →
first task → first invite. The species-template decision (the PRD on routine setup) is the first
lever; if activation is poor I would test a "start from a text you already sent"
import path - paste the message you were going to send anyway, and we structure it.
That is an AI-assisted onboarding idea worth prototyping if the numbers demand it,
and worth *not* building if they do not.

---

## Sequencing

| When | What | Blocks |
|---|---|---|
| Week 0 - before cycle 1 | **A1 paired interviews** | Yes - the shape of Release 1 |
| Week 0 - in parallel | **A3 show-me-your-note study** (done over email, low effort) | The schedule data model |
| Week 1 | Synthesis; PRD updated in Notion; decision posted in Slack | - |
| Week 2–3 | **A4 usability tests** against the prototype | Today/Week detail design |
| Cycle 1 | A2 + A5 counters ship with the features | - |
| Post-launch week 1 | Read A2 and A5; take A2 to product strategy | Release 3 scope |

Only A1 and A3 gate the start, they run concurrently, and together they cost about
a week of one person's time. That is a cheap price for finding out whether the
central thesis survives contact with reality.

---

## Ongoing, after launch

- **Five real handoffs before public launch** (Release 1 gate). Team members, their
  own pets, their own friends. Not a usability test - a live-fire rehearsal. Every
  break becomes a ticket.
- **Batch-completion rate reviewed weekly.** Per the PRD, Success metrics this is the honesty check on
  our north star, and it is the number I would want on the wall.
- **Quarterly re-interview** of 3 active owner/sitter pairs - the relationship
  question in A1 is not answered once; it decays as the product changes.

---

## What I would not do

- **A survey.** "Would you like to see when tasks are completed?" produces a yes from
  everyone and tells us nothing. The question is how the *sitter* feels, and nobody
  answers that honestly in a form.
- **Competitor teardowns as a substitute for user contact.** Rover and Wag are worth
  30 minutes of study, but they solve a different problem - paid strangers, not
  trusted friends - and their design decisions encode a trust model we are
  deliberately not adopting. Copying their patterns would import assumptions we have
  not chosen.
- **Testing the prototype before A1.** Usability testing an idea that may be wrong
  produces confident answers to the wrong question, and it makes the idea feel
  validated when it has only been made usable.
