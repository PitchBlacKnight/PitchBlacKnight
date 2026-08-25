# PetWatch - Backlog and Release Plan

Written in the shape I would put into Linear: epics as projects, tickets with
estimates, labels, and explicit dependencies. Points are relative (1 = a few
hours, 8 = most of a week for one person).

---

## How I sequenced this

**Not by user-story order.** The stories are grouped by feature area - auth, pets,
schedule, invites - which is a sensible way to *write* requirements and a poor way
to *build*. Building feature-area by feature-area means you have a complete auth
system and a complete pet manager before anyone has ever experienced the product,
and you learn nothing until the end.

**By risk retired per week.** The first release is a walking skeleton of one
complete watch period - thin, unglamorous, end-to-end. It is the shortest path to
watching a real person hand real care instructions to another real person, which
is the only thing that will tell us whether the thesis in the PRD is correct.

Three ordering principles:

1. **The riskiest assumption gets built first, not best.** Completion + activity
   (the completion thesis) lands in Release 1 in its crudest form. If owners find it
   invasive, I want to know in week 3, not after we have polished it.
2. **Nothing is scheduled that cannot be demoed.** Every cycle ends with something
   a person can use in front of us on Friday.
3. **Instrumentation ships with the feature, never after.** Analytics events are
   acceptance criteria on the same ticket, not a follow-up epic. Follow-up
   analytics epics do not get built.

---

## Release 1 - "The Handoff" · Cycles 1–3

**Goal:** One owner can hand one pet to one watcher, and both can complete a real
watch period end to end.

**Success:** We run five real handoffs - team members, their actual pets, their
actual friends - before we open it to anyone else.

### Cycle 1 - Foundations

| ID | Ticket | Est | Labels |
|---|---|---|---|
| PW-1 | Design tokens + component primitives in Figma; published library | 5 | `design` `system` |
| PW-2 | Front-end scaffold consuming tokens; Storybook wired | 5 | `frontend` `system` |
| PW-3 | Data model + migrations (6 entities per the PRD, Data model) | 5 | `backend` |
| PW-4 | Register with email + password | 3 | `backend` `frontend` |
| PW-5 | Log in / log out; session handling | 3 | `backend` `frontend` |
| PW-6 | Password reset by email link - generic response for unknown emails | 3 | `backend` `security` |
| PW-7 | Seeded staging fixtures: pet with a full week, pending invite, revoked watcher | 2 | `devops` `qa` |

> **PW-7 is not housekeeping.** Without seeded non-happy-path data, every design
> review and every QA pass happens against an empty database, and we ship a
> product that has only ever been seen in its best state. I want the revoked
> watcher and the expired invite to exist on staging from week one.

**Design in cycle 1:** tokens, primitives, the Today screen at high fidelity,
the routine editor. Design runs roughly one cycle ahead - far enough to unblock,
close enough that I am designing against a real build.

### Cycle 2 - Pets and routines

| ID | Ticket | Est | Labels |
|---|---|---|---|
| PW-8 | Add a pet: name, species, breed, age, notes | 3 | `frontend` `backend` |
| PW-9 | Pet photo upload, crop, storage | 5 | `frontend` `backend` |
| PW-10 | Edit / remove a pet, with consequence-naming confirmation | 3 | `frontend` `backend` |
| PW-11 | Create a care task: title, type, time, days of week, instructions | 5 | `frontend` `backend` |
| PW-12 | Edit / delete care tasks - soft delete, completions survive | 3 | `frontend` `backend` |
| PW-13 | Species routine templates as editable suggestions (the PRD on routine setup) | 2 | `design` `frontend` |
| PW-14 | Occurrence resolution service - rules → dated occurrences, pet timezone | 5 | `backend` |

> **PW-14 is the load-bearing ticket of the release.** Everything in Today and
> Week reads from it. I would pair with the engineer on the timezone behavior
> rather than write a spec and hope - the PRD, Data model, decision 2.

### Cycle 3 - The loop closes

| ID | Ticket | Est | Labels |
|---|---|---|---|
| PW-15 | Today view: Now / Later / Done, chronological, per-pet filter | 5 | `frontend` |
| PW-16 | **Mark task complete - optimistic, 5-min undo** | 5 | `frontend` `backend` |
| PW-17 | **Double-completion guard: unique constraint + calm "already done" state** | 3 | `backend` `frontend` `safety` |
| PW-18 | Activity record per pet, attributed and chronological | 3 | `frontend` `backend` |
| PW-19 | Invite a registered user by email | 3 | `backend` `frontend` |
| PW-20 | Invite email + accept screen showing the actual commitment | 3 | `backend` `frontend` |
| PW-21 | Unregistered-email graceful refusal + copyable message (the PRD, The registration constraint) | 2 | `frontend` |
| PW-22 | Watcher list per pet; revoke access; history retained | 3 | `frontend` `backend` |
| PW-23 | Week view: 7 columns, filter persists across views | 3 | `frontend` |
| PW-24 | Analytics events for the funnel in the PRD, Success metrics, incl. batch-completion | 2 | `frontend` `data` |

> **PW-17 carries a `safety` label deliberately.** It is the only ticket in the
> release where the failure mode is a harmed animal rather than a bad experience.
> It gets a dedicated QA pass and it does not get descoped for velocity.

---

## Release 2 - "Peace of Mind" · Cycles 4–5

**Goal:** The owner stops opening the app to check, because the app tells them.
**Gate:** Do not start until Release 1 has run five real handoffs and we have read
the batch-completion number.

| ID | Ticket | Est | Labels |
|---|---|---|---|
| PW-25 | Watcher reminders - task due, quiet hours respected | 5 | `backend` `frontend` |
| PW-26 | Owner daily digest - one summary, not a notification per task | 3 | `backend` |
| PW-27 | Optional photo on completion | 5 | `frontend` `backend` |
| PW-28 | Note on completion - "she didn't finish breakfast" | 2 | `frontend` `backend` |
| PW-29 | Missed-task handling: what the owner sees, and how gently | 5 | `design` `frontend` |
| PW-30 | Watch periods as a first-class object - start / end dates | 5 | `backend` `frontend` |

> **PW-29 is the hardest design problem in the product** and I have given it a
> full ticket rather than folding it into notifications. Telling an anxious person
> 3,000 miles away that their dog's evening walk did not get logged - without
> causing panic, and without implying an accusation against a friend doing them a
> favor - is a copy and interaction problem I expect to prototype and test
> separately. The wrong version of this screen loses us both users at once.

---

## Release 3 - "More than one of everything" · Cycles 6–7

| ID | Ticket | Est | Labels |
|---|---|---|---|
| PW-31 | **Invite-to-signup - if the unregistered-invite data supports it** | 5 | `growth` |
| PW-32 | Multi-pet households: cross-pet Today, bulk handoff | 5 | `frontend` |
| PW-33 | Watcher-side multi-owner view - watching for 2+ households | 3 | `frontend` |
| PW-34 | Routine duplication across pets | 2 | `frontend` |
| PW-35 | Accessibility audit against WCAG 2.2 AA + remediation | 5 | `design` `a11y` |
| PW-36 | Empty, loading, error and offline states audit | 3 | `design` `frontend` |

> **PW-35 is late on this list and I am not comfortable with that.** Accessibility
> is built into PW-1 and PW-2 - contrast, focus, target size and semantics are
> acceptance criteria on every UI ticket from cycle 1, not deferred to here. This
> ticket is the *formal audit and remediation pass*, which genuinely does need a
> complete product to run against. If it reads as "accessibility in cycle 7," I
> have labeled it badly, and I would rename it in refinement.

---

## Deliberately not scheduled

Naming these is as much a part of the plan as the tickets. Each has a trigger - the
evidence that would move it onto the board.

| Not building | Trigger that would change my mind |
|---|---|
| In-app messaging | Support volume showing people cannot coordinate outside the app |
| Payments / marketplace | An explicit strategy decision, not a feature request |
| Arbitrary recurrence (RRULE) | Research showing weekly patterns genuinely fail real routines |
| Native apps | Push notification limitations on web materially hurting PW-25 |
| Vet records, weight tracking | Repeated unprompted requests in research |
| Ratings and reviews | Never, in a trusted-circle product |
| Multi-owner / co-owner permissions | Households where two people both add pets - a real signal, needs a design pass |

---

## What I did not complete in this exercise, and what I would do next

Being explicit, since the team asked about work not finished here:

1. **No real users have seen any of this.** Everything rests on the completion thesis and
   the thesis is unvalidated. `research-plan.md` A1 is the first thing I would run
   - before cycle 1, in parallel with token work.
2. **The prototype covers the happy path plus two failure states.** Missing:
   password reset, pet editing, the expired-invite state, all loading and offline
   behavior, and the missed-task screen (PW-29) - which is the one I most want to
   design properly.
3. **No design system documentation.** The prototype uses a consistent token set
   but I have not written the component contracts, the usage rules, or the
   contribution model. That is PW-1's real deliverable.
4. **No accessibility audit.** The prototype was built with semantic structure,
   focus states, 44px targets and AA contrast, but built-to-standard is not the
   same as tested-against-standard, and I would not claim otherwise.
5. **Estimates are unnegotiated.** I wrote them to show sequencing logic. Real
   estimates come from the engineers doing the work, in refinement, and I expect
   several of mine to be wrong.
6. **No error-state copy pass.** Every message in the prototype is first-draft.
   Error and empty-state copy deserves a dedicated pass with whoever owns voice.
