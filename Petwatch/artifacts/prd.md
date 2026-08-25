# PetWatch - Product Definition, v1

**Status:** Draft for team review
**Author:** Mikel Rosenthal (Product Design)
**Reviewers needed:** Product strategy, TPM, Eng lead, QA
**Last updated:** Day 1

---

## 1. The problem, stated honestly

Someone leaves town. They love an animal that cannot be left alone. They ask a
person they trust to step in.

Both people are uncomfortable. The owner is anxious and absent - they cannot see
what is happening, and the thing they care about cannot tell them. The watcher is
uncertain and exposed - they have been handed responsibility for something
irreplaceable, with instructions that are usually a text message, a note on the
counter, or a half-remembered conversation at the door.

**PetWatch exists to move care instructions out of that gap and into a place both
people can rely on.**

## 2. The gap in the current scope

The user stories as written describe a complete, coherent CRUD application:
accounts, pets, schedules, invitations. It is internally consistent and it would
build cleanly.

It also cannot be completed. Read the Care Schedule stories in sequence:

> *"…so watchers know exactly what to do."*
> *"…I want to view the pet's care schedule clearly so I can follow or manage the routine."*

The owner writes. The watcher reads. **Nothing is ever marked done, and nothing
ever travels back to the owner.** There is no completion state anywhere in the
specification.

This has three consequences, in increasing order of severity:

1. **The owner's actual job is unserved.** Nobody wants a schedule. They want to
   stop worrying. A schedule they cannot verify against reality does not reduce
   anxiety - it itemizes it. We would ship a product that tells an anxious person
   exactly how many things they cannot confirm.

2. **The watcher's actual job is unserved.** The watcher's private fear is not
   "what do I do" - it is "what if I get it wrong and they blame me." A record of
   what they did is protection they currently have no way to produce.

3. **It is a safety defect.** The brief explicitly supports multiple watchers per
   pet and lists medication as a routine type. Two watchers, one shared read-only
   schedule, no completion state, and a dog on twice-daily medication is a
   double-dosing incident waiting to happen. This is not a nice-to-have.

### The proposal

Add **task completion** and a **shared activity record**. Mechanically this is a
checkbox, a timestamp, and an attributed name. It is among the smallest additions
available to us and it changes what the product *is*:

| | Without completion | With completion |
|---|---|---|
| What the owner gets | A copy of their own instructions | Evidence |
| What the watcher gets | A list of obligations | A record of having done it |
| What happens with 2 watchers | Ambiguity, duplicate care | "Jessie fed Kenji at 7:12am" |
| Product category | Schedule viewer | Trust instrument |

**Everything else in this document follows from that decision.**

### The honest counter-argument

Confirmation can read as surveillance. The watcher is doing the owner a *favor* -
they are not staff. A product that makes a friend feel monitored damages the exact
relationship it depends on.

I do not think this kills the feature, but I hold it loosely, and it is the first
thing I would put in front of real users (see `research-plan.md`, Assumption A1).
The design response is under Key flows: completion is framed as **the watcher's record**,
never as the owner's oversight. Language and defaults carry that distinction. If
research says otherwise, the fallback is a passive log - the watcher sees the
checklist, the owner sees only "last activity 7:12am" - and we lose very little
engineering work.

---

## 3. Users and jobs

"Owner" and "watcher" are relationships to a pet, not account types. The same
person is routinely both. The design must never make someone feel they are in the
wrong "mode."

**The owner - away, anxious, not in control**
- Hand over everything a competent stranger would need, without a 20-minute phone call
- Know it is being done, without having to ask and feel like a nag
- Retain the ability to see and revoke who has access

**The watcher - willing, uncertain, doing a favor**
- Know exactly what is needed *right now*, without reading a manual
- Not get it wrong
- Be able to show that they did it
- Not be surprised by something the owner forgot to mention

**Design consequence:** For the watcher, the app is one screen - *what do I do
now.* Everything else is setup. The information architecture should reflect that
the watcher's session is 40 seconds long and happens standing up, one-handed,
possibly holding a leash.

---

## 4. Scope

### In - v1

| Area | Included |
|---|---|
| Auth | Email + password registration, login, password reset by email link |
| Pets | Create, edit, remove; name, species, breed, age, notes, photo |
| Routines | Recurring care tasks: title, type, time of day, days of week, instructions |
| Views | Today and This Week; filter by pet |
| **Completion** | **Mark a task done; who did it and when; optional note** |
| **Activity** | **Chronological record of completions per pet** |
| Watchers | Invite a registered user by email; accept via emailed link; list watchers; revoke |
| Timezone | Every task time resolves to the *pet's* timezone |

### Out - v1, with reasons

| Excluded | Why |
|---|---|
| Inviting unregistered users | Explicit constraint in the brief. See The registration constraint - I think it is the biggest risk in the product, and I have designed the least-damaging version rather than quietly overriding it. |
| Payments, marketplace, vetting | This is trusted people, not hired strangers. Not Rover. Different product, different trust model. |
| In-app messaging | These two people already text each other. Rebuilding messaging is expensive and loses to iMessage. |
| Arbitrary recurrence (RRULE) | "Every other Tuesday," "3rd Thursday" - real routines are daily or weekly. Days-of-week covers the cases we can name. Revisit only with evidence. |
| Native push notifications | v1 is web + email. Push is the top of the v1.1 list because it is what makes reminders actually work. |
| Households, co-owners | A pet has one owner in v1. Multi-owner is a permissions model, not a feature, and it deserves its own design pass. |
| Vet records, weight, medical history | Adjacent product. Would double the data model for a job nobody described. |
| Ratings, public profiles | Actively harmful here. Rating your sister is not a thing. |

### Explicit non-goal

**We are not building a marketplace, and no v1 decision should be made "so it's
easier to add payments later."** If that becomes the strategy, it changes the
trust model, the identity requirements, and the liability surface, and it should
be a deliberate re-scope rather than an accumulation of hedges.

---

## 5. Data model

Six entities. The shape matters because two decisions in it save meaningful
engineering time.

```
User          id · email · password_hash · name · avatar_url · timezone

Pet           id · owner_id → User · name · species · breed · birthdate
              notes · photo_url · timezone            ← note: the PET has a timezone

Membership    id · pet_id → Pet · user_id → User
              role: owner | watcher
              status: active | revoked
              created_at · revoked_at
              ↑ this table is the whole "roles are per-pet" mechanic

CareTask      id · pet_id → Pet · title · type: feed|walk|meds|play|other
              time_of_day · days_of_week[0-6] · instructions
              created_by → User · active: bool

Completion    id · care_task_id → CareTask · occurrence_date
              completed_by → User · completed_at · note · photo_url
              UNIQUE (care_task_id, occurrence_date)   ← prevents double-completion

Invite        id · pet_id → Pet · inviter_id → User · invitee_email
              invitee_user_id → User · token · status: pending|accepted|revoked|expired
              sent_at · expires_at
```

**Decision 1 - occurrences are derived, never stored.** A `CareTask` is a *rule*.
"Feed at 7am on Mon–Sun" is one row, forever. The Today view is computed by
evaluating rules against a date. Only `Completion` rows are real instances.

The alternative - materializing every occurrence into a table - means a
cron job, a backfill horizon, a migration every time a routine is edited, and a
class of bugs where the schedule and the rule disagree. Avoiding it is the single
biggest delivery saving in the model, and it costs us nothing users can perceive.

**Decision 2 - the pet carries the timezone, not the user.** The owner is in
Lisbon; the dog is in Los Angeles. "Feed at 7am" means 7am *where the dog is*,
always. Anchoring times to the viewing user's timezone is the kind of bug that
surfaces on day one of a real trip and destroys trust permanently. It costs one
column to get right now and a painful migration to fix later.

**Decision 3 - `UNIQUE (care_task_id, occurrence_date)`** is the database-level
guarantee behind the double-dosing safeguard. The UI is the second line of
defense, not the first.

---

## 6. Key flows and the decisions inside them

### 6.1 Today - the product's center of gravity

The watcher's entire relationship with PetWatch is this screen. It opens to
**Today**, not to a dashboard, not to a pet list.

- Tasks in chronological order, grouped **Now / Later today / Done**
- Each row: time, pet, task, and a large completion target
- Overdue tasks surface at the top with a quiet marker - *never* red alarm
  styling. The watcher is a volunteer; a hostile interface punishes a person
  doing a favor. Urgency is communicated by position, not by alarm.
- Completion is one tap, optimistic, and immediately reversible for 5 minutes.
  Undo is not a confirmation dialog - dialogs before an action punish the 99%
  who meant it. Reversal after the fact costs the 1% nothing.

**Framing decision:** the completion control reads as *"I did this"* - first
person, the watcher's own record. Nowhere does the owner-facing language say
"verified" or "confirmed by." The activity feed reads *"Jessie fed Kenji · 7:12am"* -
a factual record, not a compliance report. This is the design answer to the
surveillance risk raised earlier.

### 6.2 The double-completion guard

Two watchers, one task. Watcher B opens the app and the task already shows as
done, attributed. If B taps it anyway - race condition, stale screen - the write
fails on the unique constraint and B sees:

> **Already done.** Jessie marked this complete at 7:12am.

Not an error. A fact, delivered calmly. For a medication task this is the most
important interaction in the product.

### 6.3 Week view

Same data, seven columns. Its job is different: it answers *"what am I signed up
for"* rather than *"what do I do now."* Density over immediacy. Filter by pet
persists across both views - it is a property of the session, not the screen.

### 6.4 Setting up a routine - the owner's real work

This is the highest-effort moment in the product and the one most likely to be
abandoned. Two decisions:

- **Templates by species.** Choosing "dog" pre-loads a plausible routine -
  breakfast, walk, dinner - as *editable suggestions*, not commitments. Most
  owners want to correct a draft, not face an empty state. This is the cheapest
  activation lever available and it costs a fixture file.
- **Instructions are a first-class field, not a footnote.** The valuable content
  is never "Feed 7am" - it is *"half a cup of the green bag, NOT the blue bag,
  she'll tell you otherwise and she's lying."* That is the sentence that prevents
  the 11pm phone call. The field is generous, and the placeholder teaches by
  example.

### 6.5 Inviting a watcher - and the constraint

Per the brief, the invitee must already have a PetWatch account. The flow:

1. Owner enters an email
2. **Registered** → invite sent, appears as *Pending* on the pet
3. Invitee gets an email, clicks the link, sees what they are accepting - which
   pet, whose, what routine - and accepts. Membership created.
4. **Not registered** → see The registration constraint

Accepting is a real decision with real content, so the accept screen shows the
commitment (2 tasks a day, Mar 3–9) rather than a bare "Accept?" button.

### 6.6 Visibility and revoking

The owner sees every watcher per pet, their status, and when they last did
something. Revoking is immediate and does not ask the owner to justify it.

**Revoked watchers keep their history.** Their completions remain in the activity
record, still attributed. The record of what happened to the animal is the owner's,
and it must not develop holes when a relationship ends. The watcher simply loses
access going forward.

---

## 7. The registration constraint - biggest risk in the product

> *"The invitee must already have a PetWatch account - inviting unregistered
> users is not supported."*

I want to be direct: **the person most likely to watch your pet is your neighbor,
your mother, or your friend, and they have never heard of PetWatch.** The
constraint means the product's core loop terminates at exactly the moment of
highest intent - the owner is packing, they have decided to use the tool, and the
tool tells them the person they chose is not eligible.

I am not overriding the constraint. It is a stated requirement, it may reflect
technical or product reasoning I do not have, and rewriting requirements I was
handed is not my call to make unilaterally. So v1 respects it - and I have designed
the least-damaging version of it, plus the evidence that would let us revisit it.

**v1 behavior (respects the constraint):** No invite record is created. No email
is sent to a non-user. Instead the owner sees an honest state and a way forward
that uses a channel they already have:

> **Dana isn't on PetWatch yet.**
> Invites only work for people with an account. Send them this, and once
> they've signed up you can invite them.
> `[ Copy message ]`  → *"Hey - I'm using PetWatch to set up Kenji's care
> while I'm away. Can you make an account at petwatch.app? Takes a minute,
> then I'll send you the details."*

The owner does the sending, through their own text message. We have not invited an
unregistered user; we have refused gracefully and handed the owner a rope.

**The instrumentation that decides this:** every attempt against an unregistered
email is logged. If that number is a meaningful share of invite attempts - my
guess is it will be large - we have an evidence-based case to revisit, and I would
bring it to product strategy in week one of post-launch rather than arguing it
now, in a document, without data.

**The v1.1 design if the data supports it:** the invite email doubles as a signup
link, and the invitation auto-accepts on account creation. Roughly two days of
work. See `backlog.md`, PW-31.

---

## 8. Edge cases

Written here rather than discovered in QA. I would walk this list with the QA
engineer during ticket refinement so acceptance criteria are written once.

**Invites**
- Invite to someone already watching → idempotent; show existing status, no duplicate
- Invite to yourself → blocked with a plain message
- Invite link opened while logged into a different account → email mismatch guard, offer account switch
- Invite link opened twice → "already accepted" state, not an error
- Invite link expired (7 days) → offer to request a new one
- Invite pending when the pet is deleted → invalidated silently
- Token is single-use, bound to the invitee email, 7-day expiry

**Completion**
- Two watchers complete simultaneously → unique constraint; loser sees the already-done guard
- Completing a past day → allowed within 48h, recorded as "logged late" with the real timestamp
- Completing a future day → blocked; the control is not offered
- Undo window → 5 minutes, then the record is permanent
- Task edited after completions exist → past completions retain the title they were completed under
- Task deleted → soft delete; completions survive in the activity record

**Access**
- Revoked watcher with the app open → next action fails cleanly to a "no longer have access" state, not a crash
- Revoked then re-invited → new membership, prior history intact
- Owner deletes a pet with active watchers → confirmation naming the consequences; memberships cascade
- Owner is also the only watcher → fully supported, no empty-state weirdness

**Time**
- DST transition → tasks are wall-clock local to the pet; 7am stays 7am
- Owner and watcher in different timezones → both see the pet's time, labeled
- Task at 00:00 or 23:59 → does not leak into an adjacent day

**Auth**
- Password reset for an unknown email → generic success message; never confirm whether an account exists
- Reset link single-use, 1-hour expiry

---

## 9. Success metrics

**North star - % of scheduled care events confirmed complete during an active
watch period.** This is the closest available proxy for the thing we actually
sell: the owner's confidence that their animal is fine.

| Stage | Measure | Target for v1 |
|---|---|---|
| Activation | Owner adds a pet, at least 1 routine task and 1 watcher within 7 days | 40% of new owners |
| Core value | A watch period ends with 80% or more of tasks confirmed | 60% of watch periods |
| Watcher activation | Watcher completes their first task within 24h of accepting | 70% |
| Retention | Owner starts a second watch period within 90 days | 35% |

**Counter-metrics - the numbers that tell us we are fooling ourselves**

- **Batch-completion rate:** % of tasks marked done in a single burst at the end of
  the day. If watchers are ticking twelve boxes at 11pm, the record is fiction, the
  owner's confidence is unearned, and our north star is measuring compliance
  theater. I would watch this more closely than the north star itself.
- **Time to first completion** for a new watcher - a friction detector.
- **Invite attempts against unregistered emails** - the evidence for reopening the registration constraint.
- **Support contacts mentioning "didn't know / wasn't told"** - the qualitative
  signal that the instructions field is failing.

---

## 10. Open questions for the team

Ordered by how much they would change the design.

1. **Product strategy:** Is the long-term intent a trusted-circle utility or a
   two-sided marketplace? Every trust decision in v1 branches here.
2. **Product strategy / Legal:** Is the registration constraint a technical
   limitation, a spam-surface decision, or a strategic one? The right v1.1
   response differs for each.
3. **Eng:** Confirm the derived-occurrence model in Data model is compatible with how you
   want to build the Today query before I go further on the schedule editor.
4. **TPM:** Web-first, or is a native shell in scope? It changes the notification
   design substantially and I would rather know before I design reminders.
5. **QA:** Do we have a defensible position on medication tasks? I would like us
   to decide deliberately whether we carry explicit disclaimers, rather than
   discovering the question at launch.
6. **Design/Eng:** Photo uploads - pet photos are in scope, completion photos are
   not. Confirm we are standing up image handling once, in v1, so adding
   completion photos in v1.1 is a UI change rather than an infrastructure project.
